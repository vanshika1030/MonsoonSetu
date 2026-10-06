<p align="center">
  <h1 align="center">🌧️ MonsoonSetu — मानसून-सेतु</h1>
  <p align="center"><strong>Block-Level Monsoon Intelligence for Indian Farmers</strong></p>
  <p align="center">
    <em>Predicting onset, break spells, and heavy rain at block/panchayat scale — <br>then turning predictions into crop-specific, soil-aware, insurance-checked advisories <br>in the farmer's own language.</em>
  </p>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/SIH_2026-PS_26086-blue" alt="SIH 2026">
  <img src="https://img.shields.io/badge/Ministry-MoES_/_NCMRWF-green" alt="MoES">
  <img src="https://img.shields.io/badge/Demo_State-Maharashtra-orange" alt="Maharashtra">
  <img src="https://img.shields.io/badge/Models-12_Calibrated_Ensembles-red" alt="Models">
  <img src="https://img.shields.io/badge/Features-33_Engineered-purple" alt="Features">
</p>

---

## 📌 Problem Statement (SIH 2026 · PS ID 26086)

> The Indian Summer Monsoon dictates the economic livelihood of millions of farmers, particularly during the Kharif sowing season. While macro-scale monsoon forecasts across large meteorological subdivisions have improved, Indian agriculture remains highly vulnerable to the unpredictable nature of intra-seasonal variations. Specifically, the exact dates of monsoon onset, prolonged dry spells (break-monsoon phases), and subsequent revival cycles vary drastically from one district to another.
>
> Standard regional forecasts lack the spatial granularity required for localized agricultural planning. If a farmer sows seeds during a false onset just before a major breakthrough pause, entire crops fail due to moisture stress, leading to crushing financial losses.
>
> The challenge is to build a hybrid predictive framework capable of delivering a 7-to-30-day probabilistic outlook of monsoon behavior at the Block and Panchayat (Village cluster) scale.
>
> The system must bridge the gap between global climate teleconnections and hyper-local weather outcomes. Participants should design a solution that ingests large-scale climate indices—such as the El Niño-Southern Oscillation (ENSO), Indian Ocean Dipole (IOD), and Madden-Julian Oscillation (MJO)—and downscales their signatures using advanced machine learning models to predict localized precipitation behavior, onset thresholds, and active/break durations.
>
> Develop a hybrid mathematical or machine learning model that pairs global planetary boundary conditions (ENSO, IOD, MJO phases) with regional atmospheric data to predict local rainfall anomalies. Generate dynamic, color-coded risk maps at the block/panchayat level illustrating the statistical probability percentage of monsoon onset, continuous dry spells (breaks), or heavy downpours 1 to 4 weeks in advance. Build an expert-system engine that translates rainfall probabilities into localized crop-specific agronomic advisories (e.g., advising farmers to delay sowing, prepare irrigation alternatives, or alter crop choices based on upcoming break phases). A mobile-optimized web application or automated SMS/WhatsApp API gateway that pushes clear, actionable text-based advisories in regional Indian languages directly to farmers and local agricultural extension officers.

**Organization:** Ministry of Earth Sciences (MoES) / National Centre for Medium Range Weather Forecasting (NCMRWF)

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        DATA SOURCES                             │
│  IMD 0.25° Gridded    NOAA CPC     NOAA PSL     BoM Australia  │
│  Rain/Tmax/Tmin       ONI/ENSO     DMI/IOD      MJO RMM        │
│  (1990-2023, 34 yrs)                                            │
└──────────────────────────┬──────────────────────────────────────┘
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                     ML PIPELINE                                 │
│  33 Engineered Features (rain aggregates, DTR humidity proxy,   │
│  ENSO×IOD interaction, MJO phase, geo coords, lags)             │
│         ▼                                                       │
│  12 Calibrated Stacking Ensembles                               │
│  (XGBoost + RandomForest + GradientBoosting + LogReg meta)      │
│  wrapped in CalibratedClassifierCV (isotonic regression)        │
│         ▼                                                       │
│  3 risks × 4 horizons = 12 probability outputs                  │
│  (onset/break/heavy × 7d/14d/21d/30d)                           │
└──────────────────────────┬──────────────────────────────────────┘
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│              ADVISORY ENGINE (576 combinations)                 │
│                                                                 │
│  False Onset Detector (ENSO + IOD + MJO + district history)     │
│  8 crops × 6 stages × soil type × irrigation access             │
│  Confidence Branching (irrigated vs rain-fed)                   │
│  Sowing Window Calculator (exact safe dates)                    │
│  Crop Switch Recommender (top 3 alternatives)                   │
│  PMFBY Insurance Deadline Cross-Check                           │
└──────────────────────────┬──────────────────────────────────────┘
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                    DELIVERY CHANNELS                            │
│  📱 Mobile Web App (React)     🔊 Voice I/O (multilingual)      │
│  💬 WhatsApp (wa.me share)     📄 Sarkari Parcha (printable)    │
│  📞 KVK Helpline (auto-dial)  🗺️ Officer Risk Heatmap          │
└──────────────────────────┬──────────────────────────────────────┘
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                    FEEDBACK LOOP                                │
│  Farmer Yes/No rain replies → panchayat-scale ground truth      │
│  Officer mm rainfall entries → bias correction                  │
│  Seasonal retraining → predictions sharpen district-by-district │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔬 ML Model Details

### Training Data
| Source | Resolution | Period | Variables |
|--------|-----------|--------|-----------|
| IMD Gridded (via `imdlib`) | 0.25° (~25km) | 1990–2023 (34 years) | Daily rainfall, tmax, tmin |
| NOAA CPC | Monthly | 1950–present | ONI (Oceanic Niño Index) |
| NOAA PSL | Monthly | 1870–present | DMI (Dipole Mode Index) |
| BoM Australia | Daily | 1974–present | MJO RMM (phase + amplitude) |

### 33 Engineered Features
```
Rain aggregates:       rain_1d, rain_3d, rain_7d, rain_14d, rain_30d
Temperature:           tmax_7d_mean, tmin_7d_mean, dtr_7d_mean (humidity proxy — Dai et al. 1999)
Climate indices:       oni, dmi, mjo_phase, mjo_amplitude
Derived indicators:    rain_7d_anomaly, dry_days_14d, wet_spell_length, break_spell_length
                       onset_flag, consecutive_dry_days, rain_intensity_7d
Interactions:          oni_x_dmi (Ashok et al. 2001), oni_x_mjo, dmi_x_mjo
Temporal:              day_of_year, week_of_year, month
Spatial:               latitude, longitude, district_id
Lagged:                rain_7d_lag7, rain_7d_lag14
```

### 12 Model Targets
```
onset_7d,  onset_14d,  onset_21d,  onset_30d     (will monsoon onset happen?)
break_7d,  break_14d,  break_21d,  break_30d     (will a dry spell occur?)
heavy_7d,  heavy_14d,  heavy_21d,  heavy_30d     (will heavy rain hit?)
```

### Model Architecture
```
StackingClassifier
├── Base Estimators
│   ├── XGBClassifier (max_depth=6, n_estimators=200, learning_rate=0.1)
│   ├── RandomForestClassifier (n_estimators=200, max_depth=12)
│   └── GradientBoostingClassifier (n_estimators=150, max_depth=5)
├── Meta Learner
│   └── LogisticRegression (C=1.0)
└── Calibration
    └── CalibratedClassifierCV (method='isotonic', cv=5)
```

Each model outputs calibrated probabilities — `predict_proba()` returns real probability values (68% means 68%, not an arbitrary confidence score).

### False Onset Detection
Multi-condition check per district using data-derived thresholds:
- ONI > 0.5 (El Niño active)
- DMI < -0.4 (negative IOD)
- MJO in suppressive phase (4, 5, 6)
- District historical false onset rate > 30%

Per-district false onset frequencies (computed from 1990-2023 IMD data):
| District | False Onset Rate | Interpretation |
|----------|-----------------|----------------|
| Ahmednagar | 70.6% | Very high — frequently traps farmers |
| Beed | 47.1% | High — Marathwada drought belt |
| Nagpur | 8.8% | Low — reliable Vidarbha onset |

---

## ✨ Complete Feature List (24 Features)

### PS Deliverables (Core Requirements)
| # | Feature | Description |
|---|---------|-------------|
| 1 | **12 Calibrated ML Models** | Stacking ensembles for onset/break/heavy × 7/14/21/30 days with isotonic calibration |
| 2 | **33 Engineered Features** | Scientifically justified — DTR humidity proxy (Dai 1999), ONI×DMI interaction (Ashok 2001) |
| 3 | **Color-Coded Risk Maps** | Leaflet.js heatmap with animated pulsing markers, Week 1-4 toggle, severity coloring |
| 4 | **576-Combination Advisory Engine** | 8 crops × 6 stages × soil × irrigation = unique advice per farmer situation |

### Innovations Beyond PS (14 additions)

**Trust & Accuracy Layer**
| # | Feature | What It Does |
|---|---------|-------------|
| 5 | **Calibrated Probabilities** | Isotonic regression ensures "68%" is a real probability, not a raw model score |
| 6 | **Model vs Naive Trust Card** | Backtested proof: "MonsoonSetu caught 2015 false onset, naive forecast didn't" |
| 7 | **Historical Analog Matching** | "This year's climate pattern resembles 2015 Marathwada drought" — instant context |
| 8 | **False Onset Detector** | Per-district historical rates from 34 years of data — Beed: 47.1%, Ahmednagar: 70.6% |

**Smarter Advisory**
| # | Feature | What It Does |
|---|---------|-------------|
| 9 | **Confidence-Branched Advisory** | Same weather → "sow with caution" (irrigated) vs "DO NOT sow" (rain-fed) |
| 10 | **Dynamic Sowing Window** | Exact dates: "Safe window starts July 8" instead of vague "delay sowing" |
| 11 | **Crop Switch Recommender** | "82% break risk kills Soybean. Switch to Bajra — drought tolerance VERY HIGH" |
| 12 | **PMFBY Insurance Alert** | Cross-checks sowing date against enrollment deadline — protects insurance eligibility |

**Ground Truth & Feedback**
| # | Feature | What It Does |
|---|---------|-------------|
| 13 | **Farmer Feedback Loop** | Yes/No rain buttons → every farmer becomes a rain gauge at panchayat scale |
| 14 | **Officer Calibration Tool** | Extension officers enter actual mm rainfall → bias correction for the model |
| 15 | **Soil-Aware Advisory** | NBSS&LUP block-level soil data changes the advisory (Vertisol cracking, Laterite drainage) |

**Last-Mile Delivery**
| # | Feature | What It Does |
|---|---------|-------------|
| 16 | **Voice I/O (Multilingual)** | Speech recognition + text-to-speech in Hindi, Marathi, English for low-literacy farmers |
| 17 | **WhatsApp Share (wa.me)** | One-tap share → 1 farmer reaches an entire village WhatsApp group |
| 18 | **Sarkari Parcha** | Printable government-style bulletin at CSC kiosks for zero-phone-access farmers |
| 19 | **KVK Helpline Auto-Dial** | One-tap call to nearest Krishi Vigyan Kendra — AI for scale, human for trust |

**Visual & System**
| # | Feature | What It Does |
|---|---------|-------------|
| 20 | **Animated Pulsing Heatmap** | Weather-channel-style map with risk pulses + Week 1-4 forecast toggle |
| 21 | **False Onset Timeline** | Animated storytelling: "Without MonsoonSetu → crop dies" vs "With → farmer saves" |
| 22 | **Advisory Comparison Panel** | Side-by-side split: green (borewell) vs red (rain-fed), same weather |
| 23 | **4-Role Dashboard System** | Farmer, Extension Officer, District Authority, SysAdmin — role-based views |
| 24 | **Judge Mode Overlay** | Ctrl+Shift+J → architecture, innovations, PS compliance tabs for hackathon demo |

---

## 🧑‍🌾 User Journey Workflow

### Farmer Flow
```
1. Opens MonsoonSetu → Selects village, crop, growth stage (soil auto-detected)
2. False onset check → "Is this rain real or a 3-day trap?"
3. Gets personalized advisory for YOUR crop × soil × irrigation (576 combos)
4. Same weather, different advice → borewell: "sow with caution" vs rain-fed: "wait"
5. Exact sowing date → "Safe window starts July 8" (not a vague "delay")
6. Crop too risky? → App suggests safer alternatives with reasoning
7. Insurance check → "PMFBY deadline July 15 — don't miss it"
8. Hears advisory in local language (voice) · Shares on WhatsApp · "Resembles 2015"
9. Did it rain? YES / NO → daily ground truth at panchayat scale
```
<img width="806" height="1326" alt="WhatsApp Image 2026-10-06 at 9 50 10 PM" src="https://github.com/user-attachments/assets/a1ca6588-18ee-4ef1-a409-a48d9cf696fb" />


### Extension Officer Flow
```
1. Sees live color-coded risk heatmap — red/yellow/green blocks
2. Sees backtested proof: model caught 2015 false onset
3. Visits high-risk villages flagged RED
4. Enters actual rainfall (mm) from field visit → bias correction
```
<img width="1600" height="1142" alt="WhatsApp Image 2026-10-06 at 9 50 10 PM (1)" src="https://github.com/user-attachments/assets/bb3d5b19-b97b-4580-bc8d-132744a60727" />


### District Authority Flow
```
1. State-level view: which districts need resources NOW
2. Allocates drought relief / irrigation resources based on risk data
```
<img width="1600" height="1142" alt="WhatsApp Image 2026-10-06 at 9 50 10 PM (2)" src="https://github.com/user-attachments/assets/922a0993-be47-4137-a73c-7699e6f67aa6" />


### Behind the Scenes
```
1. 12 calibrated ML models process 33 features from ENSO, IOD, MJO + 34 years IMD data
2. Farmer YES/NO + Officer mm readings collected each season
3. Models retrain with new ground truth → predictions sharpen district by district
```
<img width="1600" height="1142" alt="WhatsApp Image 2026-10-06 at 9 50 11 PM" src="https://github.com/user-attachments/assets/e65bedae-21e4-47dc-981e-14b1003f53eb" />


---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19 + Vite 8 + Tailwind CSS v4 + Recharts + Leaflet.js + lucide-react |
| **Backend** | FastAPI (Python) + uvicorn |
| **ML/AI** | scikit-learn StackingClassifier + CalibratedClassifierCV + XGBoost + RandomForest + GradientBoosting |
| **Models** | 12 `.joblib` files + StandardScaler + 33 features + 12 targets |
| **Data** | IMD 0.25° gridded rainfall + tmax + tmin (1990-2023, 34 years) |
| **Climate Indices** | NOAA CPC (ONI/ENSO), NOAA PSL (DMI/IOD), BoM Australia (MJO RMM) |
| **Soil Data** | NBSS&LUP Maharashtra block-level survey |
| **Voice** | Web Speech API (SpeechRecognition + SpeechSynthesis) |
| **Delivery** | wa.me deep links, printable bulletin, KVK tel: links |

---

## 📂 Project Structure

```
monsoon/
├── backend/
│   ├── main.py                        # FastAPI server + real ML model integration
│   └── requirements.txt               # Python dependencies
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx                    # Router (6 routes) + JudgeOverlay
│   │   ├── data/
│   │   │   └── mockData.js            # Districts, crops, advisory engine, PMFBY, KVK
│   │   ├── hooks/
│   │   │   └── useVoice.js            # Speech recognition + synthesis hook
│   │   ├── components/
│   │   │   ├── VoiceButton.jsx        # Floating mic + speaker buttons
│   │   │   ├── AdvisoryComparison.jsx # Side-by-side irrigated vs rain-fed
│   │   │   ├── FalseOnsetTimeline.jsx # Animated false onset storytelling
│   │   │   └── JudgeOverlay.jsx       # Judge mode overlay (Ctrl+Shift+J)
│   │   └── pages/
│   │       ├── RoleSelect.jsx         # Landing page — 4 role cards, bilingual
│   │       ├── FarmerDashboard.jsx    # Main farmer UI — all 24 features
│   │       ├── OfficerDashboard.jsx   # Pulsing risk map + calibration + trust card
│   │       ├── AdminDashboard.jsx     # State-level resource overview
│   │       ├── SysAdminDashboard.jsx  # Model health monitoring
│   │       └── SarkariParcha.jsx      # Printable advisory bulletin
│   ├── index.html
│   └── vite.config.js
│
├── ensemble_onset_7d.joblib           # ┐
├── ensemble_onset_14d.joblib          # │
├── ensemble_onset_21d.joblib          # │  12 trained ML models
├── ensemble_onset_30d.joblib          # │  (StackingClassifier +
├── ensemble_break_7d.joblib           # │   CalibratedClassifierCV)
├── ensemble_break_14d.joblib          # │
├── ensemble_break_21d.joblib          # │
├── ensemble_break_30d.joblib          # │
├── ensemble_heavy_7d.joblib           # │
├── ensemble_heavy_14d.joblib          # │
├── ensemble_heavy_21d.joblib          # │
├── ensemble_heavy_30d.joblib          # ┘
├── scaler.joblib                      # StandardScaler for feature normalization
├── model_config.json                  # 33 feature names, 12 targets, 15 districts
├── false_onset_config.json            # Per-district false onset thresholds
│
├── train_models_v2.py                 # Model training script
├── download_imd_data.py               # IMD gridded data download utility
├── test_models.py                     # Model validation tests
│
├── INTEGRATION_GUIDE.md               # ML model integration instructions
├── ML_TRAINING_GUIDE.md               # Training methodology documentation
├── PROJECT_CONTEXT.md                 # Full project context and feature map
└── README.md                          # This file
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Python 3.9+

### Frontend Setup
```bash
cd frontend
npm install
npx vite --host
```
Frontend runs at `http://localhost:5173`

### Backend Setup
```bash
pip install -r backend/requirements.txt
python -m uvicorn backend.main:app --host 0.0.0.0 --port 8000
```
Backend runs at `http://localhost:8000`

### API Endpoints
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/predict/{district_id}` | GET | Real ML predictions for a district |
| `/api/districts` | GET | All 15 Maharashtra districts with metadata |
| `/api/climate-indices` | GET | Current ENSO, IOD, MJO values |
| `/api/false-onset/{district_id}` | GET | False onset check for a district |
| `/api/feedback` | POST | Submit farmer rain feedback |
| `/api/calibration` | POST | Submit officer rainfall calibration |
| `/api/system/health` | GET | Model health and system status |

---

## 📊 Key Differentiators vs Meghdoot

| Aspect | Meghdoot (IMD+IITM+ICAR) | MonsoonSetu |
|--------|--------------------------|-------------|
| **Scale** | Block-level (6,970 blocks) | Panchayat-scale (feedback-driven) |
| **Frequency** | Twice weekly | Daily |
| **Personalization** | One advisory per block | 576 combos (crop × stage × soil × irrigation) |
| **False Onset** | Not detected | Per-district historical rates from 34 years of data |
| **Feedback** | None (one-way broadcast) | Bidirectional — farmer + officer loop |
| **Delivery** | SMS (13 languages) | Web + voice + WhatsApp + print + KVK helpline |
| **Insurance** | Not connected | PMFBY deadline alerts integrated |
| **Calibration** | Not applicable | Officer field readings → bias correction |

> *"We don't compete with IMD — we complete IMD."*

---

## 📚 Research References

| # | Paper | Relevance to MonsoonSetu | Journal |
|---|-------|--------------------------|---------|
| 1 | **Rajeevan et al., 2010** | Defines active/break monsoon spells — basis for our break detection | J. Earth System Science |
| 2 | **Krishna Kumar et al., 1999** | Established ENSO-monsoon statistical link — why we use ONI as a feature | Science |
| 3 | **Flatau et al., 2001** | MJO phases modulate onset/break timing — basis for false onset detection | Geophysical Research Letters |
| 4 | **Dai et al., 1999** | DTR correlates with atmospheric humidity — our humidity proxy when IMD doesn't publish humidity | J. Climate |
| 5 | **Overeem et al., 2013** | Validated citizen-sourced rainfall matches professional gauges — backing for farmer feedback loop | BAMS |
| 6 | **Pai et al., 2011** | Created IMD 0.25° daily gridded rainfall dataset — our actual training data source | J. Geophysical Research |
| 7 | **Roxy et al., 2017** | Monsoon extremes increasing with warming Arabian Sea — justifies monitoring heavy rain events | Nature Communications |
| 8 | **Abhilash et al., 2014** | 2-4 week monsoon prediction skill demonstrated — validates our 7-30 day forecast horizon | Climate Dynamics |
| 9 | **Ashok et al., 2001** | IOD independently modulates Indian rainfall beyond ENSO — why we use ONI×DMI interaction feature | J. Geophysical Research |

---

## 📈 Verified Statistics

| Statistic | Value | Source |
|-----------|-------|--------|
| Farmer suicides (India, 2024) | 10,546 (4,633 cultivators + 5,913 agri labourers) | NCRB ADSI Report, May 2026 |
| Farmer suicides (Maharashtra, 2024) | 3,824 (highest state — our demo state) | NCRB ADSI Report, May 2026 |
| Rain-fed farmland in India | 55–60% | National Rainfed Area Authority |
| Agriculture share of GDP | 18% | MoSPI FY2025 |
| IMD forecast error improvement | 7.5% → 2.28% of LPA (2017-2020 vs 2021-2024) | IMD Multi-Model Ensemble |
| PMFBY claims paid since 2016 | ~₹2 lakh crore | Lok Sabha data |
| WhatsApp users in India | 535M | Industry reports, 2025 |

---

## 🌾 Demo Configuration

- **State:** Maharashtra
- **Districts:** 15 agricultural districts (Beed, Ahmednagar, Nashik, Pune, Solapur, Aurangabad, Jalgaon, Nagpur, Amravati, Akola, Latur, Osmanabad, Nanded, Parbhani, Kolhapur)
- **Crops:** Soybean, Cotton, Rice (Paddy), Jowar, Tur, Bajra, Maize, Groundnut
- **Growth Stages:** Pre-sowing, Germination, Vegetative, Flowering, Grain Filling, Maturity
- **Soil Types:** Per-district from NBSS&LUP (Vertisol, Alfisol, Inceptisol, Laterite, Entisol)

---

## 👥 Team

**Team Infinite_Loopers_1** — Smart India Hackathon 2026

---

## 📄 License

This project is developed for SIH 2026 (PS ID 26086) under the Ministry of Earth Sciences.
