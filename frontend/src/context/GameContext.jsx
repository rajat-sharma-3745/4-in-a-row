// frontend/src/context/GameContext.jsx

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { useSocket } from "./SocketContext";
import {
  ERROR,
  FIND_MATCH,
  GAME_OVER,
  GAME_RECONNECTED,
  JOIN,
  JOINED,
  LEAVE_QUEUE,
  MAKE_MOVE,
  MATCH_FOUND,
  MATCHMAKING_ERROR,
  MATCHMAKING_WAITING,
  MOVE_ERROR,
  MOVE_MADE,
  OPPONENT_DISCONNECTED,
  OPPONENT_RECONNECTED,
  QUIT_GAME,
} from "../constants/events";
import { useSocketEvents } from "../hooks/socket";

const GameContext = createContext();

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error("useGame must be used within GameProvider");
  }
  return context;
};

export const GameProvider = ({ children }) => {
  const { socket, connected } = useSocket();

  // User state
  const [username, setUsername] = useState("");
  const [playerStats, setPlayerStats] = useState(null);
  const [isJoined, setIsJoined] = useState(false);

  // Game state
  const [gameState, setGameState] = useState(null);
  const [board, setBoard] = useState(
    Array(6)
      .fill(null)
      .map(() => Array(7).fill(null)),
  );
  const [currentTurn, setCurrentTurn] = useState(1);
  const [myPlayerNumber, setMyPlayerNumber] = useState(null);
  const [opponent, setOpponent] = useState(null);
  const [isMyTurn, setIsMyTurn] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState(null);
  const [winReason, setWinReason] = useState(null);

  // UI state
  const [isSearchingMatch, setIsSearchingMatch] = useState(false);
  const [error, setError] = useState(null);
  const [moveHistory, setMoveHistory] = useState([]);
  const [lastMove, setLastMove] = useState(null);

  // Leaderboard
  const [leaderboard, setLeaderboard] = useState([]);

  // Join with username
  const joinGame = (name) => {
    if (!socket || !connected) {
      setError("Not connected to server");
      return;
    }

    socket.emit(JOIN, { username: name });
    setUsername(name);
  };

  // Find match
  const findMatch = () => {
    if (!socket || !connected) {
      setError("Not connected to server");
      return;
    }

    setIsSearchingMatch(true);
    setError(null);
    socket.emit(FIND_MATCH, { username });
  };

  // Make a move
  const makeMove = (col) => {
    if (!socket || !connected || !gameState) {
      return;
    }

    socket.emit(MAKE_MOVE, {
      gameId: gameState.id,
      username,
      col,
    });
  };

  // Leave queue
  const leaveQueue = () => {
    if (!socket || !connected) return;

    socket.emit(LEAVE_QUEUE, { username });
    setIsSearchingMatch(false);
  };

  // Fetch leaderboard
  const fetchLeaderboard = async () => {
    try {
      const response = await fetch(
        "http://localhost:3000/leaderboard?limit=10",
      );
      const data = await response.json();
      setLeaderboard(data);
    } catch (err) {
      console.error("Error fetching leaderboard:", err);
    }
  };

  // Reset game
  const resetGame = (gameId, username) => {
    setGameState(null);
    setBoard(
      Array(6)
        .fill(null)
        .map(() => Array(7).fill(null)),
    );
    setCurrentTurn(1);
    setMyPlayerNumber(null);
    setOpponent(null);
    setIsMyTurn(false);
    setGameOver(false);
    setWinner(null);
    setWinReason(null);
    setMoveHistory([]);
    setLastMove(null);
    setIsSearchingMatch(false);
    socket.emit(QUIT_GAME, { gameId, username });
  };

  // Socket event listeners

  const joinedHandler = useCallback((data) => {
    setIsJoined(true);
    setPlayerStats(data.stats);
    fetchLeaderboard();
  }, []);

  const matchFoundHandler = useCallback(
    (data) => {
      setIsSearchingMatch(false);
      setGameState(data.game);
      setBoard(data.game.board);
      setCurrentTurn(data.game.currentTurn);
      setOpponent(data.opponent);
      setGameOver(false);
      setWinner(null);
      setWinReason(null);
      setMoveHistory([]);
      setLastMove(null);

      const myNumber = data.game.players.player1.username === username ? 1 : 2;

      setMyPlayerNumber(myNumber);
      setIsMyTurn(data.game.currentTurn === myNumber);
    },
    [username],
  );

  const moveMadeHandler = useCallback(
    (data) => {
      setBoard(data.board);
      setCurrentTurn(data.nextTurn);
      setLastMove(data.move);

      setMoveHistory((prev) => [
        ...prev,
        {
          player: data.player,
          col: data.move.col,
          row: data.move.row,
          playerNumber: data.move.player,
        },
      ]);

      if (data.gameOver) {
        setGameOver(true);
        setWinner(data.winner);
        setWinReason(data.winReason);
        setIsMyTurn(false);
        fetchLeaderboard();
      } else {
        setIsMyTurn(data.nextTurn === myPlayerNumber);
      }
    },
    [myPlayerNumber],
  );


  const gameOverHandler = useCallback((data) => {
    if (data.gameOver) {
      setGameOver(true);
      setWinner(data.winner);
      setWinReason(data.winReason);
    }
  },[])

  const gameReconnectedHandler = useCallback(
    (data) => {
      setGameState(data.game);
      setBoard(data.game.board);
      setCurrentTurn(data.game.currentTurn);

      const myNumber = data.game.players.player1.username === username ? 1 : 2;
      setMyPlayerNumber(myNumber);
      setIsMyTurn(data.game.currentTurn === myNumber);

      const opponentPlayer =
        myNumber === 1 ? data.game.players.player2 : data.game.players.player1;
      setOpponent(opponentPlayer.username);
    },
    [username],
  );
  const handlers = {
    [JOINED]: joinedHandler,
    [MATCH_FOUND]: matchFoundHandler,
    [MATCHMAKING_WAITING]: () => {},
    [MATCHMAKING_ERROR]: (data) => {
      setError(data.error);
      setIsSearchingMatch(false);
    },
    [MOVE_MADE]: moveMadeHandler,
    [MOVE_ERROR]: (data) => {
      setError(data.error);
      setTimeout(() => setError(null), 3000);
    },
    [OPPONENT_DISCONNECTED]: (data) => setError(data.message),
    [OPPONENT_RECONNECTED]: () => setError(null),
    [GAME_RECONNECTED]: gameReconnectedHandler,
    [ERROR]: (data) => {
      setError(data.message);
      setTimeout(() => setError(null), 3000);
    },
    [GAME_OVER]:gameOverHandler
  };

  useSocketEvents(socket, handlers);

  const value = {
    // User
    username,
    playerStats,
    isJoined,
    joinGame,

    // Game
    gameState,
    board,
    currentTurn,
    myPlayerNumber,
    opponent,
    isMyTurn,
    gameOver,
    winner,
    winReason,
    makeMove,
    resetGame,
    moveHistory,
    lastMove,

    // Matchmaking
    isSearchingMatch,
    findMatch,
    leaveQueue,

    // UI
    error,
    setError,

    // Leaderboard
    leaderboard,
    fetchLeaderboard,

    // Socket
    connected,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};
