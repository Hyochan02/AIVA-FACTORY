/**
 * AIVA FACTORY · OpenAPI 3.0 명세
 * Swagger UI: https://api.aiva-factory.p-e.kr/api-docs
 */

const swaggerSpec = {
  openapi: '3.0.3',
  info: {
    title: 'AIVA FACTORY API',
    version: '1.0.0',
    description:
      'AI 음악 생성 플랫폼 **AIVA FACTORY**의 REST API 문서입니다.\n\n' +
      '## 인증\n' +
      '`POST /api/auth/login` 또는 `POST /api/auth/register` 응답의 `data.token` 값을\n' +
      '**Authorize** 버튼에 입력하면 인증이 필요한 모든 엔드포인트를 테스트할 수 있습니다.\n\n' +
      '## 크레딧\n' +
      '음악 1곡 생성 시 크레딧 10개 차감. 가입 시 100개 무료 제공.',
    contact: {
      name: 'Hyochan',
      url: 'https://github.com/Hyochan02/AIVA-FACTORY',
    },
  },
  servers: [
    { url: 'https://api.aiva-factory.p-e.kr', description: '🚀 프로덕션 서버' },
    { url: 'http://localhost:3000', description: '🛠️ 로컬 개발 서버' },
  ],
  tags: [
    { name: 'Auth',          description: '회원가입 / 로그인 / 프로필 관리' },
    { name: 'Generate',      description: 'Suno AI 음악 생성 (비동기)' },
    { name: 'Tracks',        description: '내 트랙 목록 / 상세 / 수정 / 삭제 / 좋아요 / 댓글' },
    { name: 'Explore',       description: '커뮤니티 탐색 (트렌딩 / 최신 / 검색)' },
    { name: 'Users',         description: '유저 공개 프로필 / 팔로우' },
    { name: 'Credits',       description: '크레딧 잔액 / 이용 내역' },
    { name: 'Subscriptions', description: '요금제 조회 / 구독 관리' },
    { name: 'Notifications', description: '알림 수신 설정' },
    { name: 'Stats',         description: '대시보드 통계 요약' },
    { name: 'Editor',        description: 'Suno AI 음악 편집 (연장 / 가사 / 보컬 분리 / WAV / 비디오)' },
  ],

  // ── 공통 컴포넌트 ──────────────────────────────────────────────
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'JWT 토큰 (유효기간 30일). 로그인/회원가입 응답의 `data.token` 값을 입력하세요.',
      },
    },

    schemas: {
      // ── 공통 응답 래퍼 ─────────────────────────────────────────
      SuccessResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          data: { type: 'object', description: '응답 데이터 (엔드포인트마다 다름)' },
        },
      },
      MessageResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string', example: '처리가 완료되었습니다.' },
        },
      },
      ErrorResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          error: { type: 'string', example: '오류 메시지' },
          code: { type: 'string', example: 'ERROR_CODE', description: '일부 오류에만 포함' },
        },
      },
      Pagination: {
        type: 'object',
        properties: {
          page:       { type: 'integer', example: 1 },
          limit:      { type: 'integer', example: 20 },
          total:      { type: 'integer', example: 135 },
          totalPages: { type: 'integer', example: 7 },
        },
      },

      // ── 유저 ───────────────────────────────────────────────────
      User: {
        type: 'object',
        properties: {
          id:         { type: 'string', format: 'uuid', example: 'a1b2c3d4-...' },
          email:      { type: 'string', format: 'email', example: 'user@example.com' },
          name:       { type: 'string', example: '홍길동' },
          avatar_url: { type: 'string', nullable: true, example: 'https://...' },
          plan:       { type: 'string', enum: ['free', 'pro', 'enterprise'], example: 'free' },
          created_at: { type: 'string', format: 'date-time' },
        },
      },

      // ── 트랙 ───────────────────────────────────────────────────
      Track: {
        type: 'object',
        properties: {
          id:           { type: 'string', format: 'uuid' },
          user_id:      { type: 'string', format: 'uuid' },
          title:        { type: 'string', example: 'Rainy Tokyo Night' },
          prompt:       { type: 'string', example: '비 오는 도쿄 밤, 시티팝 분위기' },
          genre:        { type: 'string', nullable: true, example: 'City Pop' },
          mood:         { type: 'string', nullable: true, example: 'Chill' },
          bpm:          { type: 'integer', nullable: true, example: 120 },
          duration:     { type: 'integer', nullable: true, example: 154, description: '초 단위' },
          status:       { type: 'string', enum: ['pending', 'generating', 'done', 'error'] },
          audio_url:    { type: 'string', nullable: true, example: 'https://s3.ap-northeast-2.amazonaws.com/...' },
          cover_url:    { type: 'string', nullable: true },
          is_public:    { type: 'boolean', example: false },
          play_count:   { type: 'integer', example: 0 },
          like_count:   { type: 'integer', example: 0 },
          created_at:   { type: 'string', format: 'date-time' },
        },
      },

      // ── 댓글 ───────────────────────────────────────────────────
      Comment: {
        type: 'object',
        properties: {
          id:         { type: 'string', format: 'uuid' },
          track_id:   { type: 'string', format: 'uuid' },
          user_id:    { type: 'string', format: 'uuid' },
          user_name:  { type: 'string', example: '홍길동' },
          avatar_url: { type: 'string', nullable: true },
          content:    { type: 'string', example: '너무 좋네요!' },
          created_at: { type: 'string', format: 'date-time' },
        },
      },

      // ── 크레딧 내역 ────────────────────────────────────────────
      CreditHistory: {
        type: 'object',
        properties: {
          id:          { type: 'string', format: 'uuid' },
          type:        { type: 'string', enum: ['grant', 'usage', 'purchase', 'refund'] },
          amount:      { type: 'integer', example: -10, description: '양수: 지급, 음수: 차감' },
          balance:     { type: 'integer', example: 90 },
          description: { type: 'string', example: '음악 생성: Rainy Tokyo Night' },
          created_at:  { type: 'string', format: 'date-time' },
        },
      },

      // ── 구독 플랜 ──────────────────────────────────────────────
      Plan: {
        type: 'object',
        properties: {
          id:            { type: 'string', example: 'pro' },
          name:          { type: 'string', example: 'Pro' },
          price_monthly: { type: 'integer', example: 19000 },
          price_yearly:  { type: 'integer', example: 190000 },
          credits:       { type: 'integer', example: 500 },
          features:      { type: 'array', items: { type: 'string' }, example: ['WAV 다운로드', '스템 분리', '상업적 이용'] },
        },
      },

      // ── 알림 설정 ──────────────────────────────────────────────
      NotificationSettings: {
        type: 'object',
        properties: {
          gen:       { type: 'boolean', example: true,  description: '생성 완료 알림' },
          credit:    { type: 'boolean', example: true,  description: '크레딧 부족 알림' },
          like:      { type: 'boolean', example: false, description: '좋아요 알림' },
          follow:    { type: 'boolean', example: false, description: '팔로우 알림' },
          marketing: { type: 'boolean', example: false, description: '마케팅 알림' },
        },
      },
    },

    responses: {
      Unauthorized: {
        description: '인증 실패 (토큰 없음 또는 만료)',
        content: { 'application/json': { schema: { '$ref': '#/components/schemas/ErrorResponse' } } },
      },
      NotFound: {
        description: '리소스를 찾을 수 없음',
        content: { 'application/json': { schema: { '$ref': '#/components/schemas/ErrorResponse' } } },
      },
      BadRequest: {
        description: '잘못된 요청 파라미터',
        content: { 'application/json': { schema: { '$ref': '#/components/schemas/ErrorResponse' } } },
      },
    },
  },

  security: [{ bearerAuth: [] }],

  // ── 엔드포인트 ─────────────────────────────────────────────────
  paths: {

    // ════════════════════════════════════════════════════════
    // AUTH
    // ════════════════════════════════════════════════════════
    '/api/auth/register': {
      post: {
        tags: ['Auth'],
        summary: '회원가입',
        description: '이메일 + 비밀번호로 신규 계정 생성. 가입 즉시 크레딧 100개 자동 지급.',
        security: [],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'email', 'password'],
                properties: {
                  name:     { type: 'string', example: '홍길동' },
                  email:    { type: 'string', format: 'email', example: 'user@example.com' },
                  password: { type: 'string', minLength: 8, example: 'Pass1234!' },
                  useCases: { type: 'array', items: { type: 'string' }, example: ['유튜브 BGM', '게임 음악'], description: '선택 항목' },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: '회원가입 성공',
            content: {
              'application/json': {
                schema: {
                  allOf: [
                    { '$ref': '#/components/schemas/SuccessResponse' },
                    {
                      properties: {
                        data: {
                          type: 'object',
                          properties: {
                            token: { type: 'string', example: 'eyJhbGci...' },
                            user:  { '$ref': '#/components/schemas/User' },
                          },
                        },
                      },
                    },
                  ],
                },
              },
            },
          },
          400: { '$ref': '#/components/responses/BadRequest' },
          409: { description: '이미 사용 중인 이메일', content: { 'application/json': { schema: { '$ref': '#/components/schemas/ErrorResponse' } } } },
        },
      },
    },

    '/api/auth/login': {
      post: {
        tags: ['Auth'],
        summary: '로그인',
        description: 'JWT 토큰 발급. 응답의 `data.token`을 이후 요청 헤더에 사용하세요.',
        security: [],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email:    { type: 'string', format: 'email', example: 'test@aivafactory.com' },
                  password: { type: 'string', example: 'test1234!' },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: '로그인 성공',
            content: {
              'application/json': {
                schema: {
                  allOf: [
                    { '$ref': '#/components/schemas/SuccessResponse' },
                    {
                      properties: {
                        data: {
                          type: 'object',
                          properties: {
                            token: { type: 'string', example: 'eyJhbGci...' },
                            user:  { '$ref': '#/components/schemas/User' },
                          },
                        },
                      },
                    },
                  ],
                },
              },
            },
          },
          401: { description: '이메일 또는 비밀번호 불일치', content: { 'application/json': { schema: { '$ref': '#/components/schemas/ErrorResponse' } } } },
        },
      },
    },

    '/api/auth/social': {
      post: {
        tags: ['Auth'],
        summary: '소셜 로그인 (구현 예정)',
        description: 'Google / Kakao 소셜 로그인. 현재 stub 상태.',
        security: [],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['provider', 'token'],
                properties: {
                  provider: { type: 'string', enum: ['google', 'kakao'], example: 'google' },
                  token:    { type: 'string', example: 'oauth_access_token' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: '소셜 로그인 성공', content: { 'application/json': { schema: { '$ref': '#/components/schemas/SuccessResponse' } } } },
        },
      },
    },

    '/api/auth/me': {
      get: {
        tags: ['Auth'],
        summary: '내 프로필 조회',
        description: 'JWT 토큰으로 로그인한 유저의 프로필 + 크레딧 잔액을 반환합니다.',
        responses: {
          200: {
            description: '프로필 조회 성공',
            content: {
              'application/json': {
                schema: {
                  allOf: [
                    { '$ref': '#/components/schemas/SuccessResponse' },
                    { properties: { data: { allOf: [{ '$ref': '#/components/schemas/User' }, { properties: { credits: { type: 'integer', example: 90 } } }] } } },
                  ],
                },
              },
            },
          },
          401: { '$ref': '#/components/responses/Unauthorized' },
        },
      },
      put: {
        tags: ['Auth'],
        summary: '내 프로필 수정',
        description: '이름 또는 아바타 URL 변경',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name:       { type: 'string', example: '새이름' },
                  avatar_url: { type: 'string', example: 'https://...' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: '프로필 수정 성공', content: { 'application/json': { schema: { '$ref': '#/components/schemas/MessageResponse' } } } },
          401: { '$ref': '#/components/responses/Unauthorized' },
        },
      },
    },

    '/api/auth/password': {
      put: {
        tags: ['Auth'],
        summary: '비밀번호 변경',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['currentPassword', 'newPassword'],
                properties: {
                  currentPassword: { type: 'string', example: 'OldPass1!' },
                  newPassword:     { type: 'string', minLength: 8, example: 'NewPass2@' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: '비밀번호 변경 성공', content: { 'application/json': { schema: { '$ref': '#/components/schemas/MessageResponse' } } } },
          400: { description: '현재 비밀번호 불일치', content: { 'application/json': { schema: { '$ref': '#/components/schemas/ErrorResponse' } } } },
          401: { '$ref': '#/components/responses/Unauthorized' },
        },
      },
    },

    '/api/auth/forgot-password': {
      post: {
        tags: ['Auth'],
        summary: '비밀번호 재설정 이메일 발송',
        description:
          '입력한 이메일로 비밀번호 재설정 링크를 발송합니다.\n\n' +
          '**보안**: 이메일 존재 여부에 관계없이 항상 동일한 성공 응답을 반환합니다 (이메일 열거 공격 방지).\n\n' +
          '토큰 유효 시간: **1시간**.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email'],
                properties: {
                  email: { type: 'string', format: 'email', example: 'user@example.com' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: '항상 성공 (이메일 존재 여부 노출 안 함)', content: { 'application/json': { schema: { '$ref': '#/components/schemas/MessageResponse' } } } },
        },
        security: [],
      },
    },

    '/api/auth/reset-password': {
      post: {
        tags: ['Auth'],
        summary: '비밀번호 재설정',
        description: '이메일 링크에 포함된 `token`과 새 비밀번호를 전송하면 비밀번호를 변경합니다.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['token', 'newPassword'],
                properties: {
                  token:       { type: 'string', example: 'abc123def456...' },
                  newPassword: { type: 'string', minLength: 8, example: 'NewPass1!' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: '비밀번호 변경 완료', content: { 'application/json': { schema: { '$ref': '#/components/schemas/MessageResponse' } } } },
          400: { description: '토큰 만료 또는 이미 사용된 토큰', content: { 'application/json': { schema: { '$ref': '#/components/schemas/ErrorResponse' } } } },
        },
        security: [],
      },
    },

    // ════════════════════════════════════════════════════════
    // GENERATE
    // ════════════════════════════════════════════════════════
    '/api/generate': {
      post: {
        tags: ['Generate'],
        summary: '음악 생성 요청',
        description:
          'Suno AI에 음악 생성을 요청합니다. **비동기 방식** — 즉시 `taskId`를 반환하고 실제 생성은 백그라운드에서 진행됩니다.\n\n' +
          '생성 완료는 `GET /api/generate/{taskId}/status` 를 2초마다 폴링하여 확인하세요.\n\n' +
          '크레딧 **10개** 차감.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['prompt'],
                properties: {
                  prompt:   { type: 'string', example: '비 오는 도쿄 밤, 시티팝 분위기의 잔잔한 LoFi 트랙' },
                  genre:    { type: 'string', example: 'City Pop' },
                  mood:     { type: 'string', example: 'Chill' },
                  bpm:      { type: 'integer', example: 120 },
                  duration: { type: 'integer', example: 180, description: '생성 희망 길이 (초)' },
                  isPublic: { type: 'boolean', example: true, description: '생성 즉시 공개 여부 (기본값: true)' },
                },
              },
            },
          },
        },
        responses: {
          202: {
            description: '생성 요청 접수 (비동기 처리 중)',
            content: {
              'application/json': {
                schema: {
                  allOf: [
                    { '$ref': '#/components/schemas/SuccessResponse' },
                    {
                      properties: {
                        data: {
                          type: 'object',
                          properties: {
                            taskId:  { type: 'string', example: 'task_abc123' },
                            trackId: { type: 'string', format: 'uuid' },
                            message: { type: 'string', example: '음악 생성을 시작했습니다. 상태를 폴링해주세요.' },
                          },
                        },
                      },
                    },
                  ],
                },
              },
            },
          },
          402: { description: '크레딧 부족 (code: INSUFFICIENT_CREDITS)', content: { 'application/json': { schema: { '$ref': '#/components/schemas/ErrorResponse' } } } },
          401: { '$ref': '#/components/responses/Unauthorized' },
        },
      },
    },

    '/api/generate/{trackId}/status': {
      get: {
        tags: ['Generate'],
        summary: '생성 진행 상태 폴링',
        description: '`status`가 `done` 또는 `error`가 될 때까지 **3초 간격**으로 호출하세요.\n\n완료 시 `data.versions` 배열에 버전 1·2가 포함됩니다.',
        parameters: [
          { name: 'trackId', in: 'path', required: true, schema: { type: 'string', format: 'uuid' }, description: 'POST /api/generate 응답의 trackId' },
        ],
        responses: {
          200: {
            description: '상태 조회 성공',
            content: {
              'application/json': {
                schema: {
                  allOf: [
                    { '$ref': '#/components/schemas/SuccessResponse' },
                    {
                      properties: {
                        data: {
                          type: 'object',
                          properties: {
                            taskId:   { type: 'string' },
                            status:   { type: 'string', enum: ['pending', 'generating', 'done', 'error'] },
                            progress: { type: 'integer', example: 65, description: '0~100 (%)' },
                            track:    { '$ref': '#/components/schemas/Track', description: 'status=done 일 때만 포함' },
                          },
                        },
                      },
                    },
                  ],
                },
              },
            },
          },
          404: { '$ref': '#/components/responses/NotFound' },
          401: { '$ref': '#/components/responses/Unauthorized' },
        },
      },
    },

    '/api/generate/{trackId}': {
      delete: {
        tags: ['Generate'],
        summary: '생성 취소',
        description: '진행 중인 생성을 취소하고 크레딧 10개를 환불합니다.',
        parameters: [
          { name: 'trackId', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
        ],
        responses: {
          200: { description: '취소 및 크레딧 환불 성공', content: { 'application/json': { schema: { '$ref': '#/components/schemas/MessageResponse' } } } },
          400: { description: '이미 완료된 작업은 취소 불가', content: { 'application/json': { schema: { '$ref': '#/components/schemas/ErrorResponse' } } } },
          404: { '$ref': '#/components/responses/NotFound' },
          401: { '$ref': '#/components/responses/Unauthorized' },
        },
      },
    },

    // ════════════════════════════════════════════════════════
    // TRACKS
    // ════════════════════════════════════════════════════════
    '/api/tracks': {
      get: {
        tags: ['Tracks'],
        summary: '내 트랙 목록',
        description: '로그인 유저 본인의 트랙 목록. 검색 · 장르 필터 · 페이지네이션 지원.',
        parameters: [
          { name: 'q',      in: 'query', schema: { type: 'string' },  description: '제목 검색 (부분 일치)' },
          { name: 'genre',  in: 'query', schema: { type: 'string' },  description: '장르 필터' },
          { name: 'status', in: 'query', schema: { type: 'string', enum: ['pending', 'generating', 'done', 'error'] } },
          { name: 'page',   in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit',  in: 'query', schema: { type: 'integer', default: 20 } },
          { name: 'sort',   in: 'query', schema: { type: 'string', enum: ['created_at', 'title', 'play_count'], default: 'created_at' } },
          { name: 'order',  in: 'query', schema: { type: 'string', enum: ['asc', 'desc'], default: 'desc' } },
        ],
        responses: {
          200: {
            description: '트랙 목록 조회 성공',
            content: {
              'application/json': {
                schema: {
                  allOf: [
                    { '$ref': '#/components/schemas/SuccessResponse' },
                    {
                      properties: {
                        data: {
                          type: 'object',
                          properties: {
                            items:      { type: 'array', items: { '$ref': '#/components/schemas/Track' } },
                            pagination: { '$ref': '#/components/schemas/Pagination' },
                          },
                        },
                      },
                    },
                  ],
                },
              },
            },
          },
          401: { '$ref': '#/components/responses/Unauthorized' },
        },
      },
    },

    '/api/tracks/{id}': {
      get: {
        tags: ['Tracks'],
        summary: '트랙 상세 조회',
        description: '트랙 정보 + 버전 목록 + 좋아요 수 + 내 좋아요 여부를 반환합니다. 조회 시 play_count +1.',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: {
          200: {
            description: '상세 조회 성공',
            content: {
              'application/json': {
                schema: {
                  allOf: [
                    { '$ref': '#/components/schemas/SuccessResponse' },
                    {
                      properties: {
                        data: {
                          allOf: [
                            { '$ref': '#/components/schemas/Track' },
                            {
                              properties: {
                                versions:  { type: 'array', items: { type: 'object' } },
                                likeCount: { type: 'integer', example: 42 },
                                isLiked:   { type: 'boolean', example: false },
                              },
                            },
                          ],
                        },
                      },
                    },
                  ],
                },
              },
            },
          },
          403: { description: '비공개 트랙에 타인이 접근 시', content: { 'application/json': { schema: { '$ref': '#/components/schemas/ErrorResponse' } } } },
          404: { '$ref': '#/components/responses/NotFound' },
          401: { '$ref': '#/components/responses/Unauthorized' },
        },
      },
      patch: {
        tags: ['Tracks'],
        summary: '트랙 수정',
        description: '트랙 제목 또는 공개 여부 변경. 본인 트랙만 수정 가능.',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  title:    { type: 'string', example: '새 트랙 제목' },
                  isPublic: { type: 'boolean', example: true },
                },
              },
            },
          },
        },
        responses: {
          200: { description: '수정 성공', content: { 'application/json': { schema: { '$ref': '#/components/schemas/MessageResponse' } } } },
          403: { description: '타인의 트랙 수정 시도', content: { 'application/json': { schema: { '$ref': '#/components/schemas/ErrorResponse' } } } },
          404: { '$ref': '#/components/responses/NotFound' },
          401: { '$ref': '#/components/responses/Unauthorized' },
        },
      },
      delete: {
        tags: ['Tracks'],
        summary: '트랙 삭제',
        description: '트랙 및 관련 데이터(버전, 좋아요, 댓글) 영구 삭제. 본인 트랙만 삭제 가능.',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: {
          200: { description: '삭제 성공', content: { 'application/json': { schema: { '$ref': '#/components/schemas/MessageResponse' } } } },
          403: { description: '타인의 트랙 삭제 시도', content: { 'application/json': { schema: { '$ref': '#/components/schemas/ErrorResponse' } } } },
          404: { '$ref': '#/components/responses/NotFound' },
          401: { '$ref': '#/components/responses/Unauthorized' },
        },
      },
    },

    '/api/tracks/{id}/download': {
      get: {
        tags: ['Tracks'],
        summary: '다운로드 URL 발급',
        description: '15분 유효한 S3 Pre-signed URL 발급. WAV / 스템은 Pro 이상만 가능.',
        parameters: [
          { name: 'id',     in: 'path',  required: true, schema: { type: 'string', format: 'uuid' } },
          { name: 'format', in: 'query', schema: { type: 'string', enum: ['mp3', 'wav', 'stems'], default: 'mp3' } },
        ],
        responses: {
          200: {
            description: '다운로드 URL 발급 성공',
            content: {
              'application/json': {
                schema: {
                  allOf: [
                    { '$ref': '#/components/schemas/SuccessResponse' },
                    {
                      properties: {
                        data: {
                          type: 'object',
                          properties: {
                            downloadUrl: { type: 'string', example: 'https://s3.amazonaws.com/...?X-Amz-Signature=...' },
                            expiresIn:   { type: 'integer', example: 900, description: '초 단위 유효기간' },
                            filename:    { type: 'string', example: 'Rainy_Tokyo_Night.mp3' },
                          },
                        },
                      },
                    },
                  ],
                },
              },
            },
          },
          403: { description: 'WAV/스템은 Pro 이상 (code: PLAN_REQUIRED)', content: { 'application/json': { schema: { '$ref': '#/components/schemas/ErrorResponse' } } } },
          404: { '$ref': '#/components/responses/NotFound' },
          401: { '$ref': '#/components/responses/Unauthorized' },
        },
      },
    },

    '/api/tracks/{id}/like': {
      post: {
        tags: ['Tracks'],
        summary: '좋아요',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: {
          200: { description: '좋아요 성공', content: { 'application/json': { schema: { '$ref': '#/components/schemas/MessageResponse' } } } },
          409: { description: '이미 좋아요한 트랙 (code: ALREADY_LIKED)', content: { 'application/json': { schema: { '$ref': '#/components/schemas/ErrorResponse' } } } },
          401: { '$ref': '#/components/responses/Unauthorized' },
        },
      },
      delete: {
        tags: ['Tracks'],
        summary: '좋아요 취소',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: {
          200: { description: '좋아요 취소 성공', content: { 'application/json': { schema: { '$ref': '#/components/schemas/MessageResponse' } } } },
          401: { '$ref': '#/components/responses/Unauthorized' },
        },
      },
    },

    '/api/tracks/{id}/comments': {
      get: {
        tags: ['Tracks'],
        summary: '댓글 목록',
        parameters: [
          { name: 'id',    in: 'path',  required: true, schema: { type: 'string', format: 'uuid' } },
          { name: 'page',  in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 20 } },
        ],
        responses: {
          200: {
            description: '댓글 목록 조회 성공',
            content: {
              'application/json': {
                schema: {
                  allOf: [
                    { '$ref': '#/components/schemas/SuccessResponse' },
                    { properties: { data: { type: 'object', properties: { items: { type: 'array', items: { '$ref': '#/components/schemas/Comment' } } } } } },
                  ],
                },
              },
            },
          },
          401: { '$ref': '#/components/responses/Unauthorized' },
        },
      },
      post: {
        tags: ['Tracks'],
        summary: '댓글 작성',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['content'],
                properties: {
                  content: { type: 'string', minLength: 1, maxLength: 500, example: '진짜 최고의 트랙이네요!' },
                },
              },
            },
          },
        },
        responses: {
          201: { description: '댓글 작성 성공', content: { 'application/json': { schema: { '$ref': '#/components/schemas/SuccessResponse' } } } },
          400: { description: '내용 길이 초과 (1~500자)', content: { 'application/json': { schema: { '$ref': '#/components/schemas/ErrorResponse' } } } },
          401: { '$ref': '#/components/responses/Unauthorized' },
        },
      },
    },

    '/api/tracks/{id}/comments/{cid}': {
      delete: {
        tags: ['Tracks'],
        summary: '댓글 삭제',
        description: '본인이 작성한 댓글만 삭제 가능.',
        parameters: [
          { name: 'id',  in: 'path', required: true, schema: { type: 'string', format: 'uuid' }, description: '트랙 ID' },
          { name: 'cid', in: 'path', required: true, schema: { type: 'string', format: 'uuid' }, description: '댓글 ID' },
        ],
        responses: {
          200: { description: '삭제 성공', content: { 'application/json': { schema: { '$ref': '#/components/schemas/MessageResponse' } } } },
          403: { description: '타인의 댓글 삭제 시도', content: { 'application/json': { schema: { '$ref': '#/components/schemas/ErrorResponse' } } } },
          404: { '$ref': '#/components/responses/NotFound' },
          401: { '$ref': '#/components/responses/Unauthorized' },
        },
      },
    },

    // ════════════════════════════════════════════════════════
    // EXPLORE
    // ════════════════════════════════════════════════════════
    '/api/explore/trending': {
      get: {
        tags: ['Explore'],
        summary: '트렌딩 트랙',
        description: '최근 7일 기준 좋아요 + 재생수 가중치로 정렬된 공개 트랙 목록.',
        security: [],
        parameters: [
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 20 } },
          { name: 'genre', in: 'query', schema: { type: 'string' } },
        ],
        responses: {
          200: {
            description: '트렌딩 목록 조회 성공',
            content: { 'application/json': { schema: { allOf: [{ '$ref': '#/components/schemas/SuccessResponse' }, { properties: { data: { type: 'object', properties: { items: { type: 'array', items: { '$ref': '#/components/schemas/Track' } } } } } }] } } },
          },
        },
      },
    },

    '/api/explore/recent': {
      get: {
        tags: ['Explore'],
        summary: '최신 트랙',
        description: '공개된 최신 트랙을 시간 역순으로 반환.',
        security: [],
        parameters: [
          { name: 'page',  in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 20 } },
          { name: 'genre', in: 'query', schema: { type: 'string' } },
        ],
        responses: {
          200: {
            description: '최신 목록 조회 성공',
            content: { 'application/json': { schema: { allOf: [{ '$ref': '#/components/schemas/SuccessResponse' }, { properties: { data: { type: 'object', properties: { items: { type: 'array', items: { '$ref': '#/components/schemas/Track' } }, pagination: { '$ref': '#/components/schemas/Pagination' } } } } }] } } },
          },
        },
      },
    },

    '/api/explore/creators': {
      get: {
        tags: ['Explore'],
        summary: '인기 크리에이터',
        description: '트랙 수 + 총 좋아요 기준 상위 크리에이터 목록.',
        security: [],
        parameters: [
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
        ],
        responses: {
          200: {
            description: '크리에이터 목록 조회 성공',
            content: { 'application/json': { schema: { '$ref': '#/components/schemas/SuccessResponse' } } },
          },
        },
      },
    },

    '/api/explore/search': {
      get: {
        tags: ['Explore'],
        summary: '통합 검색',
        description: '제목 또는 프롬프트 키워드로 공개 트랙 검색.',
        security: [],
        parameters: [
          { name: 'q',     in: 'query', required: true, schema: { type: 'string' }, example: '시티팝' },
          { name: 'genre', in: 'query', schema: { type: 'string' } },
          { name: 'page',  in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 20 } },
        ],
        responses: {
          200: {
            description: '검색 결과',
            content: { 'application/json': { schema: { allOf: [{ '$ref': '#/components/schemas/SuccessResponse' }, { properties: { data: { type: 'object', properties: { items: { type: 'array', items: { '$ref': '#/components/schemas/Track' } }, pagination: { '$ref': '#/components/schemas/Pagination' } } } } }] } } },
          },
          400: { description: '검색어 누락', content: { 'application/json': { schema: { '$ref': '#/components/schemas/ErrorResponse' } } } },
        },
      },
    },

    // ════════════════════════════════════════════════════════
    // USERS
    // ════════════════════════════════════════════════════════
    '/api/users/{id}': {
      get: {
        tags: ['Users'],
        summary: '유저 공개 프로필',
        description: '유저 기본 정보 + 트랙 수 / 팔로워 수 / 총 좋아요 수 + 최근 공개 트랙 5개.',
        security: [],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: {
          200: {
            description: '프로필 조회 성공',
            content: {
              'application/json': {
                schema: {
                  allOf: [
                    { '$ref': '#/components/schemas/SuccessResponse' },
                    {
                      properties: {
                        data: {
                          type: 'object',
                          properties: {
                            user:         { '$ref': '#/components/schemas/User' },
                            stats:        { type: 'object', properties: { trackCount: { type: 'integer' }, followerCount: { type: 'integer' }, totalLikes: { type: 'integer' } } },
                            recentTracks: { type: 'array', items: { '$ref': '#/components/schemas/Track' } },
                          },
                        },
                      },
                    },
                  ],
                },
              },
            },
          },
          404: { '$ref': '#/components/responses/NotFound' },
        },
      },
    },

    '/api/users/{id}/follow': {
      post: {
        tags: ['Users'],
        summary: '팔로우',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' }, description: '팔로우할 유저 ID' }],
        responses: {
          200: { description: '팔로우 성공', content: { 'application/json': { schema: { '$ref': '#/components/schemas/MessageResponse' } } } },
          400: { description: '자기 자신 팔로우 시도', content: { 'application/json': { schema: { '$ref': '#/components/schemas/ErrorResponse' } } } },
          409: { description: '이미 팔로우 중', content: { 'application/json': { schema: { '$ref': '#/components/schemas/ErrorResponse' } } } },
          401: { '$ref': '#/components/responses/Unauthorized' },
        },
      },
      delete: {
        tags: ['Users'],
        summary: '언팔로우',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: {
          200: { description: '언팔로우 성공', content: { 'application/json': { schema: { '$ref': '#/components/schemas/MessageResponse' } } } },
          401: { '$ref': '#/components/responses/Unauthorized' },
        },
      },
    },

    '/api/users/{id}/followers': {
      get: {
        tags: ['Users'],
        summary: '팔로워 목록',
        parameters: [
          { name: 'id',    in: 'path',  required: true, schema: { type: 'string', format: 'uuid' } },
          { name: 'page',  in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 20 } },
        ],
        responses: {
          200: { description: '팔로워 목록', content: { 'application/json': { schema: { '$ref': '#/components/schemas/SuccessResponse' } } } },
        },
      },
    },

    '/api/users/{id}/following': {
      get: {
        tags: ['Users'],
        summary: '팔로잉 목록',
        parameters: [
          { name: 'id',    in: 'path',  required: true, schema: { type: 'string', format: 'uuid' } },
          { name: 'page',  in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 20 } },
        ],
        responses: {
          200: { description: '팔로잉 목록', content: { 'application/json': { schema: { '$ref': '#/components/schemas/SuccessResponse' } } } },
        },
      },
    },

    // ════════════════════════════════════════════════════════
    // CREDITS
    // ════════════════════════════════════════════════════════
    '/api/credits': {
      get: {
        tags: ['Credits'],
        summary: '크레딧 잔액 조회',
        description: '현재 크레딧 잔액 + 현재 구독 플랜 정보.',
        responses: {
          200: {
            description: '잔액 조회 성공',
            content: {
              'application/json': {
                schema: {
                  allOf: [
                    { '$ref': '#/components/schemas/SuccessResponse' },
                    {
                      properties: {
                        data: {
                          type: 'object',
                          properties: {
                            credits: { type: 'integer', example: 90 },
                            plan:    { type: 'string', enum: ['free', 'pro', 'enterprise'], example: 'free' },
                          },
                        },
                      },
                    },
                  ],
                },
              },
            },
          },
          401: { '$ref': '#/components/responses/Unauthorized' },
        },
      },
    },

    '/api/credits/history': {
      get: {
        tags: ['Credits'],
        summary: '크레딧 이용 내역',
        parameters: [
          { name: 'page',  in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 20 } },
        ],
        responses: {
          200: {
            description: '이용 내역 조회 성공',
            content: {
              'application/json': {
                schema: {
                  allOf: [
                    { '$ref': '#/components/schemas/SuccessResponse' },
                    {
                      properties: {
                        data: {
                          type: 'object',
                          properties: {
                            items:      { type: 'array', items: { '$ref': '#/components/schemas/CreditHistory' } },
                            pagination: { '$ref': '#/components/schemas/Pagination' },
                          },
                        },
                      },
                    },
                  ],
                },
              },
            },
          },
          401: { '$ref': '#/components/responses/Unauthorized' },
        },
      },
    },

    // ════════════════════════════════════════════════════════
    // SUBSCRIPTIONS
    // ════════════════════════════════════════════════════════
    '/api/subscriptions/plans': {
      get: {
        tags: ['Subscriptions'],
        summary: '요금제 목록',
        description: 'Free / Pro / Enterprise 플랜 정보와 가격을 반환합니다.',
        security: [],
        responses: {
          200: {
            description: '요금제 목록 조회 성공',
            content: {
              'application/json': {
                schema: {
                  allOf: [
                    { '$ref': '#/components/schemas/SuccessResponse' },
                    { properties: { data: { type: 'object', properties: { plans: { type: 'array', items: { '$ref': '#/components/schemas/Plan' } } } } } },
                  ],
                },
              },
            },
          },
        },
      },
    },

    '/api/subscriptions/current': {
      get: {
        tags: ['Subscriptions'],
        summary: '현재 구독 정보',
        responses: {
          200: { description: '현재 구독 조회 성공', content: { 'application/json': { schema: { '$ref': '#/components/schemas/SuccessResponse' } } } },
          401: { '$ref': '#/components/responses/Unauthorized' },
        },
      },
      delete: {
        tags: ['Subscriptions'],
        summary: '구독 취소',
        description: '현재 구독 기간 만료 시 갱신 없이 해지. 기간 중에는 계속 사용 가능.',
        responses: {
          200: { description: '구독 취소 예약 성공', content: { 'application/json': { schema: { '$ref': '#/components/schemas/MessageResponse' } } } },
          400: { description: '활성 구독 없음', content: { 'application/json': { schema: { '$ref': '#/components/schemas/ErrorResponse' } } } },
          401: { '$ref': '#/components/responses/Unauthorized' },
        },
      },
    },

    '/api/subscriptions': {
      post: {
        tags: ['Subscriptions'],
        summary: '구독 신청',
        description: '플랜 업그레이드 / 변경. 실제 결제 연동은 추후 구현 예정.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['plan', 'billingCycle'],
                properties: {
                  plan:         { type: 'string', enum: ['pro', 'enterprise'], example: 'pro' },
                  billingCycle: { type: 'string', enum: ['monthly', 'yearly'], example: 'monthly' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: '구독 신청 성공', content: { 'application/json': { schema: { '$ref': '#/components/schemas/MessageResponse' } } } },
          401: { '$ref': '#/components/responses/Unauthorized' },
        },
      },
    },

    // ════════════════════════════════════════════════════════
    // NOTIFICATIONS
    // ════════════════════════════════════════════════════════
    '/api/notifications/settings': {
      get: {
        tags: ['Notifications'],
        summary: '알림 설정 조회',
        responses: {
          200: {
            description: '알림 설정 조회 성공',
            content: {
              'application/json': {
                schema: {
                  allOf: [
                    { '$ref': '#/components/schemas/SuccessResponse' },
                    { properties: { data: { '$ref': '#/components/schemas/NotificationSettings' } } },
                  ],
                },
              },
            },
          },
          401: { '$ref': '#/components/responses/Unauthorized' },
        },
      },

      put: {
        tags: ['Notifications'],
        summary: '알림 설정 변경',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  gen:       { type: 'boolean', description: '생성 완료 알림' },
                  credit:    { type: 'boolean', description: '크레딧 부족 알림' },
                  like:      { type: 'boolean', description: '좋아요 알림' },
                  follow:    { type: 'boolean', description: '팔로우 알림' },
                  marketing: { type: 'boolean', description: '마케팅 알림' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: '알림 설정 변경 성공', content: { 'application/json': { schema: { '$ref': '#/components/schemas/MessageResponse' } } } },
          401: { '$ref': '#/components/responses/Unauthorized' },
        },
      },
    },

    // ════════════════════════════════════════════════════════
    // STATS
    // ════════════════════════════════════════════════════════
    '/api/stats': {
      get: {
        tags: ['Stats'],
        summary: '대시보드 통계',
        description: '로그인 유저의 트랙 수, 크레딧 잔액, 총 재생 수, 라이브러리 수, 주간 변화량을 반환합니다.',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: '통계 조회 성공',
            content: {
              'application/json': {
                schema: {
                  allOf: [
                    { '$ref': '#/components/schemas/SuccessResponse' },
                    {
                      properties: {
                        data: {
                          type: 'object',
                          properties: {
                            totalTracks:      { type: 'integer', example: 24 },
                            creditsRemaining: { type: 'integer', example: 90 },
                            totalPlays:       { type: 'integer', example: 1340 },
                            libraryCount:     { type: 'integer', example: 8 },
                            weeklyChange:     {
                              type: 'object',
                              properties: {
                                tracks: { type: 'integer', example: 3, description: '이번 주 생성 트랙 수' },
                                plays:  { type: 'integer', example: 120 },
                              },
                            },
                          },
                        },
                      },
                    },
                  ],
                },
              },
            },
          },
          401: { '$ref': '#/components/responses/Unauthorized' },
        },
      },
    },

    '/api/generate/callback': {
      post: {
        tags: ['Generate'],
        summary: 'Suno 콜백 수신 (서버→서버)',
        description:
          'Suno AI가 생성 완료 시 서버로 직접 호출하는 웹훅 엔드포인트입니다.\n\n' +
          '**프론트엔드에서 직접 호출하지 않습니다.**',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  code:    { type: 'integer', example: 200 },
                  msg:     { type: 'string', example: 'SUCCESS' },
                  data:    {
                    type: 'object',
                    properties: {
                      taskId:       { type: 'string' },
                      callbackType: { type: 'string', enum: ['text', 'first', 'complete'] },
                      sunoData:     { type: 'array', items: { type: 'object' } },
                    },
                  },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'OK' },
        },
        security: [],
      },
    },

    // ════════════════════════════════════════════════════════
    // EDITOR  (Suno 음악 편집)
    // ════════════════════════════════════════════════════════
    '/api/editor/extend': {
      post: {
        tags: ['Editor'],
        summary: '트랙 연장',
        description: 'Suno AI로 기존 트랙을 이어서 연장합니다. 비동기 — jobId로 폴링하세요.',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['trackId', 'audioId'],
                properties: {
                  trackId:    { type: 'string', format: 'uuid' },
                  audioId:    { type: 'string', description: 'track_versions.suno_audio_id' },
                  prompt:     { type: 'string', example: '더 어두운 분위기로 이어가기' },
                  continueAt: { type: 'number', example: 60, description: '이어붙일 시점 (초)' },
                },
              },
            },
          },
        },
        responses: {
          202: { description: '연장 작업 등록', content: { 'application/json': { schema: { allOf: [{ '$ref': '#/components/schemas/SuccessResponse' }, { properties: { data: { type: 'object', properties: { jobId: { type: 'string', format: 'uuid' } } } } }] } } } },
          401: { '$ref': '#/components/responses/Unauthorized' },
        },
      },
    },
    '/api/editor/extend/{jobId}': {
      get: {
        tags: ['Editor'],
        summary: '트랙 연장 상태 폴링',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'jobId', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: {
          200: { description: '상태 + 결과 URL', content: { 'application/json': { schema: { allOf: [{ '$ref': '#/components/schemas/SuccessResponse' }, { properties: { data: { type: 'object', properties: { status: { type: 'string', enum: ['pending','done','error'] }, resultUrl: { type: 'string', nullable: true } } } } }] } } } },
          401: { '$ref': '#/components/responses/Unauthorized' },
        },
      },
    },

    '/api/editor/lyrics': {
      post: {
        tags: ['Editor'],
        summary: '가사 생성',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['prompt'],
                properties: {
                  prompt: { type: 'string', example: '비오는 날 카페 감성' },
                  style:  { type: 'string', example: 'Korean Pop' },
                  title:  { type: 'string', example: '빗소리' },
                },
              },
            },
          },
        },
        responses: {
          202: { description: '가사 생성 작업 등록', content: { 'application/json': { schema: { allOf: [{ '$ref': '#/components/schemas/SuccessResponse' }, { properties: { data: { type: 'object', properties: { jobId: { type: 'string', format: 'uuid' } } } } }] } } } },
          401: { '$ref': '#/components/responses/Unauthorized' },
        },
      },
    },
    '/api/editor/lyrics/{jobId}': {
      get: {
        tags: ['Editor'],
        summary: '가사 생성 상태 폴링',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'jobId', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: {
          200: {
            description: '상태 + 가사',
            content: {
              'application/json': {
                schema: {
                  allOf: [
                    { '$ref': '#/components/schemas/SuccessResponse' },
                    {
                      properties: {
                        data: {
                          type: 'object',
                          properties: {
                            status:   { type: 'string', enum: ['pending','done','error'] },
                            title:    { type: 'string', nullable: true, example: 'Rainy Mood' },
                            text:     { type: 'string', nullable: true, example: '[Verse]\n빗소리 들려...' },
                            variants: {
                              type: 'array',
                              description: 'Suno가 생성한 가사 후보 목록 (보통 2개)',
                              items: {
                                type: 'object',
                                properties: {
                                  title: { type: 'string' },
                                  text:  { type: 'string' },
                                },
                              },
                            },
                          },
                        },
                      },
                    },
                  ],
                },
              },
            },
          },
          401: { '$ref': '#/components/responses/Unauthorized' },
        },
      },
    },

    '/api/editor/separate': {
      post: {
        tags: ['Editor'],
        summary: '보컬 / 스템 분리',
        description: '`type: separate_vocal` → 보컬+반주 / `type: split_stem` → 4트랙 스템.',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['audioId', 'type'],
                properties: {
                  audioId: { type: 'string' },
                  type:    { type: 'string', enum: ['separate_vocal', 'split_stem'] },
                },
              },
            },
          },
        },
        responses: {
          202: { description: '분리 작업 등록', content: { 'application/json': { schema: { allOf: [{ '$ref': '#/components/schemas/SuccessResponse' }, { properties: { data: { type: 'object', properties: { jobId: { type: 'string', format: 'uuid' } } } } }] } } } },
          401: { '$ref': '#/components/responses/Unauthorized' },
        },
      },
    },
    '/api/editor/separate/{jobId}': {
      get: {
        tags: ['Editor'],
        summary: '보컬/스템 분리 상태 폴링',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'jobId', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: {
          200: { description: '상태 + URL들', content: { 'application/json': { schema: { allOf: [{ '$ref': '#/components/schemas/SuccessResponse' }, { properties: { data: { type: 'object', properties: { status: { type: 'string', enum: ['pending','done','error'] }, vocalUrl: { type: 'string', nullable: true }, instrumentalUrl: { type: 'string', nullable: true }, drumsUrl: { type: 'string', nullable: true }, bassUrl: { type: 'string', nullable: true } } } } }] } } } },
          401: { '$ref': '#/components/responses/Unauthorized' },
        },
      },
    },

    '/api/editor/wav': {
      post: {
        tags: ['Editor'],
        summary: 'WAV 변환 (Pro 이상)',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['audioId'],
                properties: {
                  audioId: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          202: { description: 'WAV 변환 작업 등록', content: { 'application/json': { schema: { allOf: [{ '$ref': '#/components/schemas/SuccessResponse' }, { properties: { data: { type: 'object', properties: { jobId: { type: 'string', format: 'uuid' } } } } }] } } } },
          401: { '$ref': '#/components/responses/Unauthorized' },
          403: { description: 'Pro 이상 플랜 필요', content: { 'application/json': { schema: { '$ref': '#/components/schemas/ErrorResponse' } } } },
        },
      },
    },
    '/api/editor/wav/{jobId}': {
      get: {
        tags: ['Editor'],
        summary: 'WAV 변환 상태 폴링',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'jobId', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: {
          200: { description: '상태 + WAV URL', content: { 'application/json': { schema: { allOf: [{ '$ref': '#/components/schemas/SuccessResponse' }, { properties: { data: { type: 'object', properties: { status: { type: 'string', enum: ['pending','done','error'] }, resultUrl: { type: 'string', nullable: true } } } } }] } } } },
          401: { '$ref': '#/components/responses/Unauthorized' },
        },
      },
    },

    '/api/editor/video': {
      post: {
        tags: ['Editor'],
        summary: '뮤직비디오 생성',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['audioId'],
                properties: {
                  audioId: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          202: { description: '비디오 생성 작업 등록', content: { 'application/json': { schema: { allOf: [{ '$ref': '#/components/schemas/SuccessResponse' }, { properties: { data: { type: 'object', properties: { jobId: { type: 'string', format: 'uuid' } } } } }] } } } },
          401: { '$ref': '#/components/responses/Unauthorized' },
        },
      },
    },
    '/api/editor/video/{jobId}': {
      get: {
        tags: ['Editor'],
        summary: '뮤직비디오 생성 상태 폴링',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'jobId', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: {
          200: { description: '상태 + MP4 URL', content: { 'application/json': { schema: { allOf: [{ '$ref': '#/components/schemas/SuccessResponse' }, { properties: { data: { type: 'object', properties: { status: { type: 'string', enum: ['pending','done','error'] }, resultUrl: { type: 'string', nullable: true } } } } }] } } } },
          401: { '$ref': '#/components/responses/Unauthorized' },
        },
      },
    },

    '/api/editor/jobs': {
      get: {
        tags: ['Editor'],
        summary: '편집 작업 히스토리 조회',
        description:
          '로그인 유저의 모든 편집 작업 목록을 최신순으로 반환합니다.\n\n' +
          '작업 유형: `extend` (트랙 연장) / `lyrics` (가사 생성) / `separate` (보컬 분리) / `wav` (WAV 변환) / `video` (뮤직비디오)\n\n' +
          '상태: `pending` (처리 중) / `done` (완료) / `error` (실패)',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'type', in: 'query',
            schema: { type: 'string', enum: ['extend', 'lyrics', 'separate', 'wav', 'video'] },
            description: '특정 작업 유형만 필터 (생략 시 전체 반환)',
          },
          {
            name: 'limit', in: 'query',
            schema: { type: 'integer', default: 30, minimum: 1, maximum: 100 },
            description: '최대 반환 개수 (기본값: 30)',
          },
        ],
        responses: {
          200: {
            description: '히스토리 조회 성공',
            content: {
              'application/json': {
                schema: {
                  allOf: [
                    { '$ref': '#/components/schemas/SuccessResponse' },
                    {
                      properties: {
                        data: {
                          type: 'object',
                          properties: {
                            jobs: {
                              type: 'array',
                              items: {
                                type: 'object',
                                properties: {
                                  id:          { type: 'string', format: 'uuid', description: 'Job ID (폴링에 사용)' },
                                  type:        { type: 'string', enum: ['extend','lyrics','separate','wav','video'], example: 'lyrics' },
                                  status:      { type: 'string', enum: ['pending','done','error'], example: 'done' },
                                  result_url:  { type: 'string', nullable: true, example: 'https://cdn.suno.ai/...', description: '완료 시 다운로드 URL' },
                                  extra:       { type: 'string', nullable: true, description: '추가 정보 (JSON 문자열 또는 텍스트)' },
                                  track_title: { type: 'string', nullable: true, example: 'Rainy Tokyo Night', description: '연관 트랙 제목 (가사 생성은 null)' },
                                  created_at:  { type: 'string', format: 'date-time' },
                                },
                              },
                            },
                          },
                        },
                      },
                    },
                  ],
                },
              },
            },
          },
          401: { '$ref': '#/components/responses/Unauthorized' },
        },
      },
    },

    '/api/editor/callback/{type}': {
      post: {
        tags: ['Editor'],
        summary: 'Suno 에디터 콜백 수신 (서버→서버)',
        description: 'Suno AI가 편집 작업 완료 시 호출하는 웹훅. **프론트엔드에서 직접 호출 안 함.**',
        parameters: [
          { name: 'type', in: 'path', required: true, schema: { type: 'string', enum: ['extend','lyrics','separate','wav','video'] } },
        ],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { type: 'object', properties: { code: { type: 'integer' }, msg: { type: 'string' }, data: { type: 'object' } } } } },
        },
        responses: {
          200: { description: 'OK' },
        },
        security: [],
      },
    },
  },
}

export default swaggerSpec
