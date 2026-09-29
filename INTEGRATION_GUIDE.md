# Monsoon Prediction ML Models - Integration Guide
### SIH Problem Statement 26086 | Version 2 (V2)
### Trained: 2026-09-27

---

## Files to Send to Backend/Frontend Team

### REQUIRED Files (Must Send All of These)

#### 1. Trained Model Files (models/ folder) - Send entire folder
| File | Size | Purpose |
|---|---|---|
| `ensemble_onset_7d.joblib` | 0.8 MB | Monsoon onset probability - 7 day horizon (calibrated) |
| `ensemble_onset_14d.joblib` | 0.8 MB | Monsoon onset probability - 14 day horizon (calibrated) |
| `ensemble_onset_21d.joblib` | 0.7 MB | Monsoon onset probability - 21 day horizon (calibrated) |
| `ensemble_onset_30d.joblib` | 0.7 MB | Monsoon onset probability - 30 day horizon (calibrated) |
| `ensemble_break_7d.joblib` | 0.8 MB | Dry spell/break probability - 7 day horizon (calibrated) |
| `ensemble_break_14d.joblib` | 0.8 MB | Dry spell/break probability - 14 day horizon (calibrated) |
| `ensemble_break_21d.joblib` | 0.8 MB | Dry spell/break probability - 21 day horizon (calibrated) |
| `ensemble_break_30d.joblib` | 0.8 MB | Dry spell/break probability - 30 day horizon (calibrated) |
| `ensemble_heavy_7d.joblib` | 0.7 MB | Heavy rainfall probability - 7 day horizon (calibrated) |
| `ensemble_heavy_14d.joblib` | 0.7 MB | Heavy rainfall probability - 14 day horizon (calibrated) |
| `ensemble_heavy_21d.joblib` | 0.7 MB | Heavy rainfall probability - 21 day horizon (calibrated) |
| `ensemble_heavy_30d.joblib` | 0.7 MB | Heavy rainfall probability - 30 day horizon (calibrated) |
| `scaler.joblib` | 1.4 KB | StandardScaler - MUST use this to scale input before prediction |
| `model_config.json` | 1.8 KB | Feature names, target list, district list, definitions |
| `false_onset_config.json` | 1.0 KB | False onset detector thresholds + per-district frequencies |

> NOTE: Also in models/ folder: `*_raw.joblib` files - these are UNCALIBRATED backup models. You can skip these for integration unless needed for debugging.

#### 2. Training Code (for GitHub)
| File | Size | Purpose |
|---|---|---|
| `train_models_v2.py` | 33 KB | **MAIN ML TRAINING SCRIPT** - this is the V2 code that produced all models |
| `download_imd_data.py` | 2 KB | Script to download IMD rainfall/temperature data |

#### 3. Documentation
| File | Purpose |
|---|---|
| `INTEGRATION_GUIDE.md` | THIS FILE - send this to the team |


> For integration, the team only needs the `models/` folder + training code. The `data/` folder is ~2-3 GB and only needed if they want to retrain.

---

## Algorithms and Libraries Used

### Libraries (pip install)
```bash
pip install numpy pandas scikit-learn xgboost joblib imdlib
```

| Library | Used For |
|---|---|
| `scikit-learn` | StackingClassifier, RandomForestClassifier, GradientBoostingClassifier, LogisticRegression, StandardScaler, CalibratedClassifierCV, TimeSeriesSplit, all metrics |
| `xgboost` | XGBClassifier - primary base learner |
| `joblib` | Model serialization (save/load .joblib files) |
| `numpy` | Numerical computations |
| `pandas` | Data manipulation, time series handling |
| `imdlib` | Loading IMD binary .grd rainfall/temperature data |

### Model Architecture (Per Target)
Each of the 12 models is a **Stacking Ensemble** with 3 base learners + 1 meta-learner:

```
+--------------------------------------------------+
|           StackingClassifier                      |
|                                                   |
|  Base Learners:                                   |
|  +-- XGBClassifier (200 trees, depth=6, lr=0.1)  |
|  +-- RandomForestClassifier (200 trees, depth=10) |
|  +-- GradientBoostingClassifier (150 trees, d=5)  |
|                                                   |
|  Meta-Learner:                                    |
|  +-- LogisticRegression (combines predictions)    |
|                                                   |
|  Cross-validation: TimeSeriesSplit (5 folds)      |
|  Calibration: Isotonic regression (on val set)    |
+--------------------------------------------------+
```

### Hyperparameters

**XGBClassifier:**
- n_estimators=200, max_depth=6, learning_rate=0.1
- subsample=0.8, colsample_bytree=0.8
- scale_pos_weight = auto-calculated (negative_count / positive_count)
- eval_metric='logloss', random_state=42

**RandomForestClassifier:**
- n_estimators=200, max_depth=10
- min_samples_split=10, min_samples_leaf=5
- class_weight='balanced', random_state=42

**GradientBoostingClassifier:**
- n_estimators=150, max_depth=5, learning_rate=0.1
- subsample=0.8, random_state=42

**Meta-Learner (StackingClassifier):**
- final_estimator=LogisticRegression(max_iter=1000)
- cv=TimeSeriesSplit(n_splits=5)
- stack_method='predict_proba'

### Probability Calibration
- Method: Isotonic Regression via CalibratedClassifierCV(method='isotonic', cv='prefit')
- Calibrated on validation set (2020-2021)
- The *.joblib files (without _raw) are the calibrated production models

---

## Training Procedure

### Step 1: Data Loading
- Load IMD 0.25deg gridded daily rainfall, tmax, tmin for 1990-2023 using `imdlib`
- Extract data for 15 Maharashtra districts using lat/lon centroids
- Load climate indices: ONI (ENSO), DMI (IOD), MJO phase and amplitude
- Season filter: JJAS (June-September) only

### Step 2: Feature Engineering (33 features)
| # | Feature | Description |
|---|---|---|
| 1 | `oni` | ENSO Oceanic Nino Index (monthly, forward-filled to daily) |
| 2 | `dmi` | Indian Ocean Dipole Mode Index |
| 3 | `mjo_phase` | Madden-Julian Oscillation phase (1-8) |
| 4 | `mjo_amplitude` | MJO amplitude |
| 5 | `rain_1d` | Rainfall today (mm) |
| 6 | `rain_3d_sum` | 3-day cumulative rainfall |
| 7 | `rain_7d_sum` | 7-day cumulative rainfall |
| 8 | `rain_14d_sum` | 14-day cumulative rainfall |
| 9 | `rain_30d_sum` | 30-day cumulative rainfall |
| 10 | `rain_7d_mean` | 7-day mean rainfall |
| 11 | `rain_14d_mean` | 14-day mean rainfall |
| 12 | `rain_30d_mean` | 30-day mean rainfall |
| 13 | `rain_7d_max` | Max daily rainfall in last 7 days |
| 14 | `rain_7d_std` | Std dev of rainfall in last 7 days |
| 15 | `dry_days_streak` | Consecutive dry days (< 2.5mm) |
| 16 | `tmax_7d_mean` | 7-day mean max temperature |
| 17 | `tmin_7d_mean` | 7-day mean min temperature |
| 18 | `dtr_7d_mean` | 7-day mean diurnal temperature range (tmax - tmin) - humidity proxy |
| 19 | `tmax_drop_3d` | 3-day tmax drop (onset signal) |
| 20 | `tmax_anomaly` | [V2 NEW] tmax deviation from district climatological mean |
| 21 | `pre_monsoon_heat_days` | [V2 NEW] count of days > 40C in April-May |
| 22 | `temp_rain_ratio` | [V2 NEW] tmax / (rain_7d_mean + 1) |
| 23 | `evapotranspiration_proxy` | [V2 NEW] DTR x tmax (soil stress approximation) |
| 24 | `day_of_year` | Day of year (1-366) |
| 25 | `month` | Month (6-9 for JJAS) |
| 26 | `week_of_year` | Week of year |
| 27 | `latitude` | District centroid latitude |
| 28 | `longitude` | District centroid longitude |
| 29 | `elevation` | District elevation |
| 30 | `oni_x_dmi` | ONI x DMI interaction |
| 31 | `oni_x_rain30d` | ONI x 30-day rain interaction |
| 32 | `mjo_favorable` | MJO in favorable phase for rainfall (phases 1-4) |
| 33 | `mjo_suppressive` | MJO in suppressive phase (phases 5-8, amplitude > 1) |

### Step 3: Target Variable Creation
| Event | Definition | Horizons |
|---|---|---|
| **Onset** | 3 of 5 consecutive days with rain >= 2.5mm AND total >= 20mm | 7, 14, 21, 30 days |
| **Break** | 7+ consecutive days with rain < 2.5mm | 7, 14, 21, 30 days |
| **Heavy** | Any day with rain >= 64.5mm (IMD very heavy) | 7, 14, 21, 30 days |

### Step 4: Data Split
| Split | Years | Purpose |
|---|---|---|
| **Train** | 1990-2019 (30 years) | Model training |
| **Validation** | 2020-2021 (2 years) | Probability calibration |
| **Test** | 2022-2023 (2 years) | Final evaluation (metrics reported) |

### Step 5: Scaling, Training, Calibration
1. StandardScaler fitted on training data -> saved as `scaler.joblib`
2. StackingClassifier trained per target (12 targets x 1 ensemble each)
3. Isotonic calibration applied using validation set
4. Both raw (*_raw.joblib) and calibrated (*.joblib) models saved

### Step 6: False Onset Analysis
- Scans 1990-2023 rainfall for false onset events per district
- False onset = rain meets onset criteria but followed by 10+ dry days within 14 days
- Saves thresholds and per-district frequencies to `false_onset_config.json`

---

## How to Link/Load Models in Backend (Python)

### Install Dependencies
```bash
pip install scikit-learn xgboost joblib numpy
```

### Loading and Predicting - Complete Example
```python
import joblib
import numpy as np
import json

# ------ STEP 1: Load config ------
with open('models/model_config.json', 'r') as f:
    config = json.load(f)

feature_names = config['feature_names']   # list of 33 feature names
targets = config['targets']               # list of 12 target names
districts = config['districts']           # list of 15 district names

# ------ STEP 2: Load scaler ------
scaler = joblib.load('models/scaler.joblib')

# ------ STEP 3: Load all 12 models ------
models = {}
for target in targets:
    models[target] = joblib.load(f'models/ensemble_{target}.joblib')
    print(f"Loaded: {target}")

# ------ STEP 4: Make a prediction ------
# Create a feature vector with 33 values (in the SAME order as feature_names)
# Replace with real data from your API
input_features = np.zeros(33)  # Replace with actual feature values
input_features = input_features.reshape(1, -1)  # Shape: (1, 33)

# Scale the input using the SAME scaler used during training
input_scaled = scaler.transform(input_features)

# Get predictions from all 12 models
predictions = {}
for target in targets:
    probability = models[target].predict_proba(input_scaled)[0][1]  # P(event=1)
    predictions[target] = round(float(probability), 4)

print(predictions)
# Output example:
# {
#   'onset_7d': 0.4523,    <- 45.23% chance of onset in next 7 days
#   'onset_14d': 0.6891,   <- 68.91% chance of onset in next 14 days
#   ...
#   'heavy_30d': 0.0892,   <- 8.92% chance of heavy rain in next 30 days
# }
```

### Loading False Onset Config
```python
with open('models/false_onset_config.json', 'r') as f:
    false_onset = json.load(f)

# Check false onset risk for a district
district = "Beed"
risk = false_onset['false_onset_frequency_by_district'][district]
print(f"{district}: {risk*100:.1f}% historical false onset rate")
# Output: Beed: 47.1% historical false onset rate
```

### Flask API Example
```python
from flask import Flask, request, jsonify
import joblib
import numpy as np
import json

app = Flask(__name__)

# Load at startup
with open('models/model_config.json') as f:
    config = json.load(f)
scaler = joblib.load('models/scaler.joblib')
models = {}
for t in config['targets']:
    models[t] = joblib.load(f'models/ensemble_{t}.joblib')

@app.route('/predict', methods=['POST'])
def predict():
    data = request.json
    features = np.array([data['features']]).reshape(1, -1)
    scaled = scaler.transform(features)
    
    result = {}
    for target, model in models.items():
        result[target] = round(float(model.predict_proba(scaled)[0][1]), 4)
    
    return jsonify(result)

if __name__ == '__main__':
    app.run(port=5000)
```

---

## Critical Integration Notes

1. **ALWAYS scale input with `scaler.joblib` before calling `predict_proba()`** - the models expect StandardScaled features
2. **Feature order matters** - the 33 features must be in the exact order listed in `model_config.json['feature_names']`
3. **Use `predict_proba()` not `predict()`** - the models output probabilities, which is what the frontend needs for risk gauges/charts
4. **Use the calibrated models** (files WITHOUT `_raw` suffix) - these give better-calibrated probabilities
5. **Models are Python-only** - they use `joblib` serialization and require `scikit-learn` + `xgboost` to load. Cannot be loaded in Node.js directly - you need a Python backend (Flask/FastAPI) or a Python microservice
6. **Total model size**: ~9.5 MB for all 12 calibrated models + scaler + configs

---

## Districts Covered (15 Maharashtra districts)
Beed, Latur, Osmanabad, Solapur, Ahmednagar, Jalna, Aurangabad, Pune, Satara, Kolhapur, Nashik, Nagpur, Amravati, Wardha, Yavatmal

---

## Recommended GitHub Repo Structure

```
monsoon-prediction/
+-- models/                          <- Trained model files
|   +-- ensemble_onset_7d.joblib
|   +-- ensemble_onset_14d.joblib
|   +-- ensemble_onset_21d.joblib
|   +-- ensemble_onset_30d.joblib
|   +-- ensemble_break_7d.joblib
|   +-- ensemble_break_14d.joblib
|   +-- ensemble_break_21d.joblib
|   +-- ensemble_break_30d.joblib
|   +-- ensemble_heavy_7d.joblib
|   +-- ensemble_heavy_14d.joblib
|   +-- ensemble_heavy_21d.joblib
|   +-- ensemble_heavy_30d.joblib
|   +-- scaler.joblib
|   +-- model_config.json
|   +-- training_results.json
|   +-- false_onset_config.json
+-- training/                        <- ML training code
|   +-- train_models_v2.py           <- MAIN training script
|   +-- train_models.py              <- V1 (reference only)
|   +-- download_imd_data.py         <- Data download script
+-- docs/                            <- Documentation
|   +-- INTEGRATION_GUIDE.md         <- THIS FILE
|   +-- ML_TRAINING_GUIDE_2          <- V2 guide
|   +-- dataset_explanation.md       <- Dataset docs
+-- data/                            <- Add to .gitignore (too large ~2-3GB)
+-- requirements.txt
+-- README.md
```

> Add `data/` folder and `*_raw.joblib` files to `.gitignore` - they are too large / not needed for production.

---

## Quick Checklist for Backend Team

- [ ] Install: `pip install scikit-learn xgboost joblib numpy`
- [ ] Copy entire `models/` folder to backend project
- [ ] Load `scaler.joblib` at app startup
- [ ] Load all 12 `ensemble_*.joblib` models at app startup
- [ ] Read `model_config.json` for feature names and order
- [ ] Build feature vector (33 features) from API data sources
- [ ] Scale features using loaded scaler
- [ ] Call `model.predict_proba(scaled_input)[0][1]` for each model
- [ ] Return 12 probabilities as JSON to frontend
- [ ] Use `false_onset_config.json` for per-district false onset risk
