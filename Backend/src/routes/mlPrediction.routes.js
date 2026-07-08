// src/routes/mlPrediction.routes.js
import express from 'express';
import { predictProjectRisk, checkMlHealth } from '../controllers/mlPrediction.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = express.Router();

// GET  /api/v1/ml/health  — check if Python ML server is online
router.get('/health', checkMlHealth);

// POST /api/v1/ml/predict-risk  — requires valid JWT
router.post('/predict-risk', authenticate, predictProjectRisk);

export default router;
