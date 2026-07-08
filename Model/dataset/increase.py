import pandas as pd
import numpy as np
from datetime import timedelta

# 1. Load your existing 50k dataset
# Replace 'construction_data_50k.csv' with your actual file name
df_original = pd.read_csv('./construction_project_dataset.csv')
df_original['timestamp'] = pd.to_datetime(df_original['timestamp'])

# 2. Create a copy to act as the foundation for the new 50k rows
df_synthetic = df_original.copy()

# 3. Define column types for appropriate noise handling
continuous_cols = [
    'temperature', 'humidity', 'vibration_level', 'material_usage', 
    'energy_consumption', 'task_progress', 'cost_deviation', 
    'time_deviation', 'equipment_utilization_rate', 'risk_score', 
    'simulation_deviation'
]

discrete_cols = ['worker_count', 'safety_incidents']

# 4. Inject Gaussian Noise into continuous numerical columns
# We use 2% of the standard deviation of each column as the noise factor.
# This ensures the synthetic data is mathematically similar but not identical.
noise_factor = 0.02 

for col in continuous_cols:
    std_dev = df_synthetic[col].std()
    noise = np.random.normal(0, std_dev * noise_factor, size=len(df_synthetic))
    df_synthetic[col] = df_synthetic[col] + noise

# 5. Handle discrete columns (like worker count)
# We might randomly add or subtract 1 worker to create slight variation, 
# ensuring the number doesn't drop below 0.
for col in discrete_cols:
    random_shift = np.random.randint(-1, 2, size=len(df_synthetic)) # Adds -1, 0, or 1
    df_synthetic[col] = np.maximum(0, df_synthetic[col] + random_shift)

# 6. Shift Timestamps forward
# Assuming the original data was logged every minute, we find the last timestamp
# and start the synthetic timestamps exactly one minute after it.
last_time = df_original['timestamp'].max()
time_step = timedelta(minutes=1) # Adjust this if your update_frequency is different

new_timestamps = [last_time + (time_step * i) for i in range(1, len(df_synthetic) + 1)]
df_synthetic['timestamp'] = new_timestamps

# 7. Constrain physical limits (e.g., humidity shouldn't exceed 100 or drop below 0)
df_synthetic['humidity'] = df_synthetic['humidity'].clip(0, 100)
df_synthetic['task_progress'] = df_synthetic['task_progress'].clip(0, 1) # Assuming it's a percentage 0.0 to 1.0

# 8. Combine the original 50k and the new synthetic 50k
df_combined = pd.concat([df_original, df_synthetic], ignore_index=True)

# 9. Save the massive 100k dataset
df_combined.to_csv('construction_data_100k.csv', index=False)

print(f"Success! Original rows: {len(df_original)} -> New Total rows: {len(df_combined)}")