export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen auth-wave-bg flex">
      {/* Left panel — branding */}
      <div className="hidden lg:flex lg:w-5/12 xl:w-1/2 flex-col items-center justify-center relative overflow-hidden p-12"
        style={{ background: "linear-gradient(145deg, #0A0A14 0%, #12061A 60%, #1A0A2E 100%)" }}>

        {/* Decorative orbs */}
        <div className="absolute top-20 left-10 w-72 h-72 rounded-full opacity-20"
          style={{ background: "radial-gradient(circle, #FF5F7E 0%, transparent 70%)", filter: "blur(40px)" }} />
        <div className="absolute bottom-20 right-10 w-96 h-96 rounded-full opacity-10"
          style={{ background: "radial-gradient(circle, #7B5EA7 0%, transparent 70%)", filter: "blur(60px)" }} />

        <div className="relative z-10 text-center max-w-sm">
          {/* Mascot SVG placeholder */}
          <div className="mb-8 flex justify-center">
            <div className="w-40 h-40 rounded-full gradient-brand flex items-center justify-center shadow-pink-lg animate-float">
              <span className="text-7xl select-none">🦔</span>
            </div>
          </div>

          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl gradient-brand flex items-center justify-center shadow-pink-sm">
              <span className="text-white font-bold text-xl">Z</span>
            </div>
            <span className="text-3xl font-bold text-white" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Zumi</span>
          </div>

          <h1 className="text-4xl font-extrabold text-white mb-4 leading-tight" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Learn. Compete.
            <span className="block gradient-brand-text">Grow Together.</span>
          </h1>
          <p className="text-gray-400 text-lg leading-relaxed">
            AI-powered study tools, educational games, and social learning — all in one place.
          </p>

          <div className="mt-10 grid grid-cols-3 gap-4">
            {[
              { icon: "🎮", label: "Game Arena" },
              { icon: "🤖", label: "AI Study" },
              { icon: "🏆", label: "Leaderboards" },
            ].map((f) => (
              <div key={f.label} className="p-3 rounded-2xl text-center"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
                <div className="text-2xl mb-1">{f.icon}</div>
                <div className="text-xs text-gray-400 font-medium">{f.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-zumi-bg">
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  );
}
