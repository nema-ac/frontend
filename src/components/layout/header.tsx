"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '/about' },
  { label: 'Docs', href: '/docs' },
  { label: 'Airdrop', href: '/airdrop' },
];

export function Header() {
  const pathname = usePathname();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link
            href="/"
            className="flex items-center space-x-2 text-2xl font-bold text-nema-light hover:text-nema-glow transition group"
          >
            <svg
              width="32"
              height="32"
              viewBox="0 0 1200 1200"
              className="fill-nema-dawn group-hover:fill-nema-glow transition"
            >
              <path d="m894.24 445.2c-68.637 65.281-164.16 91.68-255.6 104.88-81.602 12-166.8 17.039-239.76 48.719-76.32 33.363-124.32 88.562-120.48 174 2.3984 51.359 30 101.52 68.879 140.16 10.801 8.6406 21.844 16.801 33.363 24.238-0.71875-1.4375-1.4414-3.1211-2.6406-4.5586-46.32-63.602-82.32-245.76 160.08-285.36 48.723-7.9219 97.441-16.082 145.92-27.121 42.719-9.8398 119.04-33.84 127.44-38.398 6.9609-4.0781-45.359 54.719-205.68 100.8-254.64 73.199-176.4 284.64-98.641 308.88 29.758 7.1992 60.957 10.797 92.879 10.797 222.24 0 402.48-180 402.48-402.24 0-79.922-23.281-154.32-63.359-216.72-10.801 23.52-25.922 43.68-44.883 61.918z"/>
              <path d="m197.76 600c0 44.16 7.1992 86.16 20.16 126 4.8008-43.68 19.68-84.961 47.52-120 50.398-64.078 128.64-94.078 210-110.16 81.117-15.84 167.52-17.762 250.8-37.918 46.078-11.039 92.879-29.039 130.08-58.559 30.965-24.965 45.363-62.883 13.203-98.164-11.758-10.559-24.238-20.641-37.199-29.758 23.52 48.238 5.2812 120-185.52 138.72-48.961 5.0391-97.68 9.6016-145.92 16.32-14.16 1.918-31.68 4.5586-49.68 7.6797 0 0 15.84-19.68 127.68-45.121 229.92-51.84 186.96-151.92 118.8-179.52-31.199-7.6797-64.078-12-97.68-12-222.24 0.24219-402.24 180.24-402.24 402.48z"/>
            </svg>
            <span>NEMA</span>
          </Link>

          <nav className="hidden md:flex items-center space-x-8">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "text-nema-light/90 hover:text-nema-glow transition",
                  pathname === item.href
                    ? "text-nema-glow"
                    : "text-nema-light"
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
}
