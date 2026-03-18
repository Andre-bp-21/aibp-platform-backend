import { Router } from 'express';
import { AnalysisController } from '../controllers/analysisController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.post('/score', authenticate, (req, res) => {
  AnalysisController.analyzeBusiness(req, res);
});

router.post('/simulate', authenticate, (req, res) => {
  AnalysisController.simulateScenario(req, res);
});

export default router;
