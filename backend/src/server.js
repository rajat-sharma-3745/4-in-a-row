import express from 'express';
import http from 'http';
import {Server} from 'socket.io';
import cors from 'cors';

import GameManager from './game/GameManager.js';
import Matchmaking from './matchmaking.js';
import statsRoutes from './routes/statsRoutes.js'
import { initSocket } from './socket/index.js';

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST']
  }
});

app.use(cors());
app.use(express.json());

const gameManager = new GameManager();
const matchmaking = new Matchmaking(gameManager);

const playerSockets = new Map(); // username -> socketId
const socketPlayers = new Map(); // socketId -> username

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: Date.now() });
});

app.use('/', statsRoutes);

initSocket(io, {
  gameManager,
  matchmaking,
  playerSockets,
  socketPlayers
});

setInterval(() => {
  gameManager.checkAbandonedGames();
  gameManager.cleanupFinishedGames();
}, 5000); 

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});