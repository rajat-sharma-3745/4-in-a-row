import Board from './Board.js';
import GameEngine from './GameEngine.js';
import BotAI from './Bot.js';

function displayBoard(board) {
  console.log('\n  0 1 2 3 4 5 6');
  console.log('  -------------');
  const grid = board.getBoard();
  grid.forEach((row, idx) => {
    const rowStr = row.map(cell => {
      if (cell === null) return '.';
      return cell === 1 ? 'X' : 'O';
    }).join(' ');
    console.log(`${idx}|${rowStr}|`);
  });
  console.log('  -------------\n');
}

console.log('=== TEST 1: Basic Board Operations ===');
const board1 = new Board();
console.log('Empty board created');
displayBoard(board1);

console.log('Dropping disc for Player 1 in column 3');
const move1 = board1.dropDisc(3, 1);
console.log('Result:', move1);
displayBoard(board1);

console.log('Dropping disc for Player 2 in column 3');
const move2 = board1.dropDisc(3, 2);
console.log('Result:', move2);
displayBoard(board1);

console.log('Valid moves:', board1.getValidMoves());

console.log('\n=== TEST 2: Horizontal Win Detection ===');
const board2 = new Board();
board2.dropDisc(0, 1);
board2.dropDisc(1, 1);
board2.dropDisc(2, 1);
const lastMove = board2.dropDisc(3, 1);
displayBoard(board2);

const engine2 = new GameEngine(board2);
const winner = engine2.checkWinner(lastMove.row, lastMove.col);
console.log('Winner:', winner === 1 ? 'Player 1' : 'No winner');

console.log('\n=== TEST 3: Bot AI Strategic Play ===');
const board3 = new Board();
const bot = new BotAI(2); 

console.log('Player 1 makes three in a row (should be blocked by bot)');
board3.dropDisc(0, 1);
board3.dropDisc(1, 1);
board3.dropDisc(2, 1);
displayBoard(board3);

console.log('Bot analyzing...');
const botMove = bot.getBestMove(board3);
console.log('Bot chooses column:', botMove);
board3.dropDisc(botMove, 2);
displayBoard(board3);
console.log('✓ Bot should have blocked at column 3');

console.log('\n=== TEST 4: Bot Takes Winning Move ===');
const board4 = new Board();
const bot2 = new BotAI(2);

board4.dropDisc(0, 2);
board4.dropDisc(1, 2);
board4.dropDisc(2, 2);
board4.dropDisc(0, 1); 
displayBoard(board4);

console.log('Bot analyzing...');
const winningMove = bot2.getBestMove(board4);
console.log('Bot chooses column:', winningMove);
board4.dropDisc(winningMove, 2);
displayBoard(board4);

const engine4 = new GameEngine(board4);
const botWin = engine4.checkWinner(board4.rows - 1, winningMove);
console.log('Winner:', botWin === 2 ? '✓ Bot Wins!' : 'No winner');

console.log('\n=== TEST 5: Simulated Player vs Bot Game ===');
async function playGame() {
  const gameBoard = new Board();
  const gameBot = new BotAI(2);
  const gameEngine = new GameEngine(gameBoard);
  let currentPlayer = 1;
  let moves = 0;

  while (moves < 42) { 
    console.log(`\nMove ${moves + 1} - Player ${currentPlayer}'s turn`);
    
    let col;
    if (currentPlayer === 1) {
      const validMoves = gameBoard.getValidMoves();
      col = validMoves[Math.floor(Math.random() * validMoves.length)];
      console.log(`Player 1 plays column ${col}`);
    } else {
      col = await gameBot.makeMove(gameBoard);
      console.log(`Bot plays column ${col}`);
    }

    const result = gameBoard.dropDisc(col, currentPlayer);
    if (!result.success) {
      console.log('Invalid move!');
      break;
    }

    displayBoard(gameBoard);

    const winner = gameEngine.checkWinner(result.row, result.col);
    if (winner) {
      console.log(`Player ${winner} wins!`);
      break;
    }

    if (gameEngine.isDraw()) {
      console.log('Game is a draw!');
      break;
    }

    currentPlayer = currentPlayer === 1 ? 2 : 1;
    moves++;
  }
}

playGame().then(() => {
  console.log('\n=== All Tests Complete ===');
});