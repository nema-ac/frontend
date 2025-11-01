/**
 * NeuralStatePanel component for displaying neural state sidebar
 * Works with both public and private neural state data
 */

import { useState } from 'react';
import NeuronList from './NeuronList.jsx';
import EmotionalStateVisualization from './EmotionalStateVisualization.jsx';

const NeuralStatePanel = ({
  neuralState = null,
  recentChanges = [],
  isPublicView = false,
  nemaName = 'nema'
}) => {
  const [neuralSearchTerm, setNeuralSearchTerm] = useState('');
  const [showActiveOnly, setShowActiveOnly] = useState(false);

  if (!neuralState) {
    return (
      <div className="text-nema-gray-darker text-center mt-8 text-xs">
        Loading neural state...
      </div>
    );
  }

  // Normalize the neural state structure
  const motorNeurons = neuralState.motorNeurons || neuralState.motor_neurons || {};
  const sensoryNeurons = neuralState.sensoryNeurons || neuralState.sensory_neurons || {};
  const emotionalState = neuralState.emotionalState || neuralState.emotional_state || null;
  const updatedAt = neuralState.updatedAt || neuralState.updated_at;
  const stateCount = neuralState.stateCount;

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric'
    });
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <div className="space-y-4">
      {/* State Info */}
      <div className="text-nema-white text-xs space-y-1">
        {isPublicView && <div><span className="text-nema-gray-darker">Public View</span></div>}
        {nemaName && <div><span className="text-nema-gray-darker">Nema:</span> {nemaName}</div>}
        {stateCount !== undefined && (
          <div><span className="text-nema-gray-darker">State count:</span> {stateCount}</div>
        )}
        {updatedAt && (
          <div>
            <span className="text-nema-gray-darker">Updated:</span> {formatDate(updatedAt)}, {formatTime(updatedAt)}
          </div>
        )}
        <div><span className="text-nema-gray-darker">Total neurons:</span> 302</div>
      </div>

      {/* Emotional State */}
      {emotionalState && (
        <div className="border-t border-nema-gray pt-4">
          <EmotionalStateVisualization
            emotionalState={emotionalState}
            variant="compact"
            className="mb-0"
          />
        </div>
      )}

      {/* Recent Neural Changes */}
      {recentChanges.length > 0 && (
        <div className="border-t border-nema-gray pt-4">
          <div className="text-nema-cyan text-xs mb-2">Recent Changes ({recentChanges.length}):</div>
          <div className="space-y-1 text-xs">
            {recentChanges.slice(0, 10).map((change, idx) => (
              <div key={idx} className="flex justify-between items-center">
                <span className="text-nema-white">{change.neuron}</span>
                <span className="text-nema-gray-darker text-xs">
                  {change.oldValue} → {change.newValue}
                </span>
                <span className={`font-mono ${change.delta > 0 ? 'text-nema-cyan' : 'text-red-400'}`}>
                  {change.delta > 0 ? '+' : ''}{change.delta}
                </span>
              </div>
            ))}
            {recentChanges.length > 10 && (
              <div className="text-nema-gray-darker text-center pt-2">
                +{recentChanges.length - 10} more changes
              </div>
            )}
          </div>
        </div>
      )}

      {/* Search and Filter Controls */}
      <div className="border-t border-nema-gray pt-4">
        <div className="space-y-2">
          <input
            type="text"
            placeholder="Search neurons..."
            value={neuralSearchTerm}
            onChange={(e) => setNeuralSearchTerm(e.target.value)}
            className="w-full bg-textbox-background text-nema-white text-xs px-3 py-2 rounded-lg border border-textbox-border focus:border-nema-cyan outline-none placeholder-nema-gray-darker"
          />
          <label className="flex items-center text-xs text-nema-white">
            <input
              type="checkbox"
              checked={showActiveOnly}
              onChange={(e) => setShowActiveOnly(e.target.checked)}
              className="mr-2 accent-nema-cyan"
            />
            Show active only (non-zero)
          </label>
        </div>
      </div>

      {/* Motor Neurons */}
      <NeuronList
        title={isPublicView ? `Motor Neurons` : `Neurons (302/302)`}
        neurons={motorNeurons}
        searchTerm={neuralSearchTerm}
        showActiveOnly={showActiveOnly}
        defaultExpanded={false}
      />

      {/* Sensory Neurons */}
      <NeuronList
        title={isPublicView ? `Sensory Neurons` : `Muscle Cells (90/90)`}
        neurons={isPublicView ? sensoryNeurons : Object.fromEntries(Object.entries(sensoryNeurons).slice(0, 90))}
        searchTerm={neuralSearchTerm}
        showActiveOnly={showActiveOnly}
        defaultExpanded={false}
      />
    </div>
  );
};

export default NeuralStatePanel;
