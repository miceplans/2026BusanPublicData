'use client';
import { useLayoutEffect, useRef, useState } from 'react';
import type { FaqItem } from '@/types';

export function FaqSection({ faqs }: { faqs: FaqItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id="faq" className="scroll-mt-28">
      <h2 className="max-w-[760px] text-[clamp(1.5rem,4.5vw,3rem)] leading-[1.12] font-semibold tracking-[0.055em]">
        자주 묻는 질문
      </h2>
      {faqs.length === 0 ? (
        <p className="mt-12 rounded-[28px] border border-[#45C4DE]/45 p-7 text-lg leading-[1.7] text-white/60 sm:p-10 sm:text-xl">
          등록된 자주 묻는 질문이 없습니다.
        </p>
      ) : (
        <div className="mt-12 grid gap-0">
          {faqs.map((faq, index) => {
            const open = openIndex === index;
            return (
              <div
                key={index}
                className="faq-item landing-panel overflow-hidden rounded-[20px] border-y border-[#45C4DE]/45"
              >
                <button
                  type="button"
                  aria-expanded={open}
                  aria-controls={`faq-answer-${index}`}
                  id={`faq-question-${index}`}
                  className="flex min-h-16 w-full items-center justify-between gap-4 px-6 text-left transition-colors duration-300 hover:bg-[#45C4DE]/10 sm:px-8"
                  onClick={() => setOpenIndex(open ? null : index)}
                >
                  <span className="text-lg leading-[1.5] font-bold tracking-[-0.02em] sm:text-xl">
                    {faq.question}
                  </span>
                  <span
                    aria-hidden="true"
                    className={`shrink-0 text-xl text-[#45C4DE] transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
                  >
                    ▾
                  </span>
                </button>
                <FaqAnswer answer={faq.answer} index={index} open={open} />
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

function FaqAnswer({
  answer,
  index,
  open,
}: {
  answer: string;
  index: number;
  open: boolean;
}) {
  const answerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const previousOpenRef = useRef(open);

  useLayoutEffect(() => {
    const answerElement = answerRef.current;
    const content = contentRef.current;
    if (!answerElement || !content || previousOpenRef.current === open) return;
    previousOpenRef.current = open;

    answerElement.getAnimations().forEach((animation) => animation.cancel());
    content.getAnimations().forEach((animation) => animation.cancel());

    const contentHeight = content.scrollHeight;
    const heightAnimation = answerElement.animate(
      open
        ? [{ height: '0px' }, { height: `${contentHeight}px` }]
        : [{ height: `${contentHeight}px` }, { height: '0px' }],
      {
        duration: 650,
        easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
        fill: 'forwards',
      },
    );

    const contentAnimation = content.animate(
      open
        ? [
            { opacity: 0, transform: 'translateY(-14px)' },
            { opacity: 1, transform: 'translateY(0)' },
          ]
        : [
            { opacity: 1, transform: 'translateY(0)' },
            { opacity: 0, transform: 'translateY(-8px)' },
          ],
      {
        duration: open ? 520 : 300,
        delay: open ? 90 : 0,
        easing: 'ease-out',
        fill: 'forwards',
      },
    );

    return () => {
      heightAnimation.cancel();
      contentAnimation.cancel();
    };
  }, [open]);

  return (
    <div
      ref={answerRef}
      id={`faq-answer-${index}`}
      role="region"
      aria-labelledby={`faq-question-${index}`}
      data-open={open}
      className="faq-answer"
    >
      <div ref={contentRef} className="faq-answer-inner">
        <p className="border-t border-[#45C4DE]/35 px-6 py-6 text-lg leading-[1.75] whitespace-pre-line text-white/75 sm:px-8 sm:text-xl">
          {answer}
        </p>
      </div>
    </div>
  );
}
