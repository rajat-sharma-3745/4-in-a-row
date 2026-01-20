import EVENTS from '../events.js';
import db from '../../services/database.js'


export default function (io, socket, { matchmaking }) {

    socket.on(EVENTS.FIND_MATCH, async ({ username }) => {
        console.log(`${username} looking for match...`);

        await db.logEvent('matchmaking_started', {
            playerId: username,
            timestamp: Date.now()
        });

        const result = matchmaking.joinQueue(username, socket.id);
        console.log(result)
        if (!result.success) {
            socket.emit('matchmaking-error', { error: result.error });
            return;
        }

        if (result.matched) {
            if (result.isBot) {
                console.log('bot ',result.game.id)
                socket.join(result.game.id);
                socket.emit('match-found', {
                    game: result.game,
                    opponent: 'Bot',
                    isBot: true
                });
                await db.logEvent('game_started', {
                    gameId: result.game.id,
                    player1: username,
                    player2: 'Bot',
                    isBot: true,
                    timestamp: Date.now()
                });
            } else {
                const opponentSocketId = result.opponent.socketId;
                const gameRoom = result.game.id;

                socket.join(gameRoom);
                io.sockets.sockets.get(opponentSocketId).join(gameRoom);

                io.to(gameRoom).emit('match-found', {
                    game: result.game,
                    opponent: result.opponent.username,
                    isBot: false
                });

                await db.logEvent('game_started', {
                    gameId: result.game.id,
                    player1: username,
                    player2: result.opponent.username,
                    isBot: false,
                    timestamp: Date.now()
                });
            }
        } else {
            socket.emit('matchmaking-waiting', {
                message: result.message
            });

            setTimeout(() => {
                console.log(matchmaking.isInQueue(username))
                if (matchmaking.isInQueue(username)) {
                    const botResult = matchmaking.matchWithBot(username, socket.id);
                    console.log(botResult)
                    if (botResult) {
                        socket.join(botResult.game.id);
                        socket.emit('match-found', {
                            game: botResult.game,
                            opponent: 'Bot',
                            isBot: true
                        });
                        db.logEvent('game_started', {
                            gameId: botResult.game.id,
                            player1: username,
                            player2: 'Bot',
                            isBot: true,
                            timestamp: Date.now()
                        });
                    }
                }
            }, 10000);
        }
        socket.on(EVENTS.LEAVE_QUEUE, ({ username }) => {
            matchmaking.leaveQueue(username);
            socket.emit('left-queue');
        });
    })
}
