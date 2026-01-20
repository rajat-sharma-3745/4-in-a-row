import { useGame } from '../context/GameContext';
import { useEffect } from 'react';

const Leaderboard = () => {
  const { leaderboard, fetchLeaderboard, username } = useGame();

  useEffect(() => {
    fetchLeaderboard();
    const interval = setInterval(fetchLeaderboard, 30000);
    return () => clearInterval(interval);
  }, []);

  const getMedalEmoji = (index) => {
    if (index === 0) return '🥇';
    if (index === 1) return '🥈';
    if (index === 2) return '🥉';
    return `${index + 1}.`;
  };

  return (
    <div className="card h-full">
      <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
        🏆 Leaderboard
        <span className="text-sm font-normal text-dark-400">Top 10</span>
      </h3>
      
      {leaderboard.length === 0 ? (
        <p className="text-dark-400 text-sm text-center py-8">
          No players yet. Be the first!
        </p>
      ) : (
        <div className="space-y-2">
          {leaderboard.map((player, index) => (
            <div
              key={player.username}
              className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
                player.username === username
                  ? 'bg-primary-600/20 border border-primary-600'
                  : 'bg-dark-700 hover:bg-dark-600'
              }`}
            >
              <div className="shrink-0 w-8 text-center font-bold">
                {getMedalEmoji(index)}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate flex items-center gap-2">
                  {player.username}
                  {player.username === username && (
                    <span className="text-xs bg-primary-600 px-2 py-0.5 rounded-full">You</span>
                  )}
                </div>
                <div className="text-xs text-dark-400">
                  {player.gamesWon} wins • {player.winRate.toFixed(1)}% win rate
                </div>
              </div>

              <div className="shrink-0 text-right">
                <div className="text-sm font-bold text-green-400">{player.gamesWon}</div>
                <div className="text-xs text-dark-400">wins</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Leaderboard;