-- 신규·수정 신청에서 필수로 받는 단일 대회 정보 습득 경로입니다.
-- 기존 신청은 임의 값으로 채우지 않고 null로 유지합니다.
alter table public.applications
  add column if not exists information_source text,
  add column if not exists information_source_other text;

alter table public.applications
  drop constraint if exists applications_information_source_check,
  drop constraint if exists applications_information_source_other_length_check,
  drop constraint if exists applications_information_source_other_required_check;

alter table public.applications
  add constraint applications_information_source_check
    check (information_source in ('공모 관련 사이트', 'SNS', '검색포털', '학교안내', '지인소개', '기타')),
  add constraint applications_information_source_other_length_check
    check (char_length(information_source_other) <= 100),
  add constraint applications_information_source_other_required_check
    check (information_source <> '기타' or nullif(btrim(information_source_other), '') is not null);
