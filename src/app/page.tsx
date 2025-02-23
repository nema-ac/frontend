import { PageLayout } from '@/components/layout/page-layout';
import { Card } from '@/components/ui/card';
import { TokenDistribution } from '@/components/tokenomics/token-distribution';
import { Terminal } from '@/components/ui/terminal';

export default function Home() {
  return (
    <PageLayout
      title="NEMA"
      subtitle="Digital Neural Network Simulation Token"
    >
      <div className="max-w-4xl mx-auto space-y-16">
        {/* Terminal Section */}
        <section className="space-y-6">
          <Terminal>
            <div className="space-y-4">
              <p className="text-matrix-light-green">
                {'>'} Initializing C. elegans neural network simulation...
              </p>
              <p className="text-matrix-light-green">
                {'>'} Loading 302 neurons and 95 muscle cells...
              </p>
              <p className="text-matrix-light-green">
                {'>'} Establishing TEE secure environment...
              </p>
              <p className="text-matrix-light-green">
                {'>'} Neural network online. Ready for AI integration.
              </p>
            </div>
          </Terminal>
        </section>

        {/* Evolution Section */}
        <section className="space-y-8">
          <Card>
            <h2 className="text-2xl mb-6 font-code">The Evolution of Digital Life</h2>
            <div className="space-y-4 text-matrix-light-green/90">
              <p className="leading-relaxed">
                Building on DeepWorm&apos;s pioneering work in digital biology, Nema explores the fascinating intersection of biological neural networks and artificial intelligence. Our implementation faithfully reproduces the C. elegans nervous system with 302 neurons and 95 muscles, creating verifiable digital life on-chain.
              </p>
              <p className="leading-relaxed">
                Through advanced TEE (Trusted Execution Environment) technology and blockchain integration, every neural interaction and muscle movement is transparent and verifiable, establishing a new paradigm for autonomous digital organisms.
              </p>
            </div>
          </Card>
        </section>

        {/* Core Technologies */}
        <section className="space-y-8">
          <h2 className="text-2xl font-code text-center">Core Technologies</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <h3 className="text-xl mb-4 font-code">Neural Architecture</h3>
              <ul className="space-y-3 text-matrix-light-green/90">
                <li>• 302 simulated neurons</li>
                <li>• 95 muscle cells</li>
                <li>• Leaky integrate-and-fire model</li>
                <li>• Chemotaxis and nose touch responses</li>
                <li>• Biomimetic neural connections</li>
              </ul>
            </Card>
            <Card>
              <h3 className="text-xl mb-4 font-code">Blockchain Integration</h3>
              <ul className="space-y-3 text-matrix-light-green/90">
                <li>• TEE-powered verification</li>
                <li>• On-chain state management</li>
                <li>• Real-time neural monitoring</li>
                <li>• Transparent attestations</li>
                <li>• Cross-chain compatibility</li>
              </ul>
            </Card>
          </div>
        </section>

        {/* AI Integration */}
        <section className="space-y-8">
          <Card>
            <h2 className="text-2xl mb-6 font-code">AI Integration</h2>
            <div className="space-y-4 text-matrix-light-green/90">
              <p className="leading-relaxed">
                Nema introduces groundbreaking interactions between the simulated C. elegans neural network and large language models. This creates a unique bridge between biological neural architectures and artificial intelligence, enabling new forms of autonomous behavior and decision-making.
              </p>
              <p className="leading-relaxed">
                The project explores how biological neural patterns can inform and enhance AI systems, while maintaining complete transparency through blockchain verification. Every interaction between the worm&apos;s neural network and AI systems is recorded and verifiable on-chain.
              </p>
            </div>
          </Card>
        </section>

        {/* Token Distribution */}
        <section>
          <TokenDistribution />
        </section>
      </div>
    </PageLayout>
  )
}

function FeatureCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="p-6 rounded-lg bg-slate-50 border border-slate-200">
      <h3 className="text-xl font-bold mb-4">{title}</h3>
      <p className="text-slate-600">{description}</p>
    </div>
  )
}

function TechnologyCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="p-8 rounded-lg bg-white shadow-sm">
      <h3 className="text-2xl font-bold mb-4">{title}</h3>
      <p className="text-slate-600">{description}</p>
    </div>
  )
}
