import { useState, useEffect } from 'react';

const Terminal = () => {
  const [currentLine, setCurrentLine] = useState(0);
  const [displayText, setDisplayText] = useState('');
  const [showCursor, setShowCursor] = useState(true);

  const terminalLines = [
    '> Initializing NEMA neural network...',
    '> Loading C. elegans connectome data...',
    '> Activating neuroplasticity protocols...',
    '> NEMA system online - 302 neurons active'
  ];

  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentLine < terminalLines.length) {
        const currentText = terminalLines[currentLine];
        if (displayText.length < currentText.length) {
          setDisplayText(currentText.slice(0, displayText.length + 1));
        } else {
          setTimeout(() => {
            setCurrentLine(prev => prev + 1);
            setDisplayText('');
          }, 1500);
        }
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [currentLine, displayText, terminalLines]);

  useEffect(() => {
    const cursorTimer = setInterval(() => {
      setShowCursor(prev => !prev);
    }, 500);

    return () => clearInterval(cursorTimer);
  }, []);

  return (
    <div className="neon-border bg-black p-6 rounded-lg font-mono text-sm">
      <div className="flex items-center mb-4">
        <div className="flex space-x-2">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
        </div>
        <div className="ml-4 text-gray-400">NEMA Terminal v1.0</div>
      </div>
      
      <div className="h-[140px] flex flex-col justify-center">
        <div className="space-y-2">
          {terminalLines.slice(0, currentLine).map((line, index) => (
            <div key={index} className="text-green-400">
              {line}
            </div>
          ))}
          
          {currentLine < terminalLines.length && (
            <div className="text-green-400">
              {displayText}
              {showCursor && <span className="text-cyan-400">█</span>}
            </div>
          )}
          
          {currentLine >= terminalLines.length && (
            <div className="text-cyan-400">
              Ready for neural evolution...
              {showCursor && <span>█</span>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Terminal;