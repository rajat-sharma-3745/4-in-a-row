class Matchmaking {
  constructor(gameManager) {
    this.gameManager = gameManager;
    this.waitingPlayers = new Map(); 
  }

  joinQueue(username, socketId) {
    const existingGame = this.gameManager.getGameByPlayer(username);
    if (existingGame && existingGame.status === 'active') {
      return {
        success: false,
        error: 'You already have an active game',
        gameId: existingGame.id
      };
    }

    if (this.waitingPlayers.has(username)) {
      return {
        success: false,
        error: 'You are already in the queue'
      };
    }

    for (const [waitingUsername, waitingPlayer] of this.waitingPlayers.entries()) {
      if (waitingUsername !== username) {
        clearTimeout(waitingPlayer.timeout);
        this.waitingPlayers.delete(waitingUsername);

        const game = this.gameManager.createGame(waitingUsername, username, false);

        return {
          success: true,
          matched: true,
          game: this.gameManager.getGameState(game),
          opponent: {
            username: waitingUsername,
            socketId: waitingPlayer.socketId
          }
        };
      }
    }

    const timeout = setTimeout(() => {
      // this.matchWithBot(username, socketId);
    }, 10000); 

    this.waitingPlayers.set(username, {
      username,
      socketId,
      joinTime: Date.now(),
      timeout
    });

    return {
      success: true,
      matched: false,
      waiting: true,
      message: 'Waiting for opponent... Will match with bot in 10 seconds'
    };
  }

  matchWithBot(username, socketId) {
    const waitingPlayer = this.waitingPlayers.get(username);
    
    if (!waitingPlayer) {
      return; 
    }
   
   const game = this.gameManager.createGame(username, null, true);
   this.waitingPlayers.delete(username);

    return {
      success: true,
      matched: true,
      isBot: true,
      game: this.gameManager.getGameState(game)
    };
  }

  leaveQueue(username) {
    const waitingPlayer = this.waitingPlayers.get(username);
    
    if (waitingPlayer) {
      clearTimeout(waitingPlayer.timeout);
      this.waitingPlayers.delete(username);
      return { success: true };
    }

    return { success: false, error: 'Not in queue' };
  }

  getQueueStatus() {
    return {
      playersWaiting: this.waitingPlayers.size,
      players: Array.from(this.waitingPlayers.keys())
    };
  }

  isInQueue(username) {
    return this.waitingPlayers.has(username);
  }

  getPlayerBySocketId(socketId) {
    for (const [username, player] of this.waitingPlayers.entries()) {
      if (player.socketId === socketId) {
        return username;
      }
    }
    return null;
  }

  handleDisconnect(socketId) {
    const username = this.getPlayerBySocketId(socketId);
    if (username) {
      this.leaveQueue(username);
    }
  }
}

export default Matchmaking;