'use client';
import { FormEvent, useEffect, useRef, useState } from 'react';
import { ContestHeader, fieldClass } from '@/components/contest-header';
import { formatPhoneNumber } from '@/validations';
import {
  GENDERS,
  INDUSTRIES,
  INFORMATION_SOURCES,
  PARTICIPATION_TYPES,
} from '@/types';
import { useToast } from '@/components/toast';
type App = {
  receipt_number: string;
  team_name: string;
  leader_name: string;
  leader_org: string;
  leader_email: string;
  leader_phone: string;
  leader_birth_date: string;
  leader_gender: string;
  leader_residence: string;
  participation_type: string;
  industry: string;
  information_source: string | null;
  information_source_other: string | null;
  item_name: string;
  item_summary: string;
  eligibility_confirmed: boolean;
  exclusion_confirmed: boolean;
  requests: string | null;
  updated_at: string;
  application_members: {
    name: string;
    role: string;
    is_leader: boolean;
    display_order: number;
    org: string;
    email: string;
    phone: string;
    birth_date: string;
    gender: string;
    residence: string;
  }[];
  application_files: {
    id: string;
    original_name: string;
    size_bytes: number;
  }[];
};
export default function Page() {
  const { showToast } = useToast();
  const [app, setApp] = useState<App | null>(null);
  const [editable, setEditable] = useState(false);
  const [message, setMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  async function reload() {
    const r = await fetch('/api/application/me');
    if (r.ok) {
      const v = await r.json();
      setApp(v.application);
      setEditable(v.editable);
    }
  }
  useEffect(() => {
    fetch('/api/application/me')
      .then(async (r) => {
        if (r.status === 401) {
          location.href = '/application/login';
          return null;
        }
        const v = await r.json();
        if (!r.ok) {
          showToast(v.error ?? '신청 정보를 불러오지 못했습니다.');
          return null;
        }
        return v;
      })
      .then((v) => {
        if (v) {
          setApp(v.application);
          setEditable(v.editable);
        }
      })
      .catch(() =>
        showToast('네트워크 오류로 신청 정보를 불러오지 못했습니다.'),
      );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!app) return;
    const f = new FormData(e.currentTarget);
    const body = {
      teamName: f.get('teamName'),
      leaderName: f.get('leaderName'),
      leaderOrg: f.get('leaderOrg'),
      leaderEmail: f.get('leaderEmail'),
      leaderPhone: f.get('leaderPhone'),
      leaderBirthDate: f.get('leaderBirthDate'),
      leaderGender: f.get('leaderGender'),
      leaderResidence: f.get('leaderResidence'),
      participationType: f.get('participationType'),
      industry: f.get('industry'),
      informationSource: f.get('informationSource'),
      informationSourceOther: f.get('informationSourceOther') || '',
      itemName: f.get('itemName'),
      itemSummary: f.get('itemSummary'),
      eligibilityConfirmed: true,
      exclusionConfirmed: true,
      requests: f.get('requests'),
      members: app.application_members
        .sort((a, b) => a.display_order - b.display_order)
        .map((m, i) => ({
          name: String(f.get(`memberName${i}`)),
          role: String(f.get(`memberRole${i}`)),
          isLeader: m.is_leader,
          org: String(f.get(`memberOrg${i}`)),
          email: String(f.get(`memberEmail${i}`)),
          phone: String(f.get(`memberPhone${i}`)),
          birthDate: String(f.get(`memberBirthDate${i}`)),
          gender: String(f.get(`memberGender${i}`)),
          residence: String(f.get(`memberResidence${i}`)),
        })),
    };
    try {
      const r = await fetch('/api/application/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const v = await r.json();
      if (!r.ok) {
        showToast(v.error ?? '저장하지 못했습니다.');
        return;
      }
      setMessage('수정 내용을 저장했습니다.');
    } catch {
      showToast('네트워크 오류로 저장하지 못했습니다. 다시 시도해주세요.');
    }
  }
  async function deleteFile(id: string) {
    if (!confirm('이 증빙자료를 삭제하시겠습니까?')) return;
    try {
      const r = await fetch(`/api/application/files/${id}`, {
        method: 'DELETE',
      });
      const v = await r.json();
      if (!r.ok) {
        showToast(v.error ?? '삭제하지 못했습니다.');
        return;
      }
      setMessage('증빙자료를 삭제했습니다.');
      reload();
    } catch {
      showToast('네트워크 오류로 삭제하지 못했습니다. 다시 시도해주세요.');
    }
  }
  async function addFiles() {
    const files = fileInputRef.current?.files;
    if (!files?.length) return;
    const body = new FormData();
    for (const file of Array.from(files)) body.append('files', file);
    try {
      const r = await fetch('/api/application/files', {
        method: 'POST',
        body,
      });
      const v = await r.json();
      if (!r.ok) {
        showToast(v.error ?? '추가하지 못했습니다.');
        return;
      }
      setMessage('증빙자료를 추가했습니다.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      reload();
    } catch {
      showToast('네트워크 오류로 추가하지 못했습니다. 다시 시도해주세요.');
    }
  }
  if (!app)
    return (
      <div className="service-page">
        <ContestHeader />
        <p className="motion-feedback p-8 text-center">
          신청 정보를 불러오는 중입니다…
        </p>
      </div>
    );
  return (
    <div className="service-page">
      <ContestHeader helper={`접수번호 ${app.receipt_number}`} />
      <form
        onSubmit={submit}
        autoComplete="on"
        className="motion-page mx-auto flex max-w-[800px] flex-col gap-6 px-5 py-10 sm:py-14"
      >
        <h1 className="text-3xl font-extrabold tracking-[-0.04em]">
          신청 확인·수정
        </h1>
        <p className="rounded-lg bg-[#f5f7fb] p-4 text-sm">
          최종 수정 {new Date(app.updated_at).toLocaleString('ko-KR')}
          {!editable && ' · 현재 읽기 전용'}
        </p>
        <fieldset
          disabled={!editable}
          className="service-card grid gap-5 rounded-2xl p-5 sm:grid-cols-2 sm:p-7"
        >
          <F n="teamName" l="팀명" v={app.team_name} autoComplete="username" />
          <F
            n="leaderName"
            l="팀장 이름"
            v={app.leader_name}
            autoComplete="name"
          />
          <F
            n="leaderOrg"
            l="팀장 소속"
            v={app.leader_org}
            autoComplete="organization"
          />
          <F
            n="leaderEmail"
            l="팀장 이메일"
            v={app.leader_email}
            type="email"
            autoComplete="email"
          />
          <F
            n="leaderPhone"
            l="팀장 연락처"
            v={app.leader_phone}
            autoComplete="tel"
            phone
          />
          <F
            n="leaderBirthDate"
            l="생년월일"
            v={app.leader_birth_date}
            placeholder="예: 260101"
          />
          <S n="leaderGender" l="성별" v={app.leader_gender} values={GENDERS} />
          <F
            n="leaderResidence"
            l="거주지"
            v={app.leader_residence}
            autoComplete="address-level1"
          />
          <S
            n="participationType"
            l="참가 유형"
            v={app.participation_type}
            values={PARTICIPATION_TYPES}
          />
          <S n="industry" l="참가 분야" v={app.industry} values={INDUSTRIES} />
          <InformationSourceField
            value={app.information_source ?? ''}
            otherValue={app.information_source_other ?? ''}
          />
          <F
            n="itemName"
            l="아이템명"
            v={app.item_name}
            placeholder="제안 아이디어를 20자 이내로 표현"
          />
          <label className="sm:col-span-2">
            아이템 요약
            <textarea
              name="itemSummary"
              defaultValue={app.item_summary}
              placeholder="제안 아이디어의 핵심 내용과 기대 효과를 40자 내외로 요약"
              className="mt-2 min-h-32 w-full border border-[#dfe3e8] bg-white p-3 outline-none focus:border-[#35c1de] focus:ring-3 focus:ring-[#35c1de]/10"
            />
          </label>
          {app.application_members
            .sort((a, b) => a.display_order - b.display_order)
            .map((m, i) => (
              <div className="contents" key={i}>
                <F n={`memberName${i}`} l={`팀원 ${i + 1} 이름`} v={m.name} />
                <F n={`memberOrg${i}`} l={`팀원 ${i + 1} 소속`} v={m.org} />
                <F n={`memberRole${i}`} l="역할" v={m.role} />
                <F
                  n={`memberEmail${i}`}
                  l={`팀원 ${i + 1} 이메일`}
                  v={m.email}
                  type="email"
                />
                <F
                  n={`memberPhone${i}`}
                  l={`팀원 ${i + 1} 연락처`}
                  v={m.phone}
                  phone
                />
                <F
                  n={`memberBirthDate${i}`}
                  l={`팀원 ${i + 1} 생년월일`}
                  v={m.birth_date}
                  placeholder="예: 260101"
                />
                <S
                  n={`memberGender${i}`}
                  l={`팀원 ${i + 1} 성별`}
                  v={m.gender}
                  values={GENDERS}
                />
                <F
                  n={`memberResidence${i}`}
                  l={`팀원 ${i + 1} 거주지`}
                  v={m.residence}
                />
              </div>
            ))}
          <label className="sm:col-span-2">
            요청사항
            <textarea
              name="requests"
              defaultValue={app.requests ?? ''}
              className="mt-2 min-h-24 w-full border border-[#dfe3e8] bg-white p-3 outline-none focus:border-[#35c1de] focus:ring-3 focus:ring-[#35c1de]/10"
            />
          </label>
        </fieldset>
        {app.application_files.length > 0 && (
          <section>
            <h2 className="font-bold">증빙자료</h2>
            {app.application_files.map((f) => (
              <div key={f.id} className="mt-2 flex items-center gap-3">
                <a href={`/api/files/${f.id}`} className="underline">
                  {f.original_name}
                </a>
                {editable && (
                  <button
                    type="button"
                    className="motion-control rounded-lg px-2 py-1 text-sm text-red-700 hover:bg-[#f5f5f5]"
                    onClick={() => deleteFile(f.id)}
                  >
                    삭제
                  </button>
                )}
              </div>
            ))}
          </section>
        )}
        {editable && (
          <div className="flex flex-wrap gap-3 rounded-lg border p-4">
            <input ref={fileInputRef} name="files" type="file" multiple />
            <button
              type="button"
              onClick={addFiles}
              className="motion-control rounded-lg border px-3 hover:bg-[#f5f5f5]"
            >
              증빙자료 추가
            </button>
          </div>
        )}
        {message && (
          <p role="status" className="motion-feedback">
            {message}
          </p>
        )}
        {editable && (
          <button className="brand-gradient motion-control min-h-14 rounded-[8px] p-4 font-bold text-white">
            수정 내용 저장
          </button>
        )}
      </form>
    </div>
  );
}
function F({
  n,
  l,
  v,
  type = 'text',
  autoComplete,
  phone = false,
  placeholder,
}: {
  n: string;
  l: string;
  v: string;
  type?: string;
  autoComplete?: React.HTMLInputAutoCompleteAttribute;
  phone?: boolean;
  placeholder?: string;
}) {
  return (
    <label className="text-sm font-bold">
      {l}
      <input
        required
        name={n}
        type={type}
        defaultValue={v}
        placeholder={placeholder}
        autoComplete={autoComplete}
        inputMode={phone ? 'numeric' : undefined}
        maxLength={phone ? 13 : undefined}
        onInput={
          phone
            ? (e) => {
                e.currentTarget.value = formatPhoneNumber(
                  e.currentTarget.value,
                );
              }
            : undefined
        }
        className={`${fieldClass} mt-2 font-normal`}
      />
    </label>
  );
}
function S({
  n,
  l,
  v,
  values,
  labels,
}: {
  n: string;
  l: string;
  v: string;
  values: readonly string[];
  labels?: string[];
}) {
  return (
    <label className="text-sm font-bold">
      {l}
      <select
        name={n}
        defaultValue={v}
        className={`${fieldClass} mt-2 font-normal`}
      >
        {values.map((x, i) => (
          <option key={x} value={x}>
            {labels?.[i] ?? x}
          </option>
        ))}
      </select>
    </label>
  );
}

function InformationSourceField({
  value,
  otherValue,
}: {
  value: string;
  otherValue: string;
}) {
  const [selected, setSelected] = useState(value);
  return (
    <fieldset className="sm:col-span-2">
      <legend className="text-sm font-bold">대회 정보 습득 경로</legend>
      <div className="mt-2 grid gap-3 sm:grid-cols-3">
        {INFORMATION_SOURCES.map((source) => (
          <label className="flex items-center gap-2 text-sm" key={source}>
            <input
              required
              type="radio"
              name="informationSource"
              value={source}
              checked={selected === source}
              onChange={(event) => setSelected(event.target.value)}
            />
            {source}
          </label>
        ))}
      </div>
      {selected === '기타' && (
        <input
          required
          name="informationSourceOther"
          maxLength={100}
          defaultValue={otherValue}
          aria-label="기타 대회 정보 습득 경로"
          className={`${fieldClass} mt-3 font-normal`}
        />
      )}
    </fieldset>
  );
}
