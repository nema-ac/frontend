import { PageLayout } from '@/components/layout/page-layout';
import { Card } from '@/components/ui/card';
import { TokenDistribution } from '@/components/tokenomics/token-distribution';

export default function Home() {
  return (
    <PageLayout
      title="NEMA"
      subtitle="Digital Neural Network Simulation Token"
    >
      <div className="max-w-4xl mx-auto space-y-16">
        <section className="space-y-6 terminal-text">
          <div className="space-y-4">
            <div className="typewriter-effect">
              <p className="text-lg">
                {">"} Initializing Nematoduino simulation...
              </p>
            </div>
            <div className="typewriter-effect" style={{ animationDelay: "2s" }}>
              <p className="text-lg">
                {">"} A blockchain-powered neural network inspired by C. elegans
              </p>
            </div>
          </div>

          <Card>
            <h2 className="text-2xl mb-4 font-code">About Nema</h2>
            <p className="text-lg text-matrix-light-green/90 leading-relaxed">
              Nema is a groundbreaking cryptocurrency project that simulates
              Nematoduino - an Arduino-compatible implementation of the
              Nanotode model running a robotic simulation of the C. elegans&apos;
              nervous system.
            </p>
          </Card>
        </section>

        <section>
          <TokenDistribution />
        </section>
      </div>
    </PageLayout>
  );
}
