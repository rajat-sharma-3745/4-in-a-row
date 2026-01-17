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

        if (result.botMove) {
            setTimeout(async () => {
                io.to(gameId).emit(EVENTS.MOVE_MADE, {
                    player: 'Bot',
                    move: result.botMove.move,
                    board: result.botMove.board,
                    nextTurn: result.botMove.nextTurn,
                    gameOver: result.botMove.gameOver,
                    winner: result.botMove.winner,
                    winReason: result.botMove.winReason
                });

                if (result.botMove.gameOver) {
                    const gameData = gameManager.getCompletedGameData(gameId);
                    await saveCompletedGame(gameData);
                }
            }, 100);
        }

        if (result.gameOver && !result.botMove) {
            const gameData = gameManager.getCompletedGameData(gameId);
            await saveCompletedGame(gameData);
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
};


async function saveCompletedGame(gameData) {
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
