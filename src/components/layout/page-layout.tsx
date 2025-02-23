import { ReactNode } from 'react'
import { Header } from './header'
import { Footer } from './footer'
import { EtherealWorm } from './ethereal-worm'

interface PageLayoutProps {
  title: string
  subtitle?: string
  children: ReactNode
  className?: string
}

export function PageLayout({ title, subtitle, children, className = '' }: PageLayoutProps) {
  return (
    <div className="min-h-screen bg-nema-dark">
      <EtherealWorm />
      <div
        className="min-h-screen bg-gradient-to-br from-nema-dawn/40 via-nema-midday/50 to-nema-dusk/40 backdrop-blur-sm"
        style={{
          backgroundImage: `
            radial-gradient(circle at 20% 150%, rgba(145, 193, 231, 0.4) 0%, transparent 50%),
            radial-gradient(circle at 80% -50%, rgba(180, 167, 214, 0.5) 0%, transparent 50%),
            linear-gradient(to bottom right, rgba(145, 193, 231, 0.2), rgba(180, 167, 214, 0.3), rgba(244, 184, 196, 0.2))
          `
        }}
      >
        <Header />
        <main className={`container mx-auto px-4 py-24 ${className}`}>
          <div className="space-y-8">
            <header className="text-center space-y-4">
              <h1 className="text-6xl font-bold text-white animate-fade-in drop-shadow-lg">
                {title}
              </h1>
              {subtitle && (
                <p className="text-xl text-nema-light/90 drop-shadow">
                  {subtitle}
                </p>
              )}
            </header>
            <div className="relative z-10">
              {children}
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </div>
  )
}
