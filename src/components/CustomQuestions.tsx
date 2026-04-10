'use client';

import { useState } from 'react';
import { CustomQuestion, TrainerBranding } from '@/types';

interface CustomQuestionsProps {
  questions: CustomQuestion[];
  branding: TrainerBranding;
  onSubmit: (answers: Record<string, string | string[]>) => void;
}

export default function CustomQuestions({ questions, branding, onSubmit }: CustomQuestionsProps) {
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});

  const allAnswered = questions.every((q) => {
    const a = answers[q.id];
    if (!a) return false;
    if (Array.isArray(a)) return a.length > 0;
    return a.trim().length > 0;
  });

  const setAnswer = (id: string, value: string | string[]) => {
    setAnswers((prev) => ({ ...prev, [id]: value }));
  };

  const toggleMultiOption = (id: string, option: string) => {
    const current = (answers[id] as string[]) || [];
    if (current.includes(option)) {
      setAnswer(id, current.filter((o) => o !== option));
    } else {
      setAnswer(id, [...current, option]);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <h2 className="text-[1.4rem] font-bold mb-1.5 text-center" style={{ color: branding.color_text, fontFamily: 'var(--font-heading)' }}>
        A couple more questions
      </h2>
      <p className="text-sm text-center mb-6" style={{ color: branding.color_text_muted }}>
        This helps us personalise your plan
      </p>

      <div className="space-y-5">
        {questions.map((q) => (
          <div key={q.id}>
            <label className="text-xs font-medium block mb-2" style={{ color: branding.color_text }}>
              {q.question}
            </label>

            {q.type === 'text' && (
              <input
                type="text"
                value={(answers[q.id] as string) || ''}
                onChange={(e) => setAnswer(q.id, e.target.value)}
                placeholder={q.placeholder || 'Type your answer...'}
                className="w-full rounded-xl px-4 py-3 text-base focus:outline-none transition-colors border"
                style={{
                  backgroundColor: branding.color_card,
                  borderColor: branding.color_border,
                  color: branding.color_text,
                }}
              />
            )}

            {q.type === 'select' && (
              <div className="space-y-1.5">
                {q.options.map((option) => {
                  const isSelected = answers[q.id] === option;
                  return (
                    <button key={option} onClick={() => setAnswer(q.id, option)}
                      className="w-full text-left px-4 py-3 rounded-xl border transition-all duration-200 active:scale-[0.98] text-sm"
                      style={{
                        backgroundColor: isSelected ? branding.color_primary + '12' : branding.color_card,
                        borderColor: isSelected ? branding.color_primary : branding.color_border,
                        color: branding.color_text,
                      }}>
                      {option}
                    </button>
                  );
                })}
              </div>
            )}

            {q.type === 'multiselect' && (
              <div className="space-y-1.5">
                {q.options.map((option) => {
                  const selected = ((answers[q.id] as string[]) || []).includes(option);
                  return (
                    <button key={option} onClick={() => toggleMultiOption(q.id, option)}
                      className="w-full text-left px-4 py-3 rounded-xl border transition-all duration-200 active:scale-[0.98] text-sm flex items-center gap-3"
                      style={{
                        backgroundColor: selected ? branding.color_primary + '12' : branding.color_card,
                        borderColor: selected ? branding.color_primary : branding.color_border,
                        color: branding.color_text,
                      }}>
                      <div className="w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all"
                        style={{
                          borderColor: selected ? branding.color_primary : branding.color_border,
                          backgroundColor: selected ? branding.color_primary : 'transparent',
                        }}>
                        {selected && (
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                      {option}
                    </button>
                  );
                })}
                <p className="text-[10px]" style={{ color: branding.color_text_muted }}>Select all that apply</p>
              </div>
            )}
          </div>
        ))}

        <button onClick={() => onSubmit(answers)} disabled={!allAnswered}
          className="w-full py-3.5 rounded-xl font-semibold transition-all duration-200 disabled:opacity-40 active:scale-[0.97] text-sm text-white"
          style={{ backgroundColor: branding.color_primary }}>
          Continue
        </button>
      </div>
    </div>
  );
}
