import { useGame } from '../context/GameContext';
import GameBoard from './GameBoard';
import MoveHistory from './MoveHistory';
import Leaderboard from './Leaderboard';
import GameOverModal from './GameOverModal';

const GameScreen = () => {
  const { username, opponent, myPlayerNumber, gameState, error, resetGame } = useGame();

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <div className="card">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className={`flex items-center gap-3 ${myPlayerNumber === 1 ? 'order-1' : 'order-3'}`}>
                <div className="w-10 h-10 rounded-full bg-linear-to-br from-red-400 to-red-600" />
                <div>
                  <div className="font-bold text-lg">
                    {myPlayerNumber === 1 ? username : opponent}
                    {myPlayerNumber === 1 && <span className="text-xs text-primary-400 ml-2">(You)</span>}
                  </div>
                  <div className="text-xs text-dark-400">Player 1 • Red</div>
                </div>
              </div>

              <div className="bg-dark-700 px-6 py-2 rounded-full font-bold text-primary-400 order-2 md:order-2">
                VS
              </div>

              <div className={`flex items-center gap-3 ${myPlayerNumber === 2 ? 'order-1' : 'order-3'}`}>
                <div className="w-10 h-10 rounded-full bg-linear-to-br from-yellow-400 to-yellow-600" />
                <div>
                  <div className="font-bold text-lg">
                    {myPlayerNumber === 2 ? username : opponent}
                    {myPlayerNumber === 2 && <span className="text-xs text-primary-400 ml-2">(You)</span>}
                    {opponent === 'Bot' && <span className="text-xs text-yellow-400 ml-2">🤖</span>}
                  </div>
                  <div className="text-xs text-dark-400">Player 2 • Yellow</div>
                </div>
              </div>
            </div>

            {error && (
              <div className="mt-4 p-3 bg-red-600/20 border border-red-600 rounded-lg text-red-400 text-sm">
                {error}
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-3 order-2 lg:order-1">
            <MoveHistory />
          </div>

          <div className="lg:col-span-6 order-1 lg:order-2">
            <div className="card flex flex-col items-center">
              <GameBoard />
              
              <button
                onClick={()=>resetGame(gameState?.id,username)}
                className="mt-6 btn-secondary"
              >
                Quit Game
              </button>
            </div>
          </div>

          <div className="lg:col-span-3 order-3">
            <Leaderboard />
          </div>
        </div>
      </div>

      <GameOverModal />
    </div>
  );
};

export default GameScreen;