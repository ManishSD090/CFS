# Construction ERP: Machine Learning Risk Analysis Documentation

This document provide a detailed overview of the Machine Learning architecture implemented for risk prediction in the Construction ERP system.

## 1. Machine Learning Models Used
The system implements five different regression algorithms to ensure high performance and flexibility. Users can toggle between these models to compare predictions:

1.  **Random Forest Regressor** (Ensemble - Bagging)
2.  **Gradient Boosting Regressor** (Ensemble - Boosting)
3.  **Linear Regression** (Baseline Model)
4.  **Support Vector Regressor (SVR)** (Kernel-based)
5.  **K-Neighbors Regressor (KNN)** (Distance-based)

## 2. Model Accuracy & Evaluation
Accuracy is measured using two primary regression metrics during the training phase in `train.py`:

*   **RMSE (Root Mean Squared Error):** Measures the average magnitude of the error. Lower values indicate better performance.
*   **$R^2$ Score (Coefficient of Determination):** Measures how well the model explains the variance in the data (Scale of 0 to 1). A score closer to 1.0 is ideal.

**How does the accuracy come?**
Accuracy is optimized through:
*   **5-Fold Cross-Validation:** The dataset is split into 5 parts, and the model is trained/tested 5 times on different subsets to ensure it generalizes well to new data.
*   **Hyperparameter Tuning:** `RandomizedSearchCV` is used to find the "Best Parameters" (like the number of trees in Random Forest or $C$ in SVR) by testing multiple combinations automatically.

## 3. Query Basis (Input Features)
The prediction query is based on **17 key construction parameters**. When the API receives a "request" (query), it uses these variables:

| Feature Category | Inputs |
| :--- | :--- |
| **Environmental** | Temperature, Humidity, Vibration Level |
| **Resource/Logistics** | Material Usage, Machinery Status, Worker Count, Energy Consumption |
| **Project Tracking** | Task Progress, Cost Deviation, Time Deviation, Update Frequency |
| **Safety & Simulation** | Safety Incidents, Material Shortage Alert, Simulation Deviation |
| **Efficiency Metrics** | Equipment Utilization Rate, Optimization Suggestion, Performance Score |

## 4. How the Model Works (The Pipeline)
The model follows a structured pipeline from data input to risk score output:

### A. Preprocessing & Feature Engineering
1.  **Label Encoding:** Categorical data like "Optimization Suggestions" are converted into numbers the model can understand.
2.  **Polynomial Interactions:** The system automatically generates interaction terms for the top 5 most important features to capture complex relationships (e.g., how "High Temperature" combined with "High Vibration" affects risk).

### B. Data Scaling
Because features have different units (e.g., Temperature in °C vs. Cost in Rupees), a **StandardScaler** is applied to normalize all data so no single feature dominates the model unfairly.

### C. Execution Flow
1.  **External Input:** The Flutter app or Backend sends the 17 features to the FastAPI server (`/predict`).
2.  **Model Loading:** The API loads the pre-trained `.pkl` (Pickle) files for the selected model.
3.  **Transformation:** The raw input is transformed using the same Scaler and Polynomial logic used during training.
4.  **Prediction:** The model calculates a raw numeric value.
5.  **Safety Clamping:** The result is clamped between **0 and 100** (Risk Percentage) and rounded to 2 decimal places before being returned.

## 5. Summary of Algorithms
*   **Random Forest:** Combines multiple decision trees to reduce overfitting.
*   **Gradient Boosting:** Builds trees sequentially, where each new tree corrects the errors of the previous one.
*   **SVR:** Uses a margin of tolerance to fit the line of best fit in a high-dimensional space.
*   **KNN:** Predicts based on the values of the "nearest" data points in the training set.
