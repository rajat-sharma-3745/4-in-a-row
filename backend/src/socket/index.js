import registerConnectionHandlers from './handlers/connection';
import registerMatchmakingHandlers from './handlers/matchmaking';
import registerGameHandlers from './handlers/game';

export function initSocket(io, deps) {
  io.on('connection', (socket) => {
    console.log(`New connection: ${socket.id}`);

    registerConnectionHandlers(io, socket, deps);
    registerMatchmakingHandlers(io, socket, deps);
    registerGameHandlers(io, socket, deps);
  });
};
