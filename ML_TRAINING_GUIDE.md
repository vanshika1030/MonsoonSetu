# 🧠 ML Model Training Guide — For the Model Person

> **Your job:** Train 2 models (+ 1 stretch goal), save them in the exact format described below, and hand me the output files. I'll integrate them into the web app.
>
> **Timeline:** I need Model 1 first (it's the core). Model 2 can come after. Model 3 only if time permits.

---

## Quick Summary

| # | Model | What It Does | Priority |
|---|---|---|---|
| **Model 1** | Rainfall Prediction Ensemble | Predicts P(onset), P(break), P(heavy_rain) at 7/14/21/30 day horizons for any district | 🔴 CRITICAL — nothing works without this |
| **Model 2** | False Onset Detector | Flags when recent rain looks like monsoon onset but is actually a trap (dry spell coming) | 🟡 HIGH — this is the PS's core pain point |
| **Model 3** | NDVI Vegetation Validator | Predicts crop health from satellite data to cross-check rainfall predictions | 🟢 STRETCH — only if you have time |

---

## Model 1: Rainfall Prediction Ensemble

### What It Does
Takes global climate indices (ENSO, IOD, MJO) + recent rainfall history + location info → outputs probability of onset, break (dry spell), and heavy rainfall at 4 time horizons (7, 14, 21, 30 days ahead).

### Datasets You Need

#### A. IMD 0.25° Gridded Daily Rainfall (1990–2023)

This is India's official rainfall dataset. 0.25° grid = ~25km resolution, daily, covers all of India.

```bash
pip install imdlib
```

```python
import imdlib as imd

# Download rainfall data (this will download ~2-3 GB total)
# file_dir is where the .grd files will be saved
start_yr = 1990
end_yr = 2023

# Download rain data
data = imd.open_data('rain', start_yr, end_yr, 'yearwise', file_dir='./data/imd_rain/')

# Convert to xarray Dataset
ds = data.get_xarray()
# This gives you an xarray Dataset with dimensions (time, lat, lon)

# To extract for a specific district centroid:
import numpy as np
lat, lon = 18.99, 75.76  # Beed, Maharashtra
rain_series = ds.sel(lat=lat, lon=lon, method='nearest')['rain'].values
# rain_series is now a 1D array of daily rainfall in mm
```

> **IMPORTANT:** `imdlib` downloads binary `.grd` files from IMD's server. Sometimes the server is slow. If it fails, try off-peak hours (late night IST). Alternatively, download manually from https://www.imdpune.gov.in/cmpg/Griddata/Rainfall_25_Bin.html

#### B. IMD 0.25° Gridded Daily Temperature — BOTH tmax AND tmin (1990–2023)

**CRITICAL — the PS says "regional atmospheric data", not just rainfall.** You need BOTH max and min temperature. Here's why each matters:

- **tmax:** Pre-monsoon heat buildup drives land-ocean thermal contrast which triggers monsoon onset (Roxy et al., 2017, Nature Comms)
- **tmin:** Nighttime minimum reflects moisture availability — wetter air = warmer nights
- **tmax − tmin (Diurnal Temperature Range / DTR):** This is a validated **humidity proxy**. Larger DTR = drier air = faster soil moisture loss = worse false-onset conditions (Dai et al., 1999, J. Climate). We use DTR because imdlib does NOT provide gridded humidity or wind — DTR is the standard workaround.

```python
import imdlib as imd

# Same package, same format as rainfall. Download BOTH.
tmax_data = imd.open_data('tmax', 1990, 2023, 'yearwise', file_dir='./data/imd_tmax/')
tmin_data = imd.open_data('tmin', 1990, 2023, 'yearwise', file_dir='./data/imd_tmin/')

# Extract for a district:
ds_tmax = tmax_data.get_xarray()
ds_tmin = tmin_data.get_xarray()
lat, lon = 18.99, 75.76  # Beed
tmax_series = ds_tmax.sel(lat=lat, lon=lon, method='nearest')['tmax'].values
tmin_series = ds_tmin.sel(lat=lat, lon=lon, method='nearest')['tmin'].values
dtr_series = tmax_series - tmin_series  # Diurnal Temperature Range
```

> **Why no humidity/wind?** imdlib only provides `rain`, `tmax`, `tmin`. Gridded humidity and wind would require ERA5 reanalysis data (ECMWF CDS API — free but slow, multi-GB downloads, account registration queue). For this project, we use DTR as a humidity proxy and the evapotranspiration_proxy feature (see Feature Engineering below) as a soil-moisture-stress approximation. This is methodologically justified — cite Dai et al., 1999 if judges ask.

#### C. ENSO — Oceanic Niño Index (ONI)

Monthly values. Measures El Niño / La Niña state.

```python
import pandas as pd

# NOAA CPC ONI data (direct text file)
url = "https://www.cpc.ncep.noaa.gov/data/indices/oni.ascii.txt"
oni_df = pd.read_fwf(url)
# The ANOM column is the ONI value you need
# ONI > +0.5 = El Niño, ONI < -0.5 = La Niña
```

> **NOTE:** ONI is updated monthly with a 1-month lag. For training data, **forward-fill** these to daily resolution (i.e., June 2015's ONI value applies to all days in June 2015).

#### C. IOD — Dipole Mode Index (DMI)

Monthly values. Measures Indian Ocean temperature gradient.

```python
# NOAA PSL DMI data
url = "https://psl.noaa.gov/gcos_wgsp/Timeseries/Data/dmi.had.long.data"
# Space-separated text file with year as first column, then 12 monthly values
# DMI > +0.4 = positive IOD (generally good for Indian monsoon)
# DMI < -0.4 = negative IOD (generally bad)
```

#### D. MJO — Madden-Julian Oscillation (RMM Index)

**Daily values.** This is the most granular climate index you have.

```python
# Australian Bureau of Meteorology (BoM) RMM data
url = "http://www.bom.gov.au/climate/mjo/graphics/rmm.74toRealtime.txt"
# Columns: year, month, day, RMM1, RMM2, phase, amplitude
# Phase (1-8) tells you where the MJO convection center is
# Phases 2-3 over Indian Ocean = favorable for Indian rainfall
# Phases 6-7 over Western Pacific = suppressed Indian rainfall
# Amplitude > 1.0 = MJO is active and influential

mjo_df = pd.read_csv(url, delim_whitespace=True, skiprows=2,
                       names=['year','month','day','RMM1','RMM2','phase','amplitude'],
                       na_values=['999', '1e36', '*'])
mjo_df['date'] = pd.to_datetime(mjo_df[['year','month','day']])
```

#### E. District Centroid Coordinates

Start with Maharashtra — drought-prone Kharif belt, good demo state.

```python
districts = {
    'Beed':       {'lat': 18.99, 'lon': 75.76, 'elevation': 523},
    'Latur':      {'lat': 18.40, 'lon': 76.57, 'elevation': 632},
    'Osmanabad':  {'lat': 18.18, 'lon': 76.04, 'elevation': 648},
    'Solapur':    {'lat': 17.68, 'lon': 75.91, 'elevation': 458},
    'Ahmednagar': {'lat': 19.09, 'lon': 74.74, 'elevation': 649},
    'Jalna':      {'lat': 19.84, 'lon': 75.88, 'elevation': 505},
    'Aurangabad': {'lat': 19.88, 'lon': 75.34, 'elevation': 568},
    'Pune':       {'lat': 18.52, 'lon': 73.86, 'elevation': 560},
    'Satara':     {'lat': 17.68, 'lon': 74.00, 'elevation': 751},
    'Kolhapur':   {'lat': 16.70, 'lon': 74.24, 'elevation': 569},
    'Nashik':     {'lat': 20.00, 'lon': 73.78, 'elevation': 584},
    'Nagpur':     {'lat': 21.15, 'lon': 79.09, 'elevation': 310},
    'Amravati':   {'lat': 20.93, 'lon': 77.75, 'elevation': 350},
    'Wardha':     {'lat': 20.74, 'lon': 78.60, 'elevation': 281},
    'Yavatmal':   {'lat': 20.39, 'lon': 78.12, 'elevation': 367},
}
```

---

### Feature Engineering

For each **district × date** combination, construct this feature vector:

```python
def build_features(district_lat, district_lon, date, rain_data, tmax_data, tmin_data, oni_data, dmi_data, mjo_data, elevation):
    """
    Build feature vector for one district on one date.
    Returns dict of features (~34 total).
    """
    rain = get_rain_series(rain_data, district_lat, district_lon, end_date=date)
    tmax = get_tmax_series(tmax_data, district_lat, district_lon, end_date=date)
    tmin = get_tmin_series(tmin_data, district_lat, district_lon, end_date=date)
    
    features = {
        # === CLIMATE INDICES ===
        'oni': get_oni_for_date(oni_data, date),
        'dmi': get_dmi_for_date(dmi_data, date),
        'mjo_phase': get_mjo_phase(mjo_data, date),       # categorical 1-8
        'mjo_amplitude': get_mjo_amplitude(mjo_data, date),
        
        # === LAGGED RAINFALL FEATURES ===
        'rain_1d': rain[-1],
        'rain_3d_sum': rain[-3:].sum(),
        'rain_7d_sum': rain[-7:].sum(),
        'rain_14d_sum': rain[-14:].sum(),
        'rain_30d_sum': rain[-30:].sum(),
        'rain_7d_mean': rain[-7:].mean(),
        'rain_14d_mean': rain[-14:].mean(),
        'rain_30d_mean': rain[-30:].mean(),
        'rain_7d_max': rain[-7:].max(),
        'rain_7d_std': rain[-7:].std(),
        'dry_days_streak': count_consecutive_dry(rain, threshold=2.5),
        
        # === TEMPERATURE FEATURES (PS requires "regional atmospheric data") ===
        'tmax_7d_mean': tmax[-7:].mean(),                  # 7-day mean max temperature
        'tmin_7d_mean': tmin[-7:].mean(),                  # 7-day mean min temperature
        'dtr_7d_mean': (tmax[-7:] - tmin[-7:]).mean(),     # Diurnal Temperature Range (tmax-tmin)
                                                             # DTR is a validated humidity PROXY —
                                                             # larger DTR = drier air = faster soil moisture loss
                                                             # (Dai et al., 1999, J. Climate)
        'tmax_anomaly': tmax[-7:].mean() - get_climatological_tmax(district_lat, district_lon, date),
                                                             # deviation from historical avg for this location+DOY
        'pre_monsoon_heat_days': (tmax[-30:] > 40).sum(),   # days above 40°C in last 30 days
                                                             # (drives land-ocean thermal contrast → onset trigger)
                                                             # (Roxy et al., 2017, Nature Comms)
        
        # === SOIL MOISTURE STRESS PROXY (for false onset / AWSI logic) ===
        # We don't have direct soil moisture or humidity from imdlib.
        # These derived features approximate water stress from available data:
        'temp_rain_ratio': tmax[-7:].mean() / max(rain[-7:].mean(), 0.1),
                                                             # high temp + low rain = moisture stress
        'evapotranspiration_proxy': (tmax[-7:].mean() - tmin[-7:].mean()) * (1 - min(rain[-7:].sum() / 50.0, 1.0)),
                                                             # DTR × (1 - rain_saturation) approximates
                                                             # atmospheric moisture demand vs supply
                                                             # Higher value = more moisture stress
        
        # === SEASONAL FEATURES ===
        'day_of_year': date.timetuple().tm_yday,
        'month': date.month,
        'week_of_year': date.isocalendar()[1],
        
        # === LOCATION FEATURES ===
        'latitude': district_lat,
        'longitude': district_lon,
        'elevation': elevation,
        
        # === DERIVED INTERACTION FEATURES ===
        'oni_x_dmi': get_oni_for_date(oni_data, date) * get_dmi_for_date(dmi_data, date),
        'oni_x_rain30d': get_oni_for_date(oni_data, date) * rain[-30:].mean(),
        'mjo_favorable': 1 if get_mjo_phase(mjo_data, date) in [2, 3] and get_mjo_amplitude(mjo_data, date) > 1.0 else 0,
        'mjo_suppressive': 1 if get_mjo_phase(mjo_data, date) in [6, 7] and get_mjo_amplitude(mjo_data, date) > 1.0 else 0,
    }
    return features
```

---

### Target Variables (Labels)

For each district × date, compute these **from actual future rainfall** (you have this in historical data):

```python
def build_targets(rain_data, district_lat, district_lon, date):
    """
    Build target labels using FUTURE rainfall data.
    """
    future_rain = get_rain_series(rain_data, district_lat, district_lon, 
                                   start_date=date, end_date=date + timedelta(days=30))
    
    targets = {}
    for horizon in [7, 14, 21, 30]:
        window = future_rain[:horizon]
        
        # ONSET: 3 out of 5 consecutive days with rain >= 2.5mm
        targets[f'onset_{horizon}d'] = 1 if detect_onset(window) else 0
        
        # BREAK: 7+ consecutive days with rain < 2.5mm
        targets[f'break_{horizon}d'] = 1 if detect_break(window) else 0
        
        # HEAVY: any day >= 64.5mm (IMD "heavy rainfall" threshold)
        targets[f'heavy_{horizon}d'] = 1 if any(window >= 64.5) else 0
        
        # TOTAL RAIN (regression, optional)
        targets[f'total_rain_{horizon}d'] = window.sum()
    
    return targets
```

> **IMPORTANT:** Only use data from **June 1 – September 30** (JJAS monsoon season) for training. Non-monsoon months have completely different dynamics.

---

### Training Procedure

```python
from sklearn.model_selection import TimeSeriesSplit
from sklearn.ensemble import (RandomForestClassifier, GradientBoostingClassifier,
                               StackingClassifier)
from sklearn.linear_model import LogisticRegression
from xgboost import XGBClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import f1_score, precision_score, recall_score, brier_score_loss
import joblib, json

# ========== 1. TIME-BASED SPLIT (DO NOT USE RANDOM SPLIT!) ==========
# Train: 1990-2019 (30 years)
# Validation: 2020-2021
# Test (holdout): 2022-2023

# ========== 2. SCALE FEATURES ==========
scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_val_scaled = scaler.transform(X_val)
X_test_scaled = scaler.transform(X_test)
joblib.dump(scaler, 'models/scaler.joblib')  # SAVE THIS!

# ========== 3. TRAIN 12 ENSEMBLES ==========
TARGETS = [
    'onset_7d', 'onset_14d', 'onset_21d', 'onset_30d',
    'break_7d', 'break_14d', 'break_21d', 'break_30d',
    'heavy_7d', 'heavy_14d', 'heavy_21d', 'heavy_30d',
]

for target in TARGETS:
    y_train = Y_train[target]
    
    base_models = [
        ('xgb', XGBClassifier(
            n_estimators=200, max_depth=6, learning_rate=0.1,
            subsample=0.8, colsample_bytree=0.8,
            scale_pos_weight=(1 - y_train.mean()) / y_train.mean(),
            random_state=42, use_label_encoder=False, eval_metric='logloss'
        )),
        ('rf', RandomForestClassifier(
            n_estimators=200, max_depth=10,
            class_weight='balanced', random_state=42, n_jobs=-1
        )),
        ('gb', GradientBoostingClassifier(
            n_estimators=150, max_depth=5,
            learning_rate=0.1, random_state=42
        )),
    ]
    
    ensemble = StackingClassifier(
        estimators=base_models,
        final_estimator=LogisticRegression(max_iter=1000),
        cv=TimeSeriesSplit(n_splits=5),
        stack_method='predict_proba',  # CRITICAL: we need probabilities!
        passthrough=False
    )
    
    ensemble.fit(X_train_scaled, y_train)
    
    # Evaluate (raw, uncalibrated)
    y_val_proba = ensemble.predict_proba(X_val_scaled)[:, 1]
    y_test_proba = ensemble.predict_proba(X_test_scaled)[:, 1]
    
    # ========== CALIBRATE PROBABILITIES (CRITICAL!) ==========
    # Tree ensemble outputs are NOT well-calibrated by default.
    # "68%" from raw XGBoost doesn't mean "happens 68% of the time."
    # Isotonic regression fixes this using the validation set.
    from sklearn.calibration import CalibratedClassifierCV
    
    calibrated_ensemble = CalibratedClassifierCV(
        ensemble,
        method='isotonic',  # non-parametric, handles non-linear miscalibration
        cv='prefit'         # ensemble is already trained, just calibrate
    )
    calibrated_ensemble.fit(X_val_scaled, Y_val[target])
    
    # Verify calibration on test set (generate reliability diagram)
    y_test_calibrated = calibrated_ensemble.predict_proba(X_test_scaled)[:, 1]
    
    # Save BOTH versions (calibrated is what goes to production)
    joblib.dump(ensemble, f'models/ensemble_{target}_raw.joblib')
    joblib.dump(calibrated_ensemble, f'models/ensemble_{target}.joblib')  # THIS is what I'll use

# ========== 4. SAVE CONFIG ==========
config = {
    'feature_names': list(X_train.columns),
    'targets': TARGETS,
    'train_years': '1990-2019',
    'val_years': '2020-2021', 
    'test_years': '2022-2023',
    'districts': list(districts.keys()),
    'season': 'JJAS (June-September)',
    'onset_definition': '3 out of 5 consecutive days with rain >= 2.5mm',
    'break_definition': '7+ consecutive days with rain < 2.5mm',
    'heavy_definition': 'any day with rain >= 64.5mm',
}
with open('models/model_config.json', 'w') as f:
    json.dump(config, f, indent=2, default=str)
```

---

### What You MUST Deliver to Me

```
models/
├── scaler.joblib                    # StandardScaler fitted on training data
├── ensemble_onset_7d.joblib         # 7-day onset prediction
├── ensemble_onset_14d.joblib        # 14-day onset prediction
├── ensemble_onset_21d.joblib        # 21-day onset prediction
├── ensemble_onset_30d.joblib        # 30-day onset prediction
├── ensemble_break_7d.joblib         # 7-day break prediction
├── ensemble_break_14d.joblib        # 14-day break prediction
├── ensemble_break_21d.joblib        # 21-day break prediction
├── ensemble_break_30d.joblib        # 30-day break prediction
├── ensemble_heavy_7d.joblib         # 7-day heavy rain prediction
├── ensemble_heavy_14d.joblib        # 14-day heavy rain prediction
├── ensemble_heavy_21d.joblib        # 21-day heavy rain prediction
├── ensemble_heavy_30d.joblib        # 30-day heavy rain prediction
├── model_config.json                # Feature names, metrics, definitions
└── training_notebook.ipynb          # Your training notebook (for judges)
```

> **CRITICAL:** The feature names in `model_config.json` MUST exactly match what I pass during inference. If you rename or add/remove a feature, tell me immediately.

### Inference Contract (How I'll Use Your Models)

```python
# I'll call this:
model = joblib.load('models/ensemble_break_14d.joblib')
scaler = joblib.load('models/scaler.joblib')

features = build_features(...)  # dict with your exact feature names
X = pd.DataFrame([features])[config['feature_names']]  # ensure column order
X_scaled = scaler.transform(X)

probability = model.predict_proba(X_scaled)[:, 1][0]  # float 0.0 - 1.0
# This is what goes on the dashboard as "68% break risk in 14 days"
```

---

## Model 2: False Onset Detector

### What It Does
Detects when recent rainfall looks like monsoon onset but is actually a pre-monsoon shower followed by a dry spell.

### Approach
**Rule-based with data-derived thresholds.** You analyze historical IMD data to find all false onset events, then extract the statistical thresholds.

```python
# Step 1: Find all historical false onsets
def find_false_onsets(rain_series, year):
    """
    False onset = 3+ days of rain >= 2.5mm/day
    FOLLOWED BY 10+ consecutive dry days within next 14 days
    During June 1 - July 31
    """
    jjas = rain_series[(rain_series.index.month >= 6) & 
                        (rain_series.index.month <= 7) &
                        (rain_series.index.year == year)]
    
    false_onsets = []
    i = 0
    while i < len(jjas) - 20:
        window = jjas.iloc[i:i+5]
        wet_days = (window >= 2.5).sum()
        
        if wet_days >= 3:  # looks like onset
            post_window = jjas.iloc[i+5:i+19]
            max_dry = max_consecutive_below(post_window, 2.5)
            
            if max_dry >= 10:  # FALSE ONSET
                false_onsets.append({
                    'onset_start': jjas.index[i],
                    'total_rain': window.sum(),
                    'dry_spell_length': max_dry,
                    'antecedent_rain_30d': jjas.iloc[max(0,i-30):i].sum(),
                })
                i += 19
            else:
                i += 1
        else:
            i += 1
    return false_onsets

# Step 2: Run across all districts × all years (1990-2023)
# Step 3: Compute threshold statistics from all events
# Step 4: Save as config JSON
```

### What You MUST Deliver

```
models/
├── false_onset_config.json          # Thresholds from data analysis
└── false_onset_analysis.ipynb       # Analysis notebook (for judges)
```

**`false_onset_config.json` format:**
```json
{
    "onset_rain_threshold_mm": 35.0,
    "antecedent_rain_threshold_mm": 80.0,
    "dry_spell_risk_oni_above": 0.5,
    "dry_spell_risk_dmi_below": -0.3,
    "mjo_suppressive_phases": [5, 6, 7],
    "false_onset_frequency_by_district": {
        "Beed": 0.35,
        "Latur": 0.28,
        "Solapur": 0.42
    }
}
```

---

## Model 3: NDVI Vegetation Validator (STRETCH GOAL)

### What It Does
Predicts expected crop vegetation health (NDVI) from rainfall patterns. Used to cross-check: if model says "good rain" but satellite shows stressed crops → flag anomaly.

### Dataset
NASA MODIS NDVI (MOD13A2, 16-day composite, 1km resolution). Use AppEEARS API (https://appeears.earthdatacloud.nasa.gov/) or Google Earth Engine to extract NDVI for district bounding boxes, 2000-2023.

### Training
Simple Random Forest Regressor:
- X = cumulative rainfall (30/60/90 days), dry spell count, temperature proxy
- y = NDVI value 16 days later (vegetation responds to rain with a lag)
- If R² > 0.6, it's useful

### Deliver: `models/ndvi_validator.joblib` + notebook

---

## Common Pitfalls — DON'T Do These

1. **DON'T use random train/test split.** Time series = chronological split only. Random split leaks future info.
2. **DON'T train on full year.** JJAS only (June-September). Winter data will confuse the model.
3. **DON'T ignore class imbalance.** Heavy rainfall is rare (~5-10% of days). Use `class_weight='balanced'` or `scale_pos_weight`.
4. **DON'T forget to save the scaler.** Without it, inference produces garbage.
5. **DON'T optimize for accuracy alone.** Recall matters more for BREAK (missing a warning is worse than false alarm). Precision matters more for ONSET (telling farmer to sow when it's not safe is worse than delay).
6. **DON'T panic if heavy rain R² is low (~0.1-0.2).** Expected. The model's value is onset/break prediction.

---

## Environment Requirements

```bash
pip install imdlib xgboost scikit-learn pandas numpy joblib matplotlib seaborn jupyter
```

Python 3.9+ recommended. Tell me your exact versions when done.

---

## Checklist Before Handing Off

- [ ] All 12 `.joblib` ensemble files saved and loadable
- [ ] `scaler.joblib` saved
- [ ] `model_config.json` with exact feature names and metrics
- [ ] `false_onset_config.json` with data-derived thresholds
- [ ] Training notebook(s) clean and commented
- [ ] Verified `joblib.load()` → `predict_proba()` works on sample input
- [ ] Told me Python version + package versions

**Ping me the moment Model 1 files are ready.**
