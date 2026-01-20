import { Router } from 'express'
import { getAnalytics, getLeaderboard, getPlayerStats, getStats } from "../controllers/statsController.js";
const router = Router();

router.get('/stats', getStats);
router.get('/leaderboard', getLeaderboard);
router.get('/player/:username', getPlayerStats);
router.get('/analytics', getAnalytics);

export default router;
