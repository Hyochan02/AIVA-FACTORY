<div align="center">

# 🎵 AIVA FACTORY

**AI 음악 생성 플랫폼** — 텍스트 한 줄로 나만의 음악을 만드세요

[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=white)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?style=flat-square&logo=mysql&logoColor=white)](https://www.mysql.com)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=flat-square&logo=docker&logoColor=white)](https://www.docker.com)
[![AWS](https://img.shields.io/badge/AWS-EC2%20%7C%20S3%20%7C%20RDS-FF9900?style=flat-square&logo=amazon-aws&logoColor=white)](https://aws.amazon.com)

[🌐 라이브 데모](https://aiva-factory.p-e.kr) · [📖 API 문서](https://api.aiva-factory.p-e.kr/api-docs)

</div>

---

## 📌 프로젝트 소개

**AIVA FACTORY**는 2026-1 AI비즈니스마케팅 수업의 웹 서비스 디자인 & 개발 과제로 제작된 AI 음악 생성 플랫폼입니다.

Suno AI API를 활용하여 음악 지식 없이도 텍스트 프롬프트만으로 실제 재생 가능한 음악을 생성하고, 편집하고, 커뮤니티에서 공유할 수 있습니다.

### ✨ 주요 기능

| 기능 | 설명 | 크레딧 |
|------|------|--------|
| 🎵 AI 음악 생성 | 프롬프트로 최대 2가지 버전 동시 생성 | 10 |
| 🔁 음악 연장 | 기존 트랙을 자연스럽게 이어서 연장 | 4 |
| ✍️ 가사 생성 | 주제 입력 시 가사 후보 2종 생성 | 2 |
| 🎤 보컬 분리 | 보컬+반주 분리 또는 전체 스템 분리 | 10 |
| 🔊 WAV 변환 | MP3 트랙을 고음질 WAV로 변환 | 2 |
| 🎬 뮤직비디오 | AI 비주얼 MP4 비디오 자동 생성 | 5 |
| 👥 커뮤니티 | 트렌딩 탐색, 팔로우, 좋아요·댓글 | — |

---

## 🛠 기술 스택

### Frontend
- **React 18** + **TypeScript** + **Vite**
- **Tailwind CSS v4** — 스타일링
- **React Router v6** — 클라이언트 라우팅
- **Zustand** — 전역 상태 관리
- **Lucide React** — 아이콘

### Backend
- **Node.js** + **Express** + **TypeScript**
- **mysql2** — MySQL 커넥션 풀
- **JWT** (30일) + **bcryptjs** — 인증/보안
- **Zod** — 요청 유효성 검사
- **Swagger UI** — API 문서 자동화
- **helmet** + **cors** — 보안 헤더

### Infrastructure
- **AWS EC2** — 애플리케이션 서버
- **AWS RDS (MySQL 8.0)** — 데이터베이스
- **AWS S3** — 오디오 파일 저장
- **Docker + Docker Compose** — 컨테이너화
- **GitHub Actions** — CI/CD
- **Nginx** — 리버스 프록시 + 정적 파일 서빙

### External API
- **[Suno API](https://sunoapi.org)** — AI 음악 생성 전 기능

---

## 🏗 아키텍처

```
[ Browser ]
    │ HTTPS
    ▼
[ Nginx ]
    ├──▶ [ React SPA ]         (정적 파일)
    └──▶ [ Express API ]       (Docker)
              ├──▶ [ MySQL / AWS RDS ]
              └──▶ [ Suno API ]
                       │ 비동기 콜백
                       └──▶ POST /api/editor/callback/:type
```

**비동기 처리 흐름**
1. 클라이언트 요청 → 백엔드가 Suno API 호출 후 즉시 `jobId` 반환
2. 클라이언트가 3초 간격으로 상태 폴링
3. Suno 완료 시 콜백으로 DB 업데이트

---

## 📁 프로젝트 구조

```
aiva-factory/
├── aiva-frontend/          # React 클라이언트
│   └── src/
│       ├── api/            # API 호출 함수
│       ├── components/     # 공통 컴포넌트
│       ├── hooks/          # 커스텀 훅 (useApi, usePoller)
│       ├── pages/          # 페이지 컴포넌트
│       ├── store/          # Zustand 전역 상태
│       └── utils/          # 유틸 함수
│
└── aiva-backend/           # Express API 서버
    ├── src/
    │   ├── routes/         # API 라우터
    │   ├── middlewares/    # 인증 등 미들웨어
    │   ├── config/         # DB, 설정
    │   └── docs/           # Swagger 명세
    └── prisma/
        └── schema.sql      # DB 스키마
```

---

## 🚀 로컬 실행 방법

### 사전 요구사항
- Node.js 18+
- Docker & Docker Compose
- MySQL 8.0 (또는 Docker로 실행)

### 1. 저장소 클론

```bash
git clone https://github.com/Hyochan02/AIVA-FACTORY.git
cd AIVA-FACTORY
```

### 2. 환경변수 설정

```bash
# 백엔드
cp aiva-backend/.env.example aiva-backend/.env
# .env 파일을 열어 실제 값 입력

# 프론트엔드
cp aiva-frontend/.env.example aiva-frontend/.env
```

**백엔드 주요 환경변수** (`aiva-backend/.env`)

```env
NODE_ENV=development
PORT=3000
JWT_SECRET=your_jwt_secret

# MySQL
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=aiva_factory

# Suno AI API
SUNO_API_KEY=your_suno_api_key
SUNO_API_BASE_URL=https://api.sunoapi.org

# AWS S3
AWS_REGION=ap-northeast-2
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
AWS_S3_BUCKET=your_bucket
```

### 3. 백엔드 실행

```bash
cd aiva-backend
docker compose up -d        # MySQL + API 서버 실행
```

또는 로컬 Node.js로 실행:
```bash
npm install
npm run dev
```

### 4. DB 초기화

```bash
# MySQL에 접속 후 스키마 적용
mysql -u root -p aiva_factory < prisma/schema.sql
```

### 5. 프론트엔드 실행

```bash
cd aiva-frontend
npm install
npm run dev
# http://localhost:5173 에서 확인
```

---

## 📄 API 문서

Swagger UI: `http://localhost:3000/api-docs`  
프로덕션: [https://api.aiva-factory.p-e.kr/api-docs](https://api.aiva-factory.p-e.kr/api-docs)

주요 엔드포인트:

| Method | 경로 | 설명 |
|--------|------|------|
| POST | `/api/auth/register` | 회원가입 |
| POST | `/api/auth/login` | 로그인 |
| POST | `/api/generate` | 음악 생성 요청 |
| GET | `/api/generate/:id/status` | 생성 상태 폴링 |
| GET | `/api/tracks` | 내 트랙 목록 |
| GET | `/api/explore/trending` | 트렌딩 트랙 |
| POST | `/api/editor/lyrics` | 가사 생성 |
| GET | `/api/editor/jobs` | 편집 히스토리 |

---

## 🤖 AI 활용 내역

### 서비스 내 AI — Suno API

본 서비스의 핵심 기능은 **Suno AI API**를 통해 구현됩니다. 텍스트 프롬프트를 Suno 서버에 전달하면 실제 음악 파일(MP3)을 생성해서 반환합니다. 음악 연장·가사 생성·보컬 분리·WAV 변환·뮤직비디오 생성도 동일 API 체계를 사용합니다.

### 개발 과정의 AI 활용 — Claude (Anthropic)

본 프로젝트는 **Claude AI Cowork 모드**를 활용하여 개발되었습니다.

**설계 단계**
- 전체 폴더 구조 및 기술 스택 선정
- DB 스키마 설계 (14개 테이블)
- 비동기 음악 생성 흐름 설계 (폴링 방식)
- JWT 인증 미들웨어 구조

**구현 단계**
- Express 라우터 전체 (인증, 트랙, 탐색, 에디터, 크레딧 등)
- Suno API 연동 및 콜백 핸들러
- React 페이지 컴포넌트 및 커스텀 훅
- Swagger OpenAPI 3.0 문서
- Tailwind CSS UI 구현 (피그마 디자인 기반)

**디버깅**
- Suno lyrics API 응답 구조 파싱 오류 수정
- `suno_jobs` 테이블 `user_id` 누락으로 인한 히스토리 조회 실패 해결
- JWT 401 응답 시 전체 로그아웃되던 버그 수정
- Docker Compose 경로 오류 해결

> 💡 AI를 활용하면 반복적인 코드 작성 시간을 줄일 수 있지만, API 응답 구조나 DB 동작처럼 실제로 확인해야 하는 부분은 직접 테스트하고 판단하는 과정이 필요했습니다.

---

## 📝 라이선스

본 프로젝트는 학습 및 포트폴리오 목적으로 제작되었습니다.

---

<div align="center">
  2026-1 AI비즈니스마케팅 · 진효찬
</div>
