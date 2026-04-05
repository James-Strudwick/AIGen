import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-white text-black flex flex-col items-center justify-center px-6">
      <div className="max-w-2xl text-center">
        <h1 className="text-4xl sm:text-5xl font-bold mb-4 text-black tracking-tight">
          Lead Gen Goal Calculator
        </h1>
        <p className="text-[#8e8e93] text-lg mb-8 leading-relaxed">
          The AI-powered lead generation tool for coaches.
          Each coach gets a branded landing page where prospects can calculate
          how long until theu reach their ultimate goal.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/demo-pt"
            className="bg-black hover:bg-black/80 text-white px-8 py-3.5 rounded-2xl font-semibold transition-colors text-center"
          >
            View Demo
          </Link>
          <Link
            href="/admin"
            className="bg-[#f5f5f7] hover:bg-[#e5e5ea] text-black px-8 py-3.5 rounded-2xl font-semibold transition-colors text-center"
          >
            Admin Panel
          </Link>
        </div>

        <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
          <div className="bg-[#f5f5f7] rounded-2xl p-6">
            <div className="text-2xl mb-3">🎯</div>
            <h3 className="text-black font-semibold mb-1">Smart Timelines</h3>
            <p className="text-[#8e8e93] text-sm">Evidence-based calculations personalised to each prospect&apos;s goals and fitness level.</p>
          </div>
          <div className="bg-[#f5f5f7] rounded-2xl p-6">
            <div className="text-2xl mb-3">🦾</div>
            <h3 className="text-black font-semibold mb-1">AI Narratives</h3>
            <p className="text-[#8e8e93] text-sm">AI generates bespoke journey descriptions that feel personal, not templated. Based on your real servies and expertise.</p>
          </div>
          <div className="bg-[#f5f5f7] rounded-2xl p-6">
            <div className="text-2xl mb-3">💰</div>
            <h3 className="text-black font-semibold mb-1">Package Upsell</h3>
            <p className="text-[#8e8e93] text-sm">Automatically shows how more sessions = faster results = better value for prospects.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
