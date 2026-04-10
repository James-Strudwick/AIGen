'use client';

import { useState, useEffect } from 'react';
import { createBrowserClient } from '@/lib/auth';
import { CustomGoal, TrainerForm, Trainer, CustomQuestion } from '@/types';

interface FormFlowEditorProps {
  trainer: Trainer;
  goals: CustomGoal[];
}

const defaultGoals: CustomGoal[] = [
  { id: 'weight_loss', emoji: '🔥', label: 'Lose Weight', subtitle: '', needs_target: false, target_prompt: '', target_placeholder: '', goal_type: 'weight_loss' },
  { id: 'muscle_gain', emoji: '💪', label: 'Build Muscle', subtitle: '', needs_target: false, target_prompt: '', target_placeholder: '', goal_type: 'muscle_gain' },
  { id: 'fitness', emoji: '❤️', label: 'Improve Fitness', subtitle: '', needs_target: true, target_prompt: '', target_placeholder: '', goal_type: 'fitness' },
  { id: 'performance', emoji: '🏃', label: 'Performance', subtitle: '', needs_target: true, target_prompt: '', target_placeholder: '', goal_type: 'performance' },
];

type FormStep = 'about' | 'availability' | 'questions' | 'capture' | 'results';
const STEPS: { id: FormStep; label: string; icon: string }[] = [
  { id: 'about', label: 'About You', icon: '👤' },
  { id: 'availability', label: 'Availability', icon: '📅' },
  { id: 'questions', label: 'Questions', icon: '❓' },
  { id: 'capture', label: 'Contact', icon: '📱' },
  { id: 'results', label: 'Results', icon: '📊' },
];

interface PackageInput {
  name: string;
  sessions_per_week: number;
  price_per_session: number | null;
  monthly_price: number | null;
  is_online: boolean;
}

interface AboutField {
  id: string;
  label: string;
  type: 'toggle' | 'custom';
  enabled: boolean;
  placeholder?: string;
}

interface FormConfig {
  about: {
    show_age: boolean;
    show_weight: boolean;
    show_experience: boolean;
    custom_fields: { id: string; label: string; placeholder: string }[];
  };
  availability: { max_days: number; default_days: number };
  questions: CustomQuestion[];
  capture: { show_phone: boolean; show_email: boolean; heading: string };
  results: { heading: string; show_specialties: boolean };
  packages: PackageInput[];
}

const DEFAULT_CONFIG: FormConfig = {
  about: { show_age: true, show_weight: true, show_experience: true, custom_fields: [] },
  availability: { max_days: 6, default_days: 3 },
  questions: [],
  capture: { show_phone: true, show_email: false, heading: '' },
  results: { heading: '', show_specialties: true },
  packages: [],
};

export default function FormFlowEditor({ trainer, goals }: FormFlowEditorProps) {
  const [forms, setForms] = useState<TrainerForm[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingGoalId, setEditingGoalId] = useState<string | null>(null);
  const [editingStep, setEditingStep] = useState<FormStep | null>(null);
  const [editFormId, setEditFormId] = useState<string | null>(null);
  const [config, setConfig] = useState<FormConfig>(DEFAULT_CONFIG);

  const activeGoals = goals.length > 0 ? goals : defaultGoals;

  useEffect(() => {
    const load = async () => {
      const supabase = createBrowserClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const res = await fetch('/api/forms', { headers: { Authorization: `Bearer ${session.access_token}` } });
      if (res.ok) { const data = await res.json(); setForms(data.forms || []); }
      setLoading(false);
    };
    load();
  }, []);

  const getFormForGoal = (goalId: string) => forms.find(f => f.goal_id === goalId);

  const startEditing = (goalId: string) => {
    const existing = getFormForGoal(goalId);
    setEditingGoalId(goalId);
    setEditFormId(existing?.id || null);
    setEditingStep('about');

    // Load existing config or defaults
    if (existing) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const ext = existing as any;
      setConfig({
        about: ext.about_config || DEFAULT_CONFIG.about,
        availability: ext.availability_config || DEFAULT_CONFIG.availability,
        questions: existing.questions || [],
        capture: ext.capture_config || DEFAULT_CONFIG.capture,
        results: ext.results_config || DEFAULT_CONFIG.results,
        packages: (existing.packages as PackageInput[]) || [],
      });
    } else {
      setConfig(DEFAULT_CONFIG);
    }
  };

  const saveForm = async () => {
    if (!editingGoalId) return;
    setSaving(true);
    const supabase = createBrowserClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const goal = activeGoals.find(g => g.id === editingGoalId);
    await fetch('/api/forms', {
      method: 'POST',
      headers: { Authorization: `Bearer ${session.access_token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        formId: editFormId,
        goalId: editingGoalId,
        name: goal?.label || editingGoalId,
        questions: config.questions.filter(q => q.question.trim()).length > 0 ? config.questions.filter(q => q.question.trim()) : null,
        packages: config.packages.filter(p => p.name.trim()).length > 0 ? config.packages.filter(p => p.name.trim()) : null,
        copy: config.results.heading ? { hero_subtext: config.results.heading } : null,
      }),
    });

    const res = await fetch('/api/forms', { headers: { Authorization: `Bearer ${session.access_token}` } });
    if (res.ok) { const data = await res.json(); setForms(data.forms || []); }
    setSaving(false);
    setEditingGoalId(null);
    setEditingStep(null);
  };

  const deleteForm = async (formId: string) => {
    if (!confirm('Remove custom form? This goal will use your default settings.')) return;
    const supabase = createBrowserClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    await fetch('/api/forms', {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${session.access_token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ formId }),
    });
    setForms(forms.filter(f => f.id !== formId));
  };

  const inputClass = "w-full bg-[#f5f5f7] border border-[#e5e5ea] rounded-xl px-3 py-2.5 text-[#1a1a1a] text-sm placeholder-[#8e8e93] focus:outline-none focus:border-[#8e8e93]";

  if (loading) return <p className="text-[#8e8e93] text-sm">Loading forms...</p>;

  if (trainer.tier !== 'pro') {
    return (
      <div className="text-center py-8">
        <p className="text-sm text-[#8e8e93] mb-2">Multiple forms is a Pro feature</p>
        <p className="text-xs text-[#8e8e93]">Upgrade to create separate forms per goal with custom steps</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-[#8e8e93] text-xs">
        Each goal can have its own form with custom steps. Goals without a custom form use your default settings.
      </p>

      {activeGoals.map((goal) => {
        const form = getFormForGoal(goal.id);
        const hasCustomForm = !!form;
        const isEditing = editingGoalId === goal.id;

        return (
          <div key={goal.id} className="rounded-xl border border-[#e5e5ea] overflow-hidden">
            {/* Goal header */}
            <div className="flex items-center justify-between p-4 bg-[#f5f5f7]">
              <div className="flex items-center gap-2">
                <span className="text-lg">{goal.emoji}</span>
                <div>
                  <p className="text-sm font-semibold">{goal.label}</p>
                  <p className="text-[9px]" style={{ color: hasCustomForm ? '#007AFF' : '#8e8e93' }}>
                    {hasCustomForm ? 'Custom form' : 'Using default settings'}
                  </p>
                </div>
              </div>
              <div className="flex gap-1.5">
                <button onClick={() => isEditing ? (setEditingGoalId(null), setEditingStep(null)) : startEditing(goal.id)}
                  className="text-[10px] font-medium px-2.5 py-1 rounded-lg bg-white text-[#007AFF]">
                  {isEditing ? 'Close' : hasCustomForm ? 'Edit' : 'Customise'}
                </button>
                {hasCustomForm && !isEditing && (
                  <button onClick={() => deleteForm(form!.id)}
                    className="text-[10px] font-medium px-2.5 py-1 rounded-lg bg-white text-[#FF3B30]">
                    Reset
                  </button>
                )}
              </div>
            </div>

            {/* Horizontal step flow (always visible) */}
            <div className="flex overflow-x-auto px-4 py-3 gap-2 bg-white">
              {STEPS.map((step, i) => {
                const isActive = isEditing && editingStep === step.id;
                const hasContent = step.id === 'questions' ? config.questions.length > 0
                  : step.id === 'results' ? config.packages.length > 0
                  : false;

                return (
                  <div key={step.id} className="flex items-center gap-1.5 flex-shrink-0">
                    <button
                      onClick={() => isEditing ? setEditingStep(step.id) : undefined}
                      className={`flex flex-col items-center px-3 py-2 rounded-xl text-center transition-all min-w-[70px] ${isEditing ? 'cursor-pointer' : 'cursor-default'}`}
                      style={{
                        backgroundColor: isActive ? '#007AFF12' : hasContent && hasCustomForm ? '#34C75910' : '#f5f5f7',
                        borderWidth: '1.5px',
                        borderColor: isActive ? '#007AFF' : hasContent && hasCustomForm ? '#34C759' : '#e5e5ea',
                      }}
                    >
                      <span className="text-sm">{step.icon}</span>
                      <span className="text-[9px] font-medium mt-0.5" style={{ color: isActive ? '#007AFF' : '#1a1a1a' }}>
                        {step.label}
                      </span>
                      {hasContent && hasCustomForm && (
                        <span className="text-[7px] text-[#34C759] font-semibold">custom</span>
                      )}
                    </button>
                    {i < STEPS.length - 1 && (
                      <svg className="w-3 h-3 text-[#e5e5ea] flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Step editor panel */}
            {isEditing && editingStep && (
              <div className="border-t border-[#e5e5ea] p-4 bg-white space-y-3">
                {/* About You */}
                {editingStep === 'about' && (
                  <div className="space-y-3">
                    <p className="text-xs font-semibold">About You fields</p>
                    <p className="text-[10px] text-[#8e8e93]">Toggle default fields or add your own</p>

                    {/* Default toggleable fields */}
                    {[
                      { key: 'show_age' as const, label: 'Age' },
                      { key: 'show_weight' as const, label: 'Weight (current & goal)' },
                      { key: 'show_experience' as const, label: 'Experience level' },
                    ].map((field) => (
                      <label key={field.key} className="flex items-center justify-between">
                        <span className="text-xs">{field.label}</span>
                        <button onClick={() => setConfig({ ...config, about: { ...config.about, [field.key]: !config.about[field.key] } })}
                          className="w-10 h-6 rounded-full p-0.5 transition-all duration-300"
                          style={{ backgroundColor: config.about[field.key] ? '#34C759' : '#e5e5ea' }}>
                          <div className="w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-300"
                            style={{ transform: config.about[field.key] ? 'translateX(16px)' : 'translateX(0)' }} />
                        </button>
                      </label>
                    ))}

                    {/* Custom fields */}
                    <div className="pt-2 border-t border-[#e5e5ea]">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-[10px] text-[#8e8e93] font-semibold">Custom fields</p>
                        <button onClick={() => setConfig({
                          ...config,
                          about: { ...config.about, custom_fields: [...config.about.custom_fields, { id: `cf-${Date.now()}`, label: '', placeholder: '' }] }
                        })}
                          className="text-[10px] text-[#007AFF] font-medium">+ Add field</button>
                      </div>
                      {config.about.custom_fields.map((cf, i) => (
                        <div key={cf.id} className="flex gap-2 mb-2">
                          <input value={cf.label}
                            onChange={(e) => {
                              const u = [...config.about.custom_fields];
                              u[i] = { ...u[i], label: e.target.value };
                              setConfig({ ...config, about: { ...config.about, custom_fields: u } });
                            }}
                            placeholder="Field label, e.g. Injuries" className={inputClass} />
                          <input value={cf.placeholder}
                            onChange={(e) => {
                              const u = [...config.about.custom_fields];
                              u[i] = { ...u[i], placeholder: e.target.value };
                              setConfig({ ...config, about: { ...config.about, custom_fields: u } });
                            }}
                            placeholder="Placeholder text" className={inputClass} />
                          <button onClick={() => setConfig({
                            ...config,
                            about: { ...config.about, custom_fields: config.about.custom_fields.filter((_, idx) => idx !== i) }
                          })}
                            className="text-[#FF3B30] text-[10px] px-1.5 flex-shrink-0">x</button>
                        </div>
                      ))}
                      {config.about.custom_fields.length === 0 && (
                        <p className="text-[9px] text-[#8e8e93]">Add fields like injuries, medical conditions, dietary preferences, etc.</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Availability */}
                {editingStep === 'availability' && (
                  <div className="space-y-3">
                    <p className="text-xs font-semibold">Availability settings</p>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] text-[#8e8e93] block mb-1">Max days shown</label>
                        <select value={config.availability.max_days}
                          onChange={(e) => setConfig({ ...config, availability: { ...config.availability, max_days: parseInt(e.target.value) } })}
                          className={inputClass}>
                          {[3, 4, 5, 6, 7].map(n => <option key={n} value={n}>{n} days</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] text-[#8e8e93] block mb-1">Default selection</label>
                        <select value={config.availability.default_days}
                          onChange={(e) => setConfig({ ...config, availability: { ...config.availability, default_days: parseInt(e.target.value) } })}
                          className={inputClass}>
                          {[1, 2, 3, 4, 5, 6].map(n => <option key={n} value={n}>{n} days</option>)}
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* Questions */}
                {editingStep === 'questions' && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-semibold">Custom questions</p>
                        <p className="text-[10px] text-[#8e8e93]">Specific to this goal. Empty = use your default questions.</p>
                      </div>
                      <button onClick={() => setConfig({ ...config, questions: [...config.questions, { id: `q-${Date.now()}`, question: '', type: 'select', options: ['', ''], placeholder: '' }] })}
                        className="text-[10px] text-[#007AFF] font-medium">+ Add</button>
                    </div>
                    {config.questions.map((q, i) => (
                      <div key={q.id} className="bg-[#f5f5f7] rounded-lg p-3 space-y-2">
                        <div className="flex gap-2">
                          <input value={q.question}
                            onChange={(e) => { const u = [...config.questions]; u[i] = { ...u[i], question: e.target.value }; setConfig({ ...config, questions: u }); }}
                            placeholder="e.g. Have you tried this before?" className={inputClass} />
                          <button onClick={() => setConfig({ ...config, questions: config.questions.filter((_, idx) => idx !== i) })}
                            className="text-[#FF3B30] text-[10px] px-2">x</button>
                        </div>
                        <div className="flex gap-1.5">
                          {(['text', 'select', 'multiselect'] as const).map(t => (
                            <button key={t} onClick={() => { const u = [...config.questions]; u[i] = { ...u[i], type: t }; setConfig({ ...config, questions: u }); }}
                              className="text-[9px] px-2 py-1 rounded-md"
                              style={{ backgroundColor: q.type === t ? '#1a1a1a' : '#e5e5ea', color: q.type === t ? '#fff' : '#8e8e93' }}>
                              {t === 'text' ? 'Text' : t === 'select' ? 'Single' : 'Multi'}
                            </button>
                          ))}
                        </div>
                        {(q.type === 'select' || q.type === 'multiselect') && (
                          <div className="space-y-1">
                            {q.options.map((opt, oi) => (
                              <div key={oi} className="flex gap-1.5">
                                <input value={opt}
                                  onChange={(e) => { const u = [...config.questions]; const opts = [...u[i].options]; opts[oi] = e.target.value; u[i] = { ...u[i], options: opts }; setConfig({ ...config, questions: u }); }}
                                  placeholder={`Option ${oi + 1}`} className={inputClass} />
                                {q.options.length > 2 && (
                                  <button onClick={() => { const u = [...config.questions]; u[i] = { ...u[i], options: u[i].options.filter((_, idx) => idx !== oi) }; setConfig({ ...config, questions: u }); }}
                                    className="text-[#FF3B30] text-[9px] px-1">x</button>
                                )}
                              </div>
                            ))}
                            <button onClick={() => { const u = [...config.questions]; u[i] = { ...u[i], options: [...u[i].options, ''] }; setConfig({ ...config, questions: u }); }}
                              className="text-[9px] text-[#007AFF]">+ Option</button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Contact/Capture */}
                {editingStep === 'capture' && (
                  <div className="space-y-3">
                    <p className="text-xs font-semibold">Contact step</p>
                    <p className="text-[10px] text-[#8e8e93]">Choose what info to collect. Name is always required.</p>

                    <div>
                      <label className="text-[10px] text-[#8e8e93] block mb-1">Custom heading (optional)</label>
                      <input value={config.capture.heading}
                        onChange={(e) => setConfig({ ...config, capture: { ...config.capture, heading: e.target.value } })}
                        placeholder="Almost there!" className={inputClass} />
                    </div>

                    <label className="flex items-center justify-between">
                      <div>
                        <span className="text-xs">Phone number</span>
                        <p className="text-[9px] text-[#8e8e93]">Required for WhatsApp CTA</p>
                      </div>
                      <button onClick={() => setConfig({ ...config, capture: { ...config.capture, show_phone: !config.capture.show_phone } })}
                        className="w-10 h-6 rounded-full p-0.5 transition-all duration-300"
                        style={{ backgroundColor: config.capture.show_phone ? '#34C759' : '#e5e5ea' }}>
                        <div className="w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-300"
                          style={{ transform: config.capture.show_phone ? 'translateX(16px)' : 'translateX(0)' }} />
                      </button>
                    </label>

                    <label className="flex items-center justify-between">
                      <div>
                        <span className="text-xs">Email address</span>
                        <p className="text-[9px] text-[#8e8e93]">Useful for follow-ups and newsletters</p>
                      </div>
                      <button onClick={() => setConfig({ ...config, capture: { ...config.capture, show_email: !config.capture.show_email } })}
                        className="w-10 h-6 rounded-full p-0.5 transition-all duration-300"
                        style={{ backgroundColor: config.capture.show_email ? '#34C759' : '#e5e5ea' }}>
                        <div className="w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-300"
                          style={{ transform: config.capture.show_email ? 'translateX(16px)' : 'translateX(0)' }} />
                      </button>
                    </label>

                    {!config.capture.show_phone && !config.capture.show_email && (
                      <p className="text-[10px] text-[#FF9500] bg-[#FF950010] rounded-lg px-3 py-2">
                        At least name will be collected. Consider enabling phone or email so you can contact the lead.
                      </p>
                    )}
                  </div>
                )}

                {/* Results */}
                {editingStep === 'results' && (
                  <div className="space-y-3">
                    <p className="text-xs font-semibold">Results page</p>
                    <div>
                      <label className="text-[10px] text-[#8e8e93] block mb-1">Custom results heading (optional)</label>
                      <input value={config.results.heading}
                        onChange={(e) => setConfig({ ...config, results: { ...config.results, heading: e.target.value } })}
                        placeholder="Your personalised timeline" className={inputClass} />
                    </div>

                    {/* Custom packages for this form */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <label className="text-[10px] text-[#8e8e93] font-semibold">Packages</label>
                          <p className="text-[9px] text-[#8e8e93]">Empty = use your default packages</p>
                        </div>
                        <button onClick={() => setConfig({ ...config, packages: [...config.packages, { name: '', sessions_per_week: 2, price_per_session: null, monthly_price: null, is_online: false }] })}
                          className="text-[10px] text-[#007AFF] font-medium">+ Add</button>
                      </div>
                      {config.packages.map((pkg, i) => (
                        <div key={i} className="flex gap-2 mb-2">
                          <input value={pkg.name}
                            onChange={(e) => { const u = [...config.packages]; u[i] = { ...u[i], name: e.target.value }; setConfig({ ...config, packages: u }); }}
                            placeholder="e.g. 3x Per Week" className={inputClass} />
                          <input type="number" value={pkg.sessions_per_week}
                            onChange={(e) => { const u = [...config.packages]; u[i] = { ...u[i], sessions_per_week: parseInt(e.target.value) || 0 }; setConfig({ ...config, packages: u }); }}
                            className="w-14 bg-[#f5f5f7] border border-[#e5e5ea] rounded-xl px-2 py-2.5 text-sm text-center focus:outline-none" placeholder="x/wk" />
                          <input type="number" value={pkg.monthly_price || ''}
                            onChange={(e) => { const u = [...config.packages]; u[i] = { ...u[i], monthly_price: e.target.value ? parseFloat(e.target.value) : null }; setConfig({ ...config, packages: u }); }}
                            className="w-20 bg-[#f5f5f7] border border-[#e5e5ea] rounded-xl px-2 py-2.5 text-sm text-center focus:outline-none" placeholder="£/mo" />
                          <button onClick={() => setConfig({ ...config, packages: config.packages.filter((_, idx) => idx !== i) })}
                            className="text-[#FF3B30] text-[10px] px-1.5">x</button>
                        </div>
                      ))}
                    </div>

                    <label className="flex items-center justify-between">
                      <span className="text-xs">Show specialties</span>
                      <button onClick={() => setConfig({ ...config, results: { ...config.results, show_specialties: !config.results.show_specialties } })}
                        className="w-10 h-6 rounded-full p-0.5 transition-all duration-300"
                        style={{ backgroundColor: config.results.show_specialties ? '#34C759' : '#e5e5ea' }}>
                        <div className="w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-300"
                          style={{ transform: config.results.show_specialties ? 'translateX(16px)' : 'translateX(0)' }} />
                      </button>
                    </label>
                  </div>
                )}

                {/* Save */}
                <div className="flex gap-2 pt-2">
                  <button onClick={saveForm} disabled={saving}
                    className="flex-1 py-2.5 rounded-xl bg-[#1a1a1a] text-white text-xs font-semibold disabled:opacity-40">
                    {saving ? 'Saving...' : editFormId ? 'Save changes' : 'Create custom form'}
                  </button>
                  <button onClick={() => { setEditingGoalId(null); setEditingStep(null); }}
                    className="px-4 py-2.5 rounded-xl bg-[#f5f5f7] text-[#8e8e93] text-xs">
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
