import EVENTS from '../events.js';

export default function (io, socket, {
  gameManager,
  matchmaking,
  playerSockets,
  socketPlayers
}) {

  socket.on(EVENTS.JOIN, ({ username }) => {
    if (!username) {
      socket.emit('error', { message: 'Username required' });
      return;
    }

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

    socket.emit('joined', { username });
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

    playerSockets.delete(username);
    socketPlayers.delete(socket.id);
  });
};
