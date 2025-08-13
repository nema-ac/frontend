import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

const InteractiveNeuralNetwork = () => {
  const svgRef = useRef();
  const [selectedNeuron, setSelectedNeuron] = useState(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [networkMode, setNetworkMode] = useState('normal'); // 'normal', 'learning', 'evolving'
  const [neuronCount, setNeuronCount] = useState(30);
  const [activityLog, setActivityLog] = useState([
    'Neural network initialized - 30 neurons active',
    'Ready for interaction...'
  ]);

  // Helper function to add log messages
  const addLogMessage = (message) => {
    const timestamp = new Date().toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    });
    setActivityLog(prev => [
      ...prev.slice(-6), // Keep only last 6 messages
      `${timestamp} - ${message}`
    ]);
  };

  // Generate C. elegans-inspired neural network data
  const generateNeuralData = () => {
    const neurons = [];
    const connections = [];

    // Neural types based on C. elegans
    const neuronTypes = [
      { type: 'sensory', color: '#00FFFF', count: 8 },
      { type: 'interneuron', color: '#9659D4', count: 12 },
      { type: 'motor', color: '#00FF88', count: 6 },
      { type: 'muscle', color: '#FFD700', count: 4 }
    ];

    let neuronId = 0;
    
    // Create neurons
    neuronTypes.forEach(({ type, color, count }) => {
      for (let i = 0; i < count; i++) {
        neurons.push({
          id: neuronId++,
          type,
          color,
          x: Math.random() * 400 + 50,
          y: Math.random() * 300 + 50,
          activity: 0,
          connections: 0,
          name: `${type.toUpperCase()}${i + 1}`
        });
      }
    });

    // Create realistic connections (sensory -> interneuron -> motor -> muscle)
    neurons.forEach((source, i) => {
      const connectionCount = Math.floor(Math.random() * 3) + 1;
      
      for (let j = 0; j < connectionCount; j++) {
        let possibleTargets = [];
        
        // Create biologically plausible connections
        if (source.type === 'sensory') {
          possibleTargets = neurons.filter(n => n.type === 'interneuron');
        } else if (source.type === 'interneuron') {
          if (Math.random() > 0.5) {
            possibleTargets = neurons.filter(n => n.type === 'motor');
          } else {
            possibleTargets = neurons.filter(n => n.type === 'interneuron' && n.id !== source.id);
          }
        } else if (source.type === 'motor') {
          possibleTargets = neurons.filter(n => n.type === 'muscle');
        }
        
        // Select a random target from possible targets
        if (possibleTargets.length > 0) {
          const target = possibleTargets[Math.floor(Math.random() * possibleTargets.length)];
          
          // Check if connection already exists
          const connectionExists = connections.some(c => 
            (c.source === source.id && c.target === target.id) ||
            (c.source === target.id && c.target === source.id)
          );
          
          if (!connectionExists) {
            connections.push({
              source: source.id,
              target: target.id,
              strength: Math.random() * 0.8 + 0.2,
              type: Math.random() > 0.7 ? 'gap' : 'chemical'
            });
            
            source.connections++;
            target.connections++;
          }
        }
      }
    });

    return { neurons, connections };
  };

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const width = 500;
    const height = 400;
    const { neurons, connections } = generateNeuralData();

    const g = svg.append('g');

    // Set up zoom and pan with default zoom level
    const zoom = d3.zoom()
      .scaleExtent([0.5, 3])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });

    svg.call(zoom);
    
    // Apply default zoom level (1.5x zoom)
    svg.call(zoom.transform, d3.zoomIdentity.scale(1.5).translate(width / 6, height / 6));

    // Create force simulation
    const simulation = d3.forceSimulation(neurons)
      .force('link', d3.forceLink(connections).id(d => d.id).distance(60))
      .force('charge', d3.forceManyBody().strength(-100))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(15));

    // Create connections
    const links = g.append('g')
      .selectAll('line')
      .data(connections)
      .enter()
      .append('line')
      .attr('stroke', d => d.type === 'gap' ? '#EDEDED' : '#00FFFF')
      .attr('stroke-width', d => Math.sqrt(d.strength * 3))
      .attr('stroke-dasharray', d => d.type === 'gap' ? '3,3' : null)
      .attr('opacity', 0.6);

    // Create neurons
    const nodes = g.append('g')
      .selectAll('circle')
      .data(neurons)
      .enter()
      .append('circle')
      .attr('r', d => Math.sqrt(d.connections * 2) + 5)
      .attr('fill', d => d.color)
      .attr('stroke', '#000')
      .attr('stroke-width', 1)
      .attr('opacity', 0.8)
      .style('cursor', 'pointer')
      .call(d3.drag()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended))
      .on('mouseover', (event, d) => {
        setSelectedNeuron(d);
        d3.select(event.target)
          .attr('stroke', '#FFFFFF')
          .attr('stroke-width', 3);
      })
      .on('mouseout', (event, d) => {
        d3.select(event.target)
          .attr('stroke', '#000')
          .attr('stroke-width', 1);
      })
      .on('click', (event, d) => {
        if (networkMode === 'normal') {
          simulateActivity(d.id);
        } else if (networkMode === 'learning') {
          simulateLearning(d.id);
        } else if (networkMode === 'evolving') {
          simulateEvolution(d.id);
        }
      });

    // Add labels
    const labels = g.append('g')
      .selectAll('text')
      .data(neurons)
      .enter()
      .append('text')
      .text(d => d.name)
      .attr('font-size', '10px')
      .attr('fill', '#EDEDED')
      .attr('text-anchor', 'middle')
      .attr('dy', '0.3em')
      .style('pointer-events', 'none');

    // Simulation tick
    simulation.on('tick', () => {
      links
        .attr('x1', d => d.source.x)
        .attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x)
        .attr('y2', d => d.target.y);

      nodes
        .attr('cx', d => d.x)
        .attr('cy', d => d.y);

      labels
        .attr('x', d => d.x)
        .attr('y', d => d.y);
    });

    // Drag functions
    function dragstarted(event, d) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(event, d) {
      d.fx = event.x;
      d.fy = event.y;
    }

    function dragended(event, d) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }

    // Enhanced activity simulation with dramatic effects
    function simulateActivity(startId) {
      if (isSimulating) return;
      setIsSimulating(true);

      const startNeuron = neurons.find(n => n.id === startId);
      addLogMessage(`Signal initiated at ${startNeuron.name} (${startNeuron.type})`);

      const propagateSignal = (currentId, visited = new Set(), delay = 0) => {
        if (visited.has(currentId)) return;
        visited.add(currentId);

        setTimeout(() => {
          // Dramatic neuron activation with glow effect
          nodes.filter(d => d.id === currentId)
            .transition()
            .duration(150)
            .attr('r', d => (Math.sqrt(d.connections * 2) + 5) * 2)
            .attr('fill', '#FFFFFF')
            .attr('stroke', '#00FFFF')
            .attr('stroke-width', 4)
            .attr('opacity', 1)
            .transition()
            .duration(400)
            .attr('r', d => Math.sqrt(d.connections * 2) + 5)
            .attr('fill', d => d.color)
            .attr('stroke', '#000')
            .attr('stroke-width', 1)
            .attr('opacity', 0.8);

          // Dramatic connection highlighting with wave effect
          const connectedLinks = connections.filter(c => c.source === currentId);
          connectedLinks.forEach((link, i) => {
            links.filter(l => l.source === link.source && l.target === link.target)
              .transition()
              .duration(200)
              .attr('stroke', '#FFFFFF')
              .attr('stroke-width', d => Math.sqrt(d.strength * 3) * 4)
              .attr('opacity', 1)
              .transition()
              .duration(400)
              .attr('stroke', d => d.type === 'gap' ? '#EDEDED' : '#00FFFF')
              .attr('stroke-width', d => Math.sqrt(d.strength * 3))
              .attr('opacity', 0.6);

            propagateSignal(link.target, visited, (i + 1) * 80);
          });

          if (delay > 800) {
            setTimeout(() => {
              addLogMessage(`Signal propagation complete - ${visited.size} neurons activated`);
              setIsSimulating(false);
            }, 500);
          }
        }, delay);
      };

      propagateSignal(startId);
    }

    // Learning simulation - shows plasticity
    function simulateLearning(startId) {
      if (isSimulating) return;
      setIsSimulating(true);

      const startNeuron = neurons.find(n => n.id === startId);
      addLogMessage(`Neuroplasticity activated at ${startNeuron.name} - strengthening synapses`);

      // Strengthen connections through repeated activation
      const learningCycles = 3;
      let cycle = 0;

      const runLearningCycle = () => {
        cycle++;
        addLogMessage(`Learning cycle ${cycle}/3 - adapting neural pathways`);
        
        // Flash the network with learning colors
        nodes.transition()
          .duration(300)
          .attr('fill', '#9659D4')
          .attr('stroke', '#FFFFFF')
          .attr('stroke-width', 2)
          .transition()
          .duration(300)
          .attr('fill', d => d.color)
          .attr('stroke', '#000')
          .attr('stroke-width', 1);

        // Strengthen connections visually
        links.transition()
          .duration(300)
          .attr('stroke-width', d => Math.sqrt(d.strength * 3) * 1.5)
          .transition()
          .duration(300)
          .attr('stroke-width', d => Math.sqrt(d.strength * 3));

        if (cycle < learningCycles) {
          setTimeout(runLearningCycle, 800);
        } else {
          // Show permanent learning effect
          const targetConnections = connections.filter(c => c.source === startId);
          targetConnections.forEach(conn => {
            links.filter(l => l.source === conn.source && l.target === conn.target)
              .attr('stroke-width', d => Math.sqrt(d.strength * 3) * 1.3)
              .attr('opacity', 0.9);
          });
          
          addLogMessage(`Synaptic plasticity complete - connections strengthened`);
          setTimeout(() => setIsSimulating(false), 500);
        }
      };

      runLearningCycle();
    }

    // Evolution simulation - shows neurogenesis
    function simulateEvolution(startId) {
      if (isSimulating) return;
      setIsSimulating(true);

      const startNeuron = neurons.find(n => n.id === startId);
      addLogMessage(`Neurogenesis triggered at ${startNeuron.name} - generating new neurons`);

      // Add new neurons dynamically
      const newNeurons = [];
      const evolutionSteps = 3;
      
      for (let i = 0; i < evolutionSteps; i++) {
        setTimeout(() => {
          const newNeuron = {
            id: neurons.length + i,
            type: 'interneuron',
            color: '#FF6B6B',
            x: Math.random() * 400 + 50,
            y: Math.random() * 300 + 50,
            activity: 0,
            connections: 0,
            name: `NEW${i + 1}`
          };

          // Add to simulation
          neurons.push(newNeuron);
          simulation.nodes(neurons);
          setNeuronCount(neurons.length);
          addLogMessage(`New neuron ${newNeuron.name} generated - network expanding`);

          // Visual birth effect
          const newNode = g.select('g').selectAll('circle')
            .data(neurons)
            .enter()
            .append('circle')
            .attr('r', 0)
            .attr('fill', '#FF6B6B')
            .attr('stroke', '#FFFFFF')
            .attr('stroke-width', 3)
            .attr('opacity', 0)
            .attr('cx', newNeuron.x)
            .attr('cy', newNeuron.y)
            .style('cursor', 'pointer');

          newNode.transition()
            .duration(500)
            .attr('r', 8)
            .attr('opacity', 1)
            .transition()
            .duration(500)
            .attr('fill', '#9659D4')
            .attr('stroke', '#000')
            .attr('stroke-width', 1);

          // Connect to nearby neurons with dramatic effect
          const nearbyNeurons = neurons.filter(n => 
            n.id !== newNeuron.id && 
            Math.hypot(n.x - newNeuron.x, n.y - newNeuron.y) < 100
          ).slice(0, 2);

          nearbyNeurons.forEach(target => {
            const newConnection = {
              source: newNeuron.id,
              target: target.id,
              strength: 0.8,
              type: 'chemical'
            };
            
            connections.push(newConnection);
            
            // Animate new connection
            const newLink = g.append('line')
              .attr('x1', newNeuron.x)
              .attr('y1', newNeuron.y)
              .attr('x2', newNeuron.x)
              .attr('y2', newNeuron.y)
              .attr('stroke', '#FF6B6B')
              .attr('stroke-width', 4)
              .attr('opacity', 0);

            newLink.transition()
              .duration(500)
              .attr('x2', target.x)
              .attr('y2', target.y)
              .attr('opacity', 1)
              .transition()
              .duration(300)
              .attr('stroke', '#00FFFF')
              .attr('stroke-width', 2)
              .attr('opacity', 0.6);
          });

          if (i === evolutionSteps - 1) {
            setTimeout(() => {
              addLogMessage(`Neurogenesis complete - ${evolutionSteps} new neurons integrated`);
              setIsSimulating(false);
            }, 1000);
          }
        }, i * 800);
      }
    }

    // Auto-simulation
    const autoSimulate = () => {
      if (!isSimulating) {
        const randomNeuron = neurons[Math.floor(Math.random() * neurons.length)];
        simulateActivity(randomNeuron.id);
      }
    };

    const interval = setInterval(autoSimulate, 5000);

    return () => {
      clearInterval(interval);
      simulation.stop();
    };
  }, []);

  return (
    <div className="rounded-lg bg-gradient-to-br from-purple-900/20 to-black/60 border border-cyan-400/50 p-6">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Visualization */}
        <div className="flex-1">
          <h3 className="text-xl font-bold text-cyan-400 mb-4">Interactive Neural Network</h3>
          
          {/* Mode Controls */}
          <div className="flex flex-wrap gap-2 mb-4">
            <button
              onClick={() => {
                setNetworkMode('normal');
                addLogMessage('Mode: Signal Flow - Click neurons to propagate signals');
              }}
              className={`px-3 py-1 text-sm rounded border transition-colors ${
                networkMode === 'normal' 
                  ? 'bg-cyan-400 text-black border-cyan-400' 
                  : 'bg-black/50 text-gray-300 border-gray-600 hover:border-cyan-400'
              }`}
            >
              Signal Flow
            </button>
            <button
              onClick={() => {
                setNetworkMode('learning');
                addLogMessage('Mode: Neuroplasticity - Click neurons to strengthen synapses');
              }}
              className={`px-3 py-1 text-sm rounded border transition-colors ${
                networkMode === 'learning' 
                  ? 'bg-purple-400 text-black border-purple-400' 
                  : 'bg-black/50 text-gray-300 border-gray-600 hover:border-purple-400'
              }`}
            >
              Plasticity
            </button>
            <button
              onClick={() => {
                setNetworkMode('evolving');
                addLogMessage('Mode: Neurogenesis - Click neurons to generate new ones');
              }}
              className={`px-3 py-1 text-sm rounded border transition-colors ${
                networkMode === 'evolving' 
                  ? 'bg-red-400 text-black border-red-400' 
                  : 'bg-black/50 text-gray-300 border-gray-600 hover:border-red-400'
              }`}
            >
              Evolution
            </button>
          </div>
          
          <div className="text-sm text-gray-400 mb-4 p-3 bg-black/30 rounded border border-gray-600">
            {networkMode === 'normal' && (
              <div>
                <div className="text-cyan-400 font-bold mb-1">Signal Flow Mode</div>
                <div>Click neurons to see signal propagation through the network. Watch neural activity cascade through biological pathways from sensory to motor neurons.</div>
              </div>
            )}
            {networkMode === 'learning' && (
              <div>
                <div className="text-purple-400 font-bold mb-1">Neuroplasticity Mode</div>
                <div>Click neurons to strengthen connections through repeated activation. Experience NEMA's learning capabilities as synapses adapt and strengthen over time.</div>
              </div>
            )}
            {networkMode === 'evolving' && (
              <div>
                <div className="text-red-400 font-bold mb-1">Evolution Mode</div>
                <div>Click neurons to trigger neurogenesis and network growth. Witness NEMA's revolutionary ability to generate new neurons and expand beyond the original 302-neuron limit.</div>
              </div>
            )}
          </div>
          
          <div className="bg-black/50 rounded border border-cyan-400/30 overflow-hidden">
            <svg
              ref={svgRef}
              width="500"
              height="400"
              className="w-full h-auto max-w-full"
              style={{ background: 'radial-gradient(circle at center, #1a1a2e 0%, #0f0f23 100%)' }}
            />
          </div>
        </div>

        {/* Info Panel */}
        <div className="lg:w-64">
          <div className="bg-black/50 rounded border border-cyan-400/30 p-4">
            <h4 className="text-lg font-bold text-cyan-400 mb-3">NEMA Foundation</h4>
            <p className="text-sm text-gray-300 mb-4">
              This represents the C. elegans neural network that NEMA builds upon, enhanced with neuroplasticity and neurogenesis capabilities for true digital evolution.
            </p>
            
            <h4 className="text-lg font-bold text-cyan-400 mb-3">Neural Types</h4>
            
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-cyan-400"></div>
                <span className="text-gray-300">Sensory</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{backgroundColor: '#9659D4'}}></div>
                <span className="text-gray-300">Interneuron</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{backgroundColor: '#00FF88'}}></div>
                <span className="text-gray-300">Motor</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{backgroundColor: '#FFD700'}}></div>
                <span className="text-gray-300">Muscle</span>
              </div>
            </div>

            {selectedNeuron && (
              <div className="mt-4 pt-4 border-t border-gray-600">
                <h5 className="font-bold text-cyan-400 mb-2">Selected Neuron</h5>
                <div className="text-sm text-gray-300">
                  <p><strong>Name:</strong> {selectedNeuron.name}</p>
                  <p><strong>Type:</strong> {selectedNeuron.type}</p>
                  <p><strong>Connections:</strong> {selectedNeuron.connections}</p>
                </div>
              </div>
            )}

            <div className="mt-4 pt-4 border-t border-gray-600">
              <h5 className="font-bold text-cyan-400 mb-2">Activity Log</h5>
              <div className="bg-black/70 rounded p-2 text-xs font-mono h-48 overflow-y-auto border border-gray-600">
                {activityLog.map((log, index) => (
                  <div 
                    key={index} 
                    className={`text-gray-300 leading-tight ${index === activityLog.length - 1 ? 'text-cyan-400' : ''}`}
                  >
                    {log}
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-600">
              <p className="text-xs text-gray-400">
                Solid lines: Chemical synapses<br/>
                Dashed lines: Gap junctions<br/>
                Node size: Connection count
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InteractiveNeuralNetwork;