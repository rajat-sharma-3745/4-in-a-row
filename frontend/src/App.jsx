import SocketProvider from './context/SocketContext';
import { GameProvider, useGame } from './context/GameContext';
import HomeScreen from './components/HomeScreen';
import MatchmakingScreen from './components/MatchmakingScreen';
import GameScreen from './components/GameScreen';

function AppContent() {
  const { isJoined, gameState } = useGame();

  if (!isJoined) {
    return <HomeScreen />;
  }

  if (!gameState) {
    return <MatchmakingScreen />;
  }

  return <GameScreen />;
}

function App() {
  return (
    <SocketProvider>
      <GameProvider>
        <AppContent />
      </GameProvider>
    </SocketProvider>
  );
}

export default App;