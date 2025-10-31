/**
 * NeuronList component for displaying expandable neuron lists
 * Used for both motor and sensory neurons
 */

import { useState } from 'react';
import { filterNeurons } from '../utils/neuralStateUtils.js';

const NeuronList = ({
  title,
  neurons = {},
  searchTerm = '',
  showActiveOnly = false,
  defaultExpanded = false
}) => {
  const [expanded, setExpanded] = useState(defaultExpanded);

  const filteredNeurons = filterNeurons(neurons, searchTerm, showActiveOnly);
  const neuronCount = Object.keys(neurons).length;
  const filteredCount = Object.keys(filteredNeurons).length;

  return (
    <div className="border-t border-nema-gray pt-4">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center justify-between w-full text-nema-white mb-2 hover:text-nema-cyan transition-colors"
      >
        <span className="text-xs">
          {title} ({neuronCount})
          {filteredCount !== neuronCount && ` - showing ${filteredCount}`}
        </span>
        <span
          className="transform transition-transform duration-200"
          style={{ transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)' }}
        >
          ▼
        </span>
      </button>
      {expanded && (
        <div className="text-xs text-nema-white bg-nema-black/50 p-3 rounded max-h-40 overflow-y-auto space-y-1">
          {Object.keys(filteredNeurons).length > 0 ? (
            Object.entries(filteredNeurons).map(([neuron, value]) => (
              <div key={neuron} className="flex justify-between">
                <span className="text-nema-gray-darker">{neuron}</span>
                <span className="text-nema-white">{value}</span>
              </div>
            ))
          ) : (
            <div className="text-nema-gray-darker text-center">
              No neurons match the current filters
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NeuronList;
