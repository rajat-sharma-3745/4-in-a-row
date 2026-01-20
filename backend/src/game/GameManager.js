import Board from "./Board.js";
import Bot from "./Bot.js";
import GameEngine from "./GameEngine.js";

class GameManager {
    constructor() {
        this.games = new Map();
        this.playerGames = new Map();
    }

    createGame(player1, player2 = null, isBot = false) {
        const gameId = this.generateGameId();
        const board = new Board();
        const engine = new GameEngine(board);

        const game = {
            id: gameId,
            board,
            engine,
            players: {
                player1: {
                    username: player1,
                    playerNumber: 1,
                    connected: true,
                    lastSeen: Date.now()
                },
                player2: player2 ? {
                    username: player2,
                    playerNumber: 2,
                    connected: true,
                    lastSeen: Date.now()
                } : null,
            },
            currentTurn: 1, // Player 1 starts
            status: 'waiting', // waiting, active, finished
            winner: null,
            winReason: null, // win, draw, forfeit
            isBot: isBot,
            bot: isBot ? new Bot(2) : null,
            startTime: null,
            endTime: null,
            moveHistory: []
        }

        if (isBot) {
            game.players.player2 = {
                username: 'Bot',
                playerNumber: 2,
                connected: true,
                lastSeen: Date.now()
            };
            game.status = 'active';
            game.startTime = Date.now();
        } else if (player2) {
            game.status = 'active';
            game.startTime = Date.now();
        }

        this.games.set(gameId, game);
        this.playerGames.set(player1, gameId);
        if (player2 && !isBot) {
            this.playerGames.set(player2, gameId);
        }
        return game;
    }

    async makeMove(gameId, username, col) {
        const game = this.games.get(gameId);

        if (!game) {
            return { success: false, error: 'Game not found' };
        }

        if (game.status !== 'active') {
            return { success: false, error: 'Game is not active' };
        }

        const player = game.players.player1.username === username ? game.players.player1 : game.players.player2;

        if (!player) {
            return { success: false, error: 'Player not in this game' }
        }
        if (player.playerNumber !== game.currentTurn) {
            return { success: false, error: 'Not your turn' };
        }

        const moveResult = game.board.dropDisc(col, player.playerNumber);

        if (!moveResult.success) return { success: false, error: moveResult.message };

        game.moveHistory.push({
            player: username,
            playerNumber: player.playerNumber,
            col: col,
            row: moveResult.row,
            timestamp: Date.now()
        });

        const winner = game.engine.checkWinner(moveResult.row, moveResult.col);

        if (winner) {
            game.status = 'finished';
            game.winner = winner === 1 ? game.players.player1.username : game.players.player2.username;
            game.winReason = 'win';
            game.endTime = Date.now();

            return {
                success: true,
                move: moveResult,
                gameOver: true,
                winner: game.winner,
                winReason: 'win',
                board: game.board.getBoard()
            };
        }

        if (game.engine.isDraw()) {
            game.status = 'finished';
            game.winReason = 'draw';
            game.endTime = Date.now();

            return {
                success: true,
                move: moveResult,
                gameOver: true,
                winner: null,
                winReason: 'draw',
                board: game.board.getBoard()
            };
        }

        game.currentTurn = game.currentTurn === 1 ? 2 : 1;

        return {
            success: true,
            move: moveResult,
            gameOver: false,
            board: game.board.getBoard(),
            nextTurn: game.currentTurn,
            isBot: game.isBot
        };
    }

    async makeBotMove(gameId) {
        const game = this.games.get(gameId);

        if (!game || !game.isBot) {
            return null;
        }

        const col = await game.bot.makeMove(game.board);
        const moveResult = game.board.dropDisc(col, 2);

        if (!moveResult.success) {
            return null;
        }

        game.moveHistory.push({
            player: 'Bot',
            playerNumber: 2,
            col: col,
            row: moveResult.row,
            timestamp: Date.now()
        });

        const winner = game.engine.checkWinner(moveResult.row, moveResult.col);

        if (winner) {
            game.status = 'finished';
            game.winner = 'Bot';
            game.winReason = 'win';
            game.endTime = Date.now();

            return {
                move: moveResult,
                gameOver: true,
                winner: 'Bot',
                winReason: 'win',
                board: game.board.getBoard()
            };
        }

        if (game.engine.isDraw()) {
            game.status = 'finished';
            game.winReason = 'draw';
            game.endTime = Date.now();

            return {
                move: moveResult,
                gameOver: true,
                winner: null,
                winReason: 'draw',
                board: game.board.getBoard()
            };
        }

        game.currentTurn = 1;

        return {
            move: moveResult,
            gameOver: false,
            board: game.board.getBoard(),
            nextTurn: game.currentTurn
        };
    }


    getGame(gameId) {
        return this.games.get(gameId);
    }

    getGameByPlayer(username) {
        const gameId = this.playerGames.get(username);
        return gameId ? this.games.get(gameId) : null;
    }

    reconnectPlayer(gameId, username) {
        const game = this.games.get(gameId);

        if (!game) {
            return { success: false, error: 'Game not found' };
        }

        const player = game.players.player1.username === username ? game.players.player1 : game.players.player2;

        if (!player) {
            return { success: false, error: 'Player not in this game' };
        }

        player.connected = true;
        player.lastSeen = Date.now();

        return {
            success: true,
            game: this.getGameState(game)
        };
    }

    disconnectPlayer(username) {
        const gameId = this.playerGames.get(username);
        if (!gameId) return;

        const game = this.games.get(gameId);
        if (!game) return;

        const player = game.players.player1.username === username ? game.players.player1 : game.players.player2;

        if (player) {
            player.connected = false;
            player.lastSeen = Date.now();
        }
    }

    checkAbandonedGames() {
        const now = Date.now();
        const timeout = 30000;

        for (const [gameId, game] of this.games.entries()) {
            if (game.status !== 'active') continue;

            if (!game.players.player1.connected && (now - game.players.player1.lastSeen) > timeout) {
                this.forfeitGame(gameId, game.players.player1.username);
            }

            if (!game.isBot && game.players.player2 && !game.players.player2.connected && (now - game.players.player2.lastSeen) > timeout) {
                this.forfeitGame(gameId, game.players.player2.username);
            }
        }
    }

    forfeitGame(gameId, username) {
        const game = this.games.get(gameId);
        if (!game || game.status !== 'active') return null;

        game.status = 'finished';
        game.winReason = 'forfeit';
        game.endTime = Date.now();

        if (game.players.player1.username === username) {
            game.winner = game.players.player2.username;
        } else {
            game.winner = game.players.player1.username;
        }

        return game;
    }

    getGameState(game) { //for client
        return {
            id: game.id,
            board: game.board.getBoard(),
            currentTurn: game.currentTurn,
            status: game.status,
            players: {
                player1: {
                    username: game.players.player1.username,
                    playerNumber: 1,
                    connected: game.players.player1.connected
                },
                player2: game.players.player2 ? {
                    username: game.players.player2.username,
                    playerNumber: 2,
                    connected: game.players.player2.connected
                } : null
            },
            isBot: game.isBot,
            winner: game.winner,
            winReason: game.winReason,
            validMoves: game.board.getValidMoves()
        };
    }

    getCompletedGameData(gameId) {
        const game = this.games.get(gameId);
        if (!game || game.status !== 'finished') return null;

        return {
            gameId: game.id,
            player1: game.players.player1.username,
            player2: game.players.player2.username,
            winner: game.winner,
            winReason: game.winReason,
            isBot: game.isBot,
            startTime: game.startTime,
            endTime: game.endTime,
            duration: game.endTime - game.startTime,
            moveCount: game.moveHistory.length,
            moveHistory: game.moveHistory
        };
    }

    cleanupFinishedGames() {
        const now = Date.now();
        const keepTime = 300000;

        for (const [gameId, game] of this.games.entries()) {
            if (game.status === 'finished' && (now - game.endTime) > keepTime) {
                this.games.delete(gameId);
                this.playerGames.delete(game.players.player1.username);
                if (game.players.player2 && !game.isBot) {
                    this.playerGames.delete(game.players.player2.username);
                }
            }
        }
    }
    generateGameId() {
        return `game_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
}

export default GameManager