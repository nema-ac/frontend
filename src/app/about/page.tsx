import { PageLayout } from '@/components/layout/page-layout'
import { Card } from '@/components/ui/card'

export default function AboutPage() {
  return (
    <PageLayout
      title="About Nema"
      subtitle="The Next Evolution in Digital Biology"
    >
      <div className="max-w-4xl mx-auto space-y-16">
        <section className="space-y-8">
          <Card>
            <h2 className="text-2xl mb-6 font-code">The DeepWorm Foundation</h2>
            <div className="space-y-4 text-matrix-light-green/90">
              <p className="leading-relaxed">
                DeepWorm pioneered the implementation of verifiable digital life on-chain through its groundbreaking C. elegans neural simulation. This foundation combines sophisticated neural network architecture with blockchain technology to create transparent, autonomous digital organisms.
              </p>
              <p className="leading-relaxed">
                The project utilizes a Trusted Execution Environment (TEE) on the Marlin network, ensuring complete transparency and verifiability of all neural processes. Every state change and neural response is recorded on the Hyperliquid EVM testnet, creating an immutable record of the organism&apos;s behavior.
              </p>
            </div>
          </Card>
        </section>

        <section className="space-y-8">
          <Card>
            <h2 className="text-2xl mb-6 font-code">Advanced Neural Plasticity</h2>
            <div className="space-y-4 text-matrix-light-green/90">
              <p className="leading-relaxed">
                Nema introduces sophisticated neuroplasticity through Triplet-Based STDP (Spike-Timing-Dependent Plasticity), enabling genuine learning capabilities. This system allows synapses to strengthen or weaken based on precise timing of neural activity, creating dynamic learning patterns that mirror biological brain development.
              </p>
              <p className="leading-relaxed">
                Our implementation includes homeostatic plasticity mechanisms and dopaminergic modulation, ensuring stable learning while preventing runaway synaptic growth. This creates a self-regulating system capable of continuous adaptation and learning.
              </p>
            </div>
          </Card>
        </section>

        <section className="space-y-8">
          <h2 className="text-2xl font-code text-center">NemaLink Technology</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <h3 className="text-xl mb-4 font-code">Neural Bridge System</h3>
              <div className="space-y-4 text-matrix-light-green/90">
                <p>Key components include:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Bridging neurons for core neural connections</li>
                  <li>Signaling neurons for communication control</li>
                  <li>Dopaminergic feedback mechanisms</li>
                  <li>Adaptive learning pathways</li>
                  <li>Intelligent response modulation</li>
                </ul>
              </div>
            </Card>
            <Card>
              <h3 className="text-xl mb-4 font-code">Cognitive Enhancement</h3>
              <div className="space-y-4 text-matrix-light-green/90">
                <p>Advanced features include:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Bidirectional LLM communication</li>
                  <li>Dynamic neural growth</li>
                  <li>Adaptive synaptic pruning</li>
                  <li>Balanced cognitive development</li>
                  <li>Preserved worm-like behaviors</li>
                </ul>
              </div>
            </Card>
          </div>
        </section>

        <section className="space-y-8">
          <Card>
            <h2 className="text-2xl mb-6 font-code">Enhanced Neural Architecture</h2>
            <div className="space-y-4 text-matrix-light-green/90">
              <p className="leading-relaxed">
                Building on DeepWorm&apos;s foundation, Nema introduces advanced neuroplasticity and neurogenesis capabilities. The system maintains the core C. elegans neural architecture while adding sophisticated learning mechanisms and cognitive bridges through NemaLink technology.
              </p>
              <p className="leading-relaxed">
                Our implementation includes intelligent synaptic pruning and homeostatic plasticity, ensuring optimal network efficiency while preserving critical learned behaviors. This creates a dynamic balance between biological authenticity and enhanced cognitive capabilities.
              </p>
            </div>
          </Card>
        </section>

        <section className="space-y-8">
          <Card>
            <h2 className="text-2xl mb-6 font-code">The Future of Digital Life</h2>
            <div className="space-y-4 text-matrix-light-green/90">
              <p className="leading-relaxed">
                Nema represents the next evolution in digital biology, exploring new frontiers in the integration of biological neural systems and artificial intelligence. By combining DeepWorm&apos;s proven neural simulation with advanced AI capabilities, we&apos;re creating novel forms of autonomous digital life.
              </p>
              <p className="leading-relaxed">
                Our research focuses on understanding how biological neural patterns can enhance AI systems, while maintaining complete transparency through blockchain verification. This unique approach opens new possibilities for autonomous systems, smart contracts, and digital biology.
              </p>
            </div>
          </Card>
        </section>
      </div>
    </PageLayout>
  )
}
