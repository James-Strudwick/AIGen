'use client';

import { useState, useEffect } from 'react';
import { createBrowserClient } from '@/lib/auth';
import {
  CustomGoal,
  TrainerForm,
  Trainer,
  CustomQuestion,
  TrainerSpecialty,
  TrainerCopy,
  NutritionService,
  OnlineService,
  HybridService,
  ServiceAddOn,
} from '@/types';
import {
  CopyPreview,
  SpecialtiesPreview,
  CustomQuestionsPreview,
  PackagesPreview,
} from '@/components/SettingsPreview';

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

type SubTab = 'copy' | 'questions' | 'specialties' | 'services' | 'packages';

const SUB_TABS: { id: SubTab; label: string; description: string }[] = [
  { id: 'copy', label: 'Copy', description: 'Hero headline, subtext & CTA' },
  { id: 'questions', label: 'Questions', description: 'Custom questions for this goal' },
  { id: 'specialties', label: 'Specialties', description: 'What you specialise in for this goal' },
  { id: 'services', label: 'Services', description: 'Nutrition, online, hybrid & add-ons' },
  { id: 'packages', label: 'Packages', description: 'Pricing tiers shown for this goal' },
];

interface PackageInput {
  name: string;
  sessions_per_week: string;
  price_per_session: string;
  monthly_price: string;
  is_online: boolean;
}

interface ServicesState {
  show_prices: boolean;
  nutrition: NutritionService;
  online: OnlineService;
  hybrid: HybridService;
  add_ons: ServiceAddOn[];
}

interface FormConfig {
  copy: TrainerCopy;
  questions: CustomQuestion[];
  specialties: TrainerSpecialty[];
  services: ServicesState;
  packages: PackageInput[];
}

const DEFAULT_NUTRITION: NutritionService = {
  enabled: false,
  name: 'Nutrition Plan',
  description: 'Personalised meal plans, macro targets, and weekly check-ins',
  timeline_reduction_percent: 20,
  price_per_month: null,
};

const DEFAULT_ONLINE: OnlineService = {
  enabled: false,
  name: 'Online Programming',
  description: 'Structured workout plans delivered remotely with form check videos',
  effectiveness_vs_inperson: 0.75,
  price_per_month: null,
};

const DEFAULT_HYBRID: HybridService = {
  enabled: false,
  name: 'Hybrid Coaching',
  description: 'Mix of in-person sessions and online programming',
  price_per_month: null,
};

function makeDefaultConfig(): FormConfig {
  return {
    copy: { hero_headline: '', hero_subtext: '', cta_button_text: '', tone: '' },
    questions: [],
    specialties: [],
    services: {
      show_prices: true,
      nutrition: { ...DEFAULT_NUTRITION },
      online: { ...DEFAULT_ONLINE },
      hybrid: { ...DEFAULT_HYBRID },
      add_ons: [],
    },
    packages: [],
  };
}

function pkgToInput(p: { name: string; sessions_per_week: number; price_per_session: number | null; monthly_price: number | null; is_online: boolean }): PackageInput {
  return {
    name: p.name,
    sessions_per_week: String(p.sessions_per_week),
    price_per_session: p.price_per_session != null ? String(p.price_per_session) : '',
    monthly_price: p.monthly_price != null ? String(p.monthly_price) : '',
    is_online: p.is_online,
  };
}

function inputToPkg(p: PackageInput) {
  return {
    name: p.name,
    sessions_per_week: parseInt(p.sessions_per_week) || 0,
    price_per_session: p.price_per_session ? parseFloat(p.price_per_session) : null,
    monthly_price: p.monthly_price ? parseFloat(p.monthly_price) : null,
    is_online: p.is_online,
  };
}

function configFromForm(form: TrainerForm | undefined): FormConfig {
  if (!form) return makeDefaultConfig();
  return {
    copy: {
      hero_headline: form.copy?.hero_headline || '',
      hero_subtext: form.copy?.hero_subtext || '',
      cta_button_text: form.copy?.cta_button_text || '',
      tone: form.copy?.tone || '',
    },
    questions: form.questions ? form.questions.map(q => ({ ...q, options: [...q.options] })) : [],
    specialties: form.specialties ? form.specialties.map(s => ({ ...s })) : [],
    services: {
      show_prices: form.services?.show_prices ?? true,
      nutrition: form.services?.nutrition ? { ...form.services.nutrition } : { ...DEFAULT_NUTRITION },
      online: form.services?.online ? { ...form.services.online } : { ...DEFAULT_ONLINE },
      hybrid: form.services?.hybrid ? { ...form.services.hybrid } : { ...DEFAULT_HYBRID },
      add_ons: form.services?.add_ons ? form.services.add_ons.map(a => ({ ...a })) : [],
    },
    packages: form.packages ? form.packages.map(pkgToInput) : [],
  };
}

export default function FormFlowEditor({ trainer, goals }: FormFlowEditorProps) {
  const [forms, setForms] = useState<TrainerForm[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingGoalId, setEditingGoalId] = useState<string | null>(null);
  const [activeSubTab, setActiveSubTab] = useState<SubTab>('copy');
  const [editFormId, setEditFormId] = useState<string | null>(null);
  const [config, setConfig] = useState<FormConfig>(() => makeDefaultConfig());

  const activeGoals = goals.length > 0 ? goals : defaultGoals;
  const brandTheme = trainer.branding?.theme === 'dark' ? 'dark' : 'light';
  const brandColor = trainer.branding?.color_primary || trainer.brand_color_primary || '#1a1a1a';

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
    setActiveSubTab('copy');
    setConfig(configFromForm(existing));
  };

  const closeEditor = () => {
    setEditingGoalId(null);
    setEditFormId(null);
  };

  const saveForm = async () => {
    if (!editingGoalId) return;
    setSaving(true);
    const supabase = createBrowserClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { setSaving(false); return; }

    const goal = activeGoals.find(g => g.id === editingGoalId);

    // Only include copy if at least one field is non-empty
    const anyCopy = config.copy.hero_headline || config.copy.hero_subtext || config.copy.cta_button_text || config.copy.tone;
    const copyPayload = anyCopy ? {
      hero_headline: config.copy.hero_headline || null,
      hero_subtext: config.copy.hero_subtext || null,
      cta_button_text: config.copy.cta_button_text || null,
      tone: config.copy.tone || null,
    } : null;

    const cleanQuestions = config.questions.filter(q => q.question.trim());
    const cleanSpecialties = config.specialties.filter(s => s.name.trim());
    const cleanPackages = config.packages.filter(p => p.name.trim()).map(inputToPkg);
    const cleanAddOns = config.services.add_ons.filter(a => a.name.trim());

    const anyService =
      config.services.nutrition.enabled ||
      config.services.online.enabled ||
      config.services.hybrid.enabled ||
      cleanAddOns.length > 0 ||
      config.services.show_prices === false;

    const servicesPayload = anyService ? {
      show_prices: config.services.show_prices,
      nutrition: config.services.nutrition.enabled ? config.services.nutrition : null,
      online: config.services.online.enabled ? config.services.online : null,
      hybrid: config.services.hybrid.enabled ? config.services.hybrid : null,
      add_ons: cleanAddOns,
    } : null;

    await fetch('/api/forms', {
      method: 'POST',
      headers: { Authorization: `Bearer ${session.access_token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        formId: editFormId,
        goalId: editingGoalId,
        name: goal?.label || editingGoalId,
        copy: copyPayload,
        questions: cleanQuestions.length > 0 ? cleanQuestions : null,
        specialties: cleanSpecialties.length > 0 ? cleanSpecialties : null,
        services: servicesPayload,
        packages: cleanPackages.length > 0 ? cleanPackages : null,
      }),
    });

    const res = await fetch('/api/forms', { headers: { Authorization: `Bearer ${session.access_token}` } });
    if (res.ok) { const data = await res.json(); setForms(data.forms || []); }
    setSaving(false);
    closeEditor();
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
    const benefits = [
      { icon: '🎯', title: 'Tailored questions per goal', body: 'Ask a fat-loss lead about their current diet. Ask a muscle-gain lead about their training split. Stop wasting questions on people they don\u2019t apply to.' },
      { icon: '📦', title: 'Different packages per goal', body: 'Push higher-intensity plans to performance clients, nutrition-heavy bundles to weight-loss clients. Match the offer to the intent.' },
      { icon: '💬', title: 'Custom copy & results', body: 'Speak directly to each goal with its own tone, promise and CTA. A generic results page converts way worse than one written for that exact prospect.' },
      { icon: '📊', title: 'Per-form analytics', body: 'See which goals actually convert to leads so you know where to focus your content and ads.' },
    ];
    return (
      <div className="space-y-4">
        <div className="rounded-2xl border border-[#e5e5ea] p-5">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-[#1a1a1a] text-white">Pro</span>
            <p className="text-sm font-semibold">A different form for every goal</p>
          </div>
          <p className="text-xs text-[#8e8e93] leading-relaxed">
            Right now every prospect walks through the same form, no matter what they want. Pro lets you build a completely separate form per goal — different questions, different packages, different results page. It converts way harder because each lead feels like you built it for them.
          </p>
        </div>

        <div className="space-y-3">
          {benefits.map((f) => (
            <div key={f.title} className="flex gap-3 rounded-xl bg-[#f5f5f7] p-4">
              <span className="text-lg flex-shrink-0">{f.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-[#1a1a1a] mb-0.5">{f.title}</p>
                <p className="text-[11px] text-[#8e8e93] leading-snug">{f.body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-[#8e8e93] text-xs">
        Each goal can have its own form — with its own copy, questions, specialties, services and packages. Goals without a custom form use your default settings.
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
                <button onClick={() => isEditing ? closeEditor() : startEditing(goal.id)}
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

            {/* Per-goal sub-tab editor */}
            {isEditing && (
              <div className="border-t border-[#e5e5ea] bg-white">
                {/* Sub-tab pills (mirror the main Form builder sub-tabs) */}
                <div className="flex gap-1.5 overflow-x-auto px-4 pt-4 pb-2">
                  {SUB_TABS.map((tab) => (
                    <button key={tab.id}
                      onClick={() => setActiveSubTab(tab.id)}
                      className="text-[11px] px-3 py-1.5 rounded-full whitespace-nowrap transition-all flex-shrink-0 font-medium"
                      style={{
                        backgroundColor: activeSubTab === tab.id ? '#1a1a1a' : '#f5f5f7',
                        color: activeSubTab === tab.id ? '#ffffff' : '#8e8e93',
                      }}>
                      {tab.label}
                    </button>
                  ))}
                </div>

                <div className="px-4 pb-4 pt-2">
                  <p className="text-[10px] text-[#8e8e93] mb-3">
                    {SUB_TABS.find(t => t.id === activeSubTab)?.description}
                  </p>

                  {/* Copy */}
                  {activeSubTab === 'copy' && (
                    <div className="space-y-3">
                      <div>
                        <label className="text-[#8e8e93] text-[10px] block mb-1">Hero headline</label>
                        <input value={config.copy.hero_headline}
                          onChange={(e) => setConfig({ ...config, copy: { ...config.copy, hero_headline: e.target.value } })}
                          placeholder={trainer.copy?.hero_headline || "Find out how long it'll take to reach your goal"}
                          className={inputClass} />
                      </div>
                      <div>
                        <label className="text-[#8e8e93] text-[10px] block mb-1">Hero subtext</label>
                        <input value={config.copy.hero_subtext}
                          onChange={(e) => setConfig({ ...config, copy: { ...config.copy, hero_subtext: e.target.value } })}
                          placeholder={trainer.copy?.hero_subtext || 'Free personalised timeline in 60 seconds'}
                          className={inputClass} />
                      </div>
                      <div>
                        <label className="text-[#8e8e93] text-[10px] block mb-1">CTA button text</label>
                        <input value={config.copy.cta_button_text}
                          onChange={(e) => setConfig({ ...config, copy: { ...config.copy, cta_button_text: e.target.value } })}
                          placeholder={trainer.copy?.cta_button_text || 'Get My Timeline'}
                          className={inputClass} />
                      </div>
                      <div>
                        <label className="text-[#8e8e93] text-[10px] block mb-1">Tone of voice</label>
                        <textarea value={config.copy.tone}
                          onChange={(e) => setConfig({ ...config, copy: { ...config.copy, tone: e.target.value } })}
                          placeholder={trainer.copy?.tone || 'e.g. Straight-talking but supportive.'}
                          rows={3}
                          className={inputClass} />
                        <p className="text-[#8e8e93] text-[9px] mt-1">The AI uses this tone when writing timelines for leads who pick this goal.</p>
                      </div>

                      <CopyPreview
                        theme={brandTheme}
                        primaryColor={brandColor}
                        headline={config.copy.hero_headline || trainer.copy?.hero_headline || ''}
                        subtext={config.copy.hero_subtext || trainer.copy?.hero_subtext || ''}
                        ctaText={config.copy.cta_button_text || trainer.copy?.cta_button_text || ''}
                        trainerName={trainer.name}
                        fontHeading={trainer.branding?.font_heading}
                        fontBody={trainer.branding?.font_body}
                      />
                    </div>
                  )}

                  {/* Questions */}
                  {activeSubTab === 'questions' && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <p className="text-[10px] text-[#8e8e93]">Empty = use your default questions.</p>
                        <button onClick={() => setConfig({
                          ...config,
                          questions: [...config.questions, { id: `q-${Date.now()}`, question: '', type: 'select', options: ['', ''], placeholder: '' }],
                        })}
                          className="text-[10px] text-[#007AFF] font-medium">+ Add</button>
                      </div>
                      {config.questions.map((q, i) => (
                        <div key={q.id} className="bg-[#f5f5f7] rounded-xl p-3 space-y-2">
                          <div className="flex gap-2">
                            <input value={q.question}
                              onChange={(e) => { const u = [...config.questions]; u[i] = { ...u[i], question: e.target.value }; setConfig({ ...config, questions: u }); }}
                              placeholder="e.g. Have you tried this before?" className={inputClass} />
                            <button onClick={() => setConfig({ ...config, questions: config.questions.filter((_, idx) => idx !== i) })}
                              className="text-[#FF3B30] text-[10px] px-2">Remove</button>
                          </div>
                          <div className="grid grid-cols-3 gap-1.5">
                            {(['text', 'select', 'multiselect'] as const).map((t) => (
                              <button key={t}
                                onClick={() => { const u = [...config.questions]; u[i] = { ...u[i], type: t }; setConfig({ ...config, questions: u }); }}
                                className="py-1.5 rounded-lg text-[10px] font-medium border"
                                style={{
                                  backgroundColor: q.type === t ? '#1a1a1a' : 'white',
                                  color: q.type === t ? '#ffffff' : '#8e8e93',
                                  borderColor: q.type === t ? '#1a1a1a' : '#e5e5ea',
                                }}>
                                {t === 'text' ? 'Text' : t === 'select' ? 'Single' : 'Multi'}
                              </button>
                            ))}
                          </div>
                          {q.type === 'text' && (
                            <input value={q.placeholder}
                              onChange={(e) => { const u = [...config.questions]; u[i] = { ...u[i], placeholder: e.target.value }; setConfig({ ...config, questions: u }); }}
                              placeholder="Placeholder text" className={inputClass} />
                          )}
                          {(q.type === 'select' || q.type === 'multiselect') && (
                            <div className="space-y-1">
                              {q.options.map((opt, oi) => (
                                <div key={oi} className="flex gap-1.5">
                                  <input value={opt}
                                    onChange={(e) => { const u = [...config.questions]; const opts = [...u[i].options]; opts[oi] = e.target.value; u[i] = { ...u[i], options: opts }; setConfig({ ...config, questions: u }); }}
                                    placeholder={`Option ${oi + 1}`} className={inputClass} />
                                  {q.options.length > 2 && (
                                    <button onClick={() => { const u = [...config.questions]; u[i] = { ...u[i], options: u[i].options.filter((_, idx) => idx !== oi) }; setConfig({ ...config, questions: u }); }}
                                      className="text-[#FF3B30] text-[9px] px-1.5">x</button>
                                  )}
                                </div>
                              ))}
                              <button onClick={() => { const u = [...config.questions]; u[i] = { ...u[i], options: [...u[i].options, ''] }; setConfig({ ...config, questions: u }); }}
                                className="text-[10px] text-[#007AFF] font-medium">+ Option</button>
                            </div>
                          )}
                        </div>
                      ))}

                      <CustomQuestionsPreview
                        theme={brandTheme}
                        primaryColor={brandColor}
                        questions={config.questions}
                      />
                    </div>
                  )}

                  {/* Specialties */}
                  {activeSubTab === 'specialties' && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <p className="text-[10px] text-[#8e8e93]">Shown on the results page. Empty = use your defaults.</p>
                        <button onClick={() => setConfig({ ...config, specialties: [...config.specialties, { name: '', description: '' }] })}
                          className="text-[10px] text-[#007AFF] font-medium">+ Add</button>
                      </div>
                      {config.specialties.map((s, i) => (
                        <div key={i} className="bg-[#f5f5f7] rounded-xl p-3 space-y-2">
                          <div className="flex gap-2">
                            <input value={s.name}
                              onChange={(e) => { const u = [...config.specialties]; u[i] = { ...u[i], name: e.target.value }; setConfig({ ...config, specialties: u }); }}
                              placeholder="e.g. Fat-loss transformation" className={inputClass} />
                            <button onClick={() => setConfig({ ...config, specialties: config.specialties.filter((_, idx) => idx !== i) })}
                              className="text-[#FF3B30] text-[10px] px-2">Remove</button>
                          </div>
                          <textarea value={s.description}
                            onChange={(e) => { const u = [...config.specialties]; u[i] = { ...u[i], description: e.target.value }; setConfig({ ...config, specialties: u }); }}
                            placeholder="Description..." rows={2} className={inputClass} />
                        </div>
                      ))}

                      <SpecialtiesPreview
                        theme={brandTheme}
                        primaryColor={brandColor}
                        specialties={config.specialties}
                      />
                    </div>
                  )}

                  {/* Services */}
                  {activeSubTab === 'services' && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between rounded-xl border border-[#e5e5ea] p-3">
                        <div>
                          <p className="font-medium text-xs">Show pricing</p>
                          <p className="text-[#8e8e93] text-[10px]">Display prices to prospects who pick this goal</p>
                        </div>
                        <button onClick={() => setConfig({ ...config, services: { ...config.services, show_prices: !config.services.show_prices } })}
                          className="w-10 h-6 rounded-full p-0.5 transition-all duration-300"
                          style={{ backgroundColor: config.services.show_prices ? '#34C759' : '#e5e5ea' }}>
                          <div className="w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-300"
                            style={{ transform: config.services.show_prices ? 'translateX(16px)' : 'translateX(0)' }} />
                        </button>
                      </div>

                      {/* Nutrition */}
                      <ServiceToggle
                        title="Nutrition support"
                        subtitle="Stacks on top of any training type"
                        enabled={config.services.nutrition.enabled}
                        onToggle={() => setConfig({ ...config, services: { ...config.services, nutrition: { ...config.services.nutrition, enabled: !config.services.nutrition.enabled } } })}
                      >
                        <input value={config.services.nutrition.name}
                          onChange={(e) => setConfig({ ...config, services: { ...config.services, nutrition: { ...config.services.nutrition, name: e.target.value } } })}
                          placeholder="e.g. Nutrition Plan" className={inputClass} />
                        <textarea value={config.services.nutrition.description}
                          onChange={(e) => setConfig({ ...config, services: { ...config.services, nutrition: { ...config.services.nutrition, description: e.target.value } } })}
                          rows={2} placeholder="What's included..." className={inputClass} />
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-[#8e8e93] text-[10px] block mb-0.5">Timeline boost</label>
                            <div className="flex items-center gap-2">
                              <input type="range" min={5} max={30} step={5} value={config.services.nutrition.timeline_reduction_percent}
                                onChange={(e) => setConfig({ ...config, services: { ...config.services, nutrition: { ...config.services.nutrition, timeline_reduction_percent: parseInt(e.target.value) } } })}
                                className="flex-1" />
                              <span className="text-xs font-semibold min-w-[3ch] text-right">{config.services.nutrition.timeline_reduction_percent}%</span>
                            </div>
                          </div>
                          <div>
                            <label className="text-[#8e8e93] text-[10px] block mb-0.5">£/month</label>
                            <input type="number" value={config.services.nutrition.price_per_month ?? ''}
                              onChange={(e) => setConfig({ ...config, services: { ...config.services, nutrition: { ...config.services.nutrition, price_per_month: e.target.value ? parseFloat(e.target.value) : null } } })}
                              placeholder="Optional" className={inputClass} />
                          </div>
                        </div>
                      </ServiceToggle>

                      {/* Online */}
                      <ServiceToggle
                        title="Online programming"
                        subtitle="Alternative to in-person"
                        enabled={config.services.online.enabled}
                        onToggle={() => setConfig({ ...config, services: { ...config.services, online: { ...config.services.online, enabled: !config.services.online.enabled } } })}
                      >
                        <input value={config.services.online.name}
                          onChange={(e) => setConfig({ ...config, services: { ...config.services, online: { ...config.services.online, name: e.target.value } } })}
                          placeholder="e.g. Online Programming" className={inputClass} />
                        <textarea value={config.services.online.description}
                          onChange={(e) => setConfig({ ...config, services: { ...config.services, online: { ...config.services.online, description: e.target.value } } })}
                          rows={2} placeholder="What's included..." className={inputClass} />
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-[#8e8e93] text-[10px] block mb-0.5">Effectiveness vs in-person</label>
                            <div className="flex items-center gap-2">
                              <input type="range" min={50} max={95} step={5} value={Math.round(config.services.online.effectiveness_vs_inperson * 100)}
                                onChange={(e) => setConfig({ ...config, services: { ...config.services, online: { ...config.services.online, effectiveness_vs_inperson: parseInt(e.target.value) / 100 } } })}
                                className="flex-1" />
                              <span className="text-xs font-semibold min-w-[3ch] text-right">{Math.round(config.services.online.effectiveness_vs_inperson * 100)}%</span>
                            </div>
                          </div>
                          <div>
                            <label className="text-[#8e8e93] text-[10px] block mb-0.5">£/month</label>
                            <input type="number" value={config.services.online.price_per_month ?? ''}
                              onChange={(e) => setConfig({ ...config, services: { ...config.services, online: { ...config.services.online, price_per_month: e.target.value ? parseFloat(e.target.value) : null } } })}
                              placeholder="Optional" className={inputClass} />
                          </div>
                        </div>
                      </ServiceToggle>

                      {/* Hybrid */}
                      <ServiceToggle
                        title="Hybrid coaching"
                        subtitle="Mix of in-person + online"
                        enabled={config.services.hybrid.enabled}
                        onToggle={() => setConfig({ ...config, services: { ...config.services, hybrid: { ...config.services.hybrid, enabled: !config.services.hybrid.enabled } } })}
                      >
                        <input value={config.services.hybrid.name}
                          onChange={(e) => setConfig({ ...config, services: { ...config.services, hybrid: { ...config.services.hybrid, name: e.target.value } } })}
                          placeholder="e.g. Hybrid Coaching" className={inputClass} />
                        <textarea value={config.services.hybrid.description}
                          onChange={(e) => setConfig({ ...config, services: { ...config.services, hybrid: { ...config.services.hybrid, description: e.target.value } } })}
                          rows={2} placeholder="What's included..." className={inputClass} />
                        <div>
                          <label className="text-[#8e8e93] text-[10px] block mb-0.5">£/month</label>
                          <input type="number" value={config.services.hybrid.price_per_month ?? ''}
                            onChange={(e) => setConfig({ ...config, services: { ...config.services, hybrid: { ...config.services.hybrid, price_per_month: e.target.value ? parseFloat(e.target.value) : null } } })}
                            placeholder="Optional" className={inputClass} />
                        </div>
                      </ServiceToggle>
                    </div>
                  )}

                  {/* Packages */}
                  {activeSubTab === 'packages' && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <p className="text-[10px] text-[#8e8e93]">Empty = use your default packages.</p>
                        <button onClick={() => setConfig({
                          ...config,
                          packages: [...config.packages, { name: '', sessions_per_week: '3', price_per_session: '', monthly_price: '', is_online: false }],
                        })}
                          className="text-[10px] text-[#007AFF] font-medium">+ Add</button>
                      </div>
                      {config.packages.map((pkg, i) => (
                        <div key={i} className="bg-[#f5f5f7] rounded-xl p-3 space-y-2">
                          <div className="flex gap-2">
                            <input value={pkg.name}
                              onChange={(e) => { const u = [...config.packages]; u[i] = { ...u[i], name: e.target.value }; setConfig({ ...config, packages: u }); }}
                              placeholder="e.g. 2x Per Week" className={inputClass} />
                            <button onClick={() => setConfig({ ...config, packages: config.packages.filter((_, idx) => idx !== i) })}
                              className="text-[#FF3B30] text-[10px] px-2">Remove</button>
                          </div>
                          <div className="grid grid-cols-3 gap-2">
                            <div>
                              <label className="text-[#8e8e93] text-[9px] block mb-0.5">Sessions/wk</label>
                              <input type="number" value={pkg.sessions_per_week}
                                onChange={(e) => { const u = [...config.packages]; u[i] = { ...u[i], sessions_per_week: e.target.value }; setConfig({ ...config, packages: u }); }}
                                className={inputClass} />
                            </div>
                            <div>
                              <label className="text-[#8e8e93] text-[9px] block mb-0.5">£/session</label>
                              <input type="number" value={pkg.price_per_session}
                                onChange={(e) => { const u = [...config.packages]; u[i] = { ...u[i], price_per_session: e.target.value }; setConfig({ ...config, packages: u }); }}
                                className={inputClass} />
                            </div>
                            <div>
                              <label className="text-[#8e8e93] text-[9px] block mb-0.5">£/month</label>
                              <input type="number" value={pkg.monthly_price}
                                onChange={(e) => { const u = [...config.packages]; u[i] = { ...u[i], monthly_price: e.target.value }; setConfig({ ...config, packages: u }); }}
                                className={inputClass} />
                            </div>
                          </div>
                          <label className="flex items-center gap-2 text-[10px] text-[#8e8e93]">
                            <input type="checkbox" checked={pkg.is_online}
                              onChange={(e) => { const u = [...config.packages]; u[i] = { ...u[i], is_online: e.target.checked }; setConfig({ ...config, packages: u }); }} />
                            Online package
                          </label>
                        </div>
                      ))}

                      <PackagesPreview
                        theme={brandTheme}
                        primaryColor={brandColor}
                        packages={config.packages}
                        showPrices={config.services.show_prices}
                      />
                    </div>
                  )}

                  {/* Save */}
                  <div className="flex gap-2 pt-4 mt-4 border-t border-[#e5e5ea]">
                    <button onClick={saveForm} disabled={saving}
                      className="flex-1 py-2.5 rounded-xl bg-[#1a1a1a] text-white text-xs font-semibold disabled:opacity-40">
                      {saving ? 'Saving...' : editFormId ? 'Save changes' : 'Create custom form'}
                    </button>
                    <button onClick={closeEditor}
                      className="px-4 py-2.5 rounded-xl bg-[#f5f5f7] text-[#8e8e93] text-xs">
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function ServiceToggle({ title, subtitle, enabled, onToggle, children }: {
  title: string;
  subtitle: string;
  enabled: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-[#e5e5ea] p-3 space-y-2">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-medium text-xs">{title}</p>
          <p className="text-[#8e8e93] text-[10px] mt-0.5">{subtitle}</p>
        </div>
        <button onClick={onToggle}
          className="w-10 h-6 rounded-full p-0.5 transition-all duration-300 flex-shrink-0"
          style={{ backgroundColor: enabled ? '#34C759' : '#e5e5ea' }}>
          <div className="w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-300"
            style={{ transform: enabled ? 'translateX(16px)' : 'translateX(0)' }} />
        </button>
      </div>
      {enabled && (
        <div className="space-y-2 pt-2 border-t border-[#e5e5ea]">
          {children}
        </div>
      )}
    </div>
  );
}
