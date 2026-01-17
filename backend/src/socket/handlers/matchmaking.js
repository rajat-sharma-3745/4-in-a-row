import EVENTS from '../events.js';

export default function (io, socket, { matchmaking }) {

    socket.on(EVENTS.FIND_MATCH, ({ username }) => {
        const result = matchmaking.joinQueue(username, socket.id);

        if (!result.success) {
            socket.emit('matchmaking-error', { error: result.error });
            return;
        }

        if (result.matched) {
            if (result.isBot) {
                socket.join(result.game.id);
                socket.emit('match-found', {
                    game: result.game,
                    opponent: 'Bot',
                    isBot: true
                });
            } else {
                const opponentSocketId = result.opponent.socketId;
                const gameRoom = result.game.id;

                socket.join(gameRoom);
                io.to(opponentSocketId).join(gameRoom);

                io.to(gameRoom).emit('match-found', {
                    game: result.game,
                    opponent: result.opponent.username,
                    isBot: false
                });
            }
        } else {
            socket.emit('matchmaking-waiting', {
                message: result.message
            });

            setTimeout(() => {
                if (matchmaking.isInQueue(username)) {
                    const botResult = matchmaking.matchWithBot(username, socket.id);

                    if (botResult) {
                        socket.join(botResult.game.id);
                        socket.emit('match-found', {
                            game: botResult.game,
                            opponent: 'Bot',
                            isBot: true
                        });
                    }
                }
            }, 10000);
        }
        socket.on(EVENTS.LEAVE_QUEUE, ({ username }) => {
            matchmaking.leaveQueue(username);
            socket.emit('left-queue');
        });
    })}
