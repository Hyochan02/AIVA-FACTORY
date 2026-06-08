-- =========================================================
-- AIVA FACTORY · MySQL 스키마
-- MySQL 8.0+ 기준
-- 실행: mysql -u root -p aiva_factory < schema.sql
-- =========================================================

CREATE DATABASE IF NOT EXISTS aiva_factory
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE aiva_factory;

-- ── 유저 ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id          VARCHAR(36)  PRIMARY KEY,
  email       VARCHAR(255) UNIQUE NOT NULL,
  password    VARCHAR(255),                    -- 소셜 로그인 시 NULL
  name        VARCHAR(100) NOT NULL,
  avatar_url  VARCHAR(500),
  plan        ENUM('free','pro','enterprise') DEFAULT 'free',
  is_active   TINYINT(1) DEFAULT 1,
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_plan (plan)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ── 소셜 로그인 ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS social_accounts (
  id          VARCHAR(36) PRIMARY KEY,
  user_id     VARCHAR(36) NOT NULL,
  provider    ENUM('google','facebook','kakao') NOT NULL,
  provider_id VARCHAR(255) NOT NULL,
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_provider (provider, provider_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ── 유저 선호도 ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS user_preferences (
  user_id    VARCHAR(36) PRIMARY KEY,
  use_cases  JSON,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ── 트랙 ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS tracks (
  id            VARCHAR(36)  PRIMARY KEY,
  user_id       VARCHAR(36)  NOT NULL,
  title         VARCHAR(255) NOT NULL,
  prompt        TEXT         NOT NULL,
  genre         VARCHAR(100),
  mood          VARCHAR(100),
  bpm           SMALLINT UNSIGNED,
  duration      SMALLINT UNSIGNED,               -- 초 단위
  status        ENUM('pending','generating','done','error') DEFAULT 'pending',
  suno_task_id  VARCHAR(255),
  audio_url     VARCHAR(500),
  cover_url     VARCHAR(500),
  is_public     TINYINT(1) DEFAULT 0,
  play_count    INT UNSIGNED DEFAULT 0,
  like_count    INT UNSIGNED DEFAULT 0,
  created_at    DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id   (user_id),
  INDEX idx_status    (status),
  INDEX idx_public_created (is_public, created_at),
  INDEX idx_suno_task (suno_task_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ── 트랙 버전 (Suno는 1회 요청 시 2버전 생성) ──────────────
CREATE TABLE IF NOT EXISTS track_versions (
  id          VARCHAR(36)  PRIMARY KEY,
  track_id    VARCHAR(36)  NOT NULL,
  version_num TINYINT      NOT NULL,             -- 1, 2
  audio_url   VARCHAR(500) NOT NULL,
  duration    SMALLINT UNSIGNED,
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (track_id) REFERENCES tracks(id) ON DELETE CASCADE,
  INDEX idx_track_id (track_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ── 크레딧 이용 내역 ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS credit_history (
  id          VARCHAR(36)  PRIMARY KEY,
  user_id     VARCHAR(36)  NOT NULL,
  type        ENUM('grant','usage','purchase','refund') NOT NULL,
  amount      SMALLINT     NOT NULL,             -- 양수: 지급, 음수: 차감
  balance     SMALLINT     NOT NULL,             -- 트랜잭션 후 잔액
  description VARCHAR(255),
  track_id    VARCHAR(36),                       -- usage 시 연결된 트랙
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id)  REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (track_id) REFERENCES tracks(id) ON DELETE SET NULL,
  INDEX idx_user_id   (user_id),
  INDEX idx_created   (user_id, created_at),
  INDEX idx_type      (type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ── 구독 ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS subscriptions (
  id                    VARCHAR(36) PRIMARY KEY,
  user_id               VARCHAR(36) NOT NULL,
  plan                  ENUM('free','pro','enterprise') NOT NULL,
  billing_cycle         ENUM('monthly','yearly'),
  status                ENUM('active','cancelled','expired') DEFAULT 'active',
  current_period_end    DATETIME,
  cancel_at_period_end  TINYINT(1) DEFAULT 0,
  payment_method_id     VARCHAR(255),
  created_at            DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_active (user_id, status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ── 좋아요 ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS likes (
  user_id    VARCHAR(36) NOT NULL,
  track_id   VARCHAR(36) NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, track_id),
  FOREIGN KEY (user_id)  REFERENCES users(id)   ON DELETE CASCADE,
  FOREIGN KEY (track_id) REFERENCES tracks(id)  ON DELETE CASCADE,
  INDEX idx_track_id (track_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ── 댓글 ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS comments (
  id         VARCHAR(36) PRIMARY KEY,
  track_id   VARCHAR(36) NOT NULL,
  user_id    VARCHAR(36) NOT NULL,
  content    TEXT        NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (track_id) REFERENCES tracks(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id)  REFERENCES users(id)  ON DELETE CASCADE,
  INDEX idx_track_id (track_id),
  INDEX idx_created  (track_id, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ── 팔로우 ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS follows (
  follower_id  VARCHAR(36) NOT NULL,
  following_id VARCHAR(36) NOT NULL,
  created_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (follower_id, following_id),
  FOREIGN KEY (follower_id)  REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (following_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_following (following_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ── 알림 설정 ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notification_settings (
  user_id    VARCHAR(36) PRIMARY KEY,
  gen        TINYINT(1) DEFAULT 1,   -- 생성 완료
  credit     TINYINT(1) DEFAULT 1,   -- 크레딧 부족
  `like`     TINYINT(1) DEFAULT 0,   -- 좋아요
  follow     TINYINT(1) DEFAULT 0,   -- 팔로우
  marketing  TINYINT(1) DEFAULT 0,   -- 마케팅
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ── 에디터 설정 ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS editor_settings (
  track_id    VARCHAR(36) PRIMARY KEY,
  stem_config JSON,
  effects     JSON,
  updated_at  DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (track_id) REFERENCES tracks(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =========================================================
-- 초기 데이터 (개발용 테스트 계정)
-- 비밀번호: test1234! (bcrypt 해시)
-- =========================================================
INSERT IGNORE INTO users (id, email, password, name, plan) VALUES
  ('dev-user-001', 'test@aivafactory.com',
   '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/lewKyGfcBipnmvA2y',
   '테스트유저', 'free');

INSERT IGNORE INTO credit_history (id, user_id, type, amount, balance, description) VALUES
  ('init-credit-001', 'dev-user-001', 'grant', 100, 100, '가입 축하 크레딧');

INSERT IGNORE INTO notification_settings (user_id) VALUES ('dev-user-001');

-- ─────────────────────────────────────────────────────────
-- 마이그레이션: track_versions 컬럼 추가 (v2)
-- 이미 컬럼이 있으면 무시 (IF NOT EXISTS 미지원 → 에러 무시)
-- ─────────────────────────────────────────────────────────
ALTER TABLE track_versions
  ADD COLUMN IF NOT EXISTS suno_audio_id VARCHAR(255),
  ADD COLUMN IF NOT EXISTS stream_url    VARCHAR(500),
  ADD COLUMN IF NOT EXISTS image_url     VARCHAR(500),
  ADD COLUMN IF NOT EXISTS title         VARCHAR(255);

-- ─────────────────────────────────────────────────────────
-- Suno 비동기 작업 추적 테이블 (extend / lyrics / separate / wav / video)
-- ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS suno_jobs (
  id            VARCHAR(36)  PRIMARY KEY,
  track_id      VARCHAR(36),                            -- NULL 허용 (lyrics는 트랙 무관)
  user_id       VARCHAR(36),                            -- 소유자 (직접 저장, track 없는 경우도 대응)
  type          ENUM('extend','lyrics','separate','wav','video') NOT NULL,
  suno_task_id  VARCHAR(255) NOT NULL,
  status        ENUM('pending','done','error') DEFAULT 'pending',
  result_url    VARCHAR(500),
  extra         JSON,
  created_at    DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_suno_task (suno_task_id),
  INDEX idx_track_id  (track_id),
  INDEX idx_user_id   (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ─────────────────────────────────────────────────────────
-- 비밀번호 재설정 토큰 테이블
-- ─────────────────────────────────────────────────────────
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
