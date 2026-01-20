import { useState } from 'react';
import { useGame } from '../context/GameContext';

const HomeScreen = () => {
  const { joinGame,isJoining, findMatch, isSearchingMatch, leaveQueue, connected } = useGame();
  const [name, setName] = useState('');

  const handleJoin = (e) => {
    e.preventDefault();
    if (name.trim()) {
      joinGame(name.trim());
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="card max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold mb-2 bg-linear-to-r from-primary-400 to-primary-600 bg-clip-text text-transparent">
            4 in a Row
          </h1>
          <p className="text-dark-400 text-lg">
            Connect four discs to win!
          </p>
          
          <div className="mt-4 flex items-center justify-center gap-2">
            <div className={`w-3 h-3 rounded-full ${connected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
            <span className="text-sm text-dark-400">
              {connected ? 'Connected' : 'Connecting...'}
            </span>
          </div>
        </div>

        <form onSubmit={handleJoin} className="space-y-4">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-dark-300 mb-2">
              Enter your username
            </label>
            <input
              id="username"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-white placeholder-dark-400"
              maxLength={20}
              required
            />
          </div>

          <button
            type="submit"
            disabled={!name.trim() || !connected}
            className="btn-primary w-full"
          >
            {isJoining?"Joining...":"Join Game"}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-dark-700">
          <h3 className="text-sm font-semibold text-dark-300 mb-3">How to Play:</h3>
          <ul className="text-sm text-dark-400 space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-primary-500">•</span>
              <span>Click on a column to drop your disc</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary-500">•</span>
              <span>Connect 4 discs vertically, horizontally, or diagonally to win</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary-500">•</span>
              <span>If no match is found in 10 seconds, you'll play against a bot</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default HomeScreen;