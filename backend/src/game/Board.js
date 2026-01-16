class Board {
    constructor() {
        this.rows = 6;
        this.cols = 7;
        this.grid = this.createEmptyBoard();
    }

    createEmptyBoard() {
        return Array(this.rows).fill(null).map(() => Array(this.cols).fill(null));
    }

    isValidMove(col) {
        if (col < 0 || col >= this.cols) return false;
        return this.grid[0][col] === null;
    }

    dropDisc(col, player) {
        if (!this.isValidMove(col)) {
            return { success: false, message: 'Invalid move' };
        }
        for (let row = this.rows - 1; row >= 0; row--) {
            if (this.grid[row][col] === null) {
                this.grid[row][col] = player;
                return { success: true, row, col, player };
            }
        }

        return { success: false, message: 'Column is full' };
    }

    getValidMoves() {
        const validMoves = [];
        for (let col = 0; col < this.cols; col++) {
            if (this.isValidMove(col)) {
                validMoves.push(col)
            }
        }
        return validMoves;
    }

    isFull() {
        return this.grid[0].every(cell => cell !== null);
    }

    reset() {
        this.grid = this.createEmptyBoard();
    }

    clone() {
        const newBoard = new Board();
        newBoard.grid = this.grid.map(row => [...row]);
        return newBoard;
    }

    getBoard() {
        return this.grid.map(row => [...row])
    }

    getCell(row, col) {
        if (row < 0 || row >= this.rows || col < 0 || col >= this.cols) {
            return null;
        }
        return this.grid[row][col]
    }

}

export default Board