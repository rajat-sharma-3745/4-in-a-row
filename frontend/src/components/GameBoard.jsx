import { useGame } from '../context/GameContext';
import { useEffect, useState } from 'react';

const GameBoard = () => {
  const { board, makeMove, isMyTurn, currentTurn, myPlayerNumber, lastMove } = useGame();
  const [hoveredCol, setHoveredCol] = useState(null);
  const [animatingCells, setAnimatingCells] = useState(new Set());

  useEffect(() => {
    if (lastMove) {
      const cellKey = `${lastMove.row}-${lastMove.col}`;
      setAnimatingCells(new Set([cellKey]));
      
      setTimeout(() => {
        setAnimatingCells(new Set());
      }, 500);
    }
  }, [lastMove]);

  const handleColumnClick = (col) => {
    if (isMyTurn && !isColumnFull(col)) {
      makeMove(col);
    }
  };

  const isColumnFull = (col) => {
    return board[0][col] !== null;
  };

  const getDiscClass = (cell) => {
    if (cell === 1) return 'disc disc-player1';
    if (cell === 2) return 'disc disc-player2';
    return '';
  };

  return (
    <div className="flex flex-col items-center">
      <div className="grid grid-cols-7 gap-2 mb-2">
        {[0, 1, 2, 3, 4, 5, 6].map((col) => (
          <div
            key={col}
            className="w-12 h-8 md:w-16 md:h-10 flex items-center justify-center text-dark-400 font-bold"
          >
            {hoveredCol === col && isMyTurn && !isColumnFull(col) && (
              <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full ${
                myPlayerNumber === 1 ? 'bg-red-500/50' : 'bg-yellow-500/50'
              } animate-bounce-slow`} />
            )}
          </div>
        ))}
      </div>

      <div className="bg-primary-700 p-4 rounded-2xl shadow-2xl">
        <div className="grid grid-cols-7 gap-2">
          {board.map((row, rowIndex) =>
            row.map((cell, colIndex) => {
              const cellKey = `${rowIndex}-${colIndex}`;
              const isAnimating = animatingCells.has(cellKey);
              
              return (
                <div
                  key={cellKey}
                  className={`cell w-12 h-12 md:w-16 md:h-16 ${
                    isMyTurn && !isColumnFull(colIndex) ? '' : 'cell-disabled'
                  }`}
                  onClick={() => handleColumnClick(colIndex)}
                  onMouseEnter={() => setHoveredCol(colIndex)}
                  onMouseLeave={() => setHoveredCol(null)}
                >
                  {cell !== null && (
                    <div className={`${getDiscClass(cell)} ${isAnimating ? 'animate-drop' : ''}`} />
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      <div className="mt-4 text-center">
        {isMyTurn ? (
          <div className="flex items-center gap-2 bg-green-600/20 border border-green-600 rounded-lg px-4 py-2">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
            <span className="font-bold text-green-400">Your Turn!</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 bg-dark-700 rounded-lg px-4 py-2">
            <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse-slow" />
            <span className="text-dark-300">Opponent's Turn...</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default GameBoard;