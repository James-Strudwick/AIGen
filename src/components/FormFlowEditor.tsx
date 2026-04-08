'use client';

import { useState, useEffect } from 'react';
import { createBrowserClient } from '@/lib/auth';
import { CustomGoal, TrainerForm, Trainer, CustomQuestion, ServiceAddOn } from '@/types';

interface FormFlowEditorProps {
  trainer: Trainer;
  goals: CustomGoal[];
}

const defaultGoals: CustomGoal[] = [
  { id: 'weight_loss', emoji: '🔥', label: 'Lose Weight', subtitle: 'Burn fat & get lean', needs_target: false, target_prompt: '', target_placeholder: '', goal_type: 'weight_loss' },
  { id: 'muscle_gain', emoji: '💪', label: 'Build Muscle', subtitle: 'Get stronger & bigger', needs_target: false, target_prompt: '', target_placeholder: '', goal_type: 'muscle_gain' },
  { id: 'fitness', emoji: '❤️', label: 'Improve Fitness', subtitle: 'Feel healthier & fitter', needs_target: true, target_prompt: '', target_placeholder: '', goal_type: 'fitness' },
  { id: 'performance', emoji: '🏃', label: 'Performance', subtitle: 'Hit a specific target', needs_target: true, target_prompt: '', target_placeholder: '', goal_type: 'performance' },
];

interface PackageInput {
  name: string;
  sessions_per_week: number;
  price_per_session: number | null;
  monthly_price: number | null;
  is_online: boolean;
}

export default function FormFlowEditor({ trainer, goals }: FormFlowEditorProps) {
  const [forms, setForms] = useState<TrainerForm[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingGoalId, setEditingGoalId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Edit state
  const [editQuestions, setEditQuestions] = useState<CustomQuestion[]>([]);
  const [editPackages, setEditPackages] = useState<PackageInput[]>([]);
  const [editFormId, setEditFormId] = useState<string | null>(null);

  const activeGoals = (goals.length > 0 ? goals : defaultGoals);

  useEffect(() => {
    const load = async () => {
      const supabase = createBrowserClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const res = await fetch('/api/forms', {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setForms(data.forms || []);
      }
      setLoading(false);
    };
    load();
  }, []);

  const getFormForGoal = (goalId: string) => forms.find(f => f.goal_id === goalId);

  const startEditing = (goalId: string) => {
    const existing = getFormForGoal(goalId);
    setEditingGoalId(goalId);
    setEditFormId(existing?.id || null);
    setEditQuestions(existing?.questions || []);
    setEditPackages((existing?.packages as PackageInput[]) || []);
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
        questions: editQuestions.filter(q => q.question.trim()).length > 0 ? editQuestions.filter(q => q.question.trim()) : null,
        packages: editPackages.filter(p => p.name.trim()).length > 0 ? editPackages.filter(p => p.name.trim()) : null,
      }),
    });

    // Refresh
    const res = await fetch('/api/forms', {
      headers: { Authorization: `Bearer ${session.access_token}` },
    });
    if (res.ok) {
      const data = await res.json();
      setForms(data.forms || []);
    }

    setSaving(false);
    setEditingGoalId(null);
  };

  const deleteForm = async (formId: string) => {
    if (!confirm('Remove custom form for this goal? It will use the default settings instead.')) return;

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
        <p className="text-xs text-[#8e8e93]">Upgrade to create separate forms per goal with custom questions, packages, and services</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-[#8e8e93] text-xs">
        Customise the form for each goal. Goals without a custom form use your default settings.
      </p>

      {/* Visual wireframe */}
      <div className="bg-[#f5f5f7] rounded-xl p-5">
        <p className="text-[10px] text-[#8e8e93] uppercase tracking-wider font-semibold mb-3">Your form flow</p>

        {/* Landing page */}
        <div className="flex items-center gap-2 mb-3">
          <div className="w-2 h-2 rounded-full bg-[#1a1a1a]" />
          <p className="text-xs font-semibold">Landing page</p>
        </div>

        {/* Connector */}
        <div className="ml-1 border-l-2 border-[#e5e5ea] pl-5 space-y-2">
          {activeGoals.map((goal) => {
            const form = getFormForGoal(goal.id);
            const hasCustomForm = !!form;
            const isEditing = editingGoalId === goal.id;

            return (
              <div key={goal.id}>
                {/* Goal card */}
                <div className={`rounded-xl p-3 border transition-all ${hasCustomForm ? 'border-[#007AFF] bg-[#007AFF08]' : 'border-[#e5e5ea] bg-white'}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{goal.emoji}</span>
                      <div>
                        <p className="text-xs font-semibold">{goal.label}</p>
                        <p className="text-[9px] text-[#8e8e93]">
                          {hasCustomForm ? 'Custom form' : 'Default settings'}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-1.5">
                      <button onClick={() => isEditing ? setEditingGoalId(null) : startEditing(goal.id)}
                        className="text-[10px] font-medium px-2.5 py-1 rounded-lg bg-[#f5f5f7] text-[#007AFF]">
                        {isEditing ? 'Cancel' : hasCustomForm ? 'Edit' : 'Customise'}
                      </button>
                      {hasCustomForm && !isEditing && (
                        <button onClick={() => deleteForm(form!.id)}
                          className="text-[10px] font-medium px-2.5 py-1 rounded-lg bg-[#f5f5f7] text-[#FF3B30]">
                          Reset
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Flow preview for this goal */}
                  {hasCustomForm && !isEditing && (
                    <div className="flex items-center gap-1 mt-2 flex-wrap">
                      <FlowStep label="About you" />
                      <FlowArrow />
                      <FlowStep label="Availability" />
                      {form!.questions && form!.questions.length > 0 && (
                        <>
                          <FlowArrow />
                          <FlowStep label={`${form!.questions.length} questions`} highlight />
                        </>
                      )}
                      <FlowArrow />
                      <FlowStep label="Details" />
                      <FlowArrow />
                      <FlowStep label="Results" />
                      {form!.packages && form!.packages.length > 0 && (
                        <span className="text-[8px] text-[#007AFF] ml-1">({form!.packages.length} packages)</span>
                      )}
                    </div>
                  )}

                  {!hasCustomForm && !isEditing && (
                    <div className="flex items-center gap-1 mt-2 flex-wrap">
                      <FlowStep label="About you" />
                      <FlowArrow />
                      <FlowStep label="Availability" />
                      {trainer.custom_questions && trainer.custom_questions.length > 0 && (
                        <>
                          <FlowArrow />
                          <FlowStep label="Questions" />
                        </>
                      )}
                      <FlowArrow />
                      <FlowStep label="Details" />
                      <FlowArrow />
                      <FlowStep label="Results" />
                      <span className="text-[8px] text-[#8e8e93] ml-1">(default)</span>
                    </div>
                  )}
                </div>

                {/* Editing panel */}
                {isEditing && (
                  <div className="mt-2 bg-white rounded-xl border border-[#e5e5ea] p-4 space-y-4">
                    <p className="text-xs font-semibold">Custom form for &ldquo;{goal.label}&rdquo;</p>

                    {/* Custom questions for this form */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-[#8e8e93] text-[10px] font-semibold">Questions (optional)</label>
                        <button onClick={() => setEditQuestions([...editQuestions, { id: `q-${Date.now()}`, question: '', type: 'select', options: ['', ''], placeholder: '' }])}
                          className="text-[10px] text-[#007AFF] font-medium">+ Add</button>
                      </div>
                      {editQuestions.length === 0 && (
                        <p className="text-[10px] text-[#8e8e93]">No custom questions — will use your default questions</p>
                      )}
                      {editQuestions.map((q, i) => (
                        <div key={q.id} className="flex gap-2 mb-2">
                          <input value={q.question}
                            onChange={(e) => { const u = [...editQuestions]; u[i] = { ...u[i], question: e.target.value }; setEditQuestions(u); }}
                            placeholder="e.g. Have you tried dieting before?"
                            className={inputClass} />
                          <button onClick={() => setEditQuestions(editQuestions.filter((_, idx) => idx !== i))}
                            className="text-[#FF3B30] text-[10px] px-2 flex-shrink-0">x</button>
                        </div>
                      ))}
                    </div>

                    {/* Custom packages for this form */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-[#8e8e93] text-[10px] font-semibold">Packages (optional)</label>
                        <button onClick={() => setEditPackages([...editPackages, { name: '', sessions_per_week: 2, price_per_session: null, monthly_price: null, is_online: false }])}
                          className="text-[10px] text-[#007AFF] font-medium">+ Add</button>
                      </div>
                      {editPackages.length === 0 && (
                        <p className="text-[10px] text-[#8e8e93]">No custom packages — will use your default packages</p>
                      )}
                      {editPackages.map((pkg, i) => (
                        <div key={i} className="flex gap-2 mb-2">
                          <input value={pkg.name}
                            onChange={(e) => { const u = [...editPackages]; u[i] = { ...u[i], name: e.target.value }; setEditPackages(u); }}
                            placeholder="e.g. 3x Per Week" className={inputClass} />
                          <input type="number" value={pkg.sessions_per_week}
                            onChange={(e) => { const u = [...editPackages]; u[i] = { ...u[i], sessions_per_week: parseInt(e.target.value) || 0 }; setEditPackages(u); }}
                            className="w-16 bg-[#f5f5f7] border border-[#e5e5ea] rounded-xl px-2 py-2.5 text-sm text-center focus:outline-none" placeholder="x/wk" />
                          <input type="number" value={pkg.monthly_price || ''}
                            onChange={(e) => { const u = [...editPackages]; u[i] = { ...u[i], monthly_price: e.target.value ? parseFloat(e.target.value) : null }; setEditPackages(u); }}
                            className="w-20 bg-[#f5f5f7] border border-[#e5e5ea] rounded-xl px-2 py-2.5 text-sm text-center focus:outline-none" placeholder="£/mo" />
                          <button onClick={() => setEditPackages(editPackages.filter((_, idx) => idx !== i))}
                            className="text-[#FF3B30] text-[10px] px-2 flex-shrink-0">x</button>
                        </div>
                      ))}
                    </div>

                    <div className="flex gap-2">
                      <button onClick={saveForm} disabled={saving}
                        className="flex-1 py-2.5 rounded-xl bg-[#1a1a1a] text-white text-xs font-semibold disabled:opacity-40">
                        {saving ? 'Saving...' : editFormId ? 'Save changes' : 'Create form'}
                      </button>
                      <button onClick={() => setEditingGoalId(null)}
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
      </div>
    </div>
  );
}

function FlowStep({ label, highlight }: { label: string; highlight?: boolean }) {
  return (
    <span className={`text-[9px] px-2 py-0.5 rounded-full ${highlight ? 'bg-[#007AFF15] text-[#007AFF] font-semibold' : 'bg-[#e5e5ea] text-[#8e8e93]'}`}>
      {label}
    </span>
  );
}

function FlowArrow() {
  return (
    <svg className="w-2.5 h-2.5 text-[#e5e5ea] flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
    </svg>
  );
}
