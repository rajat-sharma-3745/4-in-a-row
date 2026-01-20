import EVENTS from '../events.js';
import db from '../../services/database.js'

export default function (io, socket, { gameManager }) {

    socket.on(EVENTS.MAKE_MOVE, async ({ gameId, username, col }) => {
        console.log(`${username} plays column ${col} in game ${gameId}`);

        await db.logEvent('move_made', {
            gameId,
            playerId: username,
            column: col,
            timestamp: Date.now()
        });

        const result = await gameManager.makeMove(gameId, username, col);

        if (!result.success) {
            socket.emit('move-error', { error: result.error });
            return;
        }

        io.to(gameId).emit(EVENTS.MOVE_MADE, {
            player: username,
            move: result.move,
            board: result.board,
            nextTurn: result.nextTurn,
            gameOver: result.gameOver,
            winner: result.winner,
            winReason: result.winReason
        });

        if (result.gameOver) {
            const gameData = gameManager.getCompletedGameData(gameId);
            await saveCompletedGame(gameData);
            return;
        }

        if (result.isBot && result.nextTurn === 2) {
            setTimeout(async () => {
                try {
                    const botMoveResult = await gameManager.makeBotMove(gameId);

                    if (botMoveResult) {
                        io.to(gameId).emit('move-made', {
                            player: 'Bot',
                            move: botMoveResult.move,
                            board: botMoveResult.board,
                            nextTurn: botMoveResult.nextTurn,
                            gameOver: botMoveResult.gameOver,
                            winner: botMoveResult.winner,
                            winReason: botMoveResult.winReason
                        });

                        if (botMoveResult.gameOver) {
                            const gameData = gameManager.getCompletedGameData(gameId);
                            await saveCompletedGame(gameData);
                        }
                    }
                } catch (error) {
                    console.error('Bot move error:', error);
                }
            }, 600);
        }
    });

    socket.on('get-game-state', ({ gameId }) => {
        const game = gameManager.getGame(gameId);
        if (game) {
            socket.emit(EVENTS.GAME_STATE, {
                game: gameManager.getGameState(game)
            });
        } else {
            socket.emit('error', { message: 'Game not found' });
        }
    });

    socket.on('quit_game', async({ gameId, username }) => {
        const result = gameManager.forfeitGame(gameId, username);
        if (result) {
            io.to(gameId).emit('game_over', { ...result, gameOver: true });
            const gameData = gameManager.getCompletedGameData(gameId);
            await saveCompletedGame(gameData);
        }
    })
};


export async function saveCompletedGame(gameData) {
    try {
        const savedGame = await db.saveGame(gameData);
        console.log(`Game saved to database: ${savedGame.id}`);

        await db.logEvent('game_ended', {
            gameId: gameData.gameId,
            winner: gameData.winner,
            winReason: gameData.winReason,
            duration: gameData.duration,
            moveCount: gameData.moveCount,
            timestamp: Date.now()
        });
    } catch (error) {
        console.error('Error saving game:', error);
    }
}
