import Link from 'next/link';

export function Footer() {
  return (
    <footer className="py-12 backdrop-blur-sm">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-bold text-nema-light mb-4">About NEMA</h3>
            <p className="text-nema-light/80">
              Digital life meets artificial intelligence through the lens of C. elegans neural simulation.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-bold text-nema-light mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="https://github.com/nema-ac/" target="_blank" className="text-nema-light/80 hover:text-nema-glow transition">
                  Documentation
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-nema-light/80 hover:text-nema-glow transition">
                  About
                </Link>
              </li>
              <li>
                <Link href="/airdrop" className="text-nema-light/80 hover:text-nema-glow transition">
                  Airdrop
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-bold text-nema-light mb-4">Community</h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="https://x.com/Nema_Lab"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-nema-light/80 hover:text-nema-glow transition"
                >
                  Twitter
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/nema-ac"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-nema-light/80 hover:text-nema-glow transition"
                >
                  GitHub
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-nema-light/10 text-center text-nema-light/60">
          <p>© {new Date().getFullYear()} NEMA Project. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
