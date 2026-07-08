import pandas as pd
import numpy as np
import joblib
import os
import warnings
from sklearn.model_selection import train_test_split, RandomizedSearchCV
from sklearn.preprocessing import StandardScaler, LabelEncoder, PolynomialFeatures
from sklearn.linear_model import LinearRegression
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.svm import SVR
from sklearn.neighbors import KNeighborsRegressor
from sklearn.metrics import mean_squared_error, r2_score
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer

# Suppress warnings for cleaner output
warnings.filterwarnings("ignore")

# Create a directory for exported models if it doesn't exist
os.makedirs("exported_models", exist_ok=True)

print("Starting Advanced Model Training Pipeline...")

# Load dataset
print("Loading dataset (construction_data_100k.csv)...")
df = pd.read_csv('dataset/construction_data_100k.csv')

# 1. Preprocessing & Encoding
print("Preprocessing and encoding features...")
if 'timestamp' in df.columns:
    df = df.drop(columns=['timestamp'])

le_opt = LabelEncoder()
df['optimization_suggestion'] = le_opt.fit_transform(df['optimization_suggestion'])
joblib.dump(le_opt, 'exported_models/label_encoder_opt.pkl')

le_perf = LabelEncoder()
df['performance_score'] = le_perf.fit_transform(df['performance_score'])
joblib.dump(le_perf, 'exported_models/label_encoder_perf.pkl')

# 2. Define Features and Target
X = df.drop(columns=['risk_score'])
y = df['risk_score']

feature_names = X.columns.tolist()
joblib.dump(feature_names, 'exported_models/feature_names.pkl')

# Identifiy top 5 correlated features for polynomial interaction terms
numeric_cols = X.select_dtypes(include=[np.number]).columns.tolist()
correlations = df[numeric_cols + ['risk_score']].corr()['risk_score'].abs().sort_values(ascending=False)
correlations = correlations.drop('risk_score', errors='ignore')
top_features = correlations.head(5).index.tolist()
print(f"Feature Engineering: Generating interactions for top features: {top_features}")

# 3. Model Pipeline and Scaling
poly_transformer = ColumnTransformer([
    ('poly', PolynomialFeatures(degree=2, interaction_only=True, include_bias=False), top_features)
], remainder='passthrough')

preprocessor = Pipeline([
    ('poly_interact', poly_transformer),
    ('scaler', StandardScaler())
])

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

print("Fitting preprocessor and scaling data...")
X_train_scaled = preprocessor.fit_transform(X_train)
X_test_scaled = preprocessor.transform(X_test)

joblib.dump(preprocessor, 'exported_models/standard_scaler.pkl')

# 4. Hyperparameter Grids for Tuning
print("Initializing RandomizedSearchCV parameter grids...")
param_grids = {
    "random_forest": {
        "model": RandomForestRegressor(random_state=42),
        "params": {
            "n_estimators": [100, 200, 300],
            "max_depth": [None, 10, 20, 30],
            "min_samples_split": [2, 5, 10],
            "bootstrap": [True, False]
        }
    },
    "gradient_boosting": {
        "model": GradientBoostingRegressor(random_state=42),
        "params": {
            "n_estimators": [100, 200, 300],
            "learning_rate": [0.01, 0.1, 0.2],
            "max_depth": [3, 5, 7],
            "subsample": [0.8, 1.0]
        }
    },
    "svr": {
        "model": SVR(),
        "params": {
            "C": [0.1, 1, 10],
            "gamma": ['scale', 'auto'],
            "kernel": ['rbf']
        }
    },
    "knn": {
        "model": KNeighborsRegressor(),
        "params": {
            "n_neighbors": [3, 5, 7, 9, 11],
            "weights": ['uniform', 'distance']
        }
    },
    "linear_regression": {
        "model": LinearRegression(),
        "params": {}
    }
}

# 5. Training, Optimization, and Evaluation Loop
print("\n" + "="*80)
print(f"{'Model Name':<20} | {'Best RMSE':<12} | {'Best R²':<10}")
print("-" * 80)

for name, config in param_grids.items():
    model_obj = config["model"]
    params = config["params"]
    
    if params:
        search_X, search_y = X_train_scaled, y_train
        if name == 'svr':
            sample_size = 5000
            print(f" (Tuning {name} on {sample_size} row subset for speed...)")
            idx = np.random.choice(len(X_train_scaled), sample_size, replace=False)
            search_X = X_train_scaled[idx]
            search_y = y_train.iloc[idx]
            
        search = RandomizedSearchCV(
            model_obj, 
            param_distributions=params, 
            n_iter=8, 
            cv=5, 
            scoring='neg_mean_squared_error',
            n_jobs=-1,
            random_state=42
        )
        search.fit(search_X, search_y)
        best_model = search.best_estimator_
        best_params = search.best_params_
    else:
        model_obj.fit(X_train_scaled, y_train)
        best_model = model_obj
        best_params = "Default"
    
    preds = best_model.predict(X_test_scaled)
    rmse = np.sqrt(mean_squared_error(y_test, preds))
    r2 = r2_score(y_test, preds)
    
    print(f"{name:<20} | {rmse:<12.4f} | {r2:<10.4f}")
    if params:
        print(f"   -> Best Hyperparameters: {best_params}")
    
    export_path = f"exported_models/{name}_model.pkl"
    joblib.dump(best_model, export_path)

print("="*80)
print("\nPipeline Complete! All best estimators and preprocessors are exported.")
print("Location: exported_models/")