# MonsoonSetu — Complete Project Context Document

> **Purpose:** This document contains the COMPLETE context of our project — features, innovations, workflow, tech stack, positioning, and design decisions. Use it to generate visuals, presentations, or explanations.

---

## Project Name: MonsoonSetu (मानसून-सेतु)
**Tagline:** "We don't compete with IMD — we complete IMD."

**One-liner:** A hybrid ML pipeline that ingests global ocean-atmosphere signals (ENSO, IOD, MJO) and downscales them into daily, block-level, confidence-aware monsoon advisories — delivered in the farmer's language on WhatsApp, with a ground-truth feedback loop that makes predictions more localized season over season.

---

## Problem Statement (SIH26086 — MoES / NCMRWF)

Indian farmers lose entire Kharif crops because monsoon forecasts are too zoomed-out (state/subdivision level) and too infrequent (twice weekly via Meghdoot). A farmer in one village might get rain while a village 20km away gets none. If a farmer sows seeds during a false onset — a brief rain spell that looks like monsoon but is followed by a 10+ day dry break — the seeds die from moisture stress, causing crushing financial losses (₹15,000–40,000/hectare for soybean alone).

**The PS asks for 4 deliverables:**
1. A hybrid ML model pairing ENSO/IOD/MJO with regional atmospheric data → local rainfall predictions
2. Dynamic color-coded risk maps at block/panchayat level (7 to 30 days ahead)
3. An expert-system engine → crop-specific agronomic advisories
4. Mobile web app or WhatsApp/SMS gateway delivering advisories in regional Indian languages

---

## How We're Different from Existing Systems

### vs. Meghdoot (IMD's existing operational system)

| Dimension | Meghdoot (Current) | MonsoonSetu (Ours) |
|---|---|---|
| Update frequency | Twice weekly (Tue/Fri) | Daily, each morning |
| Resolution | Block-level advisory for ~3,100 blocks | Block-level prediction for demo state, panchayat-scale via feedback loop over seasons |
| Method | GFS/CFSv2 numerical weather models | ENSO/IOD/MJO teleconnection-based ML ensemble (what the PS explicitly asks for) |
| Advisory type | Generic weather bulletin | Confidence-branched, crop-specific, irrigation-aware |
| Direction | One-way broadcast (SMS out) | Bidirectional — forecast out, ground truth back |
| False onset detection | Not a named feature | Dedicated detector with data-derived thresholds |
| Explainability | None — black box bulletin | 1-liner per prediction + historical analog + Model vs Naive comparison |
| Reach | 43.37 million farmers via SMS | WhatsApp + SMS + wa.me group share + dashboard |

**Framing:** "Meghdoot tells 43 million farmers what the weather will be, twice a week. We tell each farmer what to DO about it, every day, and learn from what actually happened."

### vs. 9 Public GitHub Repos (SIH26086)

We analyzed 9 hackathon repos for this PS. Key finding: **6 out of 7 are frontend-only facades with fake/mock data.** Only `ajmani-x/foresight-monsoon` has a real pipeline. We built a real pipeline AND added genuinely novel features none of them have.

---

## Complete Workflow (Daily Operational Cycle)

### Stage 1: DATA INGESTION (Daily, each morning after 08:30 IST DRMS update)

**What happens:** Our server automatically fetches the latest climate data from 3 global sources and 1 national source.

| Source | Data | Frequency | How |
|---|---|---|---|
| NOAA CPC | ONI index (ENSO / El Niño state) | Monthly | Live HTTP scraper with 6-hour cache |
| NOAA PSL | DMI index (Indian Ocean Dipole) | Monthly | Live HTTP scraper with 6-hour cache |
| BoM Australia | MJO RMM1/RMM2 (phase 1-8 + amplitude) | Daily | Live HTTP scraper with 6-hour cache |
| IMD | District-wise rainfall + temperature observations (via DRMS) | Daily (08:30 IST) | Station data pull |

**Training data (historical, one-time):** 25 years (1990-2023) of IMD 0.25° gridded daily rainfall, tmax, and tmin via `imdlib` Python package.

**Future integration:** IMD's Block-Wise Rainfall Monitoring Scheme (BRMS), launched July 2025 — real-time block-level rainfall for 7,200 blocks. No public API yet, but our architecture is built to consume it when available.

### Stage 2: PREDICTION ENGINE

**What happens:** The ML model takes all ingested data and predicts three things for each target block, at 4 time horizons (7, 14, 21, 30 days ahead):

- **P(onset):** Probability that monsoon onset will occur/continue in this window
- **P(break):** Probability of a prolonged dry spell (7+ consecutive days < 2.5mm)
- **P(heavy_rain):** Probability of extreme rainfall (≥64.5mm/day, IMD threshold)

**Model architecture:** 4-model stacking ensemble
- Base models: XGBoost + Random Forest + Gradient Boosting
- Meta-learner: Logistic Regression
- Validation: TimeSeriesSplit (5-fold, chronological — no data leakage)
- Training: 1990-2019 | Validation: 2020-2021 | Test: 2022-2023

**Features (~34 total):**
- Climate indices: ONI, DMI, MJO phase, MJO amplitude
- Lagged rainfall: 1d, 3d, 7d, 14d, 30d (sums, means, max, std)
- Temperature: tmax 7d mean, tmin 7d mean, DTR (diurnal range = humidity proxy), tmax anomaly, pre-monsoon heat days
- Soil moisture stress proxies: temp/rain ratio, evapotranspiration proxy (DTR × rain deficit)
- Seasonal: day of year, month, week
- Location: latitude, longitude, elevation
- Interaction: ONI × DMI, ONI × rain30d, MJO favorable/suppressive flags

**Additional checks that run alongside the model:**

1. **False Onset Detector:** Rule-based with data-derived thresholds. If recent rain > 20mm in 5 days BUT 14-day soil moisture deficit is high AND El Niño is active AND MJO is in suppressive phase → flag as probable false onset. Thresholds derived from analysis of all historical false onset events across 25 years of IMD data.

   **Conflict resolution rule (CRITICAL DESIGN DECISION):** The false-onset flag is a **hard safety override** — it can only ESCALATE severity, never downgrade it. If the ensemble says 30% break risk (low) but the false-onset rule fires independently, the final advisory defaults to DELAY_SOWING regardless of ensemble confidence. Rationale: the cost of missing a false onset (crop death) far outweighs the cost of an unnecessary delay (a few extra waiting days). This asymmetric risk is why we use a safety-floor architecture, not a simple average of the two signals.

2. **Historical Analog Year Matching:** Cosine similarity between current (ONI, DMI, MJO_phase, MJO_amplitude) vector and each of the 25 historical years → identifies most similar historical pattern. **Always framed as supporting context, never as the primary prediction:** "Current conditions have some similarity to 2015" — paired with the model's independent probability. Two years with similar indices can still diverge in actual outcomes; the analog adds narrative context for trust-building, not a causal forecast claim.

**Onset methodology (precise statement):** We use IMD's published historical onset dates as ground-truth training labels and predict onset from ENSO/IOD/MJO + rainfall/temperature features. We do NOT recompute the 850hPa/OLR 4-point meteorological criteria (that would require ERA5 reanalysis data which isn't feasible for this scope).

### Stage 3: ADVISORY ENGINE

**What happens:** Raw probabilities get translated into specific, actionable farming advice.

**Step 1 — Rule-based decision matrix:**
Input: `crop × growth_stage × risk_level × irrigation_access`
Output: specific action

| Crop | Stage | Risk | Irrigated? | Action |
|---|---|---|---|---|
| Soybean | Pre-sowing | HIGH (break >60%) | No | DELAY_SOWING — wait 7 days minimum |
| Soybean | Pre-sowing | HIGH (break >60%) | Yes | SOW_WITH_CAUTION — monitor daily |
| Cotton | Vegetative | HIGH (break >60%) | No | PREPARE_IRRIGATION — arrange tanker/well water |
| Paddy | Flowering | HIGH (heavy >70%) | Any | DRAIN_EXCESS — clear field channels |
| Any | Pre-sowing | MODERATE (break 40-60%) | No | SWITCH_CROP — consider shorter-duration variety |

**This is the confidence-branched advisory** — same weather, different advice based on whether the farmer has irrigation. Nobody else does this.

Supported crops: Soybean, Cotton, Paddy, Bajra (Pearl Millet), Groundnut, Maize

**Step 2 — LLM Phrasing Layer (Groq / LLaMA 3):**
- The rule engine produces a structured output: `{action: "DELAY_SOWING", reason: "68% break risk", wait: "7 days", analog: "2015"}`
- The LLM receives this structured data and rephrases it into farmer-friendly language in Hindi/Marathi/English
- **The LLM NEVER generates predictions or numbers.** It only translates tone and language.
- Cost optimization: there are only ~50 unique advisory combinations. Pre-generate all phrasings, cache them. LLM only needed for new combinations. This drops API calls from 300K/month to ~50 total.

**Example output (Marathi):**
> "⚠️ रामेश, सध्या पेरणी करू नका. पुढील ७ दिवस पावसाचा खंड येण्याची ६८% शक्यता आहे. हे २०१५ च्या दुष्काळासारखे दिसत आहे. कोरडवाहू शेती असल्यास किमान ७ दिवस थांबा."

### Stage 4: SEVERITY ROUTER

**What happens:** The system decides HOW URGENTLY to deliver based on risk level.

| Severity | Condition | Delivery |
|---|---|---|
| 🔴 CRITICAL | Break >60% OR false onset flagged OR heavy rain >70% | ALL channels fire simultaneously — WhatsApp, SMS, Officer dashboard alert. No human in the loop. |
| 🟡 MODERATE | Break 40-60% OR onset shift detected | WhatsApp push to farmer + Officer dashboard update |
| 🟢 ROUTINE | Normal monsoon continuation, low risk | Dashboard update only. Farmer gets next scheduled digest. |

**Escalation logic:** If a CRITICAL alert is sent to the Extension Officer and no acknowledgment within 2 hours → system re-sends with "URGENT" tag. If still no response → designed to auto-escalate (IVR call in production; shown in architecture for hackathon).

### Stage 0: FARMER ONBOARDING (One-Time Registration via WhatsApp)

**What happens:** Before a farmer receives any advisory, they must register. This captures the profile data that makes personalized, confidence-branched advisories possible.

**WhatsApp onboarding flow (conversational, tap-to-answer):**
1. Farmer sends "Hi" to Twilio WhatsApp number (or scans QR code at KVK/mandi)
2. Bot: "Welcome! What is your village name?" → Farmer types village name → system geocodes via OpenStreetMap Nominatim → stores GPS
3. Bot: "What crop are you growing this Kharif?" → Shows numbered options: 1. Soybean, 2. Cotton, 3. Paddy, 4. Bajra, 5. Groundnut, 6. Maize → Farmer replies "1"
4. Bot: "Do you have irrigation (borewell, canal, or well)?" → 1. Yes, 2. No, 3. Partial → Farmer replies "2"
5. Bot: "Have you started sowing?" → 1. Not yet, 2. Yes, recently, 3. Yes, weeks ago → Farmer replies "1"
6. Bot: "✅ Registration complete! You'll receive daily forecasts for [Village Name]. Reply STOP anytime to unsubscribe."

**Total time:** ~60 seconds. No literacy barrier (numbered options). No app download.

**Why this is load-bearing:** Without crop, irrigation, and sowing stage, the entire advisory engine produces generic Meghdoot-style bulletins. With it, the same 68% break prediction generates "DELAY_SOWING" for rain-fed soybean but "SOW_WITH_CAUTION" for irrigated cotton. The onboarding flow IS what enables the personalization layer.

**Data stored per farmer:** phone_number (hashed), village_name, village_gps, crop, irrigation_access, sowing_stage, registration_date, language_preference.

### Stage 5: DELIVERY & DASHBOARDS

**Multi-channel delivery stack:**

| Channel | Tech | Who Gets It | When |
|---|---|---|---|
| WhatsApp Bot | Twilio WhatsApp API | Registered farmers + Officers | CRITICAL/MODERATE alerts + daily digest |
| WhatsApp Group Share | `wa.me` deep link | Village groups via 1 farmer's share | Anytime — 1 phone → 200-500 farmers |
| SMS | Twilio SMS API | Farmers without WhatsApp | CRITICAL alerts only |
| Web Dashboard (PWA) | React + Vite | All users | Always available |

**4 Role-Based Dashboards:**

**👨‍🌾 Farmer Dashboard:**
- Their village's 4-week bar chart (Week 1: 🌧️ Normal → Week 2: ☀️ Dry → Week 3: ☀️ Severe → Week 4: 🌧️ Revival)
- Advisory card with specific action
- 1-liner explainer: "Ocean signals suggest rain delay this week"
- Model agreement score shown honestly (see calibration note below)
- Feedback button: "Did it rain today? Yes/No"

**👮 Extension Officer Dashboard:**
- Block-level risk map (Leaflet choropleth, red/yellow/green)
- Village alert table (which villages got critical alerts)
- Ground-truth calibration form (enter rain gauge reading + soil condition)
- "Model vs Naive" trust card showing backtested economic comparison
- 4-horizon time slider (7/14/21/30 days)

**🏛️ Admin Dashboard (District Collector / State Agriculture Director):**
- State/national map showing which districts are in trouble
- District comparison table
- Officer response rates and acknowledgment times
- Resource allocation view ("deploy water tankers to Beed and Solapur")
- *Note: PS didn't ask for this — we added it for real-world deployability*

**⚙️ SysAdmin Dashboard (Tech Team / MoES IT Cell):**
- Model accuracy over last 30 days (F1, precision, recall per target)
- Prediction vs actual outcomes chart
- Data pipeline health (scraper status, cache freshness, last successful run)
- Confidence distribution (how often model is "high confidence" vs "uncertain")
- Model drift detection

### Stage 6: GROUND TRUTH FEEDBACK LOOP (The Innovation)

**What happens:** The system collects real-world data back from the people it serves, creating a data flywheel.

**Two feedback sources with distinct roles (IMPORTANT — these are NOT interchangeable):**

1. **Farmer feedback (high volume, low precision):**
   - WhatsApp reply or missed call: "Did it rain in your village today? Reply 1=Yes, 2=No"
   - Stored: (village GPS, date, rain yes/no)
   - Value: **directional validation only** — can confirm/deny whether the predicted break/onset actually happened at village level. CANNOT produce quantitative mm-level deltas. Binary data tells us "the model was right/wrong about the direction" for spatial coverage across hundreds of villages.

2. **Officer calibration (low volume, high precision):**
   - Dashboard form during field visits: actual rain gauge reading (mm) + soil moisture observation
   - Stored: (block, date, actual_rainfall_mm, soil_condition)
   - Value: **quantitative bias correction** — "model predicted 12mm, actual was 8mm, adjust Shirur block predictions down by 4mm." Only officer data (actual mm readings) drives the numerical bias correction via exponential smoothing.

**How it closes the loop (precise claim):**
- Farmer binary feedback → validates directional accuracy per village (was the prediction right or wrong?) → identifies systematic spatial biases (Village A consistently says "no rain" when model says "rain") → triggers flag for officer follow-up
- Officer quantitative feedback → drives actual mm-level bias correction for blocks → weekly exponential smoothing adjustment
- Season-end retraining: both data sources feed into the full model retrain, with appropriate weighting (officer data weighted higher per-observation, farmer data provides spatial density)
- **Panchayat-scale path is honest:** binary farmer feedback identifies WHICH villages deviate from block averages; officer visits to those flagged villages produce the quantitative correction. Neither alone is sufficient.

**The flywheel:**
- Season 1: District-level predictions → farmers flag directional errors at village level → officers investigate flagged villages
- Season 2: Model corrected with Season 1 quantitative data → block-level accuracy improves
- Season 3: More feedback density → approaching panchayat-level resolution for well-covered blocks

### Stage 7: PMFBY INSURANCE WINDOW CHECK

**What happens:** Before any DELAY_SOWING advisory is finalized, the advisory engine cross-references the state government's officially notified PMFBY (Pradhan Mantri Fasal Bima Yojana) sowing window for that crop and district.

**Why this matters:** State governments notify official sowing date windows for crop insurance eligibility. If our system advises a farmer to delay sowing past that state-notified cutoff, the farmer may become **ineligible for crop insurance** — even though the meteorological advice was correct. That's a real, non-obvious conflict between two government systems.

**How it works:**
- Advisory engine stores notified PMFBY sowing windows per crop × district (updated each season from state agriculture department notifications)
- When generating a DELAY_SOWING advisory:
  - If recommended delay keeps farmer within PMFBY window → advisory goes out normally
  - If recommended delay would push past PMFBY cutoff → advisory adds explicit flag: "⚠️ Delay recommended based on weather, but this exceeds your crop insurance (PMFBY) window ending [date]. Consult your extension officer before deciding."
  - Officer dashboard simultaneously shows this conflict for the affected block
- This ensures the system never unknowingly costs a farmer their insurance safety net

---

## Innovation Stack (Ranked by Judge Impact)

### Tier 1 — Genuinely Novel (Would Make a Judge Sit Up)

1. **Farmer Feedback Loop as Path to Panchayat Scale**
   - No existing system — not Meghdoot, not any hackathon repo — collects village-level ground truth
   - Farmer gives missed call or WhatsApp reply: "Did it rain? 1=Yes, 2=No" → stored with village GPS
   - Turns a limitation (can't predict below 25km grid) into a product mechanic
   - Season-over-season: predictions get more localized as data accumulates
   - Research backing: Overeem et al., 2013 (crowdsourced weather validation)

2. **Officer Ground-Truth Calibration Tool**
   - Officer enters actual rain gauge reading (mm) + soil moisture during field visit
   - High-precision data → direct model bias correction for that block (exponential smoothing)
   - Complements farmer feedback: officer = high quality/low volume, farmer = low quality/high volume
   - Both feed into the same retraining pipeline

3. **Confidence-Branched Advisory by Irrigation Access**
   - Same weather → different advice for irrigated vs rain-fed farmers
   - "70% break risk — if you have irrigation, sow with caution. If rain-fed, wait 7 days."
   - Nobody in the competitive set personalizes by irrigation access
   - Research backing: FAO 2011 distinguishes irrigated vs rainfed risk management

4. **Model vs Naive Trust Card (Real Backtested Numbers)**
   - Shows counterfactual: "Old method → crop loss. Our model → warned 8 days early."
   - Numbers derived from actual backtesting on 2015/2019 drought data + ICAR cost-of-cultivation reports
   - NOT hardcoded (MonsoonPulse's version was hardcoded — we specifically avoid this)

5. **LLM-for-Tone-Only Architecture (No Hallucination)**
   - Rule engine decides WHAT to say. LLM decides HOW to say it.
   - LLM is explicitly constrained: "Do not generate any numbers or predictions"
   - Prevents AI hallucination in a life-affecting advisory system
   - Cost optimization: ~50 unique advisory combos cached, not 300K API calls

### Tier 2 — Smart Engineering (Shows Depth)

6. **False Onset Detection** — Dedicated mechanism for the PS's #1 pain point, with data-derived thresholds from 25-year analysis (not arbitrary 0.7 cutoffs)
7. **Historical Analog Year Matching** — "This year resembles 2015" — cosine similarity on climate index vectors, gives context and builds trust in 1 sentence
8. **Severity-Based Auto-Routing with Escalation** — CRITICAL alerts go to all channels instantly (no human gate). If officer doesn't acknowledge within 2 hours → auto-escalate. Shows systems thinking about failure modes.
9. **Daily Cadence vs Meghdoot's Twice-Weekly** — False onsets develop in 3 days. Meghdoot's Tue/Fri cycle misses this window. Our daily cycle catches it.

### Tier 3 — UX & Last-Mile Reach Innovations

10. **4-Week Bar Chart** — Instead of a raw 30-day probability curve, shows "Week 1: 🌧️ Normal → Week 2: ☀️ Dry → Week 3: ☀️ Severe → Week 4: 🌧️ Revival." Most farmer-readable monthly forecast format.

11. **wa.me One-Click WhatsApp Share** — Farmer taps one button → opens WhatsApp with pre-formatted advisory → shares to village group. 1 phone → 200-500 farmers reached. Zero Twilio API cost. Complements the official WhatsApp bot for viral reach.

12. **1-Liner Explainer Per Prediction** — "समुद्री संकेतों के अनुसार इस सप्ताह बारिश में देरी" (Ocean signals suggest rain delay this week). No black box. Builds farmer trust. Different detail levels per dashboard role.

13. **Sarkari Parcha / Printable Official Bulletin** — Officer clicks one button → system generates a printable, icon-based weekly bulletin styled as an official government circular. For gram panchayat notice boards, mandis, and chopals — reaching farmers with zero phone access. Icons (sun/cloud/rain/hand) for low-literacy readability.

14. **Farmer-Saathi Ultra-Lightweight Page (80KB)** — A single static HTML file with inline CSS and minimal JS. Works on 2G, loads in 1 second, shows icon-based forecast + advisory. Progressive enhancement fallback for ultra-low-bandwidth rural areas. No app install, no heavy downloads.

15. **Judge Mode Overlay** — One-click full-screen overlay showing: architecture diagram, PS-to-feature mapping table, data pipeline visualization, key accuracy metrics, and Meghdoot differentiation summary. Purely a demo/presentation convenience feature that makes the pitch smoother and more scoring-friendly.

---

## Tech Stack

### Frontend
- React + Vite — 4 role-based dashboards
- Tailwind CSS — responsive, mobile-first
- Leaflet.js — interactive GIS risk maps with block choropleth
- Recharts — 4-week bar charts, confidence graphs, accuracy trends
- react-i18next — multilingual (Hindi, Marathi, English)
- Web Speech API — text-to-speech advisory readout

### Backend
- FastAPI (Python) — REST API server
- PostgreSQL — farmer profiles, feedback logs, officer calibration, prediction history
- Redis — 6-hour cache for scraped climate indices
- Celery — scheduled daily jobs (scraping, inference, alert dispatch)

### ML / AI
- scikit-learn — StackingClassifier, StandardScaler, TimeSeriesSplit
- XGBoost — primary base model
- Random Forest + Gradient Boosting — ensemble diversity
- Logistic Regression — meta-learner
- Groq API (LLaMA 3) — LLM for advisory phrasing only

### Data Sources
- IMD 0.25° gridded rainfall + tmax + tmin (via imdlib, 25 years)
- NOAA CPC — ONI / ENSO (monthly)
- NOAA PSL — DMI / IOD (monthly)
- BoM Australia — MJO RMM (daily)
- OpenStreetMap Nominatim — village geocoding
- Future: IMD BRMS — block-level real-time rainfall (7,200 blocks, launched 2025)

### Delivery
- Twilio WhatsApp API — bot with registration flow
- Twilio SMS API — basic phone fallback
- wa.me deep links — zero-cost group sharing
- React PWA — web dashboards

### Infrastructure
- Docker + Docker Compose — single-command deployment
- GitHub Actions — CI pipeline

---

## Key Research Citations

| Reference | What It Supports |
|---|---|
| Rajeevan et al., 2010 (J. Earth System Science) | Break monsoon definition (7+ dry days) |
| Abhilash et al., 2014 (Space Science Reviews) | MJO prediction skill drops after week 2 |
| Krishna Kumar et al., 1999 (Science) | ENSO-monsoon teleconnection |
| Pai et al., 2011 (Mausam) | MJO phases 2-3 favor onset |
| Roxy et al., 2017 (Nature Comms) | Temperature drives monsoon via thermal contrast |
| Dai et al., 1999 (J. Climate) | DTR as humidity proxy |
| Flatau et al., 2001 (GRL) | False onset as documented phenomenon |
| Overeem et al., 2013 (BAMS) | Crowdsourced weather has scientific value |

---

## Judge Q&A Prep

**Q: "How is this different from Meghdoot?"**
A: "We're not replacing Meghdoot — we're the missing daily, explainable, bidirectional layer on top of it. Three gaps we fill: daily cadence vs twice-weekly, panchayat-scale via feedback loop, and confidence-branched crop-specific advisory."

**Q: "Your model is 25km grid. PS says panchayat. How?"**
A: "Day 1, we interpolate to block using elevation correction. True panchayat comes from our feedback loop — binary farmer feedback identifies WHICH villages deviate from block averages. Officer visits to those flagged villages produce quantitative mm-level corrections. Neither alone is sufficient. After one monsoon season of both data sources, we have meaningful block-to-panchayat adjustment for well-covered areas."

**Q: "What's your accuracy at week 3-4?"**
A: "Week 1-2 skill is competitive with IMD ERF (~65-68% for onset/break). By week 3-4, skill drops — our uncertainty bands explicitly widen. We don't hide this. The model's primary value is week 1-2 actionable alerts."

**Q: "What if your model is wrong and a farmer loses a crop?"**
A: "Every advisory carries a model agreement score, explicitly framed as a recommendation, not a directive. The officer has a calibration override. We also cross-check against PMFBY insurance sowing windows — if our recommended delay would cost the farmer insurance eligibility, we flag it explicitly so neither the farmer nor the officer is blindsided."

**Q: "Is that confidence score a real probability?"**
A: "We apply isotonic regression calibration on our holdout validation set. Without calibration, tree ensemble outputs are typically not well-calibrated — '68%' from raw XGBoost doesn't reliably mean 'happens 68% of the time.' After calibration, it does. We validate calibration quality using reliability diagrams on the 2022-2023 test set. If calibration is imperfect, we label it 'model agreement score' rather than making a probabilistic claim we can't back."

**Q: "Your delay advisory could conflict with PMFBY sowing windows — have you thought about that?"**
A: "Yes. The advisory engine cross-references state-notified PMFBY sowing windows. If our recommended delay would push past the insurance cutoff, we flag it explicitly to both farmer and officer: 'delay recommended based on weather, but this exceeds your insurance window — consult your officer.' We never unknowingly cost a farmer their insurance safety net."

**Q: "Why Groq/LLaMA 3?"**
A: "Free tier, fast inference (LPU hardware), open-source model. For a government deployment, open-source avoids vendor lock-in with proprietary APIs."

**Q: "Where's the humidity/wind data?"**
A: "imdlib provides rain, tmax, tmin — not humidity or wind. We use Diurnal Temperature Range (tmax-tmin) as a validated humidity proxy (Dai et al., 1999). Direct humidity would require ERA5 reanalysis. We've scoped that as a future integration."

**Q: "You're storing farmer phone numbers, GPS, and crop data. What about privacy?"**
A: "Opt-in consent at WhatsApp registration. Phone numbers stored hashed. Purpose-limited to advisory delivery only. Farmer replies STOP = full deletion within 24 hours. Compliant with DPDP Act 2023 principles."

---

## Probability Calibration (Technical Detail)

**Problem:** XGBoost, Random Forest, and Gradient Boosting outputs from `predict_proba()` are NOT well-calibrated out of the box. A raw output of 0.68 doesn't mean "this event happens 68% of the time" — tree ensembles tend to push probabilities toward 0 and 1 (overconfident) or cluster them in the middle.

**Fix:** After training each ensemble, apply **isotonic regression calibration** using the 2020-2021 validation holdout:

```python
from sklearn.calibration import CalibratedClassifierCV

calibrated_ensemble = CalibratedClassifierCV(
    ensemble,
    method='isotonic',  # non-parametric, more flexible than Platt scaling
    cv='prefit'         # already trained, just calibrate
)
calibrated_ensemble.fit(X_val_scaled, y_val)
joblib.dump(calibrated_ensemble, f'models/ensemble_{target}_calibrated.joblib')
```

**Validation:** Generate reliability diagrams on 2022-2023 test set. If calibration curve aligns with the diagonal → the score is a true probability and we label it "confidence %." If not → label as "model agreement score" in the UI.

**Why this matters:** We show farmers a number. If that number is "68%", it needs to mean something real. An uncalibrated score that says 68% but actually occurs 85% of the time damages trust. Calibration is a one-line code addition that makes our entire trust-and-explainability story honest.

---

## Data Privacy & Consent (DPDP Act 2023)

**Why this section exists:** We store personally identifiable, location-tagged farmer data (phone, GPS, crop, irrigation) accessible across 4 access tiers. India's Digital Personal Data Protection Act 2023 applies.

**Our consent model:**
1. **Opt-in at registration:** Farmer explicitly initiates by messaging the bot or scanning QR. No pre-enrolled lists. The first message IS the consent.
2. **Purpose limitation:** Data used exclusively for advisory generation and delivery. Never sold, shared, or used for profiling beyond agricultural advisory.
3. **Data minimization:** We store only what the advisory engine needs — village GPS (not exact home), crop type, irrigation access. Phone numbers stored as salted hashes except for the delivery layer.
4. **Right to erasure:** Farmer replies "STOP" → all profile data deleted within 24 hours. Anonymized feedback (rain yes/no + GPS without phone link) retained for model improvement.
5. **Access tiers:**
   - Farmer: sees only their own data
   - Officer: sees aggregate block-level data + village names (not individual phone numbers)
   - Admin: sees district/state aggregates only
   - SysAdmin: database access under audit logging
6. **Audit trail:** All data access logged with timestamp, accessor role, and query type.

**One-slide version:** "Opt-in consent. Phone numbers hashed. Purpose-limited. STOP = delete in 24hr. DPDP Act 2023 compliant."

---

## Demo State: Maharashtra
- 15+ agricultural districts (Beed, Latur, Solapur, Osmanabad, Ahmednagar, Jalna, Aurangabad, Pune, Satara, Kolhapur, Nashik, Nagpur, Amravati, Wardha, Yavatmal)
- Drought-prone Kharif belt — soybean, cotton, paddy, groundnut
- Architecture scales pan-India; demo is scoped to one state for validation rigor
