-- 팀장/팀원 정보 항목 확장: 소속·생년월일·성별·거주지 추가, 팀원 이메일·연락처 추가, 부산 소재 여부 삭제.
alter table public.applications
  rename column leader_region to leader_residence;
alter table public.applications
  add column if not exists leader_org text not null default '',
  add column if not exists leader_birth_date text not null default '' check (leader_birth_date = '' or leader_birth_date ~ '^[0-9]{6}$'),
  add column if not exists leader_gender text not null default '' check (leader_gender in ('', '남', '여')),
  drop column if exists is_busan_based;

alter table public.application_members
  add column if not exists org text not null default '',
  add column if not exists email text not null default '',
  add column if not exists phone text not null default '',
  add column if not exists birth_date text not null default '' check (birth_date = '' or birth_date ~ '^[0-9]{6}$'),
  add column if not exists gender text not null default '' check (gender in ('', '남', '여')),
  add column if not exists residence text not null default '';
