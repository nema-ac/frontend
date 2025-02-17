"use client";

import { useEffect, useState } from 'react';
import { cn } from "@/lib/utils";
import { Header } from "./header";
import { Footer } from "./footer";

interface MatrixLayoutProps {
  children: React.ReactNode;
  className?: string;
}

function StaticMatrixBackground() {
  const [characterCount, setCharacterCount] = useState(45);

  // Japanese katakana characters
  const chars = "アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン";

  useEffect(() => {
    function updateCharacterCount() {
      // Base count on screen size
      const width = window.innerWidth;
      if (width < 640) { // mobile
        setCharacterCount(45);
      } else if (width < 1024) { // tablet
        setCharacterCount(75);
      } else if (width < 1536) { // desktop
        setCharacterCount(120);
      } else { // large desktop
        setCharacterCount(180);
      }
    }

    // Initial count
    updateCharacterCount();

    // Update on resize
    window.addEventListener('resize', updateCharacterCount);
    return () => window.removeEventListener('resize', updateCharacterCount);
  }, []);

  // Generate static positions for characters
  const characters = Array.from({ length: characterCount }).map(() => ({
    char: chars[Math.floor(Math.random() * chars.length)],
    x: Math.random() * 100,
    y: Math.random() * 100,
    opacity: Math.random() * 0.3 + 0.1, // Random opacity between 0.1 and 0.4
  }));

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      <div className="absolute inset-0 bg-matrix-terminal opacity-90" />
      {characters.map((char, i) => (
        <div
          key={i}
          className="absolute font-matrix text-matrix-green"
          style={{
            left: `${char.x}%`,
            top: `${char.y}%`,
            opacity: char.opacity,
            fontSize: 'clamp(1rem, 2vw, 1.5rem)', // Responsive font size
            textShadow: '0 0 8px rgba(0, 255, 0, 0.5)',
          }}
        >
          {char.char}
        </div>
      ))}
    </div>
  );
}

export function MatrixLayout({ children, className }: MatrixLayoutProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className={cn("min-h-screen bg-matrix-black text-matrix-green font-matrix flex flex-col", className)}>
      <StaticMatrixBackground />
      <Header />
      <div className="relative z-10 flex-1">
        {children}
      </div>
      <Footer />
    </div>
  );
}
