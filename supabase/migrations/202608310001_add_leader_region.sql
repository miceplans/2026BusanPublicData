-- 팀장(대표자) 정보에 지역 필드 추가
alter table public.applications
  add column if not exists leader_region text not null default '';
