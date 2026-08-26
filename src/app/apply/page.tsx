'use client';
import { FormEvent, useEffect, useRef, useState } from 'react';
import { ContestHeader, fieldClass } from '@/components/contest-header';
import { INDUSTRIES, PARTICIPATION_TYPES, type SiteSettings } from '@/types';
import { useToast } from '@/components/toast';
type Member = { name: string; role: string; isLeader: boolean };
export default function ApplyPage() {
  const { showToast } = useToast();
  const [idempotencyKey] = useState(() => crypto.randomUUID());
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [leaderName, setLeaderName] = useState('');
  const [members, setMembers] = useState<Member[]>([
    { name: '', role: '대표자', isLeader: true },
    { name: '', role: '', isLeader: false },
  ]);
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    fetch('/api/settings')
      .then((r) => r.json())
      .then((v) => setSettings(v.settings))
      .catch(() => showToast('운영 설정을 불러올 수 없습니다.'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const uploadEnabled = !!(
    settings?.evidence_label &&
    settings.evidence_max_files &&
    settings.evidence_max_bytes
  );
  function updateMember(index: number, key: 'name' | 'role', value: string) {
    setMembers((v) =>
      v.map((m, i) => (i === index ? { ...m, [key]: value } : m)),
    );
  }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    const form = event.currentTarget;
    const fd = new FormData(form);
    const leaderName = String(fd.get('leaderName'));
    const synced = members.map((m, i) =>
      i === 0
        ? { ...m, name: leaderName, isLeader: true }
        : { ...m, isLeader: false },
    );
    const data = {
      idempotencyKey,
      teamName: fd.get('teamName'),
      password: fd.get('password'),
      passwordConfirm: fd.get('passwordConfirm'),
      leaderName,
      leaderEmail: fd.get('leaderEmail'),
      leaderPhone: fd.get('leaderPhone'),
      participationType: fd.get('participationType') || '',
      industry: fd.get('industry') || '',
      itemName: fd.get('itemName'),
      itemSummary: fd.get('itemSummary'),
      members: synced,
      isBusanBased: fd.get('isBusanBased') === 'yes',
      eligibilityConfirmed: fd.get('eligibilityConfirmed') === 'on',
      exclusionConfirmed: fd.get('exclusionConfirmed') === 'on',
      privacyAgreed: fd.get('privacyAgreed') === 'on',
      requests: '',
    };
    if (!data.participationType) {
      showToast('참가 유형을 선택해주세요.');
      setBusy(false);
      return;
    }
    if (!data.industry) {
      showToast('참가 분야를 선택해주세요.');
      setBusy(false);
      return;
    }
    const body = new FormData();
    body.set('data', JSON.stringify(data));
    for (const file of fd.getAll('files'))
      if (file instanceof File && file.size) body.append('files', file);
    try {
      const response = await fetch('/api/applications', {
        method: 'POST',
        body,
      });
      const result = await response.json();
      if (!response.ok) {
        showToast(result.error ?? '제출하지 못했습니다.');
        return;
      }
      location.href = `/apply/complete?receipt=${encodeURIComponent(result.receiptNumber)}`;
    } catch {
      showToast('네트워크 오류로 제출하지 못했습니다. 다시 시도해주세요.');
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="min-h-screen bg-white">
      <ContestHeader
        helper="참가 신청"
        actionLabel="신청 확인·수정"
        actionHref="/application/login"
      />
      <form
        onSubmit={submit}
        className="motion-page mx-auto flex max-w-[760px] flex-col gap-8 px-5 py-8"
      >
        <h1 className="text-3xl font-bold">참가 신청</h1>
        <Section title="기본 정보">
          <Grid>
            <Field name="teamName" label="팀명" />
            <Field name="password" label="신청 비밀번호" type="password" />
            <Field
              name="passwordConfirm"
              label="비밀번호 확인"
              type="password"
            />
          </Grid>
          <p className="text-xs text-[#666]">
            8~64자, 영문·숫자·특수문자 중 2종류 이상
          </p>
        </Section>
        <Section title="대표자 정보">
          <Grid>
            <Field
              name="leaderName"
              label="대표자 이름"
              value={leaderName}
              onChange={(e) => setLeaderName(e.target.value)}
            />
            <Field name="leaderEmail" label="대표자 이메일" type="email" />
            <Field
              name="leaderPhone"
              label="대표자 연락처"
              placeholder="010-0000-0000"
            />
          </Grid>
        </Section>
        <Section title="대회 참가 정보">
          <Grid>
            <Dropdown
              name="participationType"
              label="참가 유형"
              values={PARTICIPATION_TYPES}
              columns={1}
            />
            <Dropdown name="industry" label="참가 분야" values={INDUSTRIES} />
            <Field name="itemName" label="아이템명" />
          </Grid>
          <Label text="아이템 요약">
            <textarea
              name="itemSummary"
              required
              maxLength={settings?.item_summary_max_length ?? 10000}
              className="min-h-32 rounded-[10px] border border-[#ddd] p-4"
            />
          </Label>
        </Section>
        <Section title="팀원 정보 (대표자 포함 2~4명)">
          {members.map((m, i) => (
            <div
              className="motion-list-item grid gap-3 sm:grid-cols-[1fr_1fr_auto]"
              key={i}
            >
              <input
                className={fieldClass}
                aria-label={`${i + 1}번째 팀원 이름`}
                placeholder={i === 0 ? '대표자 이름과 자동으로 일치' : '이름'}
                value={i === 0 ? leaderName : m.name}
                disabled={i === 0}
                onChange={(e) => updateMember(i, 'name', e.target.value)}
              />
              <input
                className={fieldClass}
                aria-label={`${i + 1}번째 팀원 역할`}
                placeholder="팀 내 역할"
                value={m.role}
                onChange={(e) => updateMember(i, 'role', e.target.value)}
              />
              {i > 1 && (
                <button
                  type="button"
                  className="motion-control rounded-lg px-3 py-2 text-red-700 hover:bg-[#f5f5f5]"
                  onClick={() => setMembers((v) => v.filter((_, x) => x !== i))}
                >
                  삭제
                </button>
              )}
            </div>
          ))}
          {members.length < 4 && (
            <button
              type="button"
              className="motion-control w-fit rounded-lg border border-[#cddcf0] bg-[#eef4fb] px-4 py-2 font-bold text-[#0053b9] hover:bg-[#e1ecf8]"
              onClick={() =>
                setMembers((v) => [
                  ...v,
                  { name: '', role: '', isLeader: false },
                ])
              }
            >
              팀원 추가
            </button>
          )}
        </Section>
        {uploadEnabled && (
          <Section title={settings!.evidence_label!}>
            <p className="text-sm text-[#666]">
              {settings?.evidence_purpose} · 최대 {settings?.evidence_max_files}
              개, 파일당{' '}
              {Math.round((settings?.evidence_max_bytes ?? 0) / 1048576)}MB
            </p>
            <input
              name="files"
              type="file"
              multiple
              accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
            />
          </Section>
        )}
        <Section title="필수 확인">
          <Check
            name="eligibilityConfirmed"
            text="팀원 전원이 지원대상 요건을 만족합니다."
          />
          <Check
            name="exclusionConfirmed"
            text="지원 제외 사유에 해당하지 않습니다."
          />
          <Check name="privacyAgreed" text="개인정보 수집·이용에 동의합니다." />
          <ol className="list-decimal space-y-1.5 pl-5 text-xs leading-[1.6] text-[#9ca3af]">
            <li>
              타 대회 수상 또는 사업화 지원금 수혜 이력이 확인된 동일·유사
              아이템은 수상 자격 박탈
            </li>
            <li>
              사업화지원금 수혜 시 부산 소재지 등록 및 1년 유지 의무, 기간 내
              폐업 시 지원금 환수
            </li>
          </ol>
        </Section>
        <button
          disabled={busy}
          aria-busy={busy}
          className="motion-control rounded-[10px] bg-[#1b4292] px-5 py-4 font-bold text-white hover:bg-[#153675] disabled:bg-[#aaa] disabled:hover:bg-[#aaa]"
        >
          {busy ? '제출 중…' : '참가 신청 제출'}
        </button>
      </form>
    </div>
  );
}
function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="motion-section flex flex-col gap-4 pt-2">
      <h2 className="text-xl font-bold">{title}</h2>
      {children}
    </section>
  );
}
function Grid({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-4 sm:grid-cols-2">{children}</div>;
}
function Label({
  text,
  children,
}: {
  text: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-sm font-bold">{text}</span>
      {children}
    </label>
  );
}
function Field({
  name,
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
}: {
  name: string;
  label: string;
  type?: string;
  placeholder?: string;
  value?: string;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
}) {
  return (
    <Label text={label}>
      <input
        required
        name={name}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={fieldClass}
      />
    </Label>
  );
}
function Dropdown({
  name,
  label,
  values,
  columns = 2,
}: {
  name: string;
  label: string;
  values: readonly string[];
  columns?: 1 | 2;
}) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState('');
  const rootRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    function onDocClick(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('click', onDocClick);
    return () => document.removeEventListener('click', onDocClick);
  }, [open]);
  return (
    <Label text={label}>
      <div ref={rootRef} className="relative">
        <button
          type="button"
          aria-haspopup="listbox"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className={`${fieldClass} flex items-center justify-between text-left hover:bg-[#f5f5f5]`}
        >
          <span className={value ? '' : 'text-[#b9b9b9]'}>
            {value || '선택하세요'}
          </span>
          <span
            aria-hidden
            className={`ml-2 text-[#1b4292] transition-transform ${open ? 'rotate-180' : ''}`}
          >
            ▼
          </span>
        </button>
        <input type="hidden" name={name} value={value} />
        {open && (
          <div
            role="listbox"
            aria-label={label}
            className={`absolute top-full right-0 left-0 z-10 mt-1 grid gap-1 rounded-[10px] border border-[#e5e5e5] bg-white p-2 shadow-[0_8px_24px_rgba(0,0,0,0.08)] ${columns === 2 ? 'grid-cols-2' : 'grid-cols-1'}`}
          >
            {values.map((v) => {
              const selected = value === v;
              return (
                <button
                  key={v}
                  type="button"
                  role="option"
                  aria-selected={selected}
                  onClick={() => {
                    setValue(v);
                    setOpen(false);
                  }}
                  className={`h-10 truncate rounded-[8px] px-3 text-left text-sm ${
                    selected
                      ? 'bg-[#1b4292]/10 font-medium text-[#1b4292]'
                      : 'text-[#111] hover:bg-[#f5f5f5]'
                  }`}
                >
                  {v}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </Label>
  );
}
function Check({ name, text }: { name: string; text: string }) {
  return (
    <label className="flex gap-3 text-sm">
      <input required name={name} type="checkbox" className="size-5" />
      {text}
    </label>
  );
}
