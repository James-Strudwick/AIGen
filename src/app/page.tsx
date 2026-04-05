import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center px-6">
      <div className="max-w-2xl text-center">
        <h1 className="text-4xl sm:text-5xl font-bold mb-4 bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">
          PT Goal Calculator
        </h1>
        <p className="text-gray-400 text-lg mb-8 leading-relaxed">
          The AI-powered lead generation tool for personal trainers.
          Each trainer gets a branded landing page where prospects can calculate
          their personalised fitness timeline.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/demo-pt"
            className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3.5 rounded-xl font-semibold transition-colors text-center"
          >
            View Demo
          </Link>
          <Link
            href="/admin"
            className="bg-white/5 hover:bg-white/10 border border-white/10 text-white px-8 py-3.5 rounded-xl font-semibold transition-colors text-center"
          >
            Admin Panel
          </Link>
        </div>

        <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-6 text-left">
          <div className="bg-white/[0.03] rounded-2xl p-6 border border-white/5">
            <div className="text-2xl mb-3">🎯</div>
            <h3 className="text-white font-semibold mb-1">Smart Timelines</h3>
            <p className="text-gray-500 text-sm">Evidence-based calculations personalised to each prospect&apos;s goals and fitness level.</p>
          </div>
          <div className="bg-white/[0.03] rounded-2xl p-6 border border-white/5">
            <div className="text-2xl mb-3">🤖</div>
            <h3 className="text-white font-semibold mb-1">AI Narratives</h3>
            <p className="text-gray-500 text-sm">Claude AI generates bespoke journey descriptions that feel personal, not templated.</p>
          </div>
          <div className="bg-white/[0.03] rounded-2xl p-6 border border-white/5">
            <div className="text-2xl mb-3">💰</div>
            <h3 className="text-white font-semibold mb-1">Package Upsell</h3>
            <p className="text-gray-500 text-sm">Automatically shows how more sessions = faster results = better value for prospects.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
