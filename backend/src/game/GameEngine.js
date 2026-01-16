class GameEngine {
    constructor(board) {
        this.board = board;
    }

    // after a move, check winner
    checkWinner(row, col) {
        const player = this.board.getCell(row, col);
        if (!player) return null;

        // Check all directions
        if (
            this.checkDirection(row, col, 0, 1, player) ||  // Horizontal
            this.checkDirection(row, col, 1, 0, player) ||  // Vertical
            this.checkDirection(row, col, 1, 1, player) ||  // Diagonal /
            this.checkDirection(row, col, 1, -1, player)    // Diagonal \
        ) {
            return player;
        }

        return null;


    }

    // check in specific dirction whether 4 disc exists
    // drow and dcol means direction to scan  , for e.g 0,1 means same row, col increases -> horizontal check
    checkDirection(row, col, dRow, dCol, player) {
        let count = 1;

        // Check in positive direction
        count += this.countInDirection(row, col, dRow, dCol, player);

        // Check in negative direction
        count += this.countInDirection(row, col, -dRow, -dCol, player);

        return count >= 4;
    }

    countInDirection(row, col, dRow, dCol, player) {
        let count = 0;
        let r = row + dRow;
        let c = col + dCol;

        while (r >= 0 && r < this.board.rows &&
            c >= 0 && c < this.board.cols &&
            this.board.getCell(r, c) === player) {
            count++;
            r += dRow;
            c += dCol;
        }
        return count;
    }

    isDraw() {
        return this.board.isFull();
    }

    evaluatePosition(player) {
        let score = 0;
        const opponent = player === 1 ? 2 : 1;

        // check all 4 in a row windows
        for (let row = 0; row < this.board.rows; row++) {
            for (let col = 0; col < this.board.cols - 4; col++) { //dont check out of bounds
                score += this.evaluateWindow([
                    this.board.getCell(row, col),
                    this.board.getCell(row, col + 1),
                    this.board.getCell(row, col + 2),
                    this.board.getCell(row, col + 3)
                ], player, opponent)
            }
        }
        for (let col = 0; col < this.board.cols; col++) {
            for (let row = 0; row < this.board.rows - 4; row++) {
                score += this.evaluateWindow([
                    this.board.getCell(row, col),
                    this.board.getCell(row + 1, col),
                    this.board.getCell(row + 2, col),
                    this.board.getCell(row + 3, col)
                ], player, opponent)
            }
        }
        for (let row = 3; row < this.board.rows; row++) {
            for (let col = 0; col <= this.board.cols - 4; col++) {
                score += this.evaluateWindow(
                    [
                        this.board.getCell(row, col),
                        this.board.getCell(row - 1, col + 1),
                        this.board.getCell(row - 2, col + 2),
                        this.board.getCell(row - 3, col + 3)
                    ],
                    player,
                    opponent
                );
            }
        }

        for (let row = 0; row <= this.board.rows - 4; row++) {
            for (let col = 0; col <= this.board.cols - 4; col++) {
                score += this.evaluateWindow(
                    [
                        this.board.getCell(row, col),
                        this.board.getCell(row + 1, col + 1),
                        this.board.getCell(row + 2, col + 2),
                        this.board.getCell(row + 3, col + 3)
                    ],
                    player,
                    opponent
                );
            }
        }

        return score;
    }
    evaluateWindow(window, player, opponent) {
        let score = 0;
        const playerCount = window.filter(cell => cell === player).length;
        const opponentCount = window.filter(cell => cell === opponent).length;
        const emptyCount = window.filter(cell => cell === null).length;

        if (playerCount === 4) {
            score += 100;
        } else if (playerCount === 3 && emptyCount === 1) {
            score += 5;
        } else if (playerCount === 2 && emptyCount === 2) {
            score += 2;
        }
        if (opponentCount === 3 && emptyCount === 1) {
            score -= 4; // Must block
        }
        return score;
    }

    isWinningMove(col, player) {
        const boardCopy = this.board.clone();
        const result = boardCopy.dropDisc(col, player);
        if (!result.success) return false;

        const engine = new GameEngine(boardCopy);
        return engine.checkWinner(result.row, result.col) === player;
    }

    getGameState() {
        return {
            board: this.board.getBoard(),
            validMoves: this.board.getValidMoves(),
            isGameOver: this.board.isFull()
        };
    }
}

export default GameEngine