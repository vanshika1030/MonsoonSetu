# MonsoonSetu — Project Context & Architecture
## मानसून-सेतु · Block-Level Monsoon Intelligence for Indian Farmers

> **PS:** SIH 2026 · PS ID 26086 · Ministry of Earth Sciences (MoES) / NCMRWF  
> **Repo:** https://github.com/vanshika1030/baarish_ki_boond  
> **Demo:** Maharashtra — 15 agricultural districts, Kharif 2026

---

## 1. Problem Statement (Verbatim)

> The Indian Summer Monsoon dictates the economic livelihood of millions of farmers, particularly during the Kharif sowing season. While macro-scale monsoon forecasts across large meteorological subdivisions have improved, Indian agriculture remains highly vulnerable to the unpredictable nature of intra-seasonal variations. Specifically, the exact dates of monsoon onset, prolonged dry spells (break-monsoon phases), and subsequent revival cycles vary drastically from one district to another.
>
> Standard regional forecasts lack the spatial granularity required for localized agricultural planning. If a farmer sows seeds during a false onset just before a major breakthrough pause, entire crops fail due to moisture stress, leading to crushing financial losses.
>
> The challenge is to build a hybrid predictive framework capable of delivering a 7-to-30-day probabilistic outlook of monsoon behavior at the **Block and Panchayat (Village cluster) scale**, by fusing large-scale climate indices (ENSO, IOD, MJO) with high-resolution regional rainfall and temperature data. This framework must translate raw probabilistic forecasts into **dynamic, color-coded risk maps** and an **expert-system engine** that generates crop-specific agronomic advisories (e.g., advising farmers to delay sowing during a predicted break phase, switch to drought-tolerant crop varieties, or activate supplemental irrigation). Delivery must be through a mobile-optimized web application **or automated SMS/WhatsApp API gateway** in regional Indian languages.

**PS ID:** SIH 2026 · 26086 · Ministry of Earth Sciences (MoES) / NCMRWF

## 2. What We Built — Complete Feature Map

### TIER 1: Core ML (What PS Asked)

| # | Feature | What It Does | Why It Matters | Where |
|---|---------|-------------|----------------|-------|
| 1 | **12 Trained ML Models** | StackingClassifier ensembles (XGBoost + RF + GB + LogisticRegression meta) for onset/break/heavy × 7/14/21/30 days | Not mock data — real `predict_proba()` from 34 years of IMD gridded data | `ensemble_*.joblib` → `backend/main.py` |
| 2 | **33 Engineered Features** | ONI, DMI, MJO phase/amplitude, rain aggregates (1d/3d/7d/14d/30d), DTR humidity proxy, geo coordinates, interaction terms | Each feature scientifically justified — DTR from Dai et al. 1999, ONI×DMI interaction from Ashok et al. 2001 | `model_config.json` |
| 3 | **Calibrated Probabilities** | CalibratedClassifierCV (isotonic regression) on all 12 models | "68% break risk" actually means 68%, not arbitrary confidence | Training pipeline |
| 4 | **False Onset Detector** | Per-district historical false onset rates from data-driven thresholds | Beed: 47.1%, Ahmednagar: 70.6%, Nagpur: 8.8% — derived from 1990-2023 IMD data | `false_onset_config.json` |

### TIER 2: Advisory Intelligence (Beyond PS)

| # | Feature | What It Does | Why It Matters | Where |
|---|---------|-------------|----------------|-------|
| 5 | **Crop × Stage × Soil Advisory Engine** | 8 Kharif crops × 6 growth stages × soil type × irrigation = **576 unique advisory combinations** | Same weather → different advice for Soybean/Pre-sow vs Rice/Flowering vs Bajra/Maturity. Based on ICAR Kharif guidelines. | `getCropAdvisory()` in `mockData.js` |
| 6 | **Confidence-Branched Advisory** | Same risk level → different advice for irrigated (borewell) vs rain-fed farmer | 68% break = "Sow with caution" (irrigated) vs "DO NOT sow" (rain-fed). No other system does this. | `AdvisoryComparison.jsx` |
| 7 | **Dynamic Sowing Window Calculator** | Finds the EXACT date range when it's safe to sow, based on forecast trajectory | Instead of "delay sowing" (vague) → "Wait 14 days — safe window starts July 8" (actionable) | `calculateSowingWindow()` |
| 8 | **Crop Switching Recommender** | When current crop is too risky, suggests top 3 alternative crops that ARE safe to sow now | "82% break risk kills Soybean. Switch to Bajra — drought tolerance VERY HIGH, needs only 250mm." PS literally asks for "alter crop choices." | `getAlternativeCrops()` |
| 9 | **PMFBY Insurance Deadline Alert** | Cross-checks sowing date against PMFBY enrollment cutoff | "If false onset delays sowing past July 15, your crop insurance lapses." Weather + finance in one screen. | `pmfbyDeadlines` |
| 10 | **KVK Helpline Auto-Dial** | Shows nearest Krishi Vigyan Kendra with one-tap call | AI prediction + human expert backup. "AI for scale, human for trust." | `kvkDirectory` |

### TIER 3: Ground Truth & Calibration

| # | Feature | What It Does | Why It Matters | Where |
|---|---------|-------------|----------------|-------|
| 11 | **Farmer Feedback Loop** | Yes/No rain buttons → ground truth data at panchayat scale | Every farmer becomes a rain gauge. 100 farmers = 100 validation points IMD doesn't have. | Sticky bottom bar on `/farmer` |
| 12 | **Officer Calibration Form** | Extension officers enter actual mm rainfall → bias correction | Closes the loop: prediction → observation → correction → better prediction | `/officer` dashboard |
| 13 | **Model vs Naive Trust Card** | 2015 backtest: "Sow June 12 → failure" vs "Wait with MonsoonSetu → success" | Shows the model WORKS with real historical evidence | `/officer` dashboard |
| 14 | **Historical Analog Year Matching** | Identifies which past year most closely matches current climate pattern | "This year resembles 2015" — instant context for experienced farmers | Analog card on `/farmer` |

### TIER 4: Visual WOW (Judge-Facing)

| # | Feature | What It Does | Why It Matters | Where |
|---|---------|-------------|----------------|-------|
| 15 | **False Onset Timeline** | Animated visual story: rain→sow→14 dry days→crop dies vs MonsoonSetu saves farmer | Visual storytelling — judges SEE the problem and solution in 5 seconds | `FalseOnsetTimeline.jsx` |
| 16 | **Advisory Comparison Panel** | Side-by-side split: Green (borewell) vs Red (rain-fed), same weather | Judges SEE confidence branching in action — most dramatic visual in the demo | `AdvisoryComparison.jsx` |
| 17 | **Animated Pulsing Heatmap** | Map markers pulse by risk level + Week 1-4 toggle + LIVE badge | Looks like a weather channel broadcast | `/officer` dashboard |
| 18 | **Sarkari Parcha** | Printable government-style advisory bulletin, Hindi + icons | Shows last-mile thinking: CSC kiosk prints this for illiterate farmers | `/parcha` route |

### TIER 5: UX & Last-Mile Delivery

| # | Feature | What It Does | Why It Matters | Where |
|---|---------|-------------|----------------|-------|
| 19 | **Bilingual Hindi/English Toggle** | One tap switches entire UI language | 535M WhatsApp users in India, most prefer Hindi | Language button in header |
| 20 | **Voice Input (Speech Recognition)** | Say crop name in Hindi/Marathi → auto-selects | Low-literacy farmers can use the app by speaking | `useVoice.js` + `VoiceButton.jsx` |
| 21 | **Voice Output (Text-to-Speech)** | Reads advisory aloud in Hindi voice | Farmer doesn't need to read — just listen | Speaker button on advisory card |
| 22 | **wa.me WhatsApp Share** | One-tap shares formatted advisory to WhatsApp | 1 farmer → 500 village members see it. Viral distribution. | Share button on `/farmer` |
| 23 | **Judge Mode Overlay** | Ctrl+Shift+J → architecture, innovations, PS compliance tabs | Judge sees technical depth without leaving the demo | `JudgeOverlay.jsx` |
| 24 | **4-Role Dashboard System** | Farmer, Officer, Admin, SysAdmin — each sees different data | Role-based access is enterprise-ready architecture | 4 routes |

---

## 3. Tech Stack

```
FRONTEND:    React 19 + Vite 8 + Tailwind CSS v4 + Recharts + Leaflet.js + lucide-react
BACKEND:     FastAPI (Python) + uvicorn
ML/AI:       scikit-learn StackingClassifier + CalibratedClassifierCV + XGBoost + RandomForest + GradientBoosting
MODELS:      12 .joblib files + StandardScaler + 33 features + 12 targets
DATA:        IMD 0.25° gridded rainfall + tmax + tmin (1990-2023, 34 years)
INDICES:     NOAA CPC (ONI/ENSO), NOAA PSL (DMI/IOD), BoM Australia (MJO RMM)
SOIL:        NBSS&LUP Maharashtra block-level survey
VOICE:       Web Speech API (SpeechRecognition + SpeechSynthesis)
```

---

## 4. Data Pipeline (8 Stages)

```
Stage 1: SCRAPE     → ONI, DMI, MJO from NOAA/BoM (6-hourly)
Stage 2: INGEST     → IMD 0.25° gridded rain/tmax/tmin via imdlib
Stage 3: ENGINEER   → 33 features per district (rain aggregates, DTR, interactions)
Stage 4: PREDICT    → 12 calibrated ensemble models → probability per target
Stage 5: DETECT     → False onset check (per-district thresholds)
Stage 6: ADVISE     → Crop × Stage × Soil × Irrigation → specific action
Stage 7: DELIVER    → Mobile web + voice + WhatsApp + printable bulletin
Stage 8: FEEDBACK   → Farmer Yes/No → ground truth → model improvement
```

---

## 5. Key Differentiators vs Meghdoot

| Aspect | Meghdoot (IMD+IITM+ICAR) | MonsoonSetu |
|--------|--------------------------|-------------|
| Scale | Block-level (6,970 blocks) | Panchayat-scale (feedback-driven) |
| Frequency | Twice weekly | Daily |
| Personalization | One advisory per block | 576 combos (crop × stage × soil × irrigation) |
| False onset | Not detected | Per-district historical rates |
| Feedback | None | Bidirectional farmer loop |
| Delivery | SMS (13 languages) | Web + voice + WhatsApp + print |
| Insurance | Not connected | PMFBY deadline alerts |

**Positioning:** *"We don't compete with IMD — we complete IMD."*

---

## 6. Verified Statistics (with Sources)

| Stat | Value | Source | Verified |
|------|-------|--------|----------|
| WhatsApp users India | 535M | Industry reports 2025 | ✅ Widely reported |
| Smartphone households | 85.5% | NSS 80th Round 2025 | ⚠️ Re-verify before presenting |
| Farmer suicides 2024 | 10,546 (4,633 cultivators + 5,913 agri labourers) | NCRB ADSI report, 7 May 2026 | ✅ Exact match |
| Maharashtra farmer suicides 2024 | 3,824 (highest state) | NCRB ADSI report, 7 May 2026 | ✅ Directly relevant — our demo state |
| PMFBY claims since 2016 | ~₹2 lakh crore (fast-moving figure) | Lok Sabha data; was ₹1.83L cr Aug 2025, ₹2.06L cr Aug 2026 | ⚠️ Re-pull exact current figure before presentation |
| Rain-fed farmland | 55-60% | Ministry of Agriculture | ✅ |
| Agriculture GDP share | 18% | MoSPI FY2025 | ✅ |
| IMD forecast error improvement | 7.5% → 2.28% of LPA (2017-2020 vs 2021-2024) | IMD Multi-Model Ensemble shift 2021 | ✅ Corrected |
| False onset freq (Beed) | 47.1% | Computed from IMD 0.25° gridded 1990-2023 (false_onset_config.json) | ✅ Our own data |
| False onset freq (Ahmednagar) | 70.6% | Same dataset — highest in Maharashtra | ✅ Our own data |
| False onset freq (Nagpur) | 8.8% | Same dataset — lowest (reliable Vidarbha onset) | ✅ Our own data |

> **Note:** False onset frequencies are NOT external citations — they are computed values from our training pipeline (`train_models_v2.py`) using 34 years of IMD gridded data. They are real, checkable, and reproducible.

---

## 7. Research Citations

- Rajeevan et al. 2010 — Active/break cycles of Indian monsoon
- Abhilash et al. 2014 — Extended-range monsoon prediction
- Krishna Kumar et al. 1999 — ENSO-monsoon relationship
- Pai et al. 2011 — IMD high-resolution gridded rainfall dataset
- Roxy et al. 2017 — Changing monsoon extremes
- Flatau et al. 2001 — MJO-monsoon interaction
- Dai et al. 1999 — DTR as humidity proxy (J. Climate)
- Overeem et al. 2013 — Crowdsourced rainfall monitoring

---

## 8. File Structure

```
monsoon/
├── backend/
│   ├── main.py                    # FastAPI + real ML model integration
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── App.jsx                # Router (6 routes) + JudgeOverlay
│   │   ├── data/mockData.js       # Districts, crops, advisory engine, PMFBY, KVK
│   │   ├── hooks/useVoice.js      # Speech recognition + synthesis
│   │   ├── components/
│   │   │   ├── VoiceButton.jsx    # Floating mic + speaker
│   │   │   ├── AdvisoryComparison.jsx  # Irrigated vs rain-fed split
│   │   │   ├── FalseOnsetTimeline.jsx  # Animated storytelling
│   │   │   └── JudgeOverlay.jsx   # Judge mode (Ctrl+Shift+J)
│   │   └── pages/
│   │       ├── RoleSelect.jsx     # Landing page (4 roles)
│   │       ├── FarmerDashboard.jsx # Main farmer UI (24 features)
│   │       ├── OfficerDashboard.jsx # Risk map + calibration
│   │       ├── AdminDashboard.jsx  # State overview
│   │       ├── SysAdminDashboard.jsx # Model health
│   │       └── SarkariParcha.jsx  # Printable bulletin
│   └── vite.config.js
├── ensemble_*.joblib (×12)        # Trained ML models
├── scaler.joblib                  # StandardScaler
├── model_config.json              # 33 features, 12 targets
├── false_onset_config.json        # Per-district false onset thresholds
├── train_models_v2.py             # Training script
└── download_imd_data.py           # IMD data download
```

---

## 9. Innovation Summary (For Judges)

### One-liner per feature:

1. **"We predict when the monsoon PRETENDS to start"** — False onset detection
2. **"Same village, same weather, opposite advice"** — Confidence branching
3. **"We don't say wait. We say wait until July 8."** — Sowing window calculator
4. **"82% risk kills Soybean. But Bajra survives."** — Crop switching
5. **"We save your insurance, not just your crop"** — PMFBY deadline alert
6. **"IMD has 700 rain gauges. We have every farmer's phone."** — Feedback loop
7. **"AI for scale. Human expert for trust."** — KVK helpline integration
8. **"33 features, each scientifically justified"** — DTR humidity proxy (Dai 1999)
9. **"576 advisory combinations, not one generic SMS"** — Crop × Stage × Soil
10. **"Our advisory knows your dam is empty"** — Ground-reality awareness

---

## 10. Demo Flow

```
1. Landing (/)        → 4 role cards, bilingual
2. Farmer (/farmer)   → Alert → Crop selector → Advisory (with voice) →
                         Sowing Window → Insurance Alert → Crop Switch →
                         KVK Call → Forecast Chart → Comparison Panel →
                         [Show More] → Timeline, Soil, Climate, Analog
3. Officer (/officer) → Pulsing heatmap (Week 1-4) → Alert table →
                         Calibration form → Trust card
4. Parcha (/parcha)   → Print button → A4 bulletin
5. Ctrl+Shift+J       → Judge overlay (anywhere)
```
