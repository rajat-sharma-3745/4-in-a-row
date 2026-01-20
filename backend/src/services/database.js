import { PrismaClient } from '@prisma/client'
import { PrismaNeon } from '@prisma/adapter-neon'
// import { neon } from '@neondatabase/serverless'

// const sql = neon(process.env.DATABASE_URL)

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL })

const prisma = new PrismaClient({
  adapter
});

class DatabaseService {
  // Player Methods
  
  async findOrCreatePlayer(username) {
    let player = await prisma.player.findUnique({
      where: { username }
    });

    if (!player) {
      player = await prisma.player.create({
        data: { username }
      });
    }

    return player;
  }

  async getPlayer(username) {
    return await prisma.player.findUnique({
      where: { username }
    });
  }

  async updatePlayerStats(username, result) {
    const player = await this.findOrCreatePlayer(username);

    const updateData = {
      gamesPlayed: { increment: 1 }
    };

    if (result === 'win') {
      updateData.gamesWon = { increment: 1 };
    } else if (result === 'loss') {
      updateData.gamesLost = { increment: 1 };
    } else if (result === 'draw') {
      updateData.gamesDrawn = { increment: 1 };
    }

    const updated = await prisma.player.update({
      where: { username },
      data: updateData
    });

    const winRate = updated.gamesPlayed > 0 
      ? (updated.gamesWon / updated.gamesPlayed) * 100 
      : 0;

    await prisma.player.update({
      where: { username },
      data: { winRate }
    });

    return updated;
  }

  // Game Methods

  async saveGame(gameData) { 
    const player1 = await this.findOrCreatePlayer(gameData.player1);
    const player2 = await this.findOrCreatePlayer(gameData.player2);

    let winnerId = null;
    if (gameData.winner) {
      const winner = await this.getPlayer(gameData.winner);
      winnerId = winner?.id || null;
    }

    const game = await prisma.game.create({
      data: {
        gameId: gameData.gameId,
        player1Id: player1.id,
        player2Id: player2.id,
        winnerId: winnerId,
        winReason: gameData.winReason,
        isBot: gameData.isBot,
        startTime: new Date(gameData.startTime),
        endTime: new Date(gameData.endTime),
        duration: gameData.duration,
        moveCount: gameData.moveCount,
        moveHistory: gameData.moveHistory
      }
    });

    if (gameData.winner) {
      await this.updatePlayerStats(gameData.winner, 'win');
      
      const loser = gameData.player1 === gameData.winner 
        ? gameData.player2 
        : gameData.player1;
      
      if (loser !== 'Bot') {
        await this.updatePlayerStats(loser, 'loss');
      }
    } else if (gameData.winReason === 'draw') {
      await this.updatePlayerStats(gameData.player1, 'draw');
      if (gameData.player2 !== 'Bot') {
        await this.updatePlayerStats(gameData.player2, 'draw');
      }
    }

    return game;
  }

  async getGame(gameId) {
    return await prisma.game.findUnique({
      where: { gameId },
      include: {
        player1: true,
        player2: true
      }
    });
  }

  async getPlayerGames(username, limit = 10) {
    const player = await this.getPlayer(username);
    if (!player) return [];

    return await prisma.game.findMany({
      where: {
        OR: [
          { player1Id: player.id },
          { player2Id: player.id }
        ]
      },
      include: {
        player1: true,
        player2: true
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: limit
    });
  }

  // Leaderboard Methods

  async getLeaderboard(limit = 10) {
    return await prisma.player.findMany({
      where: {
        gamesPlayed: {
          gt: 0
        }
      },
      orderBy: [
        { gamesWon: 'desc' },
        { winRate: 'desc' }
      ],
      take: limit,
      select: {
        username: true,
        gamesPlayed: true,
        gamesWon: true,
        gamesLost: true,
        gamesDrawn: true,
        winRate: true
      }
    });
  }

  async getPlayerRank(username) {
    const player = await this.getPlayer(username);
    if (!player) return null;

    const betterPlayers = await prisma.player.count({
      where: {
        AND: [
          { gamesPlayed: { gt: 0 } },
          {
            OR: [
              { gamesWon: { gt: player.gamesWon } },
              {
                AND: [
                  { gamesWon: player.gamesWon },
                  { winRate: { gt: player.winRate } }
                ]
              }
            ]
          }
        ]
      }
    });

    return betterPlayers + 1; 
  }

  // Analytics Methods

  async logEvent(eventType, data) {
    return await prisma.analytics.create({
      data: {
        eventType,
        gameId: data.gameId || null,
        playerId: data.playerId || null,
        data: data
      }
    });
  }

  async getAnalytics(eventType = null, limit = 100) {
    const where = eventType ? { eventType } : {};

    return await prisma.analytics.findMany({
      where,
      orderBy: {
        createdAt: 'desc'
      },
      take: limit
    });
  }

  async getGameStats() {
    const totalGames = await prisma.game.count();
    const gamesWithBot = await prisma.game.count({
      where: { isBot: true }
    });
    const gamesWithPlayers = totalGames - gamesWithBot;

    const avgDuration = await prisma.game.aggregate({
      _avg: {
        duration: true,
        moveCount: true
      }
    });

    const totalPlayers = await prisma.player.count();
    const activePlayers = await prisma.player.count({
      where: {
        gamesPlayed: { gt: 0 }
      }
    });

    // Games per day (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentGames = await prisma.game.count({
      where: {
        createdAt: { gte: sevenDaysAgo }
      }
    });

    return {
      totalGames,
      gamesWithBot,
      gamesWithPlayers,
      avgDuration: avgDuration._avg.duration || 0,
      avgMoveCount: avgDuration._avg.moveCount || 0,
      totalPlayers,
      activePlayers,
      gamesLast7Days: recentGames
    };
  }

  async getMostFrequentWinners(limit = 10) {
    return await prisma.player.findMany({
      where: {
        gamesWon: { gt: 0 }
      },
      orderBy: {
        gamesWon: 'desc'
      },
      take: limit,
      select: {
        username: true,
        gamesWon: true,
        gamesPlayed: true,
        winRate: true
      }
    });
  }

  // Utility Methods

  async clearAllData() {
    // Only use in development!
    if (process.env.NODE_ENV !== 'development') {
      throw new Error('Cannot clear data in production');
    }

    await prisma.analytics.deleteMany();
    await prisma.game.deleteMany();
    await prisma.player.deleteMany();
  }

  async disconnect() {
    await prisma.$disconnect();
  }
}

export default new DatabaseService();
