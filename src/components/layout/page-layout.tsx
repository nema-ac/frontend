import { MatrixLayout } from "./matrix-layout";

interface PageLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

export function PageLayout({ children, title, subtitle }: PageLayoutProps) {
  return (
    <MatrixLayout>
      <main className="container mx-auto px-4 py-16">
        <div className="space-y-8">
          <header className="text-center space-y-4">
            <h1 className="text-6xl font-bold animate-matrix-fade">
              {title}
            </h1>
            {subtitle && (
              <p className="text-xl text-matrix-light-green">
                {subtitle}
              </p>
            )}
          </header>

          {children}
        </div>
      </main>
    </MatrixLayout>
  );
}
