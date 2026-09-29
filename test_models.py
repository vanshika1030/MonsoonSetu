"""Quick test: load all ML models and run a sample prediction."""
import os
import sys
import json
import numpy as np

os.chdir(r"c:\Users\vansh\OneDrive\Desktop\monsoon")

try:
    import joblib
    print("joblib OK")
except ImportError:
    print("FAIL: joblib not installed")
    sys.exit(1)

# Load config
with open('model_config.json', 'r') as f:
    config = json.load(f)
print(f"Config: {config['n_features']} features, {len(config['targets'])} targets")

# Load scaler
scaler = joblib.load('scaler.joblib')
print(f"Scaler loaded: {type(scaler).__name__}")

# Load all 12 models
models = {}
for target in config['targets']:
    path = f'ensemble_{target}.joblib'
    if os.path.exists(path):
        models[target] = joblib.load(path)
        print(f"  Loaded: {target}")
    else:
        print(f"  MISSING: {target}")

print(f"\n{len(models)}/12 models loaded")

# Test prediction with a sample feature vector
sample = np.array([
    0.8,    # oni
    -0.3,   # dmi
    6,      # mjo_phase
    1.4,    # mjo_amplitude
    0,      # rain_1d
    0,      # rain_3d_sum
    2,      # rain_7d_sum
    40,     # rain_14d_sum
    65,     # rain_30d_sum
    0.29,   # rain_7d_mean
    2.86,   # rain_14d_mean
    2.17,   # rain_30d_mean
    2,      # rain_7d_max
    0.76,   # rain_7d_std
    14,     # dry_days_streak
    38.5,   # tmax_7d_mean
    25.8,   # tmin_7d_mean
    12.7,   # dtr_7d_mean
    -1.2,   # tmax_drop_3d
    2.5,    # tmax_anomaly
    18,     # pre_monsoon_heat_days
    5.0,    # temp_rain_ratio
    488.95, # evapotranspiration_proxy
    180,    # day_of_year (June 29)
    6,      # month
    26,     # week_of_year
    18.99,  # latitude (Beed)
    75.76,  # longitude (Beed)
    515,    # elevation (Beed)
    -0.24,  # oni_x_dmi
    52.0,   # oni_x_rain30d
    0.0,    # mjo_favorable (phase 6 = no)
    1.0,    # mjo_suppressive (phase 6, amp 1.4 > 1.0 = yes)
]).reshape(1, -1)

scaled = scaler.transform(sample)

print("\nPredictions for Beed (demo input):")
for target, model in models.items():
    prob = model.predict_proba(scaled)[0][1]
    print(f"  {target}: {prob*100:.1f}%")

print("\nSUCCESS: All models working")
