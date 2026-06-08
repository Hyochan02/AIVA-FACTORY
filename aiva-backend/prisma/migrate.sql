-- =========================================================
-- AIVA FACTORY · DB 마이그레이션 v2
-- 실행 방법:
--   docker exec -i aiva_mysql mysql -u root -p<비밀번호> aiva_factory < migrate.sql
-- 또는 MySQL 프롬프트에서:
--   source /path/to/migrate.sql
-- =========================================================

USE aiva_factory;

-- ── 1. track_versions 컬럼 추가 (Suno 응답 데이터) ────────
-- ADD COLUMN IF NOT EXISTS : MySQL 8.0+ 에서 지원
ALTER TABLE track_versions
  ADD COLUMN IF NOT EXISTS suno_audio_id VARCHAR(255),
  ADD COLUMN IF NOT EXISTS stream_url    VARCHAR(500),
  ADD COLUMN IF NOT EXISTS image_url     VARCHAR(500),
  ADD COLUMN IF NOT EXISTS title         VARCHAR(255);

-- ── 2. Suno 비동기 작업 추적 테이블 ──────────────────────
CREATE TABLE IF NOT EXISTS suno_jobs (
  id            VARCHAR(36)  PRIMARY KEY,
  track_id      VARCHAR(36),
  type          ENUM('extend','lyrics','separate','wav','video') NOT NULL,
  suno_task_id  VARCHAR(255) NOT NULL,
  status        ENUM('pending','done','error') DEFAULT 'pending',
  result_url    VARCHAR(500),
  extra         JSON,
  created_at    DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_suno_task (suno_task_id),
  INDEX idx_track_id  (track_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ── 3. 비밀번호 재설정 토큰 테이블 ───────────────────────
CREATE TABLE IF NOT EXISTS password_resets (
  id         VARCHAR(36)  PRIMARY KEY,
  user_id    VARCHAR(36)  NOT NULL,
  token      VARCHAR(255) NOT NULL UNIQUE,
  expires_at DATETIME     NOT NULL,
  used       TINYINT(1)   DEFAULT 0,
  created_at DATETIME     DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_token (token)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ── 4. 알림 설정 테이블 ───────────────────────────────────
-- `like` 는 예약어라 백틱 필수
CREATE TABLE IF NOT EXISTS notification_settings (
  user_id    VARCHAR(36) PRIMARY KEY,
  gen        TINYINT(1) DEFAULT 1,
  credit     TINYINT(1) DEFAULT 1,
  `like`     TINYINT(1) DEFAULT 0,
  follow     TINYINT(1) DEFAULT 0,
  marketing  TINYINT(1) DEFAULT 0,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ── 완료 확인 ─────────────────────────────────────────────
SELECT 'Migration complete' AS status;
SHOW TABLES;
