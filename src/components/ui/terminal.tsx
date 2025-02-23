import { ReactNode } from 'react'
import { Card } from './card'

interface TerminalProps {
  children: ReactNode
  className?: string
}

export function Terminal({ children, className = '' }: TerminalProps) {
  return (
    <Card className={`bg-nema-dark/95 border border-nema-sand/20 backdrop-blur-sm ${className}`}>
      <div className="flex flex-col space-y-2">
        {/* Terminal Header */}
        <div className="flex items-center space-x-2 pb-4 border-b border-nema-sand/10">
          <div className="h-3 w-3 rounded-full bg-nema-pulse" />
          <div className="h-3 w-3 rounded-full bg-nema-glow" />
          <div className="h-3 w-3 rounded-full bg-nema-sky" />
          <div className="ml-4 text-sm text-nema-sand/70 font-mono">
            nema@earth:~$
          </div>
        </div>

        {/* Terminal Content */}
        <div className="font-mono text-sm pt-2 text-nema-light">
          {children}
        </div>

        {/* Blinking Cursor */}
        <div className="flex items-center text-nema-sand">
          <span className="mr-2">{'>'}</span>
          <span className="w-2 h-5 bg-nema-sand/70 animate-blink" />
        </div>
      </div>
    </Card>
  )
}
