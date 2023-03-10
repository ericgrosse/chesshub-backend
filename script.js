import { Chess } from 'chess.js';
import express from 'express';

const app = express();
const port = 3000;

// Create a new game
const game = new Chess();

// Evaluate the current state of the game
function evaluateState() {
  const moves = game.moves();
  
  const opponentMoves = moves.filter(move => {
    game.move(move);
    const isOpponentInCheck = game.inCheck();
    game.undo();
    return isOpponentInCheck;
  }).length;

  const myMoves = moves.length - opponentMoves;
  return myMoves - opponentMoves;
}

// Get all legal moves for the current player
function getAllLegalMoves() {
  return game.moves({verbose: true}).map(move => {
    return {from: move.from, to: move.to};
  });
}

// Minimax algorithm with alpha-beta pruning
function minimax(depth, alpha, beta, isMaximizingPlayer) {
  if (depth === 0 || game.game_over()) {
    return evaluateState();
  }

  if (isMaximizingPlayer) {
    let bestScore = -Infinity;
    const moves = getAllLegalMoves();

    for (let i = 0; i < moves.length; i++) {
      game.move(moves[i]);
      const score = minimax(depth - 1, alpha, beta, false);
      game.undo();
      bestScore = Math.max(bestScore, score);
      alpha = Math.max(alpha, score);

      if (beta <= alpha) {
        break;
      }
    }
    return bestScore;
  } else {
    let bestScore = Infinity;
    const moves = getAllLegalMoves();

    for (let i = 0; i < moves.length; i++) {
      game.move(moves[i]);
      const score = minimax(depth - 1, alpha, beta, true);
      game.undo();
      bestScore = Math.min(bestScore, score);
      beta = Math.min(beta, score);
      if (beta <= alpha) {
        break;
      }
    }
    return bestScore;
  }
}

// Get the best move for the bot
function getBestMove() {
  let bestMove = null;
  let bestScore = -Infinity;
  const moves = getAllLegalMoves();

  for (let i = 0; i < moves.length; i++) {
    game.move(moves[i]);
    const score = minimax(3, -Infinity, Infinity, false);
    game.undo();

    if (score > bestScore) {
      bestScore = score;
      bestMove = moves[i];
    }
  }
  return bestMove;
}

// Handle incoming requests
app.get('/', (req, res) => {
  // Get the bot's best move and update the game state
  const bestMove = getBestMove();
  game.move(bestMove);

  // Send the bot's move to the client
  res.send({from: bestMove.from, to: bestMove.to});
});

// Start the server
app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});