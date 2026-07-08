from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Literal
import joblib
import pandas as pd
import uvicorn

# Initialize the API
app = FastAPI(title="Construction Risk Prediction API")

# ── Load shared preprocessors ───────────────────────────────────────────────
print("Loading preprocessors and all 5 models...")
scaler        = joblib.load("exported_models/standard_scaler.pkl")
feature_names = joblib.load("exported_models/feature_names.pkl")

# ── Load all 5 trained models into a dict ───────────────────────────────────
MODELS = {
    "random_forest":      joblib.load("exported_models/random_forest_model.pkl"),
    "gradient_boosting":  joblib.load("exported_models/gradient_boosting_model.pkl"),
    "linear_regression":  joblib.load("exported_models/linear_regression_model.pkl"),
    "svr":                joblib.load("exported_models/svr_model.pkl"),
    "knn":                joblib.load("exported_models/knn_model.pkl"),
}
print(f"All models loaded: {list(MODELS.keys())}")

# ── Request schema ───────────────────────────────────────────────────────────
class RiskInput(BaseModel):
    # Which model to use (defaults to Random Forest)
    model: Literal[
        "random_forest",
        "gradient_boosting",
        "linear_regression",
        "svr",
        "knn"
    ] = "random_forest"

    # The 17 feature inputs
    temperature:               float
    humidity:                  float
    vibration_level:           float
    material_usage:            float
    machinery_status:          int
    worker_count:              int
    energy_consumption:        float
    task_progress:             float
    cost_deviation:            float
    time_deviation:            float
    safety_incidents:          int
    equipment_utilization_rate: float
    material_shortage_alert:   int
    simulation_deviation:      float
    update_frequency:          int
    optimization_suggestion:   int   # label-encoded integer
    performance_score:         int   # label-encoded integer


@app.post("/predict")
async def predict_risk(data: RiskInput):
    try:
        model_name = data.model
        if model_name not in MODELS:
            raise HTTPException(
                status_code=400,
                detail=f"Unknown model '{model_name}'. "
                       f"Choose from: {list(MODELS.keys())}"
            )

        selected_model = MODELS[model_name]

        # Build DataFrame in exact feature order
        input_dict = data.model_dump()
        input_dict.pop("model")  # remove the model selector field
        input_data  = pd.DataFrame([input_dict])[feature_names]

        # Scale and predict
        scaled_data = scaler.transform(input_data)
        prediction  = selected_model.predict(scaled_data)

        # Clamp the score between 0 and 100 to prevent outliers from breaking the UI
        risk_score = max(0, min(100, float(prediction[0])))

        return {
            "status": "success",
            "model_used": model_name,
            "predicted_risk_score": round(risk_score, 2)
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/models")
async def list_models():
    """Returns all available model keys that can be passed to /predict."""
    return {"available_models": list(MODELS.keys())}


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)