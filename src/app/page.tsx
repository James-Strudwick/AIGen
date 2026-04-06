import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-white text-[#1a1a1a]">
      {/* Nav */}
      <nav className="flex items-center justify-between max-w-3xl mx-auto px-5 py-5">
        <p className="font-bold tracking-tight">FomoForms</p>
        <div className="flex gap-2">
          <Link href="/login" className="text-[#8e8e93] text-sm px-4 py-2 rounded-xl hover:bg-[#f5f5f7] transition-colors">
            Log in
          </Link>
          <Link href="/signup" className="bg-[#1a1a1a] text-white text-sm px-4 py-2 rounded-xl font-medium hover:bg-black transition-colors">
            Get started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-2xl mx-auto px-5 pt-16 pb-20 text-center">
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight leading-[1.1] mb-5">
          Turn up the heat on new leads and convert them into paying clients
        </h1>
        <p className="text-[#8e8e93] text-lg leading-relaxed max-w-lg mx-auto mb-8">
          Give every prospect a personalised timeline showing exactly how long it&apos;ll take to reach their goal with your coaching. They sell themselves before you even speak to them.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/signup"
            className="bg-[#1a1a1a] hover:bg-black text-white px-8 py-3.5 rounded-2xl font-semibold transition-colors text-center">
            Start free
          </Link>
          <Link href="/demo-pt"
            className="bg-[#f5f5f7] hover:bg-[#e5e5ea] text-[#1a1a1a] px-8 py-3.5 rounded-2xl font-semibold transition-colors text-center">
            See demo
          </Link>
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-3xl mx-auto px-5 py-16">
        <h2 className="text-2xl font-bold text-center mb-10 tracking-tight">How it works</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-10 h-10 rounded-full bg-[#f5f5f7] flex items-center justify-center mx-auto mb-3 text-sm font-bold">1</div>
            <h3 className="font-semibold mb-1">Prospect fills out the form</h3>
            <p className="text-[#8e8e93] text-sm">Goal, weight, experience, availability. Takes 60 seconds from your Instagram bio link.</p>
          </div>
          <div className="text-center">
            <div className="w-10 h-10 rounded-full bg-[#f5f5f7] flex items-center justify-center mx-auto mb-3 text-sm font-bold">2</div>
            <h3 className="font-semibold mb-1">AI generates their timeline</h3>
            <p className="text-[#8e8e93] text-sm">Personalised milestones, weeks to goal, and how your services accelerate their results.</p>
          </div>
          <div className="text-center">
            <div className="w-10 h-10 rounded-full bg-[#f5f5f7] flex items-center justify-center mx-auto mb-3 text-sm font-bold">3</div>
            <h3 className="font-semibold mb-1">They message you on WhatsApp</h3>
            <p className="text-[#8e8e93] text-sm">Pre-loaded message with all their details. You get a warm lead who&apos;s already bought in.</p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-3xl mx-auto px-5 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-[#f5f5f7] rounded-2xl p-6">
            <div className="text-2xl mb-3">🎯</div>
            <h3 className="font-semibold mb-1">Smart Timelines</h3>
            <p className="text-[#8e8e93] text-sm">Evidence-based calculations personalised to each prospect&apos;s goals and fitness level.</p>
          </div>
          <div className="bg-[#f5f5f7] rounded-2xl p-6">
            <div className="text-2xl mb-3">🦾</div>
            <h3 className="font-semibold mb-1">AI Narratives</h3>
            <p className="text-[#8e8e93] text-sm">AI generates bespoke journey descriptions based on your real services and expertise.</p>
          </div>
          <div className="bg-[#f5f5f7] rounded-2xl p-6">
            <div className="text-2xl mb-3">💰</div>
            <h3 className="font-semibold mb-1">Built-in Upsell</h3>
            <p className="text-[#8e8e93] text-sm">Prospects toggle sessions, nutrition, and add-ons — watching their timeline shrink in real-time.</p>
          </div>
          <div className="bg-[#f5f5f7] rounded-2xl p-6">
            <div className="text-2xl mb-3">🎨</div>
            <h3 className="font-semibold mb-1">Your Brand</h3>
            <p className="text-[#8e8e93] text-sm">Custom colours, fonts, photos, and copy. Looks like you built it, not a template.</p>
          </div>
          <div className="bg-[#f5f5f7] rounded-2xl p-6">
            <div className="text-2xl mb-3">📊</div>
            <h3 className="font-semibold mb-1">Lead Dashboard</h3>
            <p className="text-[#8e8e93] text-sm">See every lead, their goal, timeline, and whether they messaged or booked. All in one place.</p>
          </div>
          <div className="bg-[#f5f5f7] rounded-2xl p-6">
            <div className="text-2xl mb-3">⚡</div>
            <h3 className="font-semibold mb-1">Live in 5 Minutes</h3>
            <p className="text-[#8e8e93] text-sm">Sign up, add your packages, and share the link. No technical skills needed.</p>
          </div>
        </div>
      </section>

      {/* Social proof placeholder */}
      <section className="max-w-2xl mx-auto px-5 py-16 text-center">
        <p className="text-[#8e8e93] text-sm uppercase tracking-wider font-semibold mb-4">The problem</p>
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight leading-tight mb-4">
          &ldquo;How much do you charge?&rdquo;
        </h2>
        <p className="text-[#8e8e93] text-base leading-relaxed max-w-md mx-auto">
          That DM kills conversions. By the time someone sees your price, they haven&apos;t built any emotional investment. This tool flips it. They see their personalised timeline, imagine the milestones, trust your expertise and convince themselves before you even quote a price.
        </p>
      </section>

      {/* Pricing */}
      <section className="max-w-2xl mx-auto px-5 py-16 text-center">
        <h2 className="text-2xl font-bold tracking-tight mb-2">Simple pricing</h2>
        <p className="text-[#8e8e93] text-sm mb-8">Less than the cost of one Easter Egg</p>

        <div className="bg-[#f5f5f7] rounded-2xl p-8 max-w-sm mx-auto">
          <p className="text-4xl font-bold tracking-tight">£9.99<span className="text-lg text-[#8e8e93] font-normal">/month</span></p>
          <p className="text-[#8e8e93] text-sm mt-2 mb-6">Unlimited leads. Everything included.</p>
          <ul className="text-sm text-left space-y-2 mb-6">
            {[
              'Branded landing page',
              'AI-generated timelines',
              'Interactive package comparison',
              'WhatsApp lead capture',
              'Lead dashboard with tracking',
              'Custom colours, fonts, and copy',
              'Unlimited prospects',
            ].map((item) => (
              <li key={item} className="flex items-center gap-2">
                <svg className="w-4 h-4 text-[#34C759] flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                {item}
              </li>
            ))}
          </ul>
          <Link href="/signup"
            className="block w-full py-3.5 rounded-xl bg-[#1a1a1a] text-white font-semibold text-sm text-center hover:bg-black transition-colors">
            Get started
          </Link>
        </div>
      </section>

      {/* Final CTA */}
      <section className="max-w-2xl mx-auto px-5 pt-8 pb-20 text-center">
        <h2 className="text-2xl font-bold tracking-tight mb-3">
          Ready to stop losing leads?
        </h2>
        <p className="text-[#8e8e93] text-sm mb-6">Set up your page in 5 minutes. First lead could come today.</p>
        <Link href="/signup"
          className="inline-block bg-[#1a1a1a] hover:bg-black text-white px-8 py-3.5 rounded-2xl font-semibold transition-colors">
          Start free
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#e5e5ea] py-8 text-center">
        <p className="text-[#8e8e93] text-xs">FomoForms — AI-powered lead generation for coaches</p>
      </footer>
    </div>
  );
}
