import { ReactNode } from 'react'
import { Card } from './card'

interface TerminalProps {
  children: ReactNode
  className?: string
}

export function Terminal({ children, className = '' }: TerminalProps) {
  return (
    <Card className={`bg-matrix-dark border border-matrix-light-green/30 ${className}`}>
      <div className="flex flex-col space-y-2">
        {/* Terminal Header */}
        <div className="flex items-center space-x-2 pb-4 border-b border-matrix-light-green/20">
          <div className="h-3 w-3 rounded-full bg-red-500" />
          <div className="h-3 w-3 rounded-full bg-yellow-500" />
          <div className="h-3 w-3 rounded-full bg-green-500" />
          <div className="ml-4 text-sm text-matrix-light-green/70">
            nema@matrix:~$
          </div>
        </div>

        {/* Terminal Content */}
        <div className="font-mono text-sm pt-2">
          {children}
        </div>

        {/* Blinking Cursor */}
        <div className="flex items-center text-matrix-green">
          <span className="mr-2">{'>'}</span>
          <span className="w-2 h-5 bg-matrix-green/70 animate-blink" />
        </div>
      </div>
    </Card>
  )
}
