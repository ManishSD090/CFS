// src/controllers/mlPrediction.controller.js
import axios from 'axios';
import prisma from '../config/database.js';

// The URL of your locally running Python FastAPI ML server
const ML_API_URL = process.env.ML_API_URL || 'http://127.0.0.1:8000';

/**
 * POST /api/v1/ml/predict-risk
 *
 * Accepts project context from the Flutter app, enriches it with live
 * data from the database, and forwards it to the Python ML microservice.
 * Returns the predicted risk score back to the caller.
 */
export const predictProjectRisk = async (req, res) => {
  try {
    const { projectId } = req.body;

    if (!projectId) {
      return res.status(400).json({
        success: false,
        message: 'projectId is required in the request body.',
      });
    }

    // ── Step 1: Fetch live project data from the database ──────────────────
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        companyId: req.user.companyId,
      },
      include: {
        tasks: {
          select: { status: true },
        },
        expenses: {
          select: { amount: true },
        },
        _count: {
          select: {
            tasks: true,
            projectAssignments: true,
            dprs: true,
          },
        },
      },
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found or you do not have access.',
      });
    }

    // ── Step 2: Derive feature values from DB + request body ───────────────

    // Task progress: completed tasks / total tasks (0.0 – 1.0)
    const completedTasks = project.tasks.filter(
      (t) => t.status === 'COMPLETED'
    ).length;
    const totalTasks = project._count.tasks || 1;
    const taskProgress = parseFloat((completedTasks / totalTasks).toFixed(4));

    // Cost deviation: actual spend vs estimated budget
    const totalSpend = project.expenses.reduce(
      (sum, e) => sum + (e.amount || 0),
      0
    );
    const costDeviation = parseFloat(
      (totalSpend - (project.estimatedBudget || 0)).toFixed(2)
    );

    // Time deviation: days past estimated end date (negative = ahead of schedule)
    const today = new Date();
    const estEnd = project.estimatedEndDate
      ? new Date(project.estimatedEndDate)
      : today;
    const timeDeviation = parseFloat(
      ((today - estEnd) / (1000 * 60 * 60 * 24)).toFixed(1)
    );

    // ── Allowed model names (must match what Python API expects) ──────────
    const VALID_MODELS = [
      'random_forest', 'gradient_boosting', 'linear_regression', 'svr', 'knn'
    ];
    const selectedModel = VALID_MODELS.includes(req.body.model)
      ? req.body.model
      : 'random_forest';

    // Build the 17-feature payload for the ML model
    const mlInput = {
      // Which model to run
      model: selectedModel,

      // Environmental / IoT – these come from the request body (Flutter / sensor data)
      temperature: parseFloat(req.body.temperature) || 35.0,
      humidity: parseFloat(req.body.humidity) || 65.0,
      vibration_level: parseFloat(req.body.vibration_level) || 20.5,

      // Site activity – from request body
      material_usage: Number(req.body.material_usage) || 500.0,
      machinery_status: req.body.machinery_status !== undefined ? parseInt(req.body.machinery_status) : 1,
      worker_count: project._count.projectAssignments || (req.body.worker_count !== undefined ? parseInt(req.body.worker_count) : 30),
      energy_consumption: Number(req.body.energy_consumption) || 250.0,

      // Computed from live DB data
      task_progress: taskProgress,
      cost_deviation: costDeviation,
      time_deviation: timeDeviation,

      // Incidents / alerts – from request body
      safety_incidents: req.body.safety_incidents !== undefined ? parseInt(req.body.safety_incidents) : 0,
      equipment_utilization_rate: Number(req.body.equipment_utilization_rate) || 85.0,
      material_shortage_alert: req.body.material_shortage_alert !== undefined ? parseInt(req.body.material_shortage_alert) : 0,

      // Simulation / digital twin metrics – from request body
      simulation_deviation: Number(req.body.simulation_deviation) || 1.2,
      update_frequency: req.body.update_frequency !== undefined ? parseInt(req.body.update_frequency) : 15,

      // Label-encoded categoricals – must be integers from your LabelEncoder
      optimization_suggestion: req.body.optimization_suggestion !== undefined ? parseInt(req.body.optimization_suggestion) : 1,
      performance_score: req.body.performance_score !== undefined ? parseInt(req.body.performance_score) : 0,
    };

    // ── Step 3: Call the Python FastAPI microservice ───────────────────────
    const mlResponse = await axios.post(`${ML_API_URL}/predict`, mlInput, {
      timeout: 20000, // 20-second timeout
    });

    const { predicted_risk_score } = mlResponse.data;

    // ── Step 4: Categorise the risk level for the Flutter UI ──────────────
    let riskLevel = 'LOW';
    if (predicted_risk_score >= 70) riskLevel = 'HIGH';
    else if (predicted_risk_score >= 40) riskLevel = 'MEDIUM';

    // ── Step 5: Return the enriched result ────────────────────────────────
    return res.json({
      success: true,
      data: {
        projectId,
        projectName: project.name,
        model_used: mlResponse.data.model_used || selectedModel,
        predicted_risk_score,
        risk_level: riskLevel,
        computed_inputs: {
          task_progress: taskProgress,
          cost_deviation: costDeviation,
          time_deviation: timeDeviation,
          worker_count: mlInput.worker_count,
        },
        message: `ML model predicts a ${riskLevel} risk score of ${predicted_risk_score} for project "${project.name}".`,
      },
    });
  } catch (error) {
    // Handle the case where the Python server is down
    if (error.code === 'ECONNREFUSED' || error.code === 'ECONNABORTED') {
      console.error('ML API is unreachable:', error.message);
      return res.status(503).json({
        success: false,
        message: 'ML prediction service is currently unavailable. Please ensure the Python server is running on port 8000.',
      });
    }

    // Detailed logging for debugging
    if (error.response) {
      console.error('ML API Error Response:', {
        status: error.response.status,
        data: error.response.data,
      });
    } else if (error.request) {
      console.error('ML API No Response:', error.message);
    } else {
      console.error('ML Prediction Error:', error.message);
    }

    return res.status(500).json({
      success: false,
      message: 'Failed to calculate risk prediction.',
      error: error.message,
      ...(error.response?.data && { detail: error.response.data }),
    });
  }
};

/**
 * GET /api/v1/ml/health
 *
 * Proxies a health check to the Python server so the Flutter app
 * can verify the ML service is alive before showing the Risk screen.
 */
export const checkMlHealth = async (_req, res) => {
  try {
    const mlResponse = await axios.get(`${ML_API_URL}/docs`, { timeout: 5000 });
    return res.json({
      success: true,
      ml_service: 'online',
      status: mlResponse.status,
    });
  } catch {
    return res.status(503).json({
      success: false,
      ml_service: 'offline',
      message: 'Python ML server is not reachable.',
    });
  }
};
