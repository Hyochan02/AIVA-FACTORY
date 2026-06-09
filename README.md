<div align="center">

<br/>

```
 █████╗ ██╗██╗   ██╗ █████╗     ███████╗ █████╗  ██████╗████████╗ ██████╗ ██████╗ ██╗   ██╗
██╔══██╗██║██║   ██║██╔══██╗    ██╔════╝██╔══██╗██╔════╝╚══██╔══╝██╔═══██╗██╔══██╗╚██╗ ██╔╝
███████║██║██║   ██║███████║    █████╗  ███████║██║        ██║   ██║   ██║██████╔╝ ╚████╔╝ 
██╔══██║██║╚██╗ ██╔╝██╔══██║    ██╔══╝  ██╔══██║██║        ██║   ██║   ██║██╔══██╗  ╚██╔╝  
██║  ██║██║ ╚████╔╝ ██║  ██║    ██║     ██║  ██║╚██████╗   ██║   ╚██████╔╝██║  ██║   ██║   
╚═╝  ╚═╝╚═╝  ╚═══╝  ╚═╝  ╚═╝    ╚═╝     ╚═╝  ╚═╝ ╚═════╝   ╚═╝    ╚═════╝ ╚═╝  ╚═╝   ╚═╝  
```

### 🎵 텍스트 한 줄로 만드는 나만의 AI 음악

<br/>

[![React](https://img.shields.io/badge/React_18-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-0F172A?style=for-the-badge&logo=tailwind-css&logoColor=38BDF8)](https://tailwindcss.com)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![MySQL](https://img.shields.io/badge/MySQL_8.0-4479A1?style=for-the-badge&logo=mysql&logoColor=white)](https://www.mysql.com)
[![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com)
[![AWS](https://img.shields.io/badge/AWS-FF9900?style=for-the-badge&logo=amazon-aws&logoColor=white)](https://aws.amazon.com)

<br/>

[**🌐 라이브 데모**](https://aiva-factory.p-e.kr)&nbsp;&nbsp;·&nbsp;&nbsp;[**📖 API 문서 (Swagger)**](https://api.aiva-factory.p-e.kr/api-docs)&nbsp;&nbsp;·&nbsp;&nbsp;[**🐛 이슈 신고**](https://github.com/Hyochan02/AIVA-FACTORY/issues)

<br/>

</div>

---

## 🗂 목차

1. [프로젝트 소개](#-프로젝트-소개)
2. [주요 기능](#-주요-기능)
3. [기술 스택](#-기술-스택)
4. [아키텍처](#-아키텍처)
5. [DB 설계](#-db-설계)
6. [로컬 실행 방법](#-로컬-실행-방법)
7. [배포 정보](#️-배포-정보)
8. [AI 활용 내역](#-ai-활용-내역)

---

## 📌 프로젝트 소개

> 2026-1 AI비즈니스마케팅 웹 서비스 디자인 & 개발 과제

**AIVA FACTORY**는 음악 지식이 없어도 텍스트 프롬프트 하나로 실제 재생 가능한 음악을 만들어주는 AI 음악 생성 플랫폼입니다.

Suno AI API를 기반으로 음악 생성부터 편집·배포까지 하나의 흐름으로 이어지며, 커뮤니티에서 다른 유저의 트랙을 감상하고 팔로우·좋아요·댓글로 소통할 수 있습니다.

---

## ✨ 주요 기능

<table>
  <tr>
    <td align="center" width="200">
      <h3>🎵</h3>
      <b>AI 음악 생성</b><br/>
      <sub>프롬프트 입력으로 최대 2가지 버전 동시 생성. 장르·무드·BPM 설정 지원.</sub>
    </td>
    <td align="center" width="200">
      <h3>🔁</h3>
      <b>음악 연장</b><br/>
      <sub>기존 트랙의 원하는 지점부터 자연스럽게 이어서 연장 생성.</sub>
    </td>
    <td align="center" width="200">
      <h3>✍️</h3>
      <b>가사 생성</b><br/>
      <sub>주제·컨셉을 입력하면 AI가 가사 후보 2종을 자동으로 작성.</sub>
    </td>
  </tr>
  <tr>
    <td align="center" width="200">
      <h3>🎤</h3>
      <b>보컬 분리</b><br/>
      <sub>보컬+반주 2트랙 분리 또는 드럼·베이스 포함 전체 스템 분리.</sub>
    </td>
    <td align="center" width="200">
      <h3>🔊</h3>
      <b>WAV 변환</b><br/>
      <sub>생성된 MP3 트랙을 고음질 WAV 포맷으로 변환해 다운로드.</sub>
    </td>
    <td align="center" width="200">
      <h3>🎬</h3>
      <b>뮤직비디오</b><br/>
      <sub>트랙에 맞는 AI 비주얼 이펙트가 포함된 MP4 영상 자동 생성.</sub>
    </td>
  </tr>
  <tr>
    <td align="center" width="200">
      <h3>🔥</h3>
      <b>커뮤니티 탐색</b><br/>
      <sub>트렌딩·최신 공개 트랙 탐색, 크리에이터 팔로우, 좋아요·댓글.</sub>
    </td>
    <td align="center" width="200">
      <h3>📚</h3>
      <b>라이브러리</b><br/>
      <sub>그리드/리스트 뷰, 장르·상태 필터, 공개/비공개 전환.</sub>
    </td>
    <td align="center" width="200">
      <h3>💳</h3>
      <b>크레딧 시스템</b><br/>
      <sub>가입 시 100 크레딧 무료 지급. 기능별 크레딧 차감.</sub>
    </td>
  </tr>
</table>

---

## 🛠 기술 스택

<details>
<summary><b>Frontend</b></summary>

<br/>

| 분류 | 기술 | 선택 이유 |
|------|------|-----------|
| Framework | React 18 + TypeScript | 컴포넌트 기반 구조, 타입 안정성 |
| Styling | Tailwind CSS v4 | 유틸리티 클래스로 빠른 UI 개발 |
| 라우팅 | React Router v6 | SPA 클라이언트 라우팅 |
| 전역 상태 | Zustand | Redux 대비 가벼운 보일러플레이트 |
| 서버 상태 | 커스텀 `useApi` 훅 | polling 기반 비동기 상태 관리 |
| 아이콘 | Lucide React | 일관된 아이콘 시스템 |
| 번들러 | Vite + Rolldown | 빠른 HMR, 최적화된 빌드 |

</details>

<details>
<summary><b>Backend</b></summary>

<br/>

| 분류 | 기술 | 선택 이유 |
|------|------|-----------|
| Runtime | Node.js + Express | 경량 API 서버, 빠른 개발 속도 |
| 언어 | TypeScript | 타입 안정성, 자동완성 |
| DB 드라이버 | mysql2 (Connection Pool) | 직접 SQL로 쿼리 최적화 |
| 인증 | JWT (30일) + bcryptjs | Stateless 인증, 비밀번호 해시 |
| 유효성 검사 | Zod | 런타임 스키마 검증 |
| API 문서 | Swagger UI (OpenAPI 3.0) | 자동 문서화, 직접 테스트 가능 |
| 보안 | helmet + cors | HTTP 보안 헤더, CORS 정책 |
| 외부 통신 | axios | Suno API 비동기 호출 |

</details>

<details>
<summary><b>Infrastructure</b></summary>

<br/>

| 분류 | 기술 |
|------|------|
| 서버 | AWS EC2 (t2.micro) |
| DB | AWS RDS (MySQL 8.0) |
| 파일 저장 | AWS S3 |
| 컨테이너 | Docker + Docker Compose |
| CI/CD | GitHub Actions |
| 리버스 프록시 | Nginx |
| 도메인 | `aiva-factory.p-e.kr` |

</details>

---

## 🏗 아키텍처

```
┌─────────────────────────────────────────────────────────┐
│                       Browser                           │
└────────────────────────┬────────────────────────────────┘
                         │ HTTPS
┌────────────────────────▼────────────────────────────────┐
│                    Nginx (Reverse Proxy)                 │
│          ┌───────────────────────────────┐              │
│          │     React SPA (Vite Build)    │  정적 서빙    │
│          └───────────────────────────────┘              │
│          ┌───────────────────────────────┐              │
│          │   Express API (Docker)        │  /api/*      │
│          └──────────┬────────────────────┘              │
└─────────────────────┼───────────────────────────────────┘
                      │
          ┌───────────┴────────────┐
          │                        │
┌─────────▼──────────┐   ┌────────▼────────────────┐
│  MySQL (AWS RDS)   │   │     Suno AI API          │
│  - users           │   │  (sunoapi.org)           │
│  - tracks          │   │                          │
│  - suno_jobs       │   │  비동기 처리             │
│  - credit_history  │   │  ┌──────────────────┐   │
│  - follows / likes │   │  │ 완료 시 콜백 →   │   │
└────────────────────┘   │  │ /api/callback/   │   │
                          │  └──────────────────┘   │
                          └─────────────────────────┘
```

**비동기 음악 생성 흐름**

```
Client          Backend          Suno API
  │                │                 │
  │── 생성 요청 ──▶│                 │
  │                │── API 호출 ────▶│
  │◀── jobId 즉시 반환               │
  │                │           (처리 중...)
  │── 3초마다 폴링 ─▶│               │
  │◀── status: pending               │
  │                │◀── 완료 콜백 ───│
  │── 폴링 ────────▶│               │
  │◀── status: done + URL            │
```

---

## 🗄 DB 설계

<details>
<summary><b>테이블 목록 (14개)</b></summary>

<br/>

| 테이블 | 설명 |
|--------|------|
| `users` | 회원 정보 (이메일, 비밀번호 해시, 플랜) |
| `tracks` | AI 생성 트랙 (제목, 프롬프트, 장르, 상태, 공개 여부) |
| `track_versions` | 트랙 버전 1·2 (Suno audio ID, URL) |
| `suno_jobs` | 에디터 작업 히스토리 (type, status, result_url) |
| `credit_history` | 크레딧 지급/차감 내역 |
| `likes` | 트랙 좋아요 관계 |
| `comments` | 트랙 댓글 |
| `follows` | 유저 팔로우 관계 |
| `subscriptions` | 구독 플랜 정보 |
| `notification_settings` | 알림 수신 설정 |
| `social_accounts` | 소셜 로그인 연동 (예정) |
| `user_preferences` | 유저 선호 설정 |
| `editor_settings` | 에디터 개인 설정 |
| `password_resets` | 비밀번호 재설정 토큰 |

</details>

---

## 🚀 로컬 실행 방법

### 사전 요구사항

- Node.js `18+`
- Docker & Docker Compose
- Suno API Key ([sunoapi.org](https://sunoapi.org) 에서 발급)

### 1. 저장소 클론

```bash
git clone https://github.com/Hyochan02/AIVA-FACTORY.git
cd AIVA-FACTORY
```

### 2. 환경변수 설정

```bash
cp aiva-backend/.env.example aiva-backend/.env
cp aiva-frontend/.env.example aiva-frontend/.env
```

`aiva-backend/.env` 파일에 아래 값을 채워주세요:

```env
NODE_ENV=development
PORT=3000
JWT_SECRET=your_secret_here

DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_db_password
DB_NAME=aiva_factory

SUNO_API_KEY=your_suno_api_key
SUNO_API_BASE_URL=https://api.sunoapi.org

AWS_REGION=ap-northeast-2
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
AWS_S3_BUCKET=your_bucket

ALLOWED_ORIGINS=http://localhost:5173
API_BASE_URL=http://localhost:3000
```

### 3. 백엔드 실행

```bash
cd aiva-backend
docker compose up -d
```

### 4. DB 초기화

```bash
docker exec -i aiva_mysql mysql -uroot -pyour_password aiva_factory < prisma/schema.sql
```

### 5. 프론트엔드 실행

```bash
cd aiva-frontend
npm install
npm run dev
# → http://localhost:5173
```

---

## ☁️ 배포 정보

### 🌐 라이브 서비스

| 서비스 | URL | 설명 |
|--------|-----|------|
| **프론트엔드** | [https://aiva-factory.p-e.kr](https://aiva-factory.p-e.kr) | React SPA (Nginx 정적 서빙) |
| **API 서버** | [https://api.aiva-factory.p-e.kr](https://api.aiva-factory.p-e.kr) | Express REST API |
| **API 문서** | [https://api.aiva-factory.p-e.kr/api-docs](https://api.aiva-factory.p-e.kr/api-docs) | Swagger UI |

### 🏗 프로덕션 인프라

```
aiva-factory.p-e.kr          api.aiva-factory.p-e.kr
        │                              │
        └──────────┬───────────────────┘
                   │ HTTPS (Let's Encrypt)
         ┌─────────▼──────────┐
         │   AWS EC2 (t2.micro)│
         │   ap-northeast-2    │
         │                     │
         │  ┌───────────────┐  │
         │  │  Nginx:alpine │  │  ← 리버스 프록시 + 정적 서빙
         │  └──────┬────────┘  │
         │         │           │
         │  ┌──────▼────────┐  │
         │  │  Express:3000 │  │  ← REST API (Docker)
         │  └──────┬────────┘  │
         └─────────┼───────────┘
                   │
         ┌─────────▼────────┐
         │  AWS RDS MySQL   │  ← 프로덕션 DB
         └──────────────────┘
```

### 🔄 CI/CD 파이프라인

`main` 브랜치에 push하면 GitHub Actions가 자동으로 배포합니다.

```
git push origin main
        │
        ▼
┌─────────────────────────────────────────────────┐
│              GitHub Actions                      │
│                                                  │
│  ① 백엔드 Docker 이미지 빌드                      │
│     → GHCR (GitHub Container Registry) push      │
│                                                  │
│  ② 프론트엔드 빌드 (npm run build)                │
│     VITE_API_BASE_URL=https://api.aiva-factory... │
│                                                  │
│  ③ SCP: dist/ → EC2 nginx/html/                  │
│     SCP: nginx.conf → EC2 nginx/nginx.conf        │
│                                                  │
│  ④ SSH: docker compose pull backend              │
│         docker compose up -d --no-deps backend   │
│         nginx -s reload                          │
└─────────────────────────────────────────────────┘
        │
        ▼
  https://aiva-factory.p-e.kr ✅
```

### 🔑 GitHub Secrets 설정 (필수)

| Secret 이름 | 설명 |
|-------------|------|
| `EC2_HOST` | EC2 퍼블릭 IP 또는 도메인 |
| `EC2_SSH_KEY` | EC2 접속용 PEM 키 (private key) |

### 🛡 SSL 인증서

Let's Encrypt 무료 인증서를 사용합니다. EC2에서 certbot으로 발급 후 자동 갱신됩니다.

```bash
# 발급 (EC2에서 1회 실행)
sudo certbot certonly --webroot \
  -w /home/ubuntu/aiva-factory/nginx/html \
  -d aiva-factory.p-e.kr \
  -d www.aiva-factory.p-e.kr \
  --email your@email.com --agree-tos --non-interactive

# 자동 갱신 확인
sudo systemctl status certbot.timer
```

---

## 📖 API 문서

Swagger UI에서 모든 엔드포인트를 직접 테스트할 수 있습니다.

- **로컬**: `http://localhost:3000/api-docs`
- **프로덕션**: [https://api.aiva-factory.p-e.kr/api-docs](https://api.aiva-factory.p-e.kr/api-docs)

<details>
<summary><b>주요 엔드포인트 목록</b></summary>

<br/>

| Method | 경로 | 설명 |
|--------|------|------|
| `POST` | `/api/auth/register` | 회원가입 (크레딧 100 자동 지급) |
| `POST` | `/api/auth/login` | 로그인 → JWT 반환 |
| `GET` | `/api/auth/me` | 내 프로필 + 크레딧 조회 |
| `POST` | `/api/generate` | 음악 생성 요청 (비동기) |
| `GET` | `/api/generate/:id/status` | 생성 상태 폴링 |
| `GET` | `/api/tracks` | 내 트랙 목록 |
| `PATCH` | `/api/tracks/:id` | 트랙 공개/비공개 전환 |
| `GET` | `/api/explore/trending` | 트렌딩 트랙 |
| `GET` | `/api/explore/recent` | 최신 공개 트랙 |
| `POST` | `/api/editor/lyrics` | 가사 생성 |
| `POST` | `/api/editor/extend` | 음악 연장 |
| `POST` | `/api/editor/separate` | 보컬 분리 |
| `GET` | `/api/editor/jobs` | 편집 히스토리 조회 |
| `GET` | `/api/credits` | 크레딧 잔액 조회 |

</details>

---

## 🤖 AI 활용 내역

### 서비스 내 AI — Suno API

본 서비스의 핵심은 **Suno AI**입니다. 텍스트 프롬프트를 전달하면 실제 재생 가능한 음악 파일을 생성하며, 음악 연장·가사 생성·보컬 분리·WAV 변환·뮤직비디오까지 동일 API 체계로 제공됩니다.

Suno API는 비동기 방식으로 동작합니다. 요청 시 `taskId`를 즉시 반환하고, 완료 후 콜백 URL로 결과를 전송합니다.

---

### 개발 과정의 AI 활용 — Claude (Anthropic)

본 프로젝트는 **Claude AI Cowork 모드**를 활용하여 개발되었습니다.

<details>
<summary><b>설계 단계에서의 활용</b></summary>

- 전체 폴더 구조 및 기술 스택 선정
- DB 스키마 설계 (14개 테이블, 관계 정의)
- 비동기 음악 생성 흐름 설계 (폴링 vs 웹소켓 비교 분석)
- JWT 인증 미들웨어 및 보안 구조 설계

</details>

<details>
<summary><b>구현 단계에서의 활용</b></summary>

- Express 라우터 전체 구현 (인증·트랙·탐색·에디터·크레딧·통계)
- Suno API 연동 및 콜백 핸들러 구현
- React 페이지 컴포넌트 및 커스텀 훅 (`useApi`, `usePoller`)
- Swagger OpenAPI 3.0 문서 작성
- Tailwind CSS UI 구현 (Figma 디자인 기반)
- Docker Compose 구성 및 AWS 배포 설정

</details>

<details>
<summary><b>디버깅에서의 활용</b></summary>

- Suno lyrics API 응답 구조 파싱 오류 수정 (`data.response.data[0]` 구조)
- `suno_jobs.user_id` 누락으로 인한 히스토리 조회 실패 해결
- JWT 401 응답 시 전체 로그아웃되던 버그 수정 (auth route만 로그아웃 처리)
- Docker Compose 경로 오류 해결
- Editor 드롭다운 화살표 UI 깨짐 수정

</details>

> 💡 **학습 포인트** — AI를 활용하면 반복적인 코드 작성 시간을 줄일 수 있지만, API 응답 구조·DB 동작·배포 환경처럼 **실제로 실행해봐야 알 수 있는 부분**은 직접 테스트하고 판단하는 과정이 반드시 필요했습니다. AI가 제안한 구조를 이해하고 스스로 검증하는 능력이 핵심입니다.

---

<div align="center">

**2026-1 AI비즈니스마케팅**

Made with ❤️ by **진효찬**

</div>
