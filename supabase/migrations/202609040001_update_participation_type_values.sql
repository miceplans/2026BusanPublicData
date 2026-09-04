-- 참가 유형 라벨을 '예비창업팀/신규창업기업'에서 '예비창업자/신규창업자'로 변경합니다.
alter table public.applications
  drop constraint if exists applications_participation_type_check;

update public.applications
  set participation_type = '예비창업자'
  where participation_type = '예비창업팀';

update public.applications
  set participation_type = '신규창업자'
  where participation_type = '신규창업기업';

alter table public.applications
  add constraint applications_participation_type_check
    check (participation_type in ('예비창업자', '신규창업자'));
