import { useGame } from '../context/GameContext';
import { useEffect, useRef } from 'react';

const MoveHistory = () => {
  const { moveHistory } = useGame();
  const historyEndRef = useRef(null);

  useEffect(() => {
    historyEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [moveHistory]);

  if (moveHistory.length === 0) {
    return (
      <div className="card h-full">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
           Move History
        </h3>
        <p className="text-dark-400 text-sm text-center py-8">
          No moves yet. Game will start soon!
        </p>
      </div>
    );
  }

  return (
    <div className="card h-full flex flex-col">
      <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
         Move History
        <span className="text-sm font-normal text-dark-400">({moveHistory.length} moves)</span>
      </h3>
      
      <div className="flex-1 overflow-y-auto max-h-96 space-y-2 pr-2">
        {moveHistory.map((move, index) => (
          <div
            key={index}
            className="flex items-center gap-3 bg-dark-700 rounded-lg p-3 hover:bg-dark-600 transition-colors"
          >
            <div className="shrink-0 w-8 h-8 rounded-full bg-dark-600 flex items-center justify-center text-sm font-bold text-dark-300">
              {index + 1}
            </div>
            
            <div
              className={`w-6 h-6 rounded-full shrink-0 ${
                move.playerNumber === 1
                  ? 'bg-linear-to-br from-red-400 to-red-600'
                  : 'bg-linear-to-br from-yellow-400 to-yellow-600'
              }`}
            />
            
            <div className="flex-1">
              <div className="font-medium text-sm">{move.player}</div>
              <div className="text-xs text-dark-400">
                Column {move.col + 1} → Row {move.row + 1}
              </div>
            </div>
          </div>
        ))}
        <div ref={historyEndRef} />
      </div>
    </div>
  );
};

export default MoveHistory;