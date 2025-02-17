"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const navigation = [
  { name: 'About', href: '/about' },
  { name: 'Airdrop', href: '/airdrop' },
  { name: 'Docs', href: 'https://docs.deepworm.xyz/deepworm' },
  { name: 'GitHub', href: 'https://github.com/nema-ac' },
];

export function Header() {
  const pathname = usePathname();

  return (
    <header className="border-b border-matrix-green/20 bg-matrix-terminal/95 backdrop-blur-sm relative z-50">
      <div className="container mx-auto px-4">
        <nav className="flex items-center justify-between h-20">
          <Link
            href="/"
            className="text-3xl font-bold text-matrix-green hover:text-matrix-light-green transition-colors"
          >
            NEMA
          </Link>

          <div className="flex gap-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "text-base font-medium transition-colors hover:text-matrix-light-green",
                  pathname === item.href
                    ? "text-matrix-light-green"
                    : "text-matrix-green"
                )}
              >
                {item.name}
              </Link>
            ))}
          </div>
        </nav>
      </div>
    </header>
  );
}
