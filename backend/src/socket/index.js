import registerConnectionHandlers from './handlers/connection.js';
import registerMatchmakingHandlers from './handlers/matchmaking.js';
import registerGameHandlers from './handlers/game.js';

export function initSocket(io, deps) {
  io.on('connection', (socket) => {
    console.log(`New connection: ${socket.id}`);

    registerConnectionHandlers(io, socket, deps);
    registerMatchmakingHandlers(io, socket, deps);
    registerGameHandlers(io, socket, deps);
  });
};
