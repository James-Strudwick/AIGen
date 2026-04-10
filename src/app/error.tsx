'use client';

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="min-h-[100dvh] bg-white flex items-center justify-center px-5">
      <div className="text-center max-w-sm">
        <h1 className="text-2xl font-bold tracking-tight mb-2">Something went wrong</h1>
        <p className="text-[#8e8e93] text-sm mb-6">
          An unexpected error occurred. Please try again.
        </p>
        <button onClick={reset}
          className="inline-block w-full py-3.5 rounded-xl bg-[#1a1a1a] text-white font-semibold text-sm text-center">
          Try again
        </button>
      </div>
    </div>
  );
}
