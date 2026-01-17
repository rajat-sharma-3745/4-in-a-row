import db from '../services/database.js'
export const getStats = async (req, res) => {
  try {
    const stats = await db.getGameStats();
    res.json({
      activeGames: gameManager.games.size,
      playersInQueue: matchmaking.waitingPlayers.size,
      ...stats
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
};

export const getLeaderboard = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const leaderboard = await db.getLeaderboard(limit);
    res.json(leaderboard);
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
};

export const getPlayerStats = async (req, res) => {
  try {
    const { username } = req.params;
    const player = await db.getPlayer(username);

    if (!player) {
      return res.status(404).json({ error: 'Player not found' });
    }

    const rank = await db.getPlayerRank(username);
    const recentGames = await db.getPlayerGames(username, 5);

    res.json({
      player,
      rank,
      recentGames
    });
  } catch (error) {
    console.error('Error fetching player:', error);
    res.status(500).json({ error: 'Failed to fetch player' });
  }
};

export const getAnalytics = async (req, res) => {
  try {
    const stats = await db.getGameStats();
    const topWinners = await db.getMostFrequentWinners(5);

    res.json({
      stats,
      topWinners
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
};
