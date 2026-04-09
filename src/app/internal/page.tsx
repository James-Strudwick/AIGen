'use client';

import { useState, useEffect } from 'react';
import { createBrowserClient } from '@/lib/auth';

const NICHE_TEMPLATES: Record<string, {
  goals: { id: string; emoji: string; label: string; subtitle: string; goal_type: string; needs_target: boolean; target_prompt: string; target_placeholder: string }[];
  packages: { name: string; sessions_per_week: number; monthly_price: number }[];
  specialties: { name: string; description: string }[];
  questions: { id: string; question: string; type: string; options: string[]; placeholder: string }[];
}> = {
  'weight-loss': {
    goals: [
      { id: 'wl', emoji: '🔥', label: 'Lose Weight', subtitle: 'Burn fat and get lean', goal_type: 'weight_loss', needs_target: false, target_prompt: '', target_placeholder: '' },
      { id: 'tone', emoji: '💪', label: 'Tone Up', subtitle: 'Build definition and shape', goal_type: 'weight_loss', needs_target: false, target_prompt: '', target_placeholder: '' },
      { id: 'energy', emoji: '⚡', label: 'More Energy', subtitle: 'Feel better day to day', goal_type: 'fitness', needs_target: true, target_prompt: "What does 'more energy' look like for you?", target_placeholder: 'e.g. Keep up with my kids, not crash at 3pm' },
    ],
    packages: [
      { name: '2x Per Week', sessions_per_week: 2, monthly_price: 280 },
      { name: '3x Per Week', sessions_per_week: 3, monthly_price: 380 },
      { name: '4x Per Week', sessions_per_week: 4, monthly_price: 460 },
    ],
    specialties: [
      { name: 'Body Transformation', description: 'Proven programmes combining training with nutrition guidance for sustainable fat loss' },
      { name: 'Nutrition Coaching', description: 'Personalised meal plans and macro targets — not just exercise' },
    ],
    questions: [
      { id: 'q1', question: "What's held you back before?", type: 'select', options: ['Motivation', 'Time', 'Diet knowledge', 'Accountability', 'Injury'], placeholder: '' },
    ],
  },
  'strength': {
    goals: [
      { id: 'str', emoji: '🏋️', label: 'Build Strength', subtitle: 'Get stronger overall', goal_type: 'muscle_gain', needs_target: false, target_prompt: '', target_placeholder: '' },
      { id: 'muscle', emoji: '💪', label: 'Build Muscle', subtitle: 'Add size and definition', goal_type: 'muscle_gain', needs_target: false, target_prompt: '', target_placeholder: '' },
      { id: 'pr', emoji: '🎯', label: 'Hit a PR', subtitle: 'Specific strength target', goal_type: 'performance', needs_target: true, target_prompt: "What's your target?", target_placeholder: 'e.g. 100kg bench, 200kg deadlift' },
    ],
    packages: [
      { name: '3x Per Week', sessions_per_week: 3, monthly_price: 360 },
      { name: '4x Per Week', sessions_per_week: 4, monthly_price: 440 },
      { name: '5x Per Week', sessions_per_week: 5, monthly_price: 500 },
    ],
    specialties: [
      { name: 'Strength Programming', description: 'Periodised programmes using proven methods — conjugate, linear, block' },
      { name: 'Technique Coaching', description: 'Dial in your form for bigger lifts and fewer injuries' },
    ],
    questions: [
      { id: 'q1', question: 'What are your current big 3 numbers?', type: 'text', options: [], placeholder: 'e.g. Squat 120, Bench 80, Deadlift 140' },
    ],
  },
  'running': {
    goals: [
      { id: '5k', emoji: '🏃', label: 'Run a 5K', subtitle: 'From zero to finish line', goal_type: 'performance', needs_target: true, target_prompt: 'Any target time?', target_placeholder: 'e.g. Under 30 minutes, or just finish' },
      { id: '10k', emoji: '🏃‍♂️', label: 'Run a 10K', subtitle: 'Step up your distance', goal_type: 'performance', needs_target: true, target_prompt: 'Any target time?', target_placeholder: 'e.g. Under 50 minutes' },
      { id: 'marathon', emoji: '🏅', label: 'Marathon Training', subtitle: 'Go the full distance', goal_type: 'performance', needs_target: true, target_prompt: 'Any target time?', target_placeholder: 'e.g. Sub 4 hours' },
      { id: 'speed', emoji: '⚡', label: 'Improve My PB', subtitle: 'Get faster', goal_type: 'performance', needs_target: true, target_prompt: "What's your target?", target_placeholder: 'e.g. Sub-20 min 5K' },
    ],
    packages: [
      { name: '2x Per Week', sessions_per_week: 2, monthly_price: 200 },
      { name: '3x Per Week', sessions_per_week: 3, monthly_price: 280 },
      { name: '4x Per Week', sessions_per_week: 4, monthly_price: 340 },
    ],
    specialties: [
      { name: 'Run Coaching', description: 'Structured training plans that build distance and speed progressively' },
      { name: 'Injury Prevention', description: 'Strength and mobility work to keep you running pain-free' },
    ],
    questions: [
      { id: 'q1', question: 'What can you run currently?', type: 'select', options: ['Nothing — complete beginner', 'Can jog for 10-15 minutes', 'Can run 5K', 'Can run 10K+'], placeholder: '' },
    ],
  },
  'boxing': {
    goals: [
      { id: 'learn', emoji: '🥊', label: 'Learn Boxing', subtitle: 'Master the basics', goal_type: 'fitness', needs_target: true, target_prompt: 'What do you want to get from boxing?', target_placeholder: 'e.g. Self-defence, fitness, confidence' },
      { id: 'fit', emoji: '🔥', label: 'Boxing Fitness', subtitle: 'Get fight-fit', goal_type: 'fitness', needs_target: false, target_prompt: '', target_placeholder: '' },
      { id: 'compete', emoji: '🏆', label: 'Competition Prep', subtitle: 'Train to fight', goal_type: 'performance', needs_target: true, target_prompt: 'When is your fight?', target_placeholder: 'e.g. White collar bout in 12 weeks' },
    ],
    packages: [
      { name: '2x Per Week', sessions_per_week: 2, monthly_price: 240 },
      { name: '3x Per Week', sessions_per_week: 3, monthly_price: 330 },
      { name: '4x Per Week', sessions_per_week: 4, monthly_price: 400 },
    ],
    specialties: [
      { name: 'Boxing Fundamentals', description: 'Proper technique from day one — jab, cross, hooks, footwork' },
      { name: 'Fight Conditioning', description: 'The cardio and strength needed to last 3 rounds and beyond' },
    ],
    questions: [
      { id: 'q1', question: 'Any boxing experience?', type: 'select', options: ['None — total beginner', 'Done a few classes', '6+ months training', 'Competed before'], placeholder: '' },
    ],
  },
  'yoga': {
    goals: [
      { id: 'flex', emoji: '🧘', label: 'Flexibility', subtitle: 'Touch your toes and beyond', goal_type: 'fitness', needs_target: true, target_prompt: "What does flexibility mean to you?", target_placeholder: 'e.g. Do the splits, touch my toes, less stiffness' },
      { id: 'stress', emoji: '💆', label: 'Stress Relief', subtitle: 'Find calm in the chaos', goal_type: 'fitness', needs_target: true, target_prompt: 'What are you dealing with?', target_placeholder: 'e.g. Work stress, poor sleep, anxiety' },
      { id: 'pain', emoji: '🩹', label: 'Pain & Recovery', subtitle: 'Reduce aches and stiffness', goal_type: 'fitness', needs_target: true, target_prompt: 'Where do you feel pain or stiffness?', target_placeholder: 'e.g. Lower back, shoulders, hips' },
    ],
    packages: [
      { name: '1x Per Week', sessions_per_week: 1, monthly_price: 120 },
      { name: '2x Per Week', sessions_per_week: 2, monthly_price: 200 },
      { name: '3x Per Week', sessions_per_week: 3, monthly_price: 270 },
    ],
    specialties: [
      { name: 'Vinyasa Flow', description: 'Dynamic sequences that build strength, flexibility, and mindfulness' },
      { name: 'Restorative Yoga', description: 'Gentle practice focused on recovery, relaxation, and stress relief' },
    ],
    questions: [
      { id: 'q1', question: 'Any yoga experience?', type: 'select', options: ['Never tried it', 'Done a few classes', 'Practice occasionally', 'Regular practitioner'], placeholder: '' },
    ],
  },
  'postnatal': {
    goals: [
      { id: 'recovery', emoji: '👶', label: 'Postnatal Recovery', subtitle: 'Rebuild your core safely', goal_type: 'fitness', needs_target: true, target_prompt: 'What matters most to you right now?', target_placeholder: 'e.g. Core strength, energy, feeling like myself again' },
      { id: 'strong', emoji: '💪', label: 'Get Strong Again', subtitle: 'Regain your strength', goal_type: 'fitness', needs_target: false, target_prompt: '', target_placeholder: '' },
      { id: 'weight', emoji: '🔥', label: 'Lose Baby Weight', subtitle: 'Sustainable weight loss', goal_type: 'weight_loss', needs_target: false, target_prompt: '', target_placeholder: '' },
    ],
    packages: [
      { name: '1x Per Week', sessions_per_week: 1, monthly_price: 160 },
      { name: '2x Per Week', sessions_per_week: 2, monthly_price: 280 },
      { name: 'Online Plan', sessions_per_week: 3, monthly_price: 120 },
    ],
    specialties: [
      { name: 'Postnatal Exercise', description: 'Safe, progressive training designed specifically for new mums' },
      { name: 'Core Rehabilitation', description: 'Diastasis recti recovery and pelvic floor strengthening' },
    ],
    questions: [
      { id: 'q1', question: 'How long ago did you give birth?', type: 'select', options: ['Less than 3 months', '3-6 months', '6-12 months', '12+ months'], placeholder: '' },
    ],
  },
  'general': {
    goals: [
      { id: 'wl', emoji: '🔥', label: 'Lose Weight', subtitle: 'Burn fat and get lean', goal_type: 'weight_loss', needs_target: false, target_prompt: '', target_placeholder: '' },
      { id: 'mg', emoji: '💪', label: 'Build Muscle', subtitle: 'Get stronger and bigger', goal_type: 'muscle_gain', needs_target: false, target_prompt: '', target_placeholder: '' },
      { id: 'fi', emoji: '❤️', label: 'Improve Fitness', subtitle: 'Feel healthier and fitter', goal_type: 'fitness', needs_target: true, target_prompt: "What does 'fit' look like for you?", target_placeholder: 'e.g. Run 5K, keep up with my kids' },
      { id: 'pe', emoji: '🎯', label: 'Performance Goal', subtitle: 'Hit a specific target', goal_type: 'performance', needs_target: true, target_prompt: "What's your target?", target_placeholder: 'e.g. Run a marathon, compete in CrossFit' },
    ],
    packages: [
      { name: '2x Per Week', sessions_per_week: 2, monthly_price: 280 },
      { name: '3x Per Week', sessions_per_week: 3, monthly_price: 380 },
      { name: '4x Per Week', sessions_per_week: 4, monthly_price: 460 },
    ],
    specialties: [
      { name: 'Personal Training', description: 'Fully personalised programmes tailored to your goals and lifestyle' },
      { name: 'Accountability', description: 'Regular check-ins and progress tracking to keep you on course' },
    ],
    questions: [
      { id: 'q1', question: "What's held you back before?", type: 'select', options: ['Motivation', 'Time', 'Knowledge', 'Accountability', 'Injury'], placeholder: '' },
    ],
  },
};

const NICHE_LIST = [
  { id: 'weight-loss', label: '🔥 Weight Loss PT' },
  { id: 'strength', label: '🏋️ Strength Coach' },
  { id: 'running', label: '🏃 Running Coach' },
  { id: 'boxing', label: '🥊 Boxing / MMA' },
  { id: 'yoga', label: '🧘 Yoga / Mobility' },
  { id: 'postnatal', label: '👶 Postnatal' },
  { id: 'general', label: '💪 General PT' },
];

export default function InternalPage() {
  const [authed, setAuthed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState('');

  // Form state
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [bio, setBio] = useState('');
  const [niche, setNiche] = useState('general');
  const [brandColor, setBrandColor] = useState('#1a1a1a');
  const [creating, setCreating] = useState(false);
  const [result, setResult] = useState<{ slug: string; url: string } | null>(null);
  const [error, setError] = useState('');

  // Existing demos
  const [demos, setDemos] = useState<{ slug: string; name: string; created_at: string }[]>([]);

  useEffect(() => {
    const check = async () => {
      const supabase = createBrowserClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { setLoading(false); return; }
      setToken(session.access_token);

      const res = await fetch('/api/internal', {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (res.ok) {
        setAuthed(true);
        const data = await res.json();
        setDemos(data.demos || []);
      }
      setLoading(false);
    };
    check();
  }, []);

  const autoSlug = (n: string) => {
    return 'demo-' + n.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').trim();
  };

  const handleCreate = async () => {
    setCreating(true);
    setError('');
    setResult(null);

    const template = NICHE_TEMPLATES[niche] || NICHE_TEMPLATES['general'];

    const res = await fetch('/api/internal', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        slug: slug || autoSlug(name),
        bio,
        brandColor,
        goals: template.goals,
        packages: template.packages,
        specialties: template.specialties,
        questions: template.questions,
        services: {
          show_prices: true,
          nutrition: {
            enabled: true,
            name: 'Nutrition Plan',
            description: 'Personalised meal plans and macro targets to accelerate your results',
            timeline_reduction_percent: 20,
            price_per_month: null,
          },
          online: null,
          hybrid: null,
          add_ons: [],
        },
      }),
    });

    if (res.ok) {
      const data = await res.json();
      setResult(data);
      setDemos(prev => [{ slug: data.slug, name, created_at: new Date().toISOString() }, ...prev]);
      setName('');
      setSlug('');
      setBio('');
    } else {
      const data = await res.json();
      setError(data.error || 'Failed to create');
    }
    setCreating(false);
  };

  const handleDelete = async (demoSlug: string) => {
    if (!confirm(`Delete demo "${demoSlug}"?`)) return;
    await fetch('/api/internal', {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug: demoSlug }),
    });
    setDemos(prev => prev.filter(d => d.slug !== demoSlug));
  };

  if (loading) return <div className="min-h-[100dvh] bg-white flex items-center justify-center"><p className="text-[#8e8e93] text-sm">Loading...</p></div>;
  if (!authed) return <div className="min-h-[100dvh] bg-white flex items-center justify-center"><p className="text-[#8e8e93] text-sm">Not authorized</p></div>;

  const inputClass = "w-full bg-[#f5f5f7] border border-[#e5e5ea] rounded-xl px-4 py-3 text-[#1a1a1a] text-sm placeholder-[#8e8e93] focus:outline-none focus:border-[#8e8e93]";

  return (
    <div className="min-h-[100dvh] bg-white">
      <div className="max-w-lg mx-auto px-4 py-8">
        <h1 className="text-xl font-bold tracking-tight mb-1">Demo Creator</h1>
        <p className="text-[#8e8e93] text-sm mb-6">Create customised demos for cold outreach</p>

        {/* Create form */}
        <div className="space-y-4 mb-8">
          <div>
            <label className="text-[#8e8e93] text-xs block mb-1">PT&apos;s name</label>
            <input value={name} onChange={(e) => { setName(e.target.value); if (!slug) setSlug(''); }}
              placeholder="e.g. Sarah Mitchell" className={inputClass} />
          </div>

          <div>
            <label className="text-[#8e8e93] text-xs block mb-1">URL slug</label>
            <div className="flex items-center gap-0">
              <span className="text-[#8e8e93] text-sm bg-[#f5f5f7] border border-[#e5e5ea] border-r-0 rounded-l-xl px-3 py-3">fomoforms.com/</span>
              <input value={slug || autoSlug(name)}
                onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                className={inputClass + ' rounded-l-none'} />
            </div>
          </div>

          <div>
            <label className="text-[#8e8e93] text-xs block mb-1">Bio (optional)</label>
            <textarea value={bio} onChange={(e) => setBio(e.target.value)}
              placeholder="e.g. Specialising in body transformation for busy professionals"
              rows={2} className={inputClass} />
          </div>

          <div>
            <label className="text-[#8e8e93] text-xs block mb-1">Niche template</label>
            <div className="grid grid-cols-2 gap-2">
              {NICHE_LIST.map((n) => (
                <button key={n.id} onClick={() => setNiche(n.id)}
                  className="py-2.5 px-3 rounded-xl text-xs font-medium text-left transition-all"
                  style={{
                    backgroundColor: niche === n.id ? '#1a1a1a' : '#f5f5f7',
                    color: niche === n.id ? '#ffffff' : '#1a1a1a',
                  }}>
                  {n.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-[#8e8e93] text-xs block mb-1">Brand colour</label>
            <div className="flex gap-2 items-center">
              <input type="color" value={brandColor} onChange={(e) => setBrandColor(e.target.value)}
                className="w-10 h-10 rounded-xl cursor-pointer bg-transparent border-0" />
              <input value={brandColor} onChange={(e) => setBrandColor(e.target.value)} className={inputClass + ' font-mono'} />
            </div>
          </div>

          {error && <p className="text-[#FF3B30] text-sm bg-[#FF3B30]/5 rounded-xl px-4 py-3">{error}</p>}

          {result && (
            <div className="bg-[#34C75910] border border-[#34C759] rounded-xl p-4">
              <p className="text-sm font-semibold text-[#34C759] mb-1">Demo created!</p>
              <p className="text-xs text-[#1a1a1a] font-mono mb-2">{result.url}</p>
              <button onClick={() => { navigator.clipboard.writeText(result.url); }}
                className="text-xs text-[#007AFF] font-medium">Copy link</button>
            </div>
          )}

          <button onClick={handleCreate} disabled={creating || !name.trim()}
            className="w-full py-3.5 rounded-xl bg-[#1a1a1a] text-white font-semibold text-sm disabled:opacity-40 transition-all active:scale-[0.97]">
            {creating ? 'Creating...' : 'Create demo'}
          </button>
        </div>

        {/* Existing demos */}
        {demos.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-[#8e8e93] uppercase tracking-wider mb-3">Your demos ({demos.length})</p>
            <div className="space-y-2">
              {demos.map((d) => (
                <div key={d.slug} className="flex items-center justify-between bg-[#f5f5f7] rounded-xl px-4 py-3">
                  <div>
                    <p className="text-sm font-medium">{d.name || d.slug}</p>
                    <p className="text-[10px] text-[#8e8e93] font-mono">fomoforms.com/{d.slug}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => navigator.clipboard.writeText(`https://fomoforms.com/${d.slug}`)}
                      className="text-[10px] text-[#007AFF] font-medium px-2 py-1 rounded-lg bg-white">Copy</button>
                    <a href={`/${d.slug}`} target="_blank"
                      className="text-[10px] text-[#8e8e93] font-medium px-2 py-1 rounded-lg bg-white">View</a>
                    <button onClick={() => handleDelete(d.slug)}
                      className="text-[10px] text-[#FF3B30] font-medium px-2 py-1 rounded-lg bg-white">Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
