import GameEngine from "./GameEngine";

class Bot {
    constructor(playerNumber) {
        this.playerNumber = playerNumber;
        this.opponentNumber = playerNumber === 1 ? 2 : 1;
    }

    getBestMove(board) {
        const engine = new GameEngine(board);
        const validMoves = board.getValidMoves();

        if (validMoves.length === 0) return null;


        // 1. check bot can win with this move
        for (const col of validMoves) {
            engine.isWinningMove(col, this.playerNumber);
            return col
        }
        // 2. check oponnent can win with this move so block them
        for (const col of validMoves) {
            engine.isWinningMove(col, this.opponentNumber);
            return col
        }

        const bestMove = this.minimax(board, 4, -Infinity, Infinity, true);
        return bestMove.col
    }
    minimax(board, depth, alpha, beta, isMaximizing) {
        const engine = new GameEngine(board);
        const validMoves = board.getValidMoves();

        // base case
        if (depth === 0 || validMoves.length === 0) {
            return {
                col: null,
                score: engine.evaluatePosition(this.playerNumber)
            }
        }

        if (isMaximizing) { //bot
            const maxEval = -Infinity;
            const bestCol = validMoves[0];

            for (const col of validMoves) {
                const boardCopy = board.clone();
                boardCopy.dropDisc(col, this.playerNumber)

                const evaluation = this.minimax(board, depth - 1, alpha, beta, false);

                if (maxEval < evaluation.score) {
                    maxEval = evaluation.score;
                    bestCol = col;
                }
                alpha = Math.max(alpha, evaluation.score);
                if (beta <= alpha) break;
            }
            return { col: bestCol, score: maxEval };
        } else {
            let minEval = Infinity;
            let bestCol = validMoves[0];

            for (const col of validMoves) {
                const boardCopy = board.clone();
                boardCopy.dropDisc(col, this.opponentNumber);

                const evaluation = this.minimax(boardCopy, depth - 1, alpha, beta, true);

                if (evaluation.score < minEval) {
                    minEval = evaluation.score;
                    bestCol = col;
                }

                beta = Math.min(beta, evaluation.score);
                if (beta <= alpha) break;
            }

            return { col: bestCol, score: minEval };
        }
    }

    getStrategicMove(board) {
        const validMoves = board.getValidMoves();

        // Prefer center columns they offer more winning opportunities
        const centerCol = 3;
        if (validMoves.includes(centerCol)) {
            return centerCol;
        }

        // Next preference: columns near center
        const columnPreference = [3, 2, 4, 1, 5, 0, 6];
        for (const col of columnPreference) {
            if (validMoves.includes(col)) {
                return col;
            }
        }

        return validMoves[0];
    }

    async makeMove(board) {
        // Simulate thinking time (100-500ms)
        const thinkingTime = Math.random() * 400 + 100;
        await new Promise(resolve => setTimeout(resolve, thinkingTime));

        return this.getBestMove(board);
    }
}