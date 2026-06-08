# =========================================================
# AIVA FACTORY · Backend Dockerfile
# Multi-stage build: TypeScript 빌드 후 프로덕션 이미지 분리
# =========================================================

# ── Stage 1: Builder ──────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# package.json 먼저 복사 → 레이어 캐시 활용 (코드만 바꾼 경우 npm ci 스킵)
COPY package*.json ./
RUN npm ci

# 소스코드 복사 & TypeScript 컴파일
COPY tsconfig.json ./
COPY src ./src
RUN npm run build

# ── Stage 2: Production ───────────────────────────────────
FROM node:20-alpine AS production

WORKDIR /app

# 프로덕션 의존성만 설치 (devDependencies 제외 → 이미지 크기 감소)
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

# 빌드된 JS 파일만 복사
COPY --from=builder /app/dist ./dist

# 포트 노출
EXPOSE 3000

# 헬스체크 (EC2/Docker가 컨테이너 상태를 모니터링할 수 있도록)
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD wget -qO- http://localhost:3000/health || exit 1

# 비root 사용자 실행 (보안)
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

CMD ["node", "dist/index.js"]
