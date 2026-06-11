-- =========================================================
-- AIVA FACTORY · DB 마이그레이션 v3
-- "버전별 카드 분리" + "악기별 스템 자동 분리" 기능을 위한 스키마 변경
--
-- 주요 변경사항:
--   1) tracks 테이블에 suno_audio_id / version_num / stream_url 컬럼 추가
--   2) track_stems 테이블 신설 (Suno split_stem 결과 최대 12개 저장)
--   3) suno_jobs.type 에서 'extend', 'lyrics' 제거 (기능 폐지)
--   4) track_versions 의 버전2 데이터를 별도 tracks row 로 분리(이관) 후
--      track_versions 테이블 삭제
--
-- 실행 방법:
--   docker exec -i aiva_mysql mysql -u root -p<비밀번호> aiva_factory < migrate_v3.sql
-- 또는 MySQL 프롬프트에서:
--   source /path/to/migrate_v3.sql
--
-- ⚠ 주의: 이 마이그레이션은 track_versions 테이블을 삭제합니다.
--   운영 DB라면 반드시 사전 백업(mysqldump) 후 실행하세요.
-- =========================================================

USE aiva_factory;

-- ── 1. tracks 테이블 컬럼 추가 ────────────────────────────
-- suno_audio_id : Suno 버전(variation)별 오디오 ID. split_stem/wav/video
--                 호출 시 audioId 파라미터로 사용된다.
-- version_num   : 1 또는 2. Suno 1회 생성 요청은 버전을 2개 반환하는데,
--                 앞으로는 버전마다 별도의 tracks row 를 만들기 때문에
--                 "몇 번째 버전인지"를 표시하는 용도로만 쓰인다.
-- stream_url    : 생성 진행 중에도 미리 들을 수 있는 스트리밍 URL.
ALTER TABLE tracks
  ADD COLUMN IF NOT EXISTS suno_audio_id VARCHAR(255) AFTER suno_task_id,
  ADD COLUMN IF NOT EXISTS version_num   TINYINT NOT NULL DEFAULT 1 AFTER suno_audio_id,
  ADD COLUMN IF NOT EXISTS stream_url    VARCHAR(500) AFTER audio_url;

-- ── 2. track_stems 테이블 신설 ────────────────────────────
-- 곡(트랙/버전) 하나당 Suno split_stem 결과(최대 12개 악기 트랙)를
-- 1행씩 저장한다. 같은 트랙에 같은 stem_type 이 다시 들어오면
-- (재요청 등) UNIQUE 제약으로 덮어쓸 수 있도록 ON DUPLICATE KEY UPDATE 와
-- 함께 사용한다.
CREATE TABLE IF NOT EXISTS track_stems (
  id          VARCHAR(36)  PRIMARY KEY,
  track_id    VARCHAR(36)  NOT NULL,
  stem_type   ENUM('vocals','backing_vocals','drums','bass','guitar','keyboard',
                    'percussion','strings','synth','fx','brass','woodwinds','instrumental') NOT NULL,
  audio_url   VARCHAR(500) NOT NULL,
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (track_id) REFERENCES tracks(id) ON DELETE CASCADE,
  UNIQUE KEY uq_track_stem (track_id, stem_type),
  INDEX idx_track_id (track_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ── 3. suno_jobs 정리: extend / lyrics 기능 폐지 ──────────
-- (일부 환경은 v2 마이그레이션에서 user_id 컬럼이 없을 수 있어 보강)
ALTER TABLE suno_jobs
  ADD COLUMN IF NOT EXISTS user_id VARCHAR(36) AFTER track_id;

-- 더 이상 사용하지 않는 작업 기록 삭제 후 ENUM 에서 제거
DELETE FROM suno_jobs WHERE type IN ('extend', 'lyrics');
ALTER TABLE suno_jobs MODIFY COLUMN type ENUM('separate', 'wav', 'video') NOT NULL;

-- ── 4. track_versions → tracks 이관 (버전별 카드 분리) ────
-- 4-1) 버전1 데이터를 기존 tracks row 에 채워 넣는다.
--      (지금까지는 메인 tracks row 가 곧 버전1 이었으므로 같은 id 사용)
UPDATE tracks t
JOIN track_versions tv ON tv.track_id = t.id AND tv.version_num = 1
SET t.suno_audio_id = tv.suno_audio_id,
    t.stream_url    = tv.stream_url,
    t.version_num   = 1,
    t.title         = COALESCE(tv.title, t.title);

-- 4-2) 버전2 데이터는 새로운 tracks row 로 분리(INSERT)한다.
--      좋아요/댓글/공개여부/재생수는 0/false 로 시작하는 "새 곡"이 된다.
INSERT INTO tracks
  (id, user_id, title, prompt, genre, mood, bpm, duration, status,
   suno_task_id, suno_audio_id, version_num, audio_url, stream_url, cover_url,
   is_public, play_count, like_count, created_at, updated_at)
SELECT
  UUID(), t.user_id, COALESCE(tv.title, t.title), t.prompt, t.genre, t.mood, t.bpm,
  tv.duration, t.status, t.suno_task_id, tv.suno_audio_id, 2,
  tv.audio_url, tv.stream_url, tv.image_url,
  t.is_public, 0, 0, t.created_at, t.updated_at
FROM track_versions tv
JOIN tracks t ON t.id = tv.track_id
WHERE tv.version_num = 2;

-- 4-3) 더 이상 필요 없는 track_versions 테이블 삭제
DROP TABLE IF EXISTS track_versions;

-- ── 완료 확인 ─────────────────────────────────────────────
SELECT 'Migration v3 complete' AS status;
SHOW TABLES;
