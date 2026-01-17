import { getAnalytics, getLeaderboard, getPlayerStats, getStats } from "../controllers/statsController";

router.get('/stats', getStats);
router.get('/leaderboard', getLeaderboard);
router.get('/player/:username', getPlayerStats);
router.get('/analytics', getAnalytics);

export default router;
