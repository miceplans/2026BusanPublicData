'use client';
import { useState } from 'react';
import type { FaqItem } from '@/types';

export function FaqSection({ faqs }: { faqs: FaqItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="scroll-mt-28">
      <h2 className="max-w-[760px] text-[clamp(1.5rem,4.5vw,3rem)] leading-[1.12] font-semibold tracking-[0.055em]">
        자주 묻는 질문
      </h2>
      {faqs.length === 0 ? (
        <p className="mt-12 rounded-[28px] border border-[#45C4DE]/45 p-7 text-sm leading-[1.7] text-white/60 sm:p-10">
          등록된 자주 묻는 질문이 없습니다.
        </p>
      ) : (
        <div className="mt-12 grid gap-3">
          {faqs.map((faq, index) => {
            const open = openIndex === index;
            return (
              <div
                key={index}
                className="landing-panel overflow-hidden rounded-[20px] border border-[#45C4DE]/45"
              >
                <button
                  type="button"
                  aria-expanded={open}
                  aria-controls={`faq-answer-${index}`}
                  id={`faq-question-${index}`}
                  className="flex min-h-16 w-full items-center justify-between gap-4 px-6 text-left sm:px-8"
                  onClick={() => setOpenIndex(open ? null : index)}
                >
                  <span className="text-base leading-[1.5] font-bold tracking-[-0.02em] sm:text-lg">
                    {faq.question}
                  </span>
                  <span
                    aria-hidden="true"
                    className={`shrink-0 text-xl text-[#45C4DE] transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
                  >
                    ▾
                  </span>
                </button>
                <div
                  id={`faq-answer-${index}`}
                  role="region"
                  aria-labelledby={`faq-question-${index}`}
                  className={`grid transition-[grid-template-rows] duration-200 ${open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}
                >
                  <div className="overflow-hidden">
                    <p className="border-t border-[#45C4DE]/35 px-6 py-6 text-sm leading-[1.75] whitespace-pre-line text-white/75 sm:px-8 sm:text-base">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
