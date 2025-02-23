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
          <h2 className="text-2xl font-code text-center">Technical Architecture</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <h3 className="text-xl mb-4 font-code">Neural Implementation</h3>
              <div className="space-y-4 text-matrix-light-green/90">
                <p>The neural architecture includes:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>299 simulated neurons with precise connection weights</li>
                  <li>98 muscle cells for movement control</li>
                  <li>8 chemotaxis neurons for chemical response</li>
                  <li>10 nose touch neurons for avoidance behavior</li>
                  <li>21 Motor A type neurons for movement coordination</li>
                </ul>
              </div>
            </Card>
            <Card>
              <h3 className="text-xl mb-4 font-code">Simulation Model</h3>
              <div className="space-y-4 text-matrix-light-green/90">
                <p>The leaky integrate-and-fire model features:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Dynamic state value updates</li>
                  <li>Threshold-based neuron activation</li>
                  <li>Realistic charge leakage simulation</li>
                  <li>Biomimetic muscle control</li>
                  <li>Environmental response mechanisms</li>
                </ul>
              </div>
            </Card>
          </div>
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
