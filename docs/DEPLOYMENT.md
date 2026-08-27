# 배포 및 초기 설정

1. Supabase 새 프로젝트의 SQL Editor에서 `supabase/schema.sql`을 실행한다.
2. Supabase Auth에서 초기 관리자 사용자 1명을 만든다.
3. SQL Editor에서 아래 쿼리로 해당 사용자를 활성 관리자로 등록한다.

```sql
insert into public.admin_profiles(user_id)
select id from auth.users where email = '관리자 이메일';
```

4. `.env.example`의 환경변수를 Vercel Production/Preview 환경에 각각 설정한다. 서비스 역할 키, 세션 비밀값, SMTP 계정 정보와 Cron 비밀값은 브라우저 공개 환경변수로 만들지 않는다.
5. 네이버 SMTP 계정(아이디, 앱 비밀번호) 발급 전에는 `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM_EMAIL`을 비워 둔다. 이때 신청은 접수되며 이메일 결과는 `configuration_missing`으로 기록된다. 네이버는 2단계 인증 계정의 경우 로그인 비밀번호 대신 발급한 앱 비밀번호를 `SMTP_PASS`에 사용한다.
6. 배포 후 `/admin/login`으로 로그인하여 문의처, 이메일 문안과 나머지 운영 설정을 입력한다.
7. 증빙 종류를 설정한 경우 참가자 증빙 업로드가 활성화된다. 파일 개수와 용량은 제한하지 않는다.

모든 운영 화면의 일시는 Asia/Seoul 기준이며 PostgreSQL에는 UTC `timestamptz`로 저장된다.
