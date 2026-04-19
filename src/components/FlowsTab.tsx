'use client';

import { useState, useEffect } from 'react';
import { createBrowserClient } from '@/lib/auth';
import { Trainer, CustomGoal, CustomQuestion, TrainerSpecialty, Flow } from '@/types';
import FormFlowEditor from './FormFlowEditor';

interface FlowsTabProps {
  trainer: Trainer;
  goals: CustomGoal[];
  onEditGoals?: () => void;
}

type FlowSubTab = 'copy' | 'goals' | 'questions' | 'specialties' | 'services' | 'packages';

const FLOW_SUB_TABS: { id: FlowSubTab; label: string }[] = [
  { id: 'copy', label: 'Copy' },
  { id: 'goals', label: 'Goals' },
  { id: 'questions', label: 'Questions' },
  { id: 'specialties', label: 'Specialties' },
  { id: 'services', label: 'Services' },
  { id: 'packages', label: 'Packages' },
];

interface FlowFormState {
  name: string;
  slug: string;
  heroHeadline: string;
  heroSubtext: string;
  ctaButtonText: string;
  tone: string;
  goals: CustomGoal[];
  questions: CustomQuestion[];
  specialties: TrainerSpecialty[];
  showPrices: boolean;
}

function makeEmptyFlowState(): FlowFormState {
  return {
    name: '',
    slug: '',
    heroHeadline: '',
    heroSubtext: '',
    ctaButtonText: '',
    tone: '',
    goals: [],
    questions: [],
    specialties: [],
    showPrices: true,
  };
}

function flowToState(flow: Flow): FlowFormState {
  return {
    name: flow.name,
    slug: flow.slug,
    heroHeadline: flow.copy?.hero_headline || '',
    heroSubtext: flow.copy?.hero_subtext || '',
    ctaButtonText: flow.copy?.cta_button_text || '',
    tone: flow.copy?.tone || '',
    goals: flow.goals ? flow.goals.map(g => ({ ...g })) : [],
    questions: flow.questions ? flow.questions.map(q => ({ ...q, options: [...q.options] })) : [],
    specialties: flow.specialties ? flow.specialties.map(s => ({ ...s })) : [],
    showPrices: flow.services?.show_prices ?? true,
  };
}

export default function FlowsTab({ trainer, goals, onEditGoals }: FlowsTabProps) {
  const [flows, setFlows] = useState<Flow[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingFlowId, setEditingFlowId] = useState<string | null>(null);
  const [editingSubTab, setEditingSubTab] = useState<FlowSubTab>('copy');
  const [flowState, setFlowState] = useState<FlowFormState>(makeEmptyFlowState());
  const [isCreating, setIsCreating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showDefaultEditor, setShowDefaultEditor] = useState(false);

  const isPro = trainer.tier === 'pro';

  useEffect(() => {
    const load = async () => {
      const supabase = createBrowserClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const res = await fetch('/api/flows', { headers: { Authorization: `Bearer ${session.access_token}` } });
      if (res.ok) { const data = await res.json(); setFlows(data.flows || []); }
      setLoading(false);
    };
    load();
  }, []);

  const startCreate = () => {
    setIsCreating(true);
    setEditingFlowId(null);
    setFlowState(makeEmptyFlowState());
    setEditingSubTab('copy');
  };

  const startEdit = (flow: Flow) => {
    setIsCreating(false);
    setEditingFlowId(flow.id);
    setFlowState(flowToState(flow));
    setEditingSubTab('copy');
  };

  const cancelEdit = () => {
    setEditingFlowId(null);
    setIsCreating(false);
  };

  const saveFlow = async () => {
    if (!flowState.name.trim() || !flowState.slug.trim()) return;
    setSaving(true);
    const supabase = createBrowserClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const copyObj = (flowState.heroHeadline || flowState.heroSubtext || flowState.ctaButtonText || flowState.tone) ? {
      hero_headline: flowState.heroHeadline || null,
      hero_subtext: flowState.heroSubtext || null,
      cta_button_text: flowState.ctaButtonText || null,
      tone: flowState.tone || null,
    } : null;

    const body = {
      flowId: editingFlowId,
      slug: flowState.slug,
      name: flowState.name,
      copy: copyObj,
      goals: flowState.goals.filter(g => g.label.trim()).length > 0 ? flowState.goals.filter(g => g.label.trim()) : null,
      questions: flowState.questions.filter(q => q.question.trim()).length > 0 ? flowState.questions.filter(q => q.question.trim()) : null,
      specialties: flowState.specialties.filter(s => s.name.trim()).length > 0 ? flowState.specialties.filter(s => s.name.trim()) : null,
      services: flowState.showPrices !== true ? { show_prices: flowState.showPrices } : null,
    };

    const res = await fetch('/api/flows', {
      method: 'POST',
      headers: { Authorization: `Bearer ${session.access_token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      const listRes = await fetch('/api/flows', { headers: { Authorization: `Bearer ${session.access_token}` } });
      if (listRes.ok) { const data = await listRes.json(); setFlows(data.flows || []); }
      cancelEdit();
    }
    setSaving(false);
  };

  const deleteFlow = async (flowId: string) => {
    if (!confirm('Delete this flow? The URL will stop working.')) return;
    const supabase = createBrowserClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    await fetch('/api/flows', {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${session.access_token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ flowId }),
    });
    setFlows(flows.filter(f => f.id !== flowId));
  };

  const autoSlug = (name: string) =>
    name.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').trim();

  const inputClass = "w-full bg-[#f5f5f7] border border-[#e5e5ea] rounded-xl px-3 py-2.5 text-[#1a1a1a] text-sm placeholder-[#8e8e93] focus:outline-none focus:border-[#8e8e93]";

  if (loading) return <p className="text-[#8e8e93] text-sm">Loading flows...</p>;

  // Editing/creating a flow
  if (editingFlowId || isCreating) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold">{isCreating ? 'Create flow' : `Edit: ${flowState.name}`}</h3>
          <button onClick={cancelEdit} className="text-xs text-[#8e8e93]">Cancel</button>
        </div>

        {/* Name + slug */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[#8e8e93] text-[10px] block mb-1">Flow name</label>
            <input value={flowState.name}
              onChange={(e) => {
                const name = e.target.value;
                setFlowState(s => ({ ...s, name, slug: isCreating && !s.slug ? autoSlug(name) : s.slug }));
              }}
              placeholder="e.g. Weight Loss Intake" className={inputClass} />
          </div>
          <div>
            <label className="text-[#8e8e93] text-[10px] block mb-1">URL slug</label>
            <input value={flowState.slug}
              onChange={(e) => setFlowState(s => ({ ...s, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') }))}
              placeholder="e.g. weight-loss" className={inputClass} />
            <p className="text-[9px] text-[#8e8e93] mt-0.5">
              fomoforms.com/{trainer.slug}/{flowState.slug || '...'}
            </p>
          </div>
        </div>

        {/* Sub-tab pills */}
        <div className="flex gap-1.5 overflow-x-auto pb-1">
          {FLOW_SUB_TABS.map((tab) => (
            <button key={tab.id} onClick={() => setEditingSubTab(tab.id)}
              className="text-[11px] font-medium px-3 py-1.5 rounded-full whitespace-nowrap transition-all"
              style={{
                backgroundColor: editingSubTab === tab.id ? '#1a1a1a' : '#f5f5f7',
                color: editingSubTab === tab.id ? '#fff' : '#8e8e93',
              }}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Sub-tab content */}
        <div className="space-y-3">
          {editingSubTab === 'copy' && (
            <>
              <p className="text-[10px] text-[#8e8e93]">Leave blank to use your default copy.</p>
              <div>
                <label className="text-[#8e8e93] text-[10px] block mb-1">Hero headline</label>
                <input value={flowState.heroHeadline}
                  onChange={(e) => setFlowState(s => ({ ...s, heroHeadline: e.target.value }))}
                  placeholder={trainer.copy?.hero_headline || "Find out how long it'll take..."} className={inputClass} />
              </div>
              <div>
                <label className="text-[#8e8e93] text-[10px] block mb-1">Hero subtext</label>
                <input value={flowState.heroSubtext}
                  onChange={(e) => setFlowState(s => ({ ...s, heroSubtext: e.target.value }))}
                  placeholder={trainer.copy?.hero_subtext || 'Free personalised timeline...'} className={inputClass} />
              </div>
              <div>
                <label className="text-[#8e8e93] text-[10px] block mb-1">CTA button text</label>
                <input value={flowState.ctaButtonText}
                  onChange={(e) => setFlowState(s => ({ ...s, ctaButtonText: e.target.value }))}
                  placeholder={trainer.copy?.cta_button_text || 'Get My Timeline'} className={inputClass} />
              </div>
              <div>
                <label className="text-[#8e8e93] text-[10px] block mb-1">Tone of voice</label>
                <textarea value={flowState.tone}
                  onChange={(e) => setFlowState(s => ({ ...s, tone: e.target.value }))}
                  placeholder={trainer.copy?.tone || 'e.g. Straight-talking but supportive.'} rows={2} className={inputClass} />
              </div>
            </>
          )}

          {editingSubTab === 'goals' && (
            <>
              <div className="flex items-center justify-between">
                <p className="text-[10px] text-[#8e8e93]">Leave empty to use your default goals.</p>
                <button onClick={() => setFlowState(s => ({
                  ...s, goals: [...s.goals, { id: `g-${Date.now()}`, emoji: '🎯', label: '', subtitle: '', needs_target: false, target_prompt: '', target_placeholder: '', goal_type: 'fitness' as const }],
                }))} className="text-[10px] text-[#007AFF] font-medium">+ Add</button>
              </div>
              {flowState.goals.map((g, i) => (
                <div key={g.id} className="bg-[#f5f5f7] rounded-xl p-3 space-y-2">
                  <div className="flex gap-2">
                    <input value={g.emoji} onChange={(e) => { const u = [...flowState.goals]; u[i] = { ...u[i], emoji: e.target.value }; setFlowState(s => ({ ...s, goals: u })); }}
                      placeholder="🎯" className="w-12 bg-[#f5f5f7] border border-[#e5e5ea] rounded-xl px-2 py-2.5 text-center text-lg focus:outline-none" />
                    <input value={g.label} onChange={(e) => { const u = [...flowState.goals]; u[i] = { ...u[i], label: e.target.value }; setFlowState(s => ({ ...s, goals: u })); }}
                      placeholder="e.g. Run a 5K" className={inputClass} />
                    <button onClick={() => setFlowState(s => ({ ...s, goals: s.goals.filter((_, idx) => idx !== i) }))}
                      className="text-[#FF3B30] text-[10px] px-2">Remove</button>
                  </div>
                  <input value={g.subtitle} onChange={(e) => { const u = [...flowState.goals]; u[i] = { ...u[i], subtitle: e.target.value }; setFlowState(s => ({ ...s, goals: u })); }}
                    placeholder="Short description" className={inputClass} />
                </div>
              ))}
            </>
          )}

          {editingSubTab === 'questions' && (
            <>
              <div className="flex items-center justify-between">
                <p className="text-[10px] text-[#8e8e93]">Leave empty to use your default questions.</p>
                <button onClick={() => setFlowState(s => ({
                  ...s, questions: [...s.questions, { id: `q-${Date.now()}`, question: '', type: 'select', options: ['', ''], placeholder: '' }],
                }))} className="text-[10px] text-[#007AFF] font-medium">+ Add</button>
              </div>
              {flowState.questions.map((q, i) => (
                <div key={q.id} className="bg-[#f5f5f7] rounded-xl p-3 space-y-2">
                  <div className="flex gap-2">
                    <input value={q.question} onChange={(e) => { const u = [...flowState.questions]; u[i] = { ...u[i], question: e.target.value }; setFlowState(s => ({ ...s, questions: u })); }}
                      placeholder="e.g. What's held you back?" className={inputClass} />
                    <button onClick={() => setFlowState(s => ({ ...s, questions: s.questions.filter((_, idx) => idx !== i) }))}
                      className="text-[#FF3B30] text-[10px] px-2">Remove</button>
                  </div>
                  <div className="flex gap-1.5">
                    {(['text', 'select', 'multiselect'] as const).map(t => (
                      <button key={t} onClick={() => { const u = [...flowState.questions]; u[i] = { ...u[i], type: t }; setFlowState(s => ({ ...s, questions: u })); }}
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
                          <input value={opt} onChange={(e) => { const u = [...flowState.questions]; const opts = [...u[i].options]; opts[oi] = e.target.value; u[i] = { ...u[i], options: opts }; setFlowState(s => ({ ...s, questions: u })); }}
                            placeholder={`Option ${oi + 1}`} className={inputClass} />
                          {q.options.length > 2 && (
                            <button onClick={() => { const u = [...flowState.questions]; u[i] = { ...u[i], options: u[i].options.filter((_, idx) => idx !== oi) }; setFlowState(s => ({ ...s, questions: u })); }}
                              className="text-[#FF3B30] text-[9px] px-1">x</button>
                          )}
                        </div>
                      ))}
                      <button onClick={() => { const u = [...flowState.questions]; u[i] = { ...u[i], options: [...u[i].options, ''] }; setFlowState(s => ({ ...s, questions: u })); }}
                        className="text-[9px] text-[#007AFF]">+ Option</button>
                    </div>
                  )}
                </div>
              ))}
            </>
          )}

          {editingSubTab === 'specialties' && (
            <>
              <div className="flex items-center justify-between">
                <p className="text-[10px] text-[#8e8e93]">Leave empty to use your default specialties.</p>
                <button onClick={() => setFlowState(s => ({ ...s, specialties: [...s.specialties, { name: '', description: '' }] }))}
                  className="text-[10px] text-[#007AFF] font-medium">+ Add</button>
              </div>
              {flowState.specialties.map((sp, i) => (
                <div key={i} className="bg-[#f5f5f7] rounded-xl p-3 space-y-2">
                  <div className="flex gap-2">
                    <input value={sp.name} onChange={(e) => { const u = [...flowState.specialties]; u[i] = { ...u[i], name: e.target.value }; setFlowState(s => ({ ...s, specialties: u })); }}
                      placeholder="e.g. Body Transformation" className={inputClass} />
                    <button onClick={() => setFlowState(s => ({ ...s, specialties: s.specialties.filter((_, idx) => idx !== i) }))}
                      className="text-[#FF3B30] text-[10px] px-2">Remove</button>
                  </div>
                  <textarea value={sp.description} onChange={(e) => { const u = [...flowState.specialties]; u[i] = { ...u[i], description: e.target.value }; setFlowState(s => ({ ...s, specialties: u })); }}
                    placeholder="Description..." rows={2} className={inputClass} />
                </div>
              ))}
            </>
          )}

          {editingSubTab === 'services' && (
            <p className="text-[10px] text-[#8e8e93] py-4 text-center">Services inherit from your main settings. To customise services per flow, configure them in your main Services tab.</p>
          )}

          {editingSubTab === 'packages' && (
            <p className="text-[10px] text-[#8e8e93] py-4 text-center">Packages inherit from your main settings. To customise packages per flow, configure them in your main Packages tab.</p>
          )}
        </div>

        {/* Save */}
        <div className="flex gap-2 pt-2">
          <button onClick={saveFlow} disabled={saving || !flowState.name.trim() || !flowState.slug.trim()}
            className="flex-1 py-2.5 rounded-xl bg-[#1a1a1a] text-white text-xs font-semibold disabled:opacity-40">
            {saving ? 'Saving...' : isCreating ? 'Create flow' : 'Save changes'}
          </button>
          <button onClick={cancelEdit} className="px-4 py-2.5 rounded-xl bg-[#f5f5f7] text-[#8e8e93] text-xs">Cancel</button>
        </div>
      </div>
    );
  }

  // Default flow editor (per-goal overrides)
  if (showDefaultEditor) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold">Default flow — per-goal customisation</h3>
          <button onClick={() => setShowDefaultEditor(false)} className="text-xs text-[#8e8e93]">Back to flows</button>
        </div>
        <FormFlowEditor trainer={trainer} goals={goals} onEditGoals={onEditGoals} />
      </div>
    );
  }

  // Flow list
  return (
    <div className="space-y-4">
      <p className="text-[#8e8e93] text-xs">
        Each flow is a standalone intake form with its own URL, goals, questions, and specialties. Your default flow uses your main settings.
      </p>

      {/* Default flow card */}
      <div className="rounded-xl border border-[#e5e5ea] overflow-hidden">
        <div className="flex items-center justify-between p-4 bg-[#f5f5f7]">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <p className="text-sm font-semibold">Default flow</p>
              <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-[#1a1a1a] text-white">Main</span>
            </div>
            <p className="text-[10px] text-[#8e8e93] font-mono">fomoforms.com/{trainer.slug}</p>
          </div>
          <div className="flex gap-1.5">
            {isPro && (
              <button onClick={() => setShowDefaultEditor(true)}
                className="text-[10px] font-medium px-2.5 py-1 rounded-lg bg-white text-[#007AFF]">
                Per-goal forms
              </button>
            )}
            <button onClick={() => navigator.clipboard.writeText(`https://fomoforms.com/${trainer.slug}`)}
              className="text-[10px] font-medium px-2.5 py-1 rounded-lg bg-white text-[#8e8e93]">
              Copy URL
            </button>
          </div>
        </div>
      </div>

      {/* Additional flows */}
      {flows.map((flow) => (
        <div key={flow.id} className="rounded-xl border border-[#e5e5ea] overflow-hidden">
          <div className="flex items-center justify-between p-4 bg-white">
            <div>
              <p className="text-sm font-semibold">{flow.name}</p>
              <p className="text-[10px] text-[#8e8e93] font-mono">fomoforms.com/{trainer.slug}/{flow.slug}</p>
              <p className="text-[9px] text-[#8e8e93] mt-0.5">
                {flow.goals ? `${(flow.goals as CustomGoal[]).length} goals` : 'Default goals'}
                {' · '}
                {flow.questions ? `${(flow.questions as CustomQuestion[]).length} questions` : 'Default questions'}
              </p>
            </div>
            <div className="flex gap-1.5">
              <button onClick={() => startEdit(flow)}
                className="text-[10px] font-medium px-2.5 py-1 rounded-lg bg-[#f5f5f7] text-[#007AFF]">
                Edit
              </button>
              <button onClick={() => navigator.clipboard.writeText(`https://fomoforms.com/${trainer.slug}/${flow.slug}`)}
                className="text-[10px] font-medium px-2.5 py-1 rounded-lg bg-[#f5f5f7] text-[#8e8e93]">
                Copy URL
              </button>
              <button onClick={() => deleteFlow(flow.id)}
                className="text-[10px] font-medium px-2.5 py-1 rounded-lg bg-[#f5f5f7] text-[#FF3B30]">
                Delete
              </button>
            </div>
          </div>
        </div>
      ))}

      {/* Create button */}
      {isPro ? (
        <button onClick={startCreate}
          className="w-full py-4 rounded-xl border border-dashed border-[#e5e5ea] text-[#8e8e93] text-sm hover:border-[#8e8e93] transition-colors">
          + Create new flow
        </button>
      ) : (
        <div className="rounded-xl bg-[#f5f5f7] p-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-[#1a1a1a] text-white">Pro</span>
            <p className="text-xs font-medium">Multiple flows</p>
          </div>
          <p className="text-[11px] text-[#8e8e93] mb-3">Create separate intake forms with different URLs, goals, and questions for each service you offer.</p>
          <a href="/settings?tab=billing" className="inline-block text-[11px] font-semibold px-3 py-2 rounded-lg bg-[#1a1a1a] text-white">
            Upgrade to Pro
          </a>
        </div>
      )}
    </div>
  );
}
