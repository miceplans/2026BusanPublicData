# API 기능 점검 보고서

- 점검일: 2026-08-25 (Asia/Seoul)
- 대상: 로컬 `http://localhost:3000`
- 방식: 브라우저 실제 화면 확인, 15개 Route Handler의 21개 HTTP 메서드 직접 호출, 서버 로그 및 코드 검토
- 결론: 신청 기간 제거는 화면과 코드에 반영됐지만, 현재 환경에서는 Supabase 및 세션 필수 설정이 없어 실제 신청 저장·조회·관리자·파일·엑셀·이메일 성공 흐름은 동작하지 않는다.

## 1. 참가 신청 기간 제거 확인

- `/apply` 화면에 `신청 기간` 문구가 없다.
- `현재 참가 신청을 받지 않습니다.` 안내가 없다.
- `참가 신청 제출` 버튼은 활성 상태다.
- 클라이언트와 `POST /api/applications`에 기간 또는 신청 가능 여부 검사 코드가 없다.
- `application_starts_at`, `application_ends_at`, `acceptingApplications` 참조는 `src`, `supabase`, `docs`에서 제거됐다.

따라서 기간 제거 자체는 구현됐다. 다만 아래 환경 설정 문제 때문에 실제 제출 성공까지 확인할 수는 없다.

## 2. 테스트 환경 상태

현재 `.env`에는 `GLM_API_KEY`만 있고 다음 필수 값이 없다.

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_SITE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `APPLICATION_SESSION_SECRET`
- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL`
- `CRON_SECRET`

서버 로그에서도 Supabase 공개 키와 서비스 역할 키, 사이트 URL, 신청 세션 비밀값 누락이 확인됐다.

## 3. API 직접 호출 결과

| API                                     |         결과 | 판정                                        |
| --------------------------------------- | -----------: | ------------------------------------------- |
| `GET /api/settings`                     |     503 JSON | 실패: Supabase 설정 없음                    |
| `POST /api/applications`                | 500, 빈 본문 | 실패: DB 클라이언트 생성 중 예외            |
| `POST /api/application/session` 빈 입력 |     422 JSON | 입력 검증 정상                              |
| `DELETE /api/application/session`       |     200 JSON | 로그아웃 정상                               |
| `GET /api/application/me`               |     401 JSON | 비로그인 차단 정상                          |
| `PATCH /api/application/me`             |     401 JSON | 비로그인 차단 정상                          |
| `POST /api/application/files`           |     401 JSON | 비로그인 차단 정상                          |
| `DELETE /api/application/files/:id`     |     401 JSON | 비로그인 차단 정상                          |
| `GET /api/files/:id`                    | 500, 빈 본문 | 실패: 관리자 인증 환경 설정 예외            |
| `POST /api/admin/session` 빈 입력       |     422 JSON | 입력 검증 정상                              |
| `DELETE /api/admin/session`             | 500, 빈 본문 | 실패: Supabase 설정 없음                    |
| `GET /api/admin/applications`           | 500, 빈 본문 | 실패: Supabase 설정 없음                    |
| `GET /api/admin/applications/:id`       | 500, 빈 본문 | 실패: Supabase 설정 없음                    |
| `PATCH /api/admin/applications/:id`     | 500, 빈 본문 | 실패: Supabase 설정 없음                    |
| `DELETE /api/admin/applications/:id`    | 500, 빈 본문 | 실패: Supabase 설정 없음                    |
| `GET /api/admin/audit-logs`             | 500, 빈 본문 | 실패: Supabase 설정 없음                    |
| `GET /api/admin/settings`               | 500, 빈 본문 | 실패: Supabase 설정 없음                    |
| `PUT /api/admin/settings`               | 500, 빈 본문 | 실패: Supabase 설정 없음                    |
| `GET /api/admin/excel/export`           | 500, 빈 본문 | 실패: Supabase 설정 없음                    |
| `POST /api/admin/excel/import`          | 500, 빈 본문 | 실패: Supabase 설정 없음                    |
| `GET /api/cron/email-retries`           | 500, 빈 본문 | 실패: `CRON_SECRET`를 포함한 서버 설정 없음 |

성공한 것은 환경 설정과 DB가 필요 없는 입력 검증, 비로그인 차단, 참가자 로그아웃뿐이다. 신규 신청 저장, 멱등성, 중복 팀명, 신청 로그인, 본인 조회·수정, 파일 업로드·삭제·다운로드, 관리자 인증 및 CRUD, 엑셀, 감사 로그, 이메일 발송·재시도는 성공 경로를 검증하지 못했다.

## 4. 발견된 문제와 해결책

### P0 — 운영 전 반드시 해결

#### 4.1 필수 환경변수와 Supabase 실행 환경 부재

영향: 핵심 API 대부분이 500 또는 503으로 실패한다.

해결책:

1. Supabase 프로젝트를 만들고 `supabase/schema.sql`을 적용한다.
2. 비공개 `application-files` 버킷을 만든다.
3. `.env.local`과 Vercel 환경별 설정에 `.env.example`의 값을 등록한다.
4. `APPLICATION_SESSION_SECRET`은 32자 이상의 난수로 설정한다.
5. Supabase Auth 관리자 사용자와 대응하는 `admin_profiles` 활성 레코드를 만든다.
6. 서버를 재시작한 뒤 본 문서의 21개 API를 다시 테스트한다.

#### 4.2 관리자 신청 상세 API가 비밀번호 해시를 반환

`GET /api/admin/applications/:id`가 `applications`에 `*` 선택을 사용한다. 이 응답에는 `password_hash`, `idempotency_key` 등 브라우저에 보낼 필요가 없는 내부 값이 포함될 수 있다.

해결책: 화면에 필요한 컬럼을 명시적으로 선택하고 `password_hash`, `idempotency_key` 및 내부 저장 키를 응답에서 제외한다. 응답 계약 테스트로 금지 필드가 없음을 검증한다.

#### 4.3 서버 측 요청 횟수 제한 미구현

스키마에는 `application_login_attempts`가 있지만 실제 로그인 API에서 사용하지 않는다. 신규 신청, 참가자 로그인, 파일 업로드, 관리자 로그인 및 민감한 관리자 작업에도 제한 코드가 없다.

해결책: IP/환경 해시와 정규화 팀명을 조합한 서버 측 제한을 구현하고, 반복 실패 잠금·성공 시 초기화·429 응답을 통합 테스트한다. Vercel 환경에서는 Upstash Redis 같은 원자적 저장소 또는 Supabase RPC를 사용할 수 있다.

### P1 — 데이터 일관성과 장애 처리

#### 4.4 환경 설정 오류가 빈 500 응답으로 노출

여러 API가 `requireAdmin()` 또는 `createAdminClient()`를 `try/catch` 밖에서 호출한다. 설정 누락 시 공통 JSON 오류가 아니라 빈 500이 발생한다.

해결책: 앱 시작 시 환경을 검증해 배포를 실패시키고, Route Handler에는 최상위 공통 오류 경계를 적용한다. 로그에는 요청 ID와 안전한 오류 코드만 기록한다.

#### 4.5 신청 수정 시 팀원 데이터 유실 가능

신청 수정 API는 기존 팀원을 모두 삭제한 뒤 새 팀원을 삽입한다. 삽입 실패 시 기존 팀원까지 사라진다.

해결책: PostgreSQL 함수/RPC로 신청 본문 수정과 팀원 교체를 하나의 트랜잭션으로 처리한다.

#### 4.6 파일 업로드·삭제의 부분 실패 가능

- Storage 업로드 후 메타데이터 저장 실패 시 업로드 객체가 남을 수 있다.
- 파일 삭제 시 Storage 삭제 후 DB 메타데이터 삭제 오류를 확인하지 않는다.
- 관리자 영구 삭제도 Storage, 감사 로그, DB 삭제 순서에서 부분 실패가 가능하다.

해결책: 명시적인 파일 상태(`pending`, `ready`, `delete_pending`)와 보상 작업을 사용하고 각 단계 오류를 확인한다. 정리용 재처리 작업도 둔다.

#### 4.7 엑셀 반영이 행별 반복 업데이트

중간 행에서 실패하면 앞선 행만 반영되는 부분 성공이 발생할 수 있다.

해결책: 검증된 변경 목록을 Supabase RPC 한 번으로 전달하고 트랜잭션 안에서 전체 반영 또는 전체 롤백한다.

### P2 — 사용자 경험과 유지보수

#### 4.8 신청 화면이 설정 API 실패를 표시하지 않음

`/apply`는 HTTP 503도 정상 JSON처럼 처리한다. 그 결과 오류 안내 없이 증빙 업로드 설정 등이 사라진다.

해결책: `response.ok`를 확인하고 실패 시 명확한 오류와 재시도 버튼을 표시한다. 설정이 로드되기 전에는 제출을 잠시 비활성화하거나, 제출에 필요한 최소 기본값을 서버와 동일하게 정의한다.

#### 4.9 검증 오류 문구에 Zod 기본 영문 메시지 노출

빈 로그인 요청에서 `Invalid input: expected string...`이 응답에 포함됐다.

해결책: 필드별 한국어 메시지를 지정하고 운영 응답에는 허용된 사용자 메시지만 매핑한다.

#### 4.10 `is_public` 설정이 현재 사용되지 않음

신청 기간 제거 과정에서 신청 차단과의 연결을 제거했으며, 다른 공개 제어 코드도 확인되지 않았다.

해결책: 사이트 공개 기능도 필요 없으면 설정·타입·스키마에서 삭제한다. 필요하면 랜딩과 신청 페이지의 공개 정책을 별도로 명세한 뒤 서버 경계에서 적용한다.

## 5. 이메일 점검

현재 `RESEND_API_KEY`와 `RESEND_FROM_EMAIL`이 없어 실제 신청 완료 이메일은 발송할 수 없다. 코드상 설정이 없으면 `email_logs.status = configuration_missing`으로 남기도록 되어 있으나, DB 자체가 연결되지 않아 이 흐름도 실행 검증하지 못했다.

`office1170@naver.com`은 다음과 같이 사용하는 것이 현실적이다.

- 권장: Resend 발신자는 소유·인증한 도메인 주소(예: `apply@your-domain.kr`)로 두고 `replyTo`를 `office1170@naver.com`으로 설정한다.
- 불가: 소유권을 인증할 수 없는 `naver.com` 주소를 Resend의 `from`으로 직접 사용한다.
- 대안: 반드시 네이버 주소 자체로 발송해야 한다면 Resend 대신 네이버 SMTP와 앱 비밀번호를 사용하는 별도 전송기 구현이 필요하다. 이는 현재 확정 기술 구성 변경이므로 별도 승인과 보안 검토가 필요하다.

## 6. GLM 교차 검토 결과

- `.env`의 `GLM_API_KEY` 존재는 확인했다. 값은 출력하거나 문서에 기록하지 않았다.
- 공식 Chat Completions API의 `glm-5.2` 모델로 익명화된 테스트 요약을 전송했다.
- 응답: HTTP 429, `잔액 부족 또는 사용 가능한 리소스 패키지 없음`.
- 따라서 GLM의 독립 분석 결과는 얻지 못했다. 계정 충전 또는 사용 가능한 리소스 패키지 연결 후 같은 검토를 재실행해야 한다.

## 7. 재테스트 순서

1. 필수 환경변수와 Supabase 스키마·Storage·관리자 계정 준비
2. 공개 설정 조회
3. 신규 신청과 동일 멱등성 키 재전송
4. 정규화된 중복 팀명 차단
5. 참가자 로그인 실패 제한 및 성공 세션
6. 본인 조회·수정
7. JPG/PNG/WEBP 업로드와 잘못된 MIME·확장자·용량·개수 차단
8. 파일 서명 URL, 교체·삭제와 소유권 차단
9. 관리자 로그인·권한 차단·목록·상세·상태·비밀번호 초기화
10. 엑셀 전체/검색/선택 다운로드, 미리보기, 오류 행, 원자적 반영
11. 감사 로그의 관리자·대상·변경 요약 확인
12. Resend 발송 1회, 중복 방지, 실패 재시도, 최종 실패 확인
13. 운영 응답에서 비밀번호 해시·내부 객체 키·토큰이 노출되지 않는지 확인
