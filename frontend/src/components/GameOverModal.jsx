import { useGame } from '../context/GameContext';
import Confetti from 'react-confetti';
import { useState, useEffect } from 'react';

const GameOverModal = () => {
  const { gameOver, winner, winReason, username, resetGame, findMatch } = useGame();
  const [windowSize, setWindowSize] = useState({ width: window.innerWidth, height: window.innerHeight });
  
  const didIWin = winner === username;
  const isDraw = winReason === 'draw';

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (!gameOver) return null;

  const handlePlayAgain = () => {
    resetGame();
    findMatch();
  };

  const handleBackToMenu = () => {
    resetGame();
  };

  return (
    <>
      {didIWin && (
        <Confetti
          width={windowSize.width}
          height={windowSize.height}
          recycle={false}
          numberOfPieces={500}
          gravity={0.3}
        />
      )}

      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
        <div className="card max-w-md w-full text-center transform animate-scaleIn">
          <div className="mb-6">
            {isDraw ? (
              <div className="text-8xl">🤝</div>
            ) : didIWin ? (
              <div className="text-8xl animate-bounce">🎉</div>
            ) : (
              <div className="text-8xl">😢</div>
            )}
          </div>

          <div className="mb-6">
            {isDraw ? (
              <>
                <h2 className="text-3xl font-bold mb-2 text-yellow-400">It's a Draw!</h2>
                <p className="text-dark-300">The board is full. Well played!</p>
              </>
            ) : didIWin ? (
              <>
                <h2 className="text-3xl font-bold mb-2 text-green-400">You Win! 🏆</h2>
                <p className="text-dark-300">
                  Congratulations! You defeated {winner === username ? 'your opponent' : winner}
                  {winReason === 'forfeit' && ' by forfeit'}!
                </p>
              </>
            ) : (
              <>
                <h2 className="text-3xl font-bold mb-2 text-red-400">You Lose</h2>
                <p className="text-dark-300">
                  {winner} wins{winReason === 'forfeit' && ' by forfeit'}. Better luck next time!
                </p>
              </>
            )}
          </div>

          {winReason && (
            <div className="mb-6 p-4 bg-dark-700 rounded-lg">
              <p className="text-sm text-dark-400">
                {winReason === 'win' && '4 discs connected!'}
                {winReason === 'draw' && 'Board completely filled'}
                {winReason === 'forfeit' && 'Opponent disconnected'}
              </p>
            </div>
          )}

          <div className="space-y-3">
            <button
              onClick={handlePlayAgain}
              className="btn-primary w-full"
            >
              🎮 Play Again
            </button>
            
            <button
              onClick={handleBackToMenu}
              className="btn-secondary w-full"
            >
              Back to Menu
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default GameOverModal;