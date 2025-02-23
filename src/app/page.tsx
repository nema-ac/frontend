import { PageLayout } from '@/components/layout/page-layout';
import { Card } from '@/components/ui/card';
import { TokenDistribution } from '@/components/tokenomics/token-distribution';
import { Terminal } from '@/components/ui/terminal';

export default function Home() {
  return (
    <PageLayout
      title="NEMA"
      subtitle="Enhanced C. elegans Neural Network with Advanced Learning Capabilities"
    >
      <div className="max-w-4xl mx-auto space-y-16">
        <section className="space-y-6">
          <Terminal>
            <div className="space-y-4">
              <p className="text-nema-light">
                {'>'} Initializing C. elegans neural network simulation...
              </p>
              <p className="text-nema-light">
                {'>'} Loading 302 neurons and 95 muscle cells...
              </p>
              <p className="text-nema-light">
                {'>'} Establishing TEE secure environment...
              </p>
              <p className="text-nema-light">
                {'>'} Neural network online. Ready for AI integration.
              </p>
            </div>
          </Terminal>
        </section>

        {/* Evolution Section */}
        <section className="space-y-8">
          <Card>
            <h2 className="text-2xl mb-6 font-code">The Evolution of Digital Life</h2>
            <div className="space-y-4 text-nema-light/90">
              <p className="leading-relaxed">
                Building on DeepWorm&apos;s pioneering work in digital biology, Nema introduces groundbreaking neuroplasticity and neurogenesis capabilities. Our implementation not only faithfully reproduces the C. elegans nervous system but enhances it with the ability to learn and grow through advanced neural plasticity algorithms.
              </p>
              <p className="leading-relaxed">
                Through NemaLink, our innovative neural bridge technology, we enable higher cognitive functions while preserving authentic worm-like behaviors. This creates a unique fusion of biological neural networks and artificial intelligence, establishing new possibilities for autonomous digital organisms.
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
              <ul className="space-y-3 text-nema-light/90">
                <li>• Advanced neuroplasticity algorithms</li>
                <li>• Dynamic neural growth capabilities</li>
                <li>• 302 neurons with adaptive connections</li>
                <li>• NemaLink cognitive bridge system</li>
                <li>• Biomimetic learning patterns</li>
              </ul>
            </Card>
            <Card>
              <h3 className="text-xl mb-4 font-code">AI Integration</h3>
              <ul className="space-y-3 text-nema-light/90">
                <li>• Bidirectional LLM communication</li>
                <li>• Adaptive learning mechanisms</li>
                <li>• Neural bridge technology</li>
                <li>• Dopaminergic feedback systems</li>
                <li>• Intelligent response modulation</li>
              </ul>
            </Card>
          </div>
        </section>

        {/* AI Integration */}
        <section className="space-y-8">
          <Card>
            <h2 className="text-2xl mb-6 font-code">AI Integration</h2>
            <div className="space-y-4 text-nema-light/90">
              <p className="leading-relaxed">
                Through NemaLink, we establish a sophisticated bridge between biological neural patterns and artificial intelligence. This innovative system enables higher cognitive functions while preserving authentic worm behaviors, creating a unique fusion of natural and artificial intelligence.
              </p>
              <p className="leading-relaxed">
                Our implementation includes advanced neuroplasticity algorithms and dynamic neural growth capabilities, allowing the network to learn and adapt over time. Every interaction is carefully modulated through dopaminergic feedback systems, ensuring optimal learning and response patterns.
              </p>
            </div>
          </Card>
        </section>

        {/* Tokenomics Section */}
        <section className="space-y-8">
          <Card>
            <h2 className="text-2xl font-code mb-6">Tokenomics</h2>

            <div className="space-y-8">
              {/* Token Info */}
              <div className="space-y-4">
                <h3 className="text-xl font-code">Token Supply</h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <p className="text-nema-light/90">Total Supply</p>
                    <p className="text-2xl font-code">100,000,000 NEMA</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-nema-light/90">Initial Circulating Supply</p>
                    <p className="text-2xl font-code">70,000,000 NEMA</p>
                  </div>
                </div>
              </div>

              <div className="min-w-[280px] sm:min-w-[320px] sm:px-6">
                <TokenDistribution />
              </div>

              {/* Protocol Info */}
              <div className="space-y-4">
                <h3 className="text-xl font-code">Protocol Details</h3>
                <div className="grid sm:grid-cols-2 gap-4 text-nema-light/90">
                  <div>
                    <p className="font-semibold mb-2">Network</p>
                    <p>Ethereum</p>
                  </div>
                  <div>
                    <p className="font-semibold mb-2">Token Type</p>
                    <p>ERC-20</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </section>
      </div>
    </PageLayout>
  )
}
