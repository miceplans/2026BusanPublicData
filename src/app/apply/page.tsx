'use client';
import { ChangeEvent, FormEvent, useEffect, useRef, useState } from 'react';
import { ContestHeader, fieldClass } from '@/components/contest-header';
import {
  GENDERS,
  INDUSTRIES,
  INFORMATION_SOURCES,
  PARTICIPATION_TYPES,
  type SiteSettings,
} from '@/types';
import { useToast } from '@/components/toast';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { formatPhoneNumber } from '@/validations';
type Member = {
  name: string;
  role: string;
  isLeader: boolean;
  org: string;
  email: string;
  phone: string;
  birthDate: string;
  gender: string;
  residence: string;
};
const emptyMember = (role: string, isLeader: boolean): Member => ({
  name: '',
  role,
  isLeader,
  org: '',
  email: '',
  phone: '',
  birthDate: '',
  gender: '',
  residence: '',
});
export default function ApplyPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [idempotencyKey] = useState(() => crypto.randomUUID());
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [leaderName, setLeaderName] = useState('');
  const [members, setMembers] = useState<Member[]>([
    emptyMember('팀장', true),
    emptyMember('', false),
  ]);
  const [busy, setBusy] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [informationSource, setInformationSource] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    fetch('/api/settings')
      .then((r) => r.json())
      .then((v) => setSettings(v.settings))
      .catch(() => showToast('운영 설정을 불러올 수 없습니다.'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const uploadEnabled = !!settings?.evidence_label;
  function updateMember(
    index: number,
    key: Exclude<keyof Member, 'isLeader'>,
    value: string,
  ) {
    setMembers((v) =>
      v.map((m, i) => (i === index ? { ...m, [key]: value } : m)),
    );
  }
  function onFilesSelected(event: ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(event.target.files ?? []);
    event.target.value = '';
    if (!selected.length) return;
    setFiles((v) => [...v, ...selected]);
  }
  function removeFile(index: number) {
    setFiles((v) => v.filter((_, i) => i !== index));
  }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    const form = event.currentTarget;
    const fd = new FormData(form);
    const leaderName = String(fd.get('leaderName'));
    const leaderOrg = String(fd.get('leaderOrg'));
    const leaderEmail = String(fd.get('leaderEmail'));
    const leaderPhone = String(fd.get('leaderPhone'));
    const leaderBirthDate = String(fd.get('leaderBirthDate'));
    const leaderGender = String(fd.get('leaderGender'));
    const leaderResidence = String(fd.get('leaderResidence'));
    const synced = members.map((m, i) =>
      i === 0
        ? {
            ...m,
            name: leaderName,
            isLeader: true,
            org: leaderOrg,
            email: leaderEmail,
            phone: leaderPhone,
            birthDate: leaderBirthDate,
            gender: leaderGender,
            residence: leaderResidence,
          }
        : { ...m, isLeader: false },
    );
    const data = {
      idempotencyKey,
      teamName: fd.get('teamName'),
      leaderName,
      leaderOrg,
      leaderEmail,
      leaderPhone,
      leaderBirthDate,
      leaderGender,
      leaderResidence,
      participationType: fd.get('participationType') || '',
      industry: fd.get('industry') || '',
      informationSource: fd.get('informationSource') || '',
      informationSourceOther: fd.get('informationSourceOther') || '',
      itemName: fd.get('itemName'),
      itemSummary: fd.get('itemSummary'),
      members: synced,
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
    for (const file of files) body.append('files', file);
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
      router.push(
        `/apply/complete?receipt=${encodeURIComponent(result.receiptNumber)}`,
      );
    } catch {
      showToast('네트워크 오류로 제출하지 못했습니다. 다시 시도해주세요.');
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="apply-page service-page">
      <ContestHeader
        helper="참가 신청"
        actionLabel="신청 확인·수정"
        actionHref="/application/login"
        singleLineMobile
      />
      <form
        onSubmit={submit}
        autoComplete="on"
        className="motion-page mx-auto flex max-w-[800px] flex-col gap-5 px-5 py-10 sm:py-14"
      >
        <div className="mb-2">
          <h1 className="mt-2 text-3xl font-extrabold tracking-[-0.04em] sm:text-4xl">
            참가신청서
          </h1>
          <p className="mt-3 text-[15px] leading-6 text-[#6b7684]">
            필수 정보를 정확하게 입력해 주세요.
          </p>
        </div>
        <Section title="기본 정보">
          <Grid>
            <Field name="teamName" label="팀명" autoComplete="username" />
          </Grid>
          <p className="text-xs text-[#666]">
            신청 확인 비밀번호는 아래에 입력하는 팀장 연락처의 뒤 4자리로 자동
            설정됩니다.
          </p>
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
            <Field
              name="itemName"
              label="아이템명"
              maxLength={20}
              placeholder="제안 아이디어를 20자 이내로 표현"
            />
          </Grid>
          <Label text="아이템 요약">
            <textarea
              name="itemSummary"
              required
              maxLength={Math.min(settings?.item_summary_max_length ?? 40, 40)}
              placeholder="제안 아이디어의 핵심 내용과 기대 효과를 40자 내외로 요약"
              className="min-h-32 border border-[#dfe3e8] bg-white p-4 outline-none hover:border-[#c9d0d8] focus:border-[#35c1de] focus:ring-3 focus:ring-[#35c1de]/10"
            />
          </Label>
        </Section>
        <Section title="대회 정보 습득 경로">
          <fieldset>
            <legend className="sr-only">대회 정보 습득 경로 (필수)</legend>
            <div className="grid gap-3 sm:grid-cols-3">
              {INFORMATION_SOURCES.map((source) => (
                <label className="flex items-center gap-2 text-sm" key={source}>
                  <input
                    required
                    type="radio"
                    name="informationSource"
                    value={source}
                    checked={informationSource === source}
                    onChange={(event) =>
                      setInformationSource(event.target.value)
                    }
                    className="size-4"
                  />
                  {source}
                </label>
              ))}
            </div>
            {informationSource === '기타' && (
              <input
                required
                name="informationSourceOther"
                maxLength={100}
                aria-label="기타 대회 정보 습득 경로"
                placeholder="기타 경로를 입력해 주세요."
                className={`${fieldClass} mt-4`}
              />
            )}
          </fieldset>
        </Section>
        <Section title="신청인(팀장 정보)">
          <Grid>
            <Field
              name="leaderName"
              label="이름"
              value={leaderName}
              onChange={(e) => setLeaderName(e.target.value)}
              autoComplete="name"
            />
            <Field name="leaderOrg" label="소속" autoComplete="organization" />
            <Field
              name="leaderEmail"
              label="이메일"
              type="email"
              autoComplete="email"
            />
            <Field
              name="leaderPhone"
              label="연락처"
              placeholder="010-0000-0000"
              autoComplete="tel"
              inputMode="numeric"
              maxLength={13}
              onChange={(e) => {
                e.currentTarget.value = formatPhoneNumber(
                  e.currentTarget.value,
                );
              }}
            />
            <Field
              name="leaderBirthDate"
              label="생년월일"
              placeholder="예: 260101"
              inputMode="numeric"
              maxLength={6}
              onChange={(e) => {
                e.currentTarget.value = e.currentTarget.value
                  .replace(/\D/g, '')
                  .slice(0, 6);
              }}
            />
            <Field
              name="leaderResidence"
              label="거주지"
              placeholder="예: 부산"
              autoComplete="address-level1"
            />
          </Grid>
          <GenderField name="leaderGender" legend="성별" />
        </Section>
        <Section title="팀원 정보 (팀장 제외, 1~3명)">
          {members.map((m, i) =>
            i === 0 ? null : (
              <div
                className="motion-list-item flex flex-col gap-3 rounded-xl border border-[#e5e5e5] p-4"
                key={i}
              >
                <div className="flex items-center justify-between">
                  {i > 1 && (
                    <button
                      type="button"
                      className="motion-control rounded-lg px-3 py-1 text-sm text-red-700 hover:bg-[#f5f5f5]"
                      onClick={() =>
                        setMembers((v) => v.filter((_, x) => x !== i))
                      }
                    >
                      삭제
                    </button>
                  )}
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <input
                    className={fieldClass}
                    aria-label={`${i}번째 팀원 이름`}
                    placeholder="이름"
                    value={m.name}
                    onChange={(e) => updateMember(i, 'name', e.target.value)}
                  />
                  <input
                    className={fieldClass}
                    aria-label={`${i}번째 팀원 소속`}
                    placeholder="소속"
                    value={m.org}
                    onChange={(e) => updateMember(i, 'org', e.target.value)}
                  />
                  <input
                    className={fieldClass}
                    aria-label={`${i}번째 팀원 역할`}
                    placeholder="팀 내 역할"
                    value={m.role}
                    onChange={(e) => updateMember(i, 'role', e.target.value)}
                  />
                  <input
                    className={fieldClass}
                    type="email"
                    aria-label={`${i}번째 팀원 이메일`}
                    placeholder="이메일"
                    value={m.email}
                    onChange={(e) => updateMember(i, 'email', e.target.value)}
                  />
                  <input
                    className={fieldClass}
                    inputMode="numeric"
                    maxLength={13}
                    aria-label={`${i}번째 팀원 연락처`}
                    placeholder="010-0000-0000"
                    value={m.phone}
                    onChange={(e) =>
                      updateMember(
                        i,
                        'phone',
                        formatPhoneNumber(e.target.value),
                      )
                    }
                  />
                  <input
                    className={fieldClass}
                    inputMode="numeric"
                    maxLength={6}
                    aria-label={`${i}번째 팀원 생년월일`}
                    placeholder="생년월일 (예: 260101)"
                    value={m.birthDate}
                    onChange={(e) =>
                      updateMember(
                        i,
                        'birthDate',
                        e.target.value.replace(/\D/g, '').slice(0, 6),
                      )
                    }
                  />
                  <input
                    className={fieldClass}
                    aria-label={`${i}번째 팀원 거주지`}
                    placeholder="거주지"
                    value={m.residence}
                    onChange={(e) =>
                      updateMember(i, 'residence', e.target.value)
                    }
                  />
                  <fieldset className="flex items-center gap-4 sm:col-span-2">
                    <legend className="sr-only">{`${i}번째 팀원 성별`}</legend>
                    {GENDERS.map((g) => (
                      <label
                        className="flex items-center gap-2 text-sm"
                        key={g}
                      >
                        <input
                          type="radio"
                          name={`memberGender${i}`}
                          checked={m.gender === g}
                          onChange={() => updateMember(i, 'gender', g)}
                          className="size-4"
                        />
                        {g}
                      </label>
                    ))}
                  </fieldset>
                </div>
              </div>
            ),
          )}
          {members.length < 4 && (
            <button
              type="button"
              className="motion-control w-fit rounded-lg border border-[#b7e4ee] bg-[#effbfe] px-4 py-2 font-bold text-[#176f9f] hover:bg-[#ddf5fa]"
              onClick={() => setMembers((v) => [...v, emptyMember('', false)])}
            >
              팀원 추가
            </button>
          )}
        </Section>
        {uploadEnabled && (
          <Section title={settings!.evidence_label!}>
            {settings?.evidence_purpose && (
              <p className="text-sm text-[#666]">{settings.evidence_purpose}</p>
            )}
            <div className="flex flex-col gap-2">
              <DocumentDownload
                href="/downloads/[제출서류] 2026 AI 창업 경진대회 아이디어 제안서.hwp"
                fileName="[제출서류] 2026 AI 창업 경진대회 아이디어 제안서.hwp"
                label="아이디어 제안서 양식"
              />
              <DocumentDownload
                href="/downloads/[제출서류] 2026 AI 창업 경진대회 개인정보 수집 및 이용에 관한 동의서.hwp"
                fileName="[제출서류] 2026 AI 창업 경진대회 개인정보 수집 및 이용에 관한 동의서.hwp"
                label="개인정보 수집·이용 동의서"
              />
              <DocumentDownload
                href="/downloads/[제출서류] 2026 AI 창업 경진대회 참가서약서.hwp"
                fileName="[제출서류] 2026 AI 창업 경진대회 참가서약서.hwp"
                label="참가 서약서"
              />
            </div>
            <div className="flex flex-col gap-2 rounded-[10px] border border-[#e5e5e5] px-4 py-2">
              {files.map((file, i) => (
                <div
                  key={i}
                  className={`motion-list-item flex items-center justify-between gap-3 py-2.5 ${
                    i > 0 ? 'border-t border-[#e5e5e5]' : ''
                  }`}
                >
                  <p className="truncate text-sm text-[#111]">{file.name}</p>
                  <button
                    type="button"
                    className="motion-control shrink-0 text-[13px] font-semibold text-[#176f9f] hover:underline"
                    onClick={() => removeFile(i)}
                  >
                    삭제
                  </button>
                </div>
              ))}
              <div
                className={`flex items-center justify-between py-2 ${
                  files.length > 0 ? 'border-t border-[#e5e5e5]' : ''
                }`}
              >
                <p className="text-xs font-semibold text-[#111]">
                  {files.length}개 파일 첨부됨
                </p>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="brand-gradient motion-control rounded-[10px] px-3 py-2 text-sm font-bold text-white"
                >
                  파일 추가
                </button>
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={onFilesSelected}
            />
          </Section>
        )}
        <Section title="유의사항">
          <ol className="list-decimal space-y-3 pl-5 text-sm leading-6 text-[#4e5968]">
            <li>접수된 서류는 반환되지 않습니다.</li>
            <li>
              제출된 아이디어 제안서의 내용은 접수 및 심사 과정에서 비밀이
              유지됩니다.
            </li>
            <li>
              타인의 아이디어, 기술 등을 모방하여 발생하는 모든 민·형사상 책임은
              참가자 본인에게 있습니다.
            </li>
            <li>
              수상 시 상장은 팀명과 팀원명이 기재된 1부만 제공되며, 부상 및
              지원금은 팀장 명의로 지급됩니다.
            </li>
            <li>
              아이디어명, 참가분야, 팀명, 참가자 및 팀원 등 신청서에 작성한
              내용은 접수 마감일 이후 변경할 수 없습니다.
            </li>
            <li>
              부정행위가 적발되면 수상이 취소되고 상금이 회수될 수 있습니다.
            </li>
            <li>
              심사결과는 공개하지 않으며, 심사결과와 관련된 문의 및 이의제기
              등은 일체 받지 않습니다.
            </li>
            <li>
              상금을 수령한 팀은 창업 후에 이행보증증권을 발행해야하며,
              보증보험료는 자부담으로 진행됩니다.
            </li>
          </ol>
        </Section>
        <Section title="필수 확인">
          <Check
            name="eligibilityConfirmed"
            text="팀원 전원이 지원대상 요건을 만족합니다."
          />
          <Check
            name="exclusionConfirmed"
            text="지원 제외 사유에 해당하지 않습니다."
          />
          <Check name="privacyAgreed">
            <Link
              className="font-bold text-[#176f9f] underline underline-offset-4"
              href="/privacy"
              target="_blank"
            >
              개인정보처리방침
            </Link>
            을 확인했으며 개인정보 수집·이용에 동의합니다.
          </Check>
        </Section>
        <button
          disabled={busy}
          aria-busy={busy}
          className="brand-gradient motion-control mt-2 min-h-14 rounded-[8px] px-5 py-4 font-bold text-white disabled:bg-[#b0b8c1] disabled:hover:bg-[#b0b8c1]"
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
    <section className="service-card motion-section flex flex-col gap-5 rounded-2xl p-5 sm:p-7">
      <h2 className="text-xl font-extrabold tracking-[-0.025em] text-[#191f28]">
        {title}
      </h2>
      {children}
    </section>
  );
}
function Grid({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-4 sm:grid-cols-2">{children}</div>;
}
function DocumentDownload({
  href,
  fileName,
  label,
}: {
  href: string;
  fileName: string;
  label: string;
}) {
  return (
    <a
      href={href}
      download={fileName}
      className="motion-control flex min-h-12 items-center justify-between gap-3 rounded-[10px] border border-[#b7e4ee] bg-[#effbfe] px-4 py-3 text-sm font-bold text-[#176f9f] hover:bg-[#ddf5fa]"
    >
      <span>{label}</span>
      <span aria-hidden className="shrink-0">
        ↓
      </span>
    </a>
  );
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
      <span className="text-sm font-bold text-[#333d4b]">{text}</span>
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
  autoComplete,
  inputMode,
  maxLength,
}: {
  name: string;
  label: string;
  type?: string;
  placeholder?: string;
  value?: string;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
  autoComplete?: React.HTMLInputAutoCompleteAttribute;
  inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode'];
  maxLength?: number;
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
        autoComplete={autoComplete}
        inputMode={inputMode}
        maxLength={maxLength}
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
            className={`ml-2 text-[#176f9f] transition-transform ${open ? 'rotate-180' : ''}`}
          >
            ▼
          </span>
        </button>
        <input type="hidden" name={name} value={value} />
        {open && (
          <div
            role="listbox"
            aria-label={label}
            className={`absolute top-full right-0 left-0 z-10 mt-1 grid gap-1 rounded-[6px] border border-[#e5e8eb] bg-white p-2 shadow-[0_8px_24px_rgba(0,0,0,0.08)] ${columns === 2 ? 'grid-cols-2' : 'grid-cols-1'}`}
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
                      ? 'bg-[#176f9f]/10 font-medium text-[#176f9f]'
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
function GenderField({ name, legend }: { name: string; legend: string }) {
  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="text-sm font-bold text-[#333d4b]">{legend}</legend>
      <div className="flex gap-4">
        {GENDERS.map((g, index) => (
          <label className="flex items-center gap-2 text-sm" key={g}>
            <input
              required={index === 0}
              type="radio"
              name={name}
              value={g}
              className="size-4"
            />
            {g}
          </label>
        ))}
      </div>
    </fieldset>
  );
}
function Check({
  name,
  text,
  children,
}: {
  name: string;
  text?: string;
  children?: React.ReactNode;
}) {
  return (
    <label className="flex gap-3 text-sm">
      <input required name={name} type="checkbox" className="size-5" />
      <span>{children ?? text}</span>
    </label>
  );
}
