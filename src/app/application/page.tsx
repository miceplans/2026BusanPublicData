'use client';
import { FormEvent, useEffect, useRef, useState } from 'react';
import { ContestHeader, fieldClass } from '@/components/contest-header';
import { INDUSTRIES, PARTICIPATION_TYPES } from '@/types';
import { useToast } from '@/components/toast';
type App = {
  receipt_number: string;
  team_name: string;
  leader_name: string;
  leader_email: string;
  leader_phone: string;
  participation_type: string;
  industry: string;
  item_name: string;
  item_summary: string;
  is_busan_based: boolean;
  eligibility_confirmed: boolean;
  exclusion_confirmed: boolean;
  requests: string | null;
  updated_at: string;
  application_members: {
    name: string;
    role: string;
    is_leader: boolean;
    display_order: number;
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
      leaderEmail: f.get('leaderEmail'),
      leaderPhone: f.get('leaderPhone'),
      participationType: f.get('participationType'),
      industry: f.get('industry'),
      itemName: f.get('itemName'),
      itemSummary: f.get('itemSummary'),
      isBusanBased: f.get('isBusanBased') === 'true',
      eligibilityConfirmed: true,
      exclusionConfirmed: true,
      requests: f.get('requests'),
      members: app.application_members
        .sort((a, b) => a.display_order - b.display_order)
        .map((m, i) => ({
          name: String(f.get(`memberName${i}`)),
          role: String(f.get(`memberRole${i}`)),
          isLeader: m.is_leader,
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
          <F n="teamName" l="팀명" v={app.team_name} />
          <F n="leaderName" l="대표자 이름" v={app.leader_name} />
          <F
            n="leaderEmail"
            l="대표자 이메일"
            v={app.leader_email}
            type="email"
          />
          <F n="leaderPhone" l="대표자 연락처" v={app.leader_phone} />
          <S
            n="participationType"
            l="참가 유형"
            v={app.participation_type}
            values={PARTICIPATION_TYPES}
          />
          <S n="industry" l="참가 분야" v={app.industry} values={INDUSTRIES} />
          <F n="itemName" l="아이템명" v={app.item_name} />
          <S
            n="isBusanBased"
            l="부산 소재 여부"
            v={String(app.is_busan_based)}
            values={['true', 'false']}
            labels={['예', '아니오']}
          />
          <label className="sm:col-span-2">
            아이템 요약
            <textarea
              name="itemSummary"
              defaultValue={app.item_summary}
              className="mt-2 min-h-32 w-full border border-[#dfe3e8] bg-white p-3 outline-none focus:border-[#e4007f] focus:ring-3 focus:ring-[#e4007f]/10"
            />
          </label>
          {app.application_members
            .sort((a, b) => a.display_order - b.display_order)
            .map((m, i) => (
              <div className="contents" key={i}>
                <F n={`memberName${i}`} l={`팀원 ${i + 1} 이름`} v={m.name} />
                <F n={`memberRole${i}`} l="역할" v={m.role} />
              </div>
            ))}
          <label className="sm:col-span-2">
            요청사항
            <textarea
              name="requests"
              defaultValue={app.requests ?? ''}
              className="mt-2 min-h-24 w-full border border-[#dfe3e8] bg-white p-3 outline-none focus:border-[#e4007f] focus:ring-3 focus:ring-[#e4007f]/10"
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
            <input
              ref={fileInputRef}
              name="files"
              type="file"
              multiple
              accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
            />
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
}: {
  n: string;
  l: string;
  v: string;
  type?: string;
}) {
  return (
    <label className="text-sm font-bold">
      {l}
      <input
        required
        name={n}
        type={type}
        defaultValue={v}
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
