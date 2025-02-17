import Link from "next/link";

const navigation = [
  { name: 'About', href: '/about' },
  { name: 'Airdrop', href: '/airdrop' },
  { name: 'Docs', href: 'https://docs.deepworm.xyz/deepworm' },
  { name: 'GitHub', href: 'https://github.com/nema-ac' },
];

export function Footer() {
  return (
    <footer className="border-t border-matrix-green/20 bg-matrix-terminal/95 backdrop-blur-sm relative z-50 py-10 mt-auto">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center gap-8">
          <div className="flex gap-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-base font-medium text-matrix-green transition-colors hover:text-matrix-light-green"
              >
                {item.name}
              </Link>
            ))}
          </div>
          <div className="text-base text-matrix-green/80">
            © {new Date().getFullYear()} Nema. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}
