"""
=============================================================================
  MONSOON PREDICTION MODEL TRAINER V2
  SIH Problem Statement 26086
=============================================================================
IMPROVEMENTS OVER V1:
  - 4 new features: tmax_anomaly, pre_monsoon_heat_days, temp_rain_ratio, evapotranspiration_proxy
  - Class balancing: XGBoost scale_pos_weight + RF class_weight='balanced'
  - 3-way split: Train(1990-2019) / Val(2020-2021) / Test(2022-2023)
  - Isotonic probability calibration on validation set
  - Updated districts (Wardha/Yavatmal replace Buldhana/Sangli)
  - Per-district false onset frequency analysis
  - Saves BOTH raw + calibrated models

Usage: python train_models_v2.py
"""

import os
import sys
import time
import json
import warnings
import numpy as np
import pandas as pd
import joblib
import gc
from datetime import datetime, timedelta

from sklearn.ensemble import (
    StackingClassifier,
    RandomForestClassifier,
    GradientBoostingClassifier,
)
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import TimeSeriesSplit
from sklearn.preprocessing import StandardScaler
from sklearn.calibration import CalibratedClassifierCV
from sklearn.metrics import (
    accuracy_score,
    f1_score,
    roc_auc_score,
    precision_score,
    recall_score,
    brier_score_loss,
)
from xgboost import XGBClassifier

warnings.filterwarnings('ignore')

# =============================================================================
# CONFIGURATION
# =============================================================================
BASE_DIR = r'C:\MOdel'
DATA_DIR = os.path.join(BASE_DIR, 'data')
MODEL_DIR = os.path.join(BASE_DIR, 'models')
os.makedirs(MODEL_DIR, exist_ok=True)

START_YEAR = 1990
END_YEAR = 2023

# 3-WAY SPLIT (Guide 2 requirement)
TRAIN_END_YEAR = 2019     # 1990-2019 = 30 years
VAL_START_YEAR = 2020     # 2020-2021 = calibration
VAL_END_YEAR = 2021
TEST_START_YEAR = 2022    # 2022-2023 = final evaluation
TEST_END_YEAR = 2023

MONSOON_START_MONTH = 6
MONSOON_END_MONTH = 9

# Thresholds (IMD standards)
RAIN_DAY_THRESHOLD = 2.5
HEAVY_RAIN_THRESHOLD = 64.5
ONSET_MIN_DAYS = 3
ONSET_WINDOW = 5
ONSET_TOTAL_RAIN = 20.0
BREAK_CONSECUTIVE_DRY = 7

HORIZONS = [7, 14, 21, 30]
EVENT_TYPES = ['onset', 'break', 'heavy']

# Updated districts (Guide 2: Wardha/Yavatmal replace Buldhana/Sangli)
DISTRICTS = {
    'Beed':        {'lat': 18.99, 'lon': 75.76, 'elev': 523},
    'Latur':       {'lat': 18.40, 'lon': 76.57, 'elev': 632},
    'Osmanabad':   {'lat': 18.18, 'lon': 76.04, 'elev': 648},
    'Solapur':     {'lat': 17.68, 'lon': 75.91, 'elev': 458},
    'Ahmednagar':  {'lat': 19.09, 'lon': 74.74, 'elev': 649},
    'Jalna':       {'lat': 19.84, 'lon': 75.88, 'elev': 505},
    'Aurangabad':  {'lat': 19.88, 'lon': 75.34, 'elev': 568},
    'Pune':        {'lat': 18.52, 'lon': 73.86, 'elev': 560},
    'Satara':      {'lat': 17.68, 'lon': 74.00, 'elev': 751},
    'Kolhapur':    {'lat': 16.70, 'lon': 74.24, 'elev': 569},
    'Nashik':      {'lat': 20.00, 'lon': 73.78, 'elev': 584},
    'Nagpur':      {'lat': 21.15, 'lon': 79.09, 'elev': 310},
    'Amravati':    {'lat': 20.93, 'lon': 77.75, 'elev': 350},
    'Wardha':      {'lat': 20.74, 'lon': 78.60, 'elev': 281},
    'Yavatmal':    {'lat': 20.39, 'lon': 78.12, 'elev': 367},
}

print("=" * 70)
print("  MONSOON PREDICTION MODEL TRAINER V2")
print("  Improvements: class balancing, calibration, 4 new features")
print(f"  Train: {START_YEAR}-{TRAIN_END_YEAR} | Val: {VAL_START_YEAR}-{VAL_END_YEAR} | Test: {TEST_START_YEAR}-{TEST_END_YEAR}")
print(f"  Districts: {len(DISTRICTS)} | Models: {len(EVENT_TYPES) * len(HORIZONS)}")
print("=" * 70)

# =============================================================================
# PHASE 1: LOAD RAW DATA
# =============================================================================
print("\n[PHASE 1] Loading raw datasets...")
phase1_start = time.time()

import imdlib as imd

print("  Loading IMD Rainfall (1990-2023)... ", end="", flush=True)
rain_obj = imd.open_data('rain', START_YEAR, END_YEAR, 'yearwise',
                         file_dir=os.path.join(DATA_DIR, 'imd_rain'))
ds_rain = rain_obj.get_xarray()
rain_var = list(ds_rain.data_vars)[0]
print(f"OK - shape {ds_rain[rain_var].shape}")

print("  Loading IMD Tmax (1990-2023)... ", end="", flush=True)
tmax_obj = imd.open_data('tmax', START_YEAR, END_YEAR, 'yearwise',
                         file_dir=os.path.join(DATA_DIR, 'imd_tmax'))
ds_tmax = tmax_obj.get_xarray()
tmax_var = list(ds_tmax.data_vars)[0]
print(f"OK - shape {ds_tmax[tmax_var].shape}")

print("  Loading IMD Tmin (1990-2023)... ", end="", flush=True)
tmin_obj = imd.open_data('tmin', START_YEAR, END_YEAR, 'yearwise',
                         file_dir=os.path.join(DATA_DIR, 'imd_tmin'))
ds_tmin = tmin_obj.get_xarray()
tmin_var = list(ds_tmin.data_vars)[0]
print(f"OK - shape {ds_tmin[tmin_var].shape}")

print(f"  Phase 1 complete ({time.time()-phase1_start:.1f}s)")

# =============================================================================
# PHASE 2: PARSE CLIMATE INDICES
# =============================================================================
print("\n[PHASE 2] Parsing climate indices...")
phase2_start = time.time()

# --- ONI ---
print("  Parsing ONI (ENSO)... ", end="", flush=True)
oni_df = pd.read_fwf(os.path.join(DATA_DIR, 'climate_indices', 'oni.txt'))
SEAS_TO_MONTH = {
    'DJF': 1, 'JFM': 2, 'FMA': 3, 'MAM': 4, 'AMJ': 5, 'MJJ': 6,
    'JJA': 7, 'JAS': 8, 'ASO': 9, 'SON': 10, 'OND': 11, 'NDJ': 12
}
oni_df['month'] = oni_df['SEAS'].map(SEAS_TO_MONTH)
oni_df = oni_df.dropna(subset=['month'])
oni_df['month'] = oni_df['month'].astype(int)
oni_lookup = {}
for _, row in oni_df.iterrows():
    oni_lookup[(int(row['YR']), int(row['month']))] = float(row['ANOM'])
print(f"OK - {len(oni_lookup)} entries")

# --- DMI ---
print("  Parsing DMI (IOD)... ", end="", flush=True)
dmi_lookup = {}
with open(os.path.join(DATA_DIR, 'climate_indices', 'dmi.txt'), 'r') as f:
    lines = f.readlines()
for line in lines:
    line = line.strip()
    if not line:
        continue
    parts = line.split()
    if len(parts) < 13:
        continue
    try:
        year = int(parts[0])
        if year < 0:
            continue
        for month_idx in range(12):
            val = float(parts[1 + month_idx])
            if val > -90:
                dmi_lookup[(year, month_idx + 1)] = val
    except (ValueError, IndexError):
        continue
print(f"OK - {len(dmi_lookup)} entries")

# --- MJO ---
print("  Parsing MJO (RMM)... ", end="", flush=True)
mjo_df = pd.read_csv(
    os.path.join(DATA_DIR, 'climate_indices', 'mjo.txt'),
    sep=r'\s+', skiprows=2, header=None
)
mjo_df.columns = ['year', 'month', 'day', 'RMM1', 'RMM2', 'phase', 'amplitude'] + \
                 [f'extra_{i}' for i in range(mjo_df.shape[1] - 7)]
mjo_df.loc[mjo_df['phase'] > 8, 'phase'] = 0
mjo_df.loc[mjo_df['phase'] < 1, 'phase'] = 0
mjo_df.loc[mjo_df['amplitude'] > 10, 'amplitude'] = 0.0
mjo_lookup = {}
for _, row in mjo_df.iterrows():
    try:
        key = (int(row['year']), int(row['month']), int(row['day']))
        mjo_lookup[key] = (int(row['phase']), float(row['amplitude']))
    except (ValueError, KeyError):
        continue
print(f"OK - {len(mjo_lookup)} entries")

print(f"  Phase 2 complete ({time.time()-phase2_start:.1f}s)")

# =============================================================================
# PHASE 3: EXTRACT DISTRICT TIME SERIES
# =============================================================================
print("\n[PHASE 3] Extracting district-level time series...")
phase3_start = time.time()

rain_times = pd.DatetimeIndex(ds_rain.time.values)
tmax_times = pd.DatetimeIndex(ds_tmax.time.values)
tmin_times = pd.DatetimeIndex(ds_tmin.time.values)

district_data = {}

for name, info in DISTRICTS.items():
    lat, lon = info['lat'], info['lon']

    # Rain: 0.25 deg grid
    rain_ts = ds_rain[rain_var].sel(lat=lat, lon=lon, method='nearest').values.astype(np.float32)
    rain_ts = np.where(np.isnan(rain_ts) | (rain_ts < 0), 0.0, rain_ts)

    # Tmax/Tmin: 1 deg grid - align to rain's time axis
    tmax_ts_raw = ds_tmax[tmax_var].sel(lat=lat, lon=lon, method='nearest').values.astype(np.float32)
    tmin_ts_raw = ds_tmin[tmin_var].sel(lat=lat, lon=lon, method='nearest').values.astype(np.float32)

    tmax_ts = np.full(len(rain_times), np.nan, dtype=np.float32)
    tmin_ts = np.full(len(rain_times), np.nan, dtype=np.float32)

    tmax_date_map = {d: i for i, d in enumerate(tmax_times)}
    tmin_date_map = {d: i for i, d in enumerate(tmin_times)}

    for i, dt in enumerate(rain_times):
        if dt in tmax_date_map:
            val = tmax_ts_raw[tmax_date_map[dt]]
            if not np.isnan(val) and -50 < val < 60:
                tmax_ts[i] = val
        if dt in tmin_date_map:
            val = tmin_ts_raw[tmin_date_map[dt]]
            if not np.isnan(val) and -30 < val < 50:
                tmin_ts[i] = val

    # Forward-fill then back-fill NaN
    for arr in [tmax_ts, tmin_ts]:
        for i in range(1, len(arr)):
            if np.isnan(arr[i]):
                arr[i] = arr[i-1]
        for i in range(len(arr)-2, -1, -1):
            if np.isnan(arr[i]):
                arr[i] = arr[i+1]

    district_data[name] = {
        'rain': rain_ts,
        'tmax': tmax_ts,
        'tmin': tmin_ts,
        'lat': lat, 'lon': lon, 'elev': info['elev'],
    }
    print(f"  {name}: rain_mean={rain_ts.mean():.1f}mm, tmax_mean={np.nanmean(tmax_ts):.1f}C")

del ds_rain, ds_tmax, ds_tmin, rain_obj, tmax_obj, tmin_obj
gc.collect()

print(f"  Phase 3 complete ({time.time()-phase3_start:.1f}s)")

# =============================================================================
# PHASE 3.5: COMPUTE CLIMATOLOGICAL TMAX (for tmax_anomaly feature)
# =============================================================================
print("\n[PHASE 3.5] Computing climatological tmax baselines...")
phase35_start = time.time()

# For each district and day-of-year (1-366), compute mean tmax from TRAINING years only (1990-2019)
climatological_tmax = {}  # (district_name, doy) -> mean_tmax

for name, ddata in district_data.items():
    tmax = ddata['tmax']
    doy_sums = {}
    doy_counts = {}

    for i, dt in enumerate(rain_times):
        if dt.year > TRAIN_END_YEAR:
            break  # Only use training years for climatology
        doy = dt.timetuple().tm_yday
        val = tmax[i]
        if not np.isnan(val):
            doy_sums[doy] = doy_sums.get(doy, 0.0) + val
            doy_counts[doy] = doy_counts.get(doy, 0) + 1

    for doy in range(1, 367):
        if doy in doy_sums and doy_counts[doy] > 0:
            climatological_tmax[(name, doy)] = doy_sums[doy] / doy_counts[doy]
        else:
            climatological_tmax[(name, doy)] = 35.0  # fallback

print(f"  Computed climatological tmax for {len(DISTRICTS)} districts x 366 DOYs")
print(f"  Phase 3.5 complete ({time.time()-phase35_start:.1f}s)")

# =============================================================================
# PHASE 4: FEATURE ENGINEERING & TARGET LABELS
# =============================================================================
print("\n[PHASE 4] Building features and target labels (33 features per sample)...")
phase4_start = time.time()


def count_consecutive_dry(rain_arr, threshold=2.5):
    count = 0
    for i in range(len(rain_arr) - 1, -1, -1):
        if rain_arr[i] < threshold:
            count += 1
        else:
            break
    return count


def check_onset(future_rain, window=5, min_days=3, total_threshold=20.0, day_threshold=2.5):
    n = len(future_rain)
    for i in range(n - window + 1):
        w = future_rain[i:i+window]
        rainy_days = np.sum(w >= day_threshold)
        total = np.sum(w)
        if rainy_days >= min_days and total >= total_threshold:
            return 1
    return 0


def check_break(future_rain, min_dry_days=7, threshold=2.5):
    n = len(future_rain)
    consecutive = 0
    for i in range(n):
        if future_rain[i] < threshold:
            consecutive += 1
            if consecutive >= min_dry_days:
                return 1
        else:
            consecutive = 0
    return 0


def check_heavy(future_rain, threshold=64.5):
    return 1 if np.any(future_rain >= threshold) else 0


def max_consecutive_below(arr, threshold):
    """Find max consecutive days below threshold."""
    max_run = 0
    current = 0
    for val in arr:
        if val < threshold:
            current += 1
            max_run = max(max_run, current)
        else:
            current = 0
    return max_run


# Build complete dataset
all_features = []
all_targets = []
all_years = []  # Track year for 3-way split
total_samples = 0
skipped_samples = 0

for year in range(START_YEAR, END_YEAR + 1):
    jjas_start = pd.Timestamp(year, MONSOON_START_MONTH, 1)
    jjas_end = pd.Timestamp(year, MONSOON_END_MONTH, 30)

    for name, ddata in district_data.items():
        rain = ddata['rain']
        tmax = ddata['tmax']
        tmin = ddata['tmin']

        for day_offset in range((jjas_end - jjas_start).days + 1):
            current_date = jjas_start + timedelta(days=day_offset)

            try:
                idx = rain_times.get_loc(current_date)
            except KeyError:
                skipped_samples += 1
                continue

            if idx < 30 or idx + 30 >= len(rain):
                skipped_samples += 1
                continue

            # ---- FEATURES (33 total) ----
            past_rain = rain[idx-30:idx+1]
            past_tmax = tmax[idx-30:idx+1]  # Need 30 days for pre_monsoon_heat_days
            past_tmin = tmin[idx-7:idx+1]

            yr, mo, dy = current_date.year, current_date.month, current_date.day
            oni_val = oni_lookup.get((yr, mo), oni_lookup.get((yr, max(1, mo-1)), 0.0))
            dmi_val = dmi_lookup.get((yr, mo), 0.0)
            mjo_phase, mjo_amp = mjo_lookup.get((yr, mo, dy), (0, 0.0))

            doy = current_date.timetuple().tm_yday

            # Compute derived values
            tmax_7d = past_tmax[-7:]
            tmin_7d = past_tmin[-7:]
            rain_7d = past_rain[-7:]
            rain_7d_mean = rain_7d.mean()

            tmax_7d_mean = tmax_7d.mean() if not np.all(np.isnan(tmax_7d)) else 35.0
            tmin_7d_mean = tmin_7d.mean() if not np.all(np.isnan(tmin_7d)) else 22.0
            dtr_7d = (tmax_7d - tmin_7d).mean() if not np.all(np.isnan(tmax_7d)) else 12.0

            # Climatological tmax anomaly
            clim_tmax = climatological_tmax.get((name, doy), 35.0)
            tmax_anomaly = tmax_7d_mean - clim_tmax

            # Pre-monsoon heat days (>40C in last 30 days)
            pre_monsoon_heat = int(np.sum(past_tmax[-30:] > 40))

            # Soil moisture stress proxies
            temp_rain_ratio = tmax_7d_mean / max(rain_7d_mean, 0.1)
            rain_saturation = min(rain_7d.sum() / 50.0, 1.0)
            evapotranspiration_proxy = dtr_7d * (1 - rain_saturation)

            features = {
                # Climate indices
                'oni': oni_val,
                'dmi': dmi_val,
                'mjo_phase': mjo_phase,
                'mjo_amplitude': mjo_amp,
                # Lagged rainfall
                'rain_1d': past_rain[-1],
                'rain_3d_sum': past_rain[-3:].sum(),
                'rain_7d_sum': past_rain[-7:].sum(),
                'rain_14d_sum': past_rain[-14:].sum(),
                'rain_30d_sum': past_rain[-30:].sum(),
                'rain_7d_mean': rain_7d_mean,
                'rain_14d_mean': past_rain[-14:].mean(),
                'rain_30d_mean': past_rain[-30:].mean(),
                'rain_7d_max': past_rain[-7:].max(),
                'rain_7d_std': past_rain[-7:].std(),
                'dry_days_streak': count_consecutive_dry(past_rain),
                # Temperature (PS: "regional atmospheric data")
                'tmax_7d_mean': tmax_7d_mean,
                'tmin_7d_mean': tmin_7d_mean,
                'dtr_7d_mean': dtr_7d,  # Humidity proxy (Dai et al., 1999)
                'tmax_drop_3d': (past_tmax[-4] - past_tmax[-1]) if len(past_tmax) >= 4 else 0.0,
                # NEW: Guide 2 features
                'tmax_anomaly': tmax_anomaly,
                'pre_monsoon_heat_days': pre_monsoon_heat,
                'temp_rain_ratio': temp_rain_ratio,
                'evapotranspiration_proxy': evapotranspiration_proxy,
                # Seasonal
                'day_of_year': doy,
                'month': mo,
                'week_of_year': current_date.isocalendar()[1],
                # Location
                'latitude': ddata['lat'],
                'longitude': ddata['lon'],
                'elevation': ddata['elev'],
                # Interactions
                'oni_x_dmi': oni_val * dmi_val,
                'oni_x_rain30d': oni_val * past_rain[-30:].mean(),
                'mjo_favorable': 1 if mjo_phase in [2, 3] and mjo_amp > 1.0 else 0,
                'mjo_suppressive': 1 if mjo_phase in [6, 7] and mjo_amp > 1.0 else 0,
            }

            # Clean NaN/Inf
            for k, v in features.items():
                if isinstance(v, (float, np.floating)) and (np.isnan(v) or np.isinf(v)):
                    features[k] = 0.0

            # ---- TARGETS ----
            targets = {}
            for horizon in HORIZONS:
                future_rain = rain[idx+1:idx+1+horizon]
                if len(future_rain) < horizon:
                    future_rain = np.concatenate([future_rain, np.zeros(horizon - len(future_rain))])
                targets[f'onset_{horizon}d'] = check_onset(future_rain)
                targets[f'break_{horizon}d'] = check_break(future_rain)
                targets[f'heavy_{horizon}d'] = check_heavy(future_rain)

            all_features.append(features)
            all_targets.append(targets)
            all_years.append(year)
            total_samples += 1

    years_done = year - START_YEAR + 1
    total_years = END_YEAR - START_YEAR + 1
    print(f"  Year {year} done ({years_done/total_years*100:.0f}%) - {total_samples:,} samples", flush=True)

print(f"\n  Total samples: {total_samples:,} | Skipped: {skipped_samples:,}")

df_features = pd.DataFrame(all_features)
df_targets = pd.DataFrame(all_targets)
years_arr = np.array(all_years)

del all_features, all_targets
gc.collect()

print(f"  Features: {df_features.shape[1]} columns, {df_features.shape[0]:,} rows")

# Show class balance
print("\n  Target class balance:")
for col in df_targets.columns:
    pos_pct = df_targets[col].mean() * 100
    print(f"    {col}: {pos_pct:.1f}% positive ({int(df_targets[col].sum()):,} events)")

print(f"\n  Phase 4 complete ({time.time()-phase4_start:.1f}s)")

# =============================================================================
# PHASE 5: 3-WAY SPLIT + SCALE
# =============================================================================
print("\n[PHASE 5] 3-way train/val/test split + scaling...")
phase5_start = time.time()

# Split by year
train_mask = years_arr <= TRAIN_END_YEAR
val_mask = (years_arr >= VAL_START_YEAR) & (years_arr <= VAL_END_YEAR)
test_mask = years_arr >= TEST_START_YEAR

X_train_raw = df_features[train_mask].values
X_val_raw = df_features[val_mask].values
X_test_raw = df_features[test_mask].values

print(f"  Train: {X_train_raw.shape[0]:,} samples ({START_YEAR}-{TRAIN_END_YEAR})")
print(f"  Val:   {X_val_raw.shape[0]:,} samples ({VAL_START_YEAR}-{VAL_END_YEAR})")
print(f"  Test:  {X_test_raw.shape[0]:,} samples ({TEST_START_YEAR}-{TEST_END_YEAR})")

# Scale (fit ONLY on training data)
feature_names = list(df_features.columns)
scaler = StandardScaler()
X_train = scaler.fit_transform(X_train_raw)
X_val = scaler.transform(X_val_raw)
X_test = scaler.transform(X_test_raw)

# Save scaler
scaler_path = os.path.join(MODEL_DIR, 'scaler.joblib')
joblib.dump(scaler, scaler_path)
print(f"  Scaler saved: {scaler_path}")

# Save config
config = {
    'feature_names': feature_names,
    'n_features': len(feature_names),
    'targets': [f'{e}_{h}d' for e in EVENT_TYPES for h in HORIZONS],
    'train_years': f'{START_YEAR}-{TRAIN_END_YEAR}',
    'val_years': f'{VAL_START_YEAR}-{VAL_END_YEAR}',
    'test_years': f'{TEST_START_YEAR}-{TEST_END_YEAR}',
    'districts': list(DISTRICTS.keys()),
    'season': 'JJAS (June-September)',
    'onset_definition': '3 out of 5 consecutive days with rain >= 2.5mm AND total >= 20mm',
    'break_definition': '7+ consecutive days with rain < 2.5mm',
    'heavy_definition': 'any day with rain >= 64.5mm (IMD very heavy)',
    'new_features_v2': ['tmax_anomaly', 'pre_monsoon_heat_days', 'temp_rain_ratio', 'evapotranspiration_proxy'],
    'humidity_proxy': 'dtr_7d_mean (Dai et al., 1999, J. Climate)',
}
config_path = os.path.join(MODEL_DIR, 'model_config.json')
with open(config_path, 'w') as f:
    json.dump(config, f, indent=2)

print(f"  Phase 5 complete ({time.time()-phase5_start:.1f}s)")

# =============================================================================
# PHASE 6: TRAIN 12 MODELS WITH CLASS BALANCING + CALIBRATION
# =============================================================================
print("\n[PHASE 6] Training 12 stacking ensembles with class balancing + calibration...")
print("  Architecture: XGBoost(balanced) + RF(balanced) + GB -> LogReg")
print("  + Isotonic calibration on validation set")
phase6_start = time.time()

results = {}
model_count = 0
total_models = len(EVENT_TYPES) * len(HORIZONS)

for event in EVENT_TYPES:
    for horizon in HORIZONS:
        model_count += 1
        target_col = f'{event}_{horizon}d'
        print(f"\n  [{model_count}/{total_models}] Training: {target_col}")

        y_train = df_targets[train_mask][target_col].values
        y_val = df_targets[val_mask][target_col].values
        y_test = df_targets[test_mask][target_col].values

        pos_ratio = y_train.mean()
        neg_ratio = 1 - pos_ratio
        print(f"    Class balance: {pos_ratio*100:.1f}% positive")

        # Calculate class weight for XGBoost
        if pos_ratio > 0.001:
            spw = neg_ratio / pos_ratio
        else:
            spw = 1.0
        print(f"    XGBoost scale_pos_weight: {spw:.2f}")

        # Create ensemble with CLASS BALANCING
        base_models = [
            ('xgb', XGBClassifier(
                n_estimators=200,
                max_depth=6,
                learning_rate=0.1,
                subsample=0.8,
                colsample_bytree=0.8,
                scale_pos_weight=spw,  # CLASS BALANCING
                use_label_encoder=False,
                eval_metric='logloss',
                random_state=42,
                n_jobs=-1,
                verbosity=0,
            )),
            ('rf', RandomForestClassifier(
                n_estimators=200,
                max_depth=10,
                min_samples_split=10,
                min_samples_leaf=5,
                class_weight='balanced',  # CLASS BALANCING
                random_state=42,
                n_jobs=-1,
            )),
            ('gb', GradientBoostingClassifier(
                n_estimators=150,
                max_depth=5,
                learning_rate=0.1,
                subsample=0.8,
                random_state=42,
            )),
        ]

        ensemble = StackingClassifier(
            estimators=base_models,
            final_estimator=LogisticRegression(max_iter=1000, random_state=42),
            cv=TimeSeriesSplit(n_splits=5),
            stack_method='predict_proba',
            n_jobs=-1,
            passthrough=False,
        )

        # Train
        train_start = time.time()
        try:
            ensemble.fit(X_train, y_train)
        except Exception as e:
            print(f"    ERROR: {e}. Falling back to XGBoost only...")
            ensemble = XGBClassifier(
                n_estimators=200, max_depth=6, learning_rate=0.1,
                scale_pos_weight=spw,
                use_label_encoder=False, eval_metric='logloss',
                random_state=42, n_jobs=-1, verbosity=0
            )
            ensemble.fit(X_train, y_train)

        train_time = time.time() - train_start

        # --- EVALUATE RAW MODEL ---
        y_pred_test = ensemble.predict(X_test)
        y_proba_test_raw = ensemble.predict_proba(X_test)[:, 1]

        raw_acc = accuracy_score(y_test, y_pred_test)
        raw_f1 = f1_score(y_test, y_pred_test, zero_division=0)
        raw_precision = precision_score(y_test, y_pred_test, zero_division=0)
        raw_recall = recall_score(y_test, y_pred_test, zero_division=0)
        try:
            raw_auc = roc_auc_score(y_test, y_proba_test_raw)
        except Exception:
            raw_auc = 0.0

        print(f"    RAW  -> Acc:{raw_acc:.4f} F1:{raw_f1:.4f} Prec:{raw_precision:.4f} Rec:{raw_recall:.4f} AUC:{raw_auc:.4f}")

        # Save raw model
        raw_path = os.path.join(MODEL_DIR, f'ensemble_{target_col}_raw.joblib')
        joblib.dump(ensemble, raw_path)

        # --- CALIBRATE WITH ISOTONIC REGRESSION ---
        try:
            calibrated = CalibratedClassifierCV(
                ensemble,
                method='isotonic',
                cv='prefit',
            )
            calibrated.fit(X_val, y_val)

            # Evaluate calibrated model
            y_proba_test_cal = calibrated.predict_proba(X_test)[:, 1]
            y_pred_test_cal = (y_proba_test_cal >= 0.5).astype(int)

            cal_acc = accuracy_score(y_test, y_pred_test_cal)
            cal_f1 = f1_score(y_test, y_pred_test_cal, zero_division=0)
            cal_precision = precision_score(y_test, y_pred_test_cal, zero_division=0)
            cal_recall = recall_score(y_test, y_pred_test_cal, zero_division=0)
            try:
                cal_auc = roc_auc_score(y_test, y_proba_test_cal)
                cal_brier = brier_score_loss(y_test, y_proba_test_cal)
            except Exception:
                cal_auc = raw_auc
                cal_brier = 0.0

            print(f"    CAL  -> Acc:{cal_acc:.4f} F1:{cal_f1:.4f} Prec:{cal_precision:.4f} Rec:{cal_recall:.4f} AUC:{cal_auc:.4f} Brier:{cal_brier:.4f}")

            # Save calibrated model (THIS is the production model)
            cal_path = os.path.join(MODEL_DIR, f'ensemble_{target_col}.joblib')
            joblib.dump(calibrated, cal_path)
            model_size = os.path.getsize(cal_path) / (1024 * 1024)

            results[target_col] = {
                'raw_accuracy': round(raw_acc, 4),
                'raw_f1': round(raw_f1, 4),
                'raw_auc': round(raw_auc, 4),
                'calibrated_accuracy': round(cal_acc, 4),
                'calibrated_f1': round(cal_f1, 4),
                'calibrated_precision': round(cal_precision, 4),
                'calibrated_recall': round(cal_recall, 4),
                'calibrated_auc': round(cal_auc, 4),
                'brier_score': round(cal_brier, 4),
                'train_time_sec': round(train_time, 1),
                'model_size_mb': round(model_size, 1),
                'positive_ratio': round(pos_ratio, 4),
                'scale_pos_weight': round(spw, 2),
            }

        except Exception as e:
            print(f"    Calibration failed: {e}. Using raw model.")
            cal_path = os.path.join(MODEL_DIR, f'ensemble_{target_col}.joblib')
            joblib.dump(ensemble, cal_path)
            model_size = os.path.getsize(cal_path) / (1024 * 1024)
            results[target_col] = {
                'raw_accuracy': round(raw_acc, 4),
                'raw_f1': round(raw_f1, 4),
                'raw_auc': round(raw_auc, 4),
                'calibrated_accuracy': round(raw_acc, 4),
                'calibrated_f1': round(raw_f1, 4),
                'calibrated_auc': round(raw_auc, 4),
                'train_time_sec': round(train_time, 1),
                'model_size_mb': round(model_size, 1),
                'positive_ratio': round(pos_ratio, 4),
            }

        print(f"    Saved: {cal_path} ({model_size:.1f} MB) | Time: {train_time:.1f}s")

print(f"\n  Phase 6 complete ({time.time()-phase6_start:.1f}s)")

# =============================================================================
# PHASE 7: FALSE ONSET ANALYSIS (Per-District)
# =============================================================================
print("\n[PHASE 7] Analyzing false onset events per district...")
phase7_start = time.time()

false_onset_events = []
false_onset_freq = {}

for name, ddata in district_data.items():
    rain = ddata['rain']
    district_false = 0
    district_years = 0

    for year in range(START_YEAR, END_YEAR + 1):
        # June-July window
        start_dt = pd.Timestamp(year, 6, 1)
        end_dt = pd.Timestamp(year, 7, 31)

        try:
            start_idx = rain_times.get_loc(start_dt)
            end_idx = rain_times.get_loc(end_dt)
        except KeyError:
            continue

        district_years += 1
        jj_rain = rain[start_idx:end_idx+1]

        i = 0
        while i < len(jj_rain) - 20:
            window = jj_rain[i:i+5]
            wet_days = np.sum(window >= RAIN_DAY_THRESHOLD)

            if wet_days >= 3:  # Looks like onset
                post_window = jj_rain[i+5:i+19]
                max_dry = max_consecutive_below(post_window, RAIN_DAY_THRESHOLD)

                if max_dry >= 10:  # FALSE ONSET!
                    district_false += 1
                    false_onset_events.append({
                        'district': name,
                        'year': year,
                        'onset_rain_total': float(window.sum()),
                        'dry_spell_length': int(max_dry),
                        'antecedent_rain_30d': float(jj_rain[max(0, i-30):i].sum()),
                    })
                    i += 19  # Skip past this event
                else:
                    i += 1
            else:
                i += 1

    if district_years > 0:
        freq = district_false / district_years
        false_onset_freq[name] = round(freq, 3)
        print(f"  {name}: {district_false} false onsets in {district_years} years ({freq*100:.1f}%)")

# Compute aggregate thresholds from events
if false_onset_events:
    fo_df = pd.DataFrame(false_onset_events)
    onset_rain_threshold = float(fo_df['onset_rain_total'].median())
    antecedent_threshold = float(fo_df['antecedent_rain_30d'].median())
else:
    onset_rain_threshold = 35.0
    antecedent_threshold = 80.0

false_onset_config = {
    'description': 'Data-driven false onset detector (V2)',
    'onset_rain_threshold_mm': round(onset_rain_threshold, 1),
    'antecedent_rain_threshold_mm': round(antecedent_threshold, 1),
    'min_rainy_days_in_window': ONSET_MIN_DAYS,
    'onset_window_days': ONSET_WINDOW,
    'post_onset_dry_days_threshold': 10,
    'dry_spell_risk_oni_above': 0.5,
    'dry_spell_risk_dmi_below': -0.4,
    'suppressive_mjo_phases': [5, 6, 7, 8],
    'min_mjo_amplitude': 1.0,
    'dtr_dry_threshold': 12.0,
    'false_onset_frequency_by_district': false_onset_freq,
    'total_false_onset_events': len(false_onset_events),
    'analysis_years': f'{START_YEAR}-{END_YEAR}',
    'science_note': 'DTR (tmax-tmin) proxy for humidity; Dai et al., 1999, J. Climate',
}

fo_path = os.path.join(MODEL_DIR, 'false_onset_config.json')
with open(fo_path, 'w') as f:
    json.dump(false_onset_config, f, indent=2)
print(f"\n  False onset config saved: {fo_path}")
print(f"  Phase 7 complete ({time.time()-phase7_start:.1f}s)")

# =============================================================================
# PHASE 8: SUMMARY
# =============================================================================
total_time = time.time() - phase1_start

print("\n" + "=" * 70)
print("  TRAINING V2 COMPLETE!")
print("=" * 70)
print(f"\n  Total time: {total_time/60:.1f} minutes")
print(f"\n  {'Target':<20} {'Raw F1':>8} {'Cal F1':>8} {'Cal AUC':>9} {'Cal Prec':>9} {'Cal Rec':>9}")
print(f"  {'-'*64}")
for target, m in results.items():
    print(f"  {target:<20} {m.get('raw_f1',0):>8.4f} {m.get('calibrated_f1',0):>8.4f} "
          f"{m.get('calibrated_auc',0):>9.4f} {m.get('calibrated_precision',0):>9.4f} "
          f"{m.get('calibrated_recall',0):>9.4f}")

print(f"\n  Files saved to {MODEL_DIR}:")
for f in sorted(os.listdir(MODEL_DIR)):
    fpath = os.path.join(MODEL_DIR, f)
    size = os.path.getsize(fpath) / (1024 * 1024)
    print(f"    {f} ({size:.1f} MB)")

# Save results
results_path = os.path.join(MODEL_DIR, 'training_results.json')
with open(results_path, 'w') as f:
    json.dump({
        'version': 'V2',
        'improvements': [
            '4 new features (tmax_anomaly, pre_monsoon_heat_days, temp_rain_ratio, evapotranspiration_proxy)',
            'Class balancing (XGBoost scale_pos_weight + RF class_weight=balanced)',
            'Isotonic probability calibration',
            '3-way train/val/test split',
            'Per-district false onset analysis',
        ],
        'results': results,
        'total_time_minutes': round(total_time/60, 1),
        'total_samples': total_samples,
        'feature_count': len(feature_names),
        'feature_names': feature_names,
        'training_date': datetime.now().isoformat(),
    }, f, indent=2)

print(f"\n  Results saved: {results_path}")
print(f"\n  YOUR V2 MODELS ARE READY!")
print("=" * 70)
