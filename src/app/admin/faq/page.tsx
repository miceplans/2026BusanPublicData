'use client';
import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ContestHeader, fieldClass } from '@/components/contest-header';
import type { SiteSettings } from '@/types';
import { useToast } from '@/components/toast';
export default function Page() {
  const router = useRouter();
  const { showToast } = useToast();
  const [s, setS] = useState<SiteSettings | null>(null);
  useEffect(() => {
    fetch('/api/admin/settings')
      .then(async (r) => {
        if (r.status === 401) {
          router.push('/admin/login');
          return null;
        }
        const v = await r.json();
        if (!r.ok) {
          showToast(v.error ?? '자주 묻는 질문을 불러오지 못했습니다.');
          return null;
        }
        return v;
      })
      .then((v) => v && setS(v.settings))
      .catch(() =>
        showToast('네트워크 오류로 자주 묻는 질문을 불러오지 못했습니다.'),
      );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!s) return;
    if (
      (s.faqs ?? []).some((faq) => !faq.question.trim() || !faq.answer.trim())
    ) {
      showToast(
        '작성하지 않은 FAQ 항목이 있습니다. 질문과 답변을 모두 입력하거나 해당 항목을 삭제해주세요.',
      );
      return;
    }
    try {
      const r = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(s),
      });
      const v = await r.json();
      if (!r.ok) {
        showToast(v.error ?? '저장하지 못했습니다.');
        return;
      }
      showToast('자주 묻는 질문을 저장했습니다.', 'success');
    } catch {
      showToast('네트워크 오류로 저장하지 못했습니다. 다시 시도해주세요.');
    }
  }
  if (!s) return <p className="motion-feedback p-8">불러오는 중…</p>;
  return (
    <div>
      <ContestHeader
        helper="Asia/Seoul 기준"
        actionLabel="신청 목록"
        actionHref="/admin/applications"
      />
      <form
        onSubmit={submit}
        className="motion-page mx-auto flex max-w-[760px] flex-col gap-5 px-5 py-8"
      >
        <h1 className="text-3xl font-bold">자주 묻는 질문</h1>
        <div className="flex flex-col gap-4">
          {(s.faqs ?? []).map((faq, index) => (
            <div
              key={index}
              className="flex flex-col gap-2 rounded-lg border border-[#e5e5e5] bg-[#fafafa] p-4"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold text-[#666]">
                  FAQ {index + 1}
                </span>
                <div className="flex gap-1">
                  <button
                    type="button"
                    className="rounded-md border border-[#dfe3e8] bg-white px-2 py-1 text-xs font-bold disabled:opacity-40"
                    disabled={index === 0}
                    onClick={() =>
                      setS({
                        ...s,
                        faqs: moveFaq(s.faqs ?? [], index, -1),
                      })
                    }
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    className="rounded-md border border-[#dfe3e8] bg-white px-2 py-1 text-xs font-bold disabled:opacity-40"
                    disabled={index === (s.faqs ?? []).length - 1}
                    onClick={() =>
                      setS({
                        ...s,
                        faqs: moveFaq(s.faqs ?? [], index, 1),
                      })
                    }
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    className="rounded-md border border-[#f0c4c4] bg-white px-2 py-1 text-xs font-bold text-[#c0392b]"
                    onClick={() =>
                      setS({
                        ...s,
                        faqs: (s.faqs ?? []).filter((_, i) => i !== index),
                      })
                    }
                  >
                    삭제
                  </button>
                </div>
              </div>
              <input
                className={fieldClass}
                placeholder="질문"
                value={faq.question}
                onChange={(e) =>
                  setS({
                    ...s,
                    faqs: (s.faqs ?? []).map((item, i) =>
                      i === index
                        ? { ...item, question: e.target.value }
                        : item,
                    ),
                  })
                }
              />
              <textarea
                className="mt-1 min-h-28 w-full rounded-lg border border-[#dfe3e8] bg-white p-3 text-sm"
                placeholder="답변"
                value={faq.answer}
                onChange={(e) =>
                  setS({
                    ...s,
                    faqs: (s.faqs ?? []).map((item, i) =>
                      i === index ? { ...item, answer: e.target.value } : item,
                    ),
                  })
                }
              />
            </div>
          ))}
          <button
            type="button"
            className="rounded-lg border border-[#dfe3e8] bg-white p-3 text-sm font-bold"
            onClick={() =>
              setS({
                ...s,
                faqs: [...(s.faqs ?? []), { question: '', answer: '' }],
              })
            }
          >
            + FAQ 추가
          </button>
        </div>
        <button className="brand-gradient motion-control rounded-lg p-4 font-bold text-white">
          저장
        </button>
      </form>
    </div>
  );
}
function moveFaq(faqs: SiteSettings['faqs'], index: number, offset: number) {
  const next = [...faqs];
  const target = index + offset;
  if (target < 0 || target >= next.length) return next;
  [next[index], next[target]] = [next[target], next[index]];
  return next;
}
