import { useGame } from '../context/GameContext';

const MatchmakingScreen = () => {
  const { username, findMatch, isSearchingMatch, leaveQueue, playerStats } = useGame();

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="card max-w-2xl w-full">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-2">Welcome, {username}!</h2>
          
          {playerStats && (
            <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-dark-700 rounded-lg p-4">
                <div className="text-2xl font-bold text-primary-400">{playerStats.gamesPlayed}</div>
                <div className="text-xs text-dark-400">Games Played</div>
              </div>
              <div className="bg-dark-700 rounded-lg p-4">
                <div className="text-2xl font-bold text-green-400">{playerStats.gamesWon}</div>
                <div className="text-xs text-dark-400">Wins</div>
              </div>
              <div className="bg-dark-700 rounded-lg p-4">
                <div className="text-2xl font-bold text-red-400">{playerStats.gamesLost}</div>
                <div className="text-xs text-dark-400">Losses</div>
              </div>
              <div className="bg-dark-700 rounded-lg p-4">
                <div className="text-2xl font-bold text-yellow-400">{playerStats.winRate.toFixed(1)}%</div>
                <div className="text-xs text-dark-400">Win Rate</div>
              </div>
            </div>
          )}
        </div>

        {!isSearchingMatch ? (
          <div className="space-y-4">
            <button
              onClick={findMatch}
              className="btn-primary w-full text-xl py-4"
            >
              🎮 Find Match
            </button>
            
            <p className="text-center text-sm text-dark-400">
              Click to find an opponent. If no player is found within 10 seconds, you'll play against a competitive bot.
            </p>
          </div>
        ) : (
          <div className="text-center space-y-6">
            <div className="flex justify-center">
              <div className="relative">
                <div className="w-20 h-20 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl">🎮</span>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-xl font-bold mb-2">Finding opponent...</h3>
              <p className="text-dark-400">
                Matching you with a player or bot
              </p>
            </div>

            <button
              onClick={leaveQueue}
              className="btn-secondary"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MatchmakingScreen;