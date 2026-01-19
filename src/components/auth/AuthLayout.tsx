import { ReactNode } from 'react'

interface AuthLayoutProps {
  children: ReactNode
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-bg animate-fade-in relative overflow-hidden">
      {/* Gradient background overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-brand-primary/5 via-brand-secondary/5 to-brand-accent/5 pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(102,126,234,0.1),transparent_50%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(118,75,162,0.1),transparent_50%)] pointer-events-none" />
      
      <div className="relative mx-auto flex min-h-screen max-w-5xl items-center justify-center gap-10 px-4 py-10">
        {/* Left Sidebar - Features */}
        <div className="hidden w-[420px] shrink-0 md:block">
          <div className="rounded-[32px] border border-border bg-bg-secondary p-8 shadow-sm hover-lift">
            <div className="text-4xl font-extrabold tracking-tight text-gradient-brand">Reactify</div>
            <div className="mt-2 text-sm text-text-secondary">
              Instagram-inspired UI + crypto-native features.
            </div>
            <div className="mt-6 grid grid-cols-2 gap-3 text-sm">
              {['Reels', 'Stories', 'Messaging', 'Search', 'Wallet', 'Subscriptions'].map((t) => (
                <div
                  key={t}
                  className="rounded-2xl border border-border bg-bg px-4 py-3 font-semibold text-text hover-lift transition-all duration-200"
                >
                  {t}
                </div>
              ))}
            </div>
            <div className="mt-6 text-xs text-text-muted">
              Accent color: <span className="font-semibold text-gradient-primary">Sky Blue</span>
            </div>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="w-full max-w-md">
          {children}
        </div>
      </div>
    </div>
  )
}
