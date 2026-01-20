import EVENTS from '../events.js';
import db from '../../services/database.js'
import { saveCompletedGame } from './game.js';


export default function (io, socket, {
  gameManager,
  matchmaking,
  playerSockets,
  socketPlayers
}) {

  socket.on(EVENTS.JOIN, async ({ username }) => {
    if (!username || username.trim() === '') {
      socket.emit('error', { message: 'Username required' });
      return;
    }
    await db.findOrCreatePlayer(username);

    playerSockets.set(username, socket.id);
    socketPlayers.set(socket.id, username);
    console.log(`Player joined: ${username} (${socket.id})`);

    const existingGame = gameManager.getGameByPlayer(username);

    if (existingGame && existingGame.status === 'active') {
      const result = gameManager.reconnectPlayer(existingGame.id, username);

      if (result.success) {
        socket.join(existingGame.id);
        socket.emit('game-reconnected', { game: result.game });
        socket.to(existingGame.id).emit('opponent-reconnected', { username });
      }
    }

    const player = await db.getPlayer(username);
    socket.emit('joined', {
      username,
      stats: player
    });
  });

  socket.on('disconnect', () => {
    const username = socketPlayers.get(socket.id);
    if (!username) return;

    matchmaking.handleDisconnect(socket.id);
    gameManager.disconnectPlayer(username);

    const game = gameManager.getGameByPlayer(username);
    if (game && game.status === 'active') {
      socket.to(game.id).emit(EVENTS.OPPONENT_DISCONNECTED, {
        username,
        message: 'Opponent disconnected. 30s to reconnect.'
      });
    }
    let result;
    let timer = setInterval(async () => {
      result = gameManager.checkAbandonedGames();
      if (result?.status === 'finished') {
        clearInterval(timer)
        io.to(game.id).emit('game_over', { ...result, gameOver: true });
        const gameData = gameManager.getCompletedGameData(game.id);
        await saveCompletedGame(gameData);

      }
    }, 5000);
    setTimeout(() => {
      clearInterval(timer);
      console.log('Interval cleared after 45 seconds');
    }, 45000);

    playerSockets.delete(username);
    socketPlayers.delete(socket.id);
  });
};
