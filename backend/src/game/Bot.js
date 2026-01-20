import GameEngine from "./GameEngine.js";


class Bot {
  constructor(playerNumber) {
    this.playerNumber = playerNumber; 
    this.opponentNumber = playerNumber === 1 ? 2 : 1;
  }

  getBestMove(board) {
    const engine = new GameEngine(board);
    const validMoves = board.getValidMoves();

    if (validMoves.length === 0) return null;

    //Check if bot can win immediately
    for (const col of validMoves) {
      if (engine.isWinningMove(col, this.playerNumber)) {
        return col;
      }
    }

    //Block opponent's winning move
    for (const col of validMoves) {
      if (engine.isWinningMove(col, this.opponentNumber)) {
        return col;
      }
    }

    const bestMove = this.minimax(board, 4, -Infinity, Infinity, true);
    return bestMove.col;
  }

  minimax(board, depth, alpha, beta, isMaximizing) {
    const engine = new GameEngine(board);
    const validMoves = board.getValidMoves();

    // base conditions
    if (depth === 0 || validMoves.length === 0) {
      return {
        col: null,
        score: engine.evaluatePosition(this.playerNumber)
      };
    }

    if (isMaximizing) {
      let maxEval = -Infinity;
      let bestCol = validMoves[0];

      for (const col of validMoves) {
        const boardCopy = board.clone();
        boardCopy.dropDisc(col, this.playerNumber);

        const evaluation = this.minimax(boardCopy, depth - 1, alpha, beta, false);
        
        if (evaluation.score > maxEval) {
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
    
    // Prefer center columns (they offer more winning opportunities)
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
    const thinkingTime = Math.random() * 800 + 100;
    await new Promise(resolve => setTimeout(resolve, thinkingTime));

    return this.getBestMove(board);
  }
}

export default Bot