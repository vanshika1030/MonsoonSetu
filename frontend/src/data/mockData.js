// src/data/mockData.js
// Mock dataset for MonsoonSetu — Maharashtra Monsoon Prediction Dashboard

export const districts = [
  {
    id: 'beed',
    name: 'Beed',
    lat: 18.9891,
    lon: 75.7601,
    elevation: 515,
    riskLevel: 'high',
    soilType: 'Vertisol (Black Cotton)',
    soilDescription: 'Deep black cotton soil — high water-holding capacity when wet, cracks badly when dry',
    soilAdvisoryImpact: 'False onset is EXTRA dangerous here — cracked Vertisol kills germinating seeds faster than other soils',
    predictions: {
      onset_7d: 78,
      onset_14d: 85,
      break_7d: 65,
      break_14d: 82,
      break_21d: 74,
      break_30d: 58,
      heavy_7d: 22,
      heavy_14d: 15,
    },
    falseOnsetFlag: true,
    analogYear: {
      year: 2015,
      similarity: 89,
      description: 'Similar pattern in 2015 led to 14-day mid-July break in Marathwada.',
    },
    weeklyForecast: [
      { week: 1, label: 'Normal Rain', icon: 'cloud-rain', probability: 72, riskLevel: 'low', color: '#16A34A' },
      { week: 2, label: 'Dry Spell Likely', icon: 'sun', probability: 68, riskLevel: 'moderate', color: '#EAB308' },
      { week: 3, label: 'Dry Continues', icon: 'sun', probability: 55, riskLevel: 'high', color: '#DC2626' },
      { week: 4, label: 'Revival Expected', icon: 'cloud-rain', probability: 61, riskLevel: 'low', color: '#16A34A' },
    ],
  },
  {
    id: 'latur',
    name: 'Latur',
    lat: 18.4088,
    lon: 76.5604,
    elevation: 631,
    riskLevel: 'high',
    soilType: 'Vertisol (Black Cotton)',
    soilDescription: 'Deep black cotton soil — high clay content, swells when wet, cracks when dry',
    soilAdvisoryImpact: 'Cracked Vertisol after false onset dries out root zone rapidly — delay sowing until sustained rain',
    predictions: {
      onset_7d: 74,
      onset_14d: 80,
      break_7d: 62,
      break_14d: 79,
      break_21d: 70,
      break_30d: 52,
      heavy_7d: 18,
      heavy_14d: 12,
    },
    falseOnsetFlag: false,
    analogYear: {
      year: 2015,
      similarity: 86,
      description: 'Severe soil moisture deficit during vegetative stage post early sowing.',
    },
    weeklyForecast: [
      { week: 1, label: 'Scattered Showers', icon: 'cloud-rain', probability: 65, riskLevel: 'low', color: '#16A34A' },
      { week: 2, label: 'Dry Spell Likely', icon: 'sun', probability: 70, riskLevel: 'moderate', color: '#EAB308' },
      { week: 3, label: 'Extended Break', icon: 'sun', probability: 64, riskLevel: 'high', color: '#DC2626' },
      { week: 4, label: 'Late Showers', icon: 'cloud-rain', probability: 58, riskLevel: 'low', color: '#16A34A' },
    ],
  },
  {
    id: 'solapur',
    name: 'Solapur',
    lat: 17.6599,
    lon: 75.9064,
    elevation: 458,
    riskLevel: 'high',
    soilType: 'Vertisol (Shallow Black)',
    soilDescription: 'Shallow black cotton soil over basalt — limited water retention, drought-prone',
    soilAdvisoryImpact: 'Shallow soil means even short dry spells stress crops faster — shorter sowing window',
    predictions: {
      onset_7d: 60,
      onset_14d: 68,
      break_7d: 70,
      break_14d: 84,
      break_21d: 76,
      break_30d: 60,
      heavy_7d: 15,
      heavy_14d: 10,
    },
    falseOnsetFlag: false,
    analogYear: {
      year: 2018,
      similarity: 82,
      description: 'Deficient early monsoon with prolonged dry breaks in southern plateau.',
    },
    weeklyForecast: [
      { week: 1, label: 'Light Showers', icon: 'cloud-rain', probability: 54, riskLevel: 'low', color: '#16A34A' },
      { week: 2, label: 'Dry Spell Likely', icon: 'sun', probability: 75, riskLevel: 'high', color: '#DC2626' },
      { week: 3, label: 'Dry Continues', icon: 'sun', probability: 68, riskLevel: 'high', color: '#DC2626' },
      { week: 4, label: 'Isolated Rain', icon: 'cloud-rain', probability: 50, riskLevel: 'moderate', color: '#EAB308' },
    ],
  },
  {
    id: 'osmanabad',
    name: 'Osmanabad',
    lat: 18.1853,
    lon: 76.0420,
    elevation: 653,
    riskLevel: 'high',
    soilType: 'Vertisol (Medium Black)',
    soilDescription: 'Medium-depth black soil — moderate water-holding capacity',
    soilAdvisoryImpact: 'Better retention than Solapur but still vulnerable to 10+ day breaks',
    predictions: {
      onset_7d: 71,
      onset_14d: 77,
      break_7d: 64,
      break_14d: 81,
      break_21d: 72,
      break_30d: 55,
      heavy_7d: 19,
      heavy_14d: 14,
    },
    falseOnsetFlag: false,
    analogYear: {
      year: 2015,
      similarity: 84,
      description: 'Delayed monsoon progression leading to stunted pulse germination.',
    },
    weeklyForecast: [
      { week: 1, label: 'Normal Rain', icon: 'cloud-rain', probability: 68, riskLevel: 'low', color: '#16A34A' },
      { week: 2, label: 'Dry Spell Likely', icon: 'sun', probability: 66, riskLevel: 'moderate', color: '#EAB308' },
      { week: 3, label: 'High Evaporation', icon: 'sun', probability: 60, riskLevel: 'high', color: '#DC2626' },
      { week: 4, label: 'Rain Revival', icon: 'cloud-rain', probability: 59, riskLevel: 'low', color: '#16A34A' },
    ],
  },
  {
    id: 'ahmednagar',
    name: 'Ahmednagar',
    lat: 19.0952,
    lon: 74.7496,
    elevation: 649,
    riskLevel: 'moderate',
    soilType: 'Entisol (Alluvial-Black mix)',
    soilDescription: 'Mixed alluvial and black soil along river basins — variable drainage',
    soilAdvisoryImpact: 'River-basin blocks retain moisture longer — can tolerate 5-7 day gaps',
    predictions: {
      onset_7d: 65,
      onset_14d: 72,
      break_7d: 48,
      break_14d: 59,
      break_21d: 52,
      break_30d: 45,
      heavy_7d: 25,
      heavy_14d: 20,
    },
    falseOnsetFlag: false,
    analogYear: {
      year: 2017,
      similarity: 79,
      description: 'Patchy rainfall in western rain shadow belt with intermittent breaks.',
    },
    weeklyForecast: [
      { week: 1, label: 'Scattered Rain', icon: 'cloud-rain', probability: 62, riskLevel: 'low', color: '#16A34A' },
      { week: 2, label: 'Partly Cloudy', icon: 'sun', probability: 50, riskLevel: 'moderate', color: '#EAB308' },
      { week: 3, label: 'Light Showers', icon: 'cloud-rain', probability: 56, riskLevel: 'low', color: '#16A34A' },
      { week: 4, label: 'Steady Rain', icon: 'cloud-rain', probability: 65, riskLevel: 'low', color: '#16A34A' },
    ],
  },
  {
    id: 'jalna',
    name: 'Jalna',
    lat: 19.8347,
    lon: 75.8816,
    elevation: 508,
    riskLevel: 'moderate',
    soilType: 'Vertisol (Black Cotton)',
    soilDescription: 'Deep black cotton soil — typical Marathwada, high clay content',
    soilAdvisoryImpact: 'Same Vertisol risk as Beed — false onset causes severe cracking and seed mortality',
    predictions: {
      onset_7d: 70,
      onset_14d: 76,
      break_7d: 55,
      break_14d: 63,
      break_21d: 58,
      break_30d: 49,
      heavy_7d: 28,
      heavy_14d: 22,
    },
    falseOnsetFlag: false,
    analogYear: {
      year: 2019,
      similarity: 77,
      description: 'Initial sluggish onset followed by rapid catch-up in late July.',
    },
    weeklyForecast: [
      { week: 1, label: 'Moderate Rain', icon: 'cloud-rain', probability: 66, riskLevel: 'low', color: '#16A34A' },
      { week: 2, label: 'Dry Spell Likely', icon: 'sun', probability: 58, riskLevel: 'moderate', color: '#EAB308' },
      { week: 3, label: 'Intermittent Rain', icon: 'cloud-rain', probability: 52, riskLevel: 'moderate', color: '#EAB308' },
      { week: 4, label: 'Active Monsoon', icon: 'cloud-rain', probability: 70, riskLevel: 'low', color: '#16A34A' },
    ],
  },
  {
    id: 'aurangabad',
    name: 'Aurangabad',
    lat: 19.8762,
    lon: 75.3433,
    elevation: 569,
    riskLevel: 'moderate',
    soilType: 'Vertisol (Black Cotton)',
    soilDescription: 'Deep black cotton soil with basalt parent rock — classic Deccan trap soil',
    soilAdvisoryImpact: 'High water-holding when wet, but cracks rapidly after 7-10 dry days',
    predictions: {
      onset_7d: 68,
      onset_14d: 75,
      break_7d: 50,
      break_14d: 60,
      break_21d: 54,
      break_30d: 46,
      heavy_7d: 30,
      heavy_14d: 25,
    },
    falseOnsetFlag: false,
    analogYear: {
      year: 2016,
      similarity: 80,
      description: 'Moderate early spell with intermittent dry intervals.',
    },
    weeklyForecast: [
      { week: 1, label: 'Normal Rain', icon: 'cloud-rain', probability: 70, riskLevel: 'low', color: '#16A34A' },
      { week: 2, label: 'Brief Break', icon: 'sun', probability: 52, riskLevel: 'moderate', color: '#EAB308' },
      { week: 3, label: 'Normal Showers', icon: 'cloud-rain', probability: 63, riskLevel: 'low', color: '#16A34A' },
      { week: 4, label: 'Good Rains', icon: 'cloud-rain', probability: 68, riskLevel: 'low', color: '#16A34A' },
    ],
  },
  {
    id: 'pune',
    name: 'Pune',
    lat: 18.5204,
    lon: 73.8567,
    elevation: 560,
    riskLevel: 'low',
    soilType: 'Laterite-Alfisol mix',
    soilDescription: 'Laterite soil on Western Ghat slopes, transitioning to alluvial in plains',
    soilAdvisoryImpact: 'Laterite drains fast — needs more frequent rain, but less cracking risk than Vertisol',
    predictions: {
      onset_7d: 85,
      onset_14d: 92,
      break_7d: 25,
      break_14d: 32,
      break_21d: 28,
      break_30d: 24,
      heavy_7d: 55,
      heavy_14d: 48,
    },
    falseOnsetFlag: false,
    analogYear: {
      year: 2020,
      similarity: 88,
      description: 'Timely onset along Western Ghats catchment with robust seasonal totals.',
    },
    weeklyForecast: [
      { week: 1, label: 'Steady Rain', icon: 'cloud-rain', probability: 82, riskLevel: 'low', color: '#16A34A' },
      { week: 2, label: 'Heavy Showers', icon: 'cloud-rain', probability: 78, riskLevel: 'low', color: '#16A34A' },
      { week: 3, label: 'Continuous Drizzle', icon: 'cloud-rain', probability: 72, riskLevel: 'low', color: '#16A34A' },
      { week: 4, label: 'Moderate Rain', icon: 'cloud-rain', probability: 75, riskLevel: 'low', color: '#16A34A' },
    ],
  },
  {
    id: 'satara',
    name: 'Satara',
    lat: 17.6805,
    lon: 73.9935,
    elevation: 742,
    riskLevel: 'low',
    soilType: 'Laterite (Red)',
    soilDescription: 'Red laterite soil — well-drained, moderate fertility, acidic',
    soilAdvisoryImpact: 'Fast drainage means crops need consistent rain — but waterlogging risk is lower',
    predictions: {
      onset_7d: 88,
      onset_14d: 94,
      break_7d: 22,
      break_14d: 28,
      break_21d: 26,
      break_30d: 20,
      heavy_7d: 62,
      heavy_14d: 54,
    },
    falseOnsetFlag: false,
    analogYear: {
      year: 2021,
      similarity: 85,
      description: 'Strong ghat surge bringing consistent moisture to western belts.',
    },
    weeklyForecast: [
      { week: 1, label: 'Heavy Rain', icon: 'cloud-rain', probability: 84, riskLevel: 'low', color: '#16A34A' },
      { week: 2, label: 'Moderate Rain', icon: 'cloud-rain', probability: 80, riskLevel: 'low', color: '#16A34A' },
      { week: 3, label: 'Normal Showers', icon: 'cloud-rain', probability: 74, riskLevel: 'low', color: '#16A34A' },
      { week: 4, label: 'Steady Monsoon', icon: 'cloud-rain', probability: 78, riskLevel: 'low', color: '#16A34A' },
    ],
  },
  {
    id: 'kolhapur',
    name: 'Kolhapur',
    lat: 16.7050,
    lon: 74.2433,
    elevation: 569,
    riskLevel: 'low',
    soilType: 'Laterite-Alluvial',
    soilDescription: 'Rich alluvial soil near Krishna river, laterite on uplands — high fertility',
    soilAdvisoryImpact: 'Wettest district — advisory focuses on excess rain and waterlogging, not drought',
    predictions: {
      onset_7d: 92,
      onset_14d: 96,
      break_7d: 18,
      break_14d: 24,
      break_21d: 20,
      break_30d: 18,
      heavy_7d: 70,
      heavy_14d: 62,
    },
    falseOnsetFlag: false,
    analogYear: {
      year: 2019,
      similarity: 91,
      description: 'Very active monsoon trough with high river inflows and minimal dry breaks.',
    },
    weeklyForecast: [
      { week: 1, label: 'Torrential Rain', icon: 'cloud-rain', probability: 88, riskLevel: 'low', color: '#16A34A' },
      { week: 2, label: 'Heavy Rain', icon: 'cloud-rain', probability: 85, riskLevel: 'low', color: '#16A34A' },
      { week: 3, label: 'Steady Rain', icon: 'cloud-rain', probability: 79, riskLevel: 'low', color: '#16A34A' },
      { week: 4, label: 'Persistent Showers', icon: 'cloud-rain', probability: 81, riskLevel: 'low', color: '#16A34A' },
    ],
  },
  {
    id: 'nashik',
    name: 'Nashik',
    lat: 19.9975,
    lon: 73.7898,
    elevation: 600,
    riskLevel: 'low',
    soilType: 'Inceptisol (Brown-Black)',
    soilDescription: 'Brown to black medium soil — transitional zone between Western Ghats and plateau',
    soilAdvisoryImpact: 'Moderate retention — can handle 5-day gaps but not prolonged breaks',
    predictions: {
      onset_7d: 82,
      onset_14d: 89,
      break_7d: 30,
      break_14d: 36,
      break_21d: 32,
      break_30d: 26,
      heavy_7d: 48,
      heavy_14d: 40,
    },
    falseOnsetFlag: false,
    analogYear: {
      year: 2022,
      similarity: 83,
      description: 'Favorable cyclonic circulation in Arabian sea aiding timely monsoon surge.',
    },
    weeklyForecast: [
      { week: 1, label: 'Moderate Rain', icon: 'cloud-rain', probability: 78, riskLevel: 'low', color: '#16A34A' },
      { week: 2, label: 'Steady Showers', icon: 'cloud-rain', probability: 74, riskLevel: 'low', color: '#16A34A' },
      { week: 3, label: 'Light Rain', icon: 'cloud-rain', probability: 66, riskLevel: 'low', color: '#16A34A' },
      { week: 4, label: 'Normal Rain', icon: 'cloud-rain', probability: 72, riskLevel: 'low', color: '#16A34A' },
    ],
  },
  {
    id: 'nagpur',
    name: 'Nagpur',
    lat: 21.1458,
    lon: 79.0882,
    elevation: 310,
    riskLevel: 'low',
    soilType: 'Alfisol (Red-Yellow)',
    soilDescription: 'Red-yellow loamy soil — well-drained Vidarbha soil with moderate fertility',
    soilAdvisoryImpact: 'Better drainage than Marathwada Vertisols — cotton and orange orchards adapted',
    predictions: {
      onset_7d: 79,
      onset_14d: 86,
      break_7d: 32,
      break_14d: 38,
      break_21d: 35,
      break_30d: 30,
      heavy_7d: 45,
      heavy_14d: 38,
    },
    falseOnsetFlag: false,
    analogYear: {
      year: 2020,
      similarity: 81,
      description: 'Bay of Bengal low pressure systems providing regular rain pulses across Vidarbha.',
    },
    weeklyForecast: [
      { week: 1, label: 'Good Rain', icon: 'cloud-rain', probability: 76, riskLevel: 'low', color: '#16A34A' },
      { week: 2, label: 'Scattered Showers', icon: 'cloud-rain', probability: 70, riskLevel: 'low', color: '#16A34A' },
      { week: 3, label: 'Normal Rain', icon: 'cloud-rain', probability: 68, riskLevel: 'low', color: '#16A34A' },
      { week: 4, label: 'Active Monsoon', icon: 'cloud-rain', probability: 74, riskLevel: 'low', color: '#16A34A' },
    ],
  },
  {
    id: 'amravati',
    name: 'Amravati',
    lat: 20.9374,
    lon: 77.7796,
    elevation: 343,
    riskLevel: 'moderate',
    soilType: 'Vertisol-Alfisol mix',
    soilDescription: 'Mixed black and red soil — varies by block, deep in valleys, shallow on ridges',
    soilAdvisoryImpact: 'Block-level variation matters — valley blocks more resilient than ridge blocks',
    predictions: {
      onset_7d: 72,
      onset_14d: 79,
      break_7d: 45,
      break_14d: 54,
      break_21d: 48,
      break_30d: 40,
      heavy_7d: 35,
      heavy_14d: 28,
    },
    falseOnsetFlag: false,
    analogYear: {
      year: 2017,
      similarity: 76,
      description: 'Patchy early rains with 7 to 10 day dry gap in cotton-growing blocks.',
    },
    weeklyForecast: [
      { week: 1, label: 'Normal Rain', icon: 'cloud-rain', probability: 68, riskLevel: 'low', color: '#16A34A' },
      { week: 2, label: 'Dry Spell Likely', icon: 'sun', probability: 54, riskLevel: 'moderate', color: '#EAB308' },
      { week: 3, label: 'Scattered Rain', icon: 'cloud-rain', probability: 60, riskLevel: 'low', color: '#16A34A' },
      { week: 4, label: 'Moderate Rain', icon: 'cloud-rain', probability: 66, riskLevel: 'low', color: '#16A34A' },
    ],
  },
  {
    id: 'wardha',
    name: 'Wardha',
    lat: 20.7453,
    lon: 78.6022,
    elevation: 234,
    riskLevel: 'low',
    soilType: 'Alfisol (Red Loam)',
    soilDescription: 'Red loamy soil — moderate water retention, good for cotton and pulses',
    soilAdvisoryImpact: 'Drains better than Marathwada — can tolerate 7-day dry gaps without cracking',
    predictions: {
      onset_7d: 77,
      onset_14d: 84,
      break_7d: 34,
      break_14d: 42,
      break_21d: 36,
      break_30d: 32,
      heavy_7d: 42,
      heavy_14d: 35,
    },
    falseOnsetFlag: false,
    analogYear: {
      year: 2021,
      similarity: 82,
      description: 'Consistent central Vidarbha rain bands supporting steady crop establishment.',
    },
    weeklyForecast: [
      { week: 1, label: 'Steady Rain', icon: 'cloud-rain', probability: 74, riskLevel: 'low', color: '#16A34A' },
      { week: 2, label: 'Normal Rain', icon: 'cloud-rain', probability: 71, riskLevel: 'low', color: '#16A34A' },
      { week: 3, label: 'Light Showers', icon: 'cloud-rain', probability: 64, riskLevel: 'low', color: '#16A34A' },
      { week: 4, label: 'Active Spells', icon: 'cloud-rain', probability: 70, riskLevel: 'low', color: '#16A34A' },
    ],
  },
  {
    id: 'yavatmal',
    name: 'Yavatmal',
    lat: 20.3888,
    lon: 78.1204,
    elevation: 445,
    riskLevel: 'moderate',
    soilType: 'Vertisol-Inceptisol mix',
    soilDescription: 'Black cotton soil in plains, thin rocky soil on hills — cotton belt',
    soilAdvisoryImpact: 'Cotton-growing blocks on thin soil are most vulnerable to break spells',
    predictions: {
      onset_7d: 70,
      onset_14d: 76,
      break_7d: 49,
      break_14d: 58,
      break_21d: 51,
      break_30d: 44,
      heavy_7d: 32,
      heavy_14d: 26,
    },
    falseOnsetFlag: false,
    analogYear: {
      year: 2016,
      similarity: 78,
      description: 'Moderate onset followed by intermittent breaks affecting rainfed cotton sowing.',
    },
    weeklyForecast: [
      { week: 1, label: 'Normal Rain', icon: 'cloud-rain', probability: 67, riskLevel: 'low', color: '#16A34A' },
      { week: 2, label: 'Dry Spell Likely', icon: 'sun', probability: 56, riskLevel: 'moderate', color: '#EAB308' },
      { week: 3, label: 'Light Showers', icon: 'cloud-rain', probability: 58, riskLevel: 'low', color: '#16A34A' },
      { week: 4, label: 'Revival Expected', icon: 'cloud-rain', probability: 64, riskLevel: 'low', color: '#16A34A' },
    ],
  },
];

export const farmerProfile = {
  name: 'Ramesh Patil',
  village: 'Shirur Kasar',
  district: 'Beed',
  location: 'Shirur Kasar, Beed',
  crop: 'Soybean',
  stage: 'Pre-sowing',
  irrigation: false,
  language: 'mr',
  phone: '9876XXXXXX',
};

export const advisory = {
  action: 'DELAY_SOWING',
  severity: 'CRITICAL',
  level: 'CRITICAL',
  headline: '⚠️ पेरणी करू नका — खोटा पावसाळा सुरू!',
  headlineEn: '⚠️ Do Not Sow — False Onset Detected!',
  explanation:
    'Ocean signals show El Niño strengthening. MJO rain belt moving away from India. This rain is likely temporary.',
  explanationMr: 'समुद्री संकेत दर्शवतात की एल निनो मजबूत होत आहे. पाऊस तात्पुरता आहे.',
  confidence: 68,
  waitDays: 7,
  waitInstruction: 'Wait minimum 7 days for sustained rain confirmation.',
  analogYear: 2015,
  analogDescription: 'Similar pattern in 2015 led to 14-day mid-July break in Marathwada.',
  pmfbyWarning: null,
  irrigatedAdvice: 'Sow with caution. Supplement with borewell if rain stops.',
  rainfedAdvice: 'DO NOT sow. Wait minimum 7 days for sustained rain confirmation.',
};

export const climateIndices = {
  oni: 0.8,
  oniStatus: 'El Niño (Weak)',
  dmi: -0.3,
  dmiStatus: 'Negative IOD',
  mjoPhase: 6,
  mjoAmplitude: 1.4,
  mjoStatus: 'Suppressive (Phase 6)',
  // Nested structure for compatibility
  ONI: { value: 0.8, status: 'El Niño (Weak)' },
  DMI: { value: -0.3, status: 'Negative IOD' },
  MJO: { value: 'Phase 6 (Amp 1.4)', status: 'Suppressive (Phase 6)' },
};

export const feedbackHistory = [
  { id: 'FB-101', village: 'Shirur Kasar', date: '2026-06-28', rainReported: false, matchedPrediction: true },
  { id: 'FB-102', village: 'Ashti', date: '2026-06-28', rainReported: false, matchedPrediction: true },
  { id: 'FB-103', village: 'Patoda', date: '2026-06-27', rainReported: true, matchedPrediction: false },
  { id: 'FB-104', village: 'Georai', date: '2026-06-27', rainReported: false, matchedPrediction: true },
  { id: 'FB-105', village: 'Majalgaon', date: '2026-06-26', rainReported: true, matchedPrediction: true },
  { id: 'FB-106', village: 'Kaij', date: '2026-06-26', rainReported: false, matchedPrediction: true },
  { id: 'FB-107', village: 'Ambajogai', date: '2026-06-25', rainReported: false, matchedPrediction: true },
  { id: 'FB-108', village: 'Dharur', date: '2026-06-25', rainReported: true, matchedPrediction: false },
  { id: 'FB-109', village: 'Parli', date: '2026-06-24', rainReported: false, matchedPrediction: true },
  { id: 'FB-110', village: 'Wadwani', date: '2026-06-24', rainReported: false, matchedPrediction: true },
];

export const officerCalibrations = [
  {
    id: 'CAL-01',
    block: 'Beed Central',
    date: '2026-06-28',
    predictedMm: 18.5,
    actualMm: 4.2,
    soilCondition: 'Dry crust (top 5cm)',
    bias: '+14.3mm (Over-predicted)',
  },
  {
    id: 'CAL-02',
    block: 'Ashti West',
    date: '2026-06-27',
    predictedMm: 12.0,
    actualMm: 2.0,
    soilCondition: 'Parched red soil',
    bias: '+10.0mm (Over-predicted)',
  },
  {
    id: 'CAL-03',
    block: 'Majalgaon Canal',
    date: '2026-06-27',
    predictedMm: 8.0,
    actualMm: 9.5,
    soilCondition: 'Moist (adequate sub-surface)',
    bias: '-1.5mm (Accurate)',
  },
  {
    id: 'CAL-04',
    block: 'Georai Valley',
    date: '2026-06-26',
    predictedMm: 15.0,
    actualMm: 3.1,
    soilCondition: 'Dry black cotton',
    bias: '+11.9mm (Over-predicted)',
  },
  {
    id: 'CAL-05',
    block: 'Kaij Plateau',
    date: '2026-06-25',
    predictedMm: 6.5,
    actualMm: 5.8,
    soilCondition: 'Slight surface moisture',
    bias: '+0.7mm (Accurate)',
  },
];

export const systemHealth = {
  scraperStatus: { enso: 'ok', iod: 'ok', mjo: 'ok', lastUpdated: '2 hrs ago' },
  modelAccuracy: { onset_f1: 0.72, break_f1: 0.68, heavy_f1: 0.65 },
  pipelineHealth: 'All systems operational',
  totalFarmers: 2847,
  totalOfficers: 23,
  totalAlerts: 156,
};

export const weeklyForecastBeed = [
  { week: 1, label: 'Normal Rain', icon: 'cloud-rain', color: '#16A34A', probability: 72 },
  { week: 2, label: 'Dry Spell Likely', icon: 'sun', color: '#EAB308', probability: 68 },
  { week: 3, label: 'Dry Continues', icon: 'sun', color: '#DC2626', probability: 55 },
  { week: 4, label: 'Revival Expected', icon: 'cloud-rain', color: '#16A34A', probability: 61 },
];



// ============================================================
// CROP × STAGE × SOIL ADVISORY ENGINE
// Real agricultural rules based on ICAR/KVK Kharif advisories
// ============================================================

export const availableCrops = [
  { id: 'soybean', name: 'Soybean (सोयाबीन)', kharifOnly: true, droughtTolerance: 'low', waterNeedMm: 450 },
  { id: 'cotton', name: 'Cotton (कापूस)', kharifOnly: true, droughtTolerance: 'medium', waterNeedMm: 700 },
  { id: 'rice', name: 'Rice / Paddy (भात)', kharifOnly: true, droughtTolerance: 'very_low', waterNeedMm: 1200 },
  { id: 'jowar', name: 'Jowar / Sorghum (ज्वारी)', kharifOnly: false, droughtTolerance: 'high', waterNeedMm: 350 },
  { id: 'tur', name: 'Tur Dal / Pigeon Pea (तूर)', kharifOnly: true, droughtTolerance: 'medium', waterNeedMm: 400 },
  { id: 'bajra', name: 'Bajra / Pearl Millet (बाजरी)', kharifOnly: false, droughtTolerance: 'very_high', waterNeedMm: 250 },
  { id: 'maize', name: 'Maize (मका)', kharifOnly: false, droughtTolerance: 'medium', waterNeedMm: 500 },
  { id: 'groundnut', name: 'Groundnut (भुईमूग)', kharifOnly: true, droughtTolerance: 'medium', waterNeedMm: 500 },
];

export const cropStages = [
  { id: 'pre_sowing', name: 'Pre-sowing (पेरणीपूर्व)', critical: true },
  { id: 'germination', name: 'Germination (उगवण)', critical: true },
  { id: 'vegetative', name: 'Vegetative Growth (वाढ)', critical: false },
  { id: 'flowering', name: 'Flowering (फुलोरा)', critical: true },
  { id: 'grain_filling', name: 'Grain Filling (दाणे भरणे)', critical: true },
  { id: 'maturity', name: 'Maturity / Harvest (काढणी)', critical: false },
];

// Returns crop-specific advisory based on crop, stage, break risk, soil, and irrigation
export function getCropAdvisory(cropId, stageId, breakRisk, soilType, irrigated) {
  const crop = availableCrops.find(c => c.id === cropId);
  if (!crop) return { action: 'SOW_NOW', message: 'No specific advisory available.', severity: 'ROUTINE' };

  const isVertisol = soilType?.toLowerCase().includes('vertisol') || soilType?.toLowerCase().includes('black');
  const isLaterite = soilType?.toLowerCase().includes('laterite');

  // PRE-SOWING: Should the farmer sow now?
  if (stageId === 'pre_sowing') {
    if (breakRisk > 60) {
      if (cropId === 'bajra' || cropId === 'jowar') {
        return {
          action: irrigated ? 'SOW_WITH_CAUTION' : 'DELAY_SOWING',
          severity: irrigated ? 'MODERATE' : 'CRITICAL',
          message: irrigated
            ? crop.name.split(' (')[0] + ' is drought-tolerant. Sow with caution, supplement with irrigation.'
            : crop.name.split(' (')[0] + ' can handle dry spells, but ' + (breakRisk) + '% break risk is too high. Wait 5 days.',
          soilNote: isVertisol ? 'Black cotton soil will crack if rain stops — extra risky for germination.' : null,
          cropNote: 'Drought tolerance: ' + crop.droughtTolerance.toUpperCase() + ' | Water need: ' + crop.waterNeedMm + 'mm/season'
        };
      }
      if (cropId === 'rice') {
        return {
          action: 'DELAY_SOWING',
          severity: 'CRITICAL',
          message: 'Rice needs standing water. ' + breakRisk + '% break risk = seedling death. DO NOT transplant.',
          soilNote: isVertisol ? 'Vertisol retains water when wet but cracks when dry — devastating for paddy.' : 'This soil drains fast — rice needs consistent flooding.',
          cropNote: 'Drought tolerance: VERY LOW | Water need: 1200mm/season — highest of all Kharif crops'
        };
      }
      if (cropId === 'cotton') {
        return {
          action: 'DELAY_SOWING',
          severity: 'CRITICAL',
          message: 'Cotton has 700mm water need and long growing season. ' + breakRisk + '% break risk at sowing = high total-loss risk.',
          soilNote: isVertisol ? 'Cotton on black soil is Maharashtra\'s most vulnerable combination.' : null,
          cropNote: 'Drought tolerance: MEDIUM | Water need: 700mm/season | 150+ day crop cycle'
        };
      }
      // Default for other crops
      return {
        action: irrigated ? 'SOW_WITH_CAUTION' : 'DELAY_SOWING',
        severity: irrigated ? 'MODERATE' : 'CRITICAL',
        message: irrigated
          ? 'Sow ' + crop.name.split(' (')[0] + ' with caution. Supplement with borewell if rain stops.'
          : breakRisk + '% break risk is too high for rain-fed ' + crop.name.split(' (')[0] + '. Wait minimum 7 days.',
        soilNote: isVertisol ? 'Black cotton soil cracks after 7 dry days — seeds die in the cracks.' : null,
        cropNote: 'Drought tolerance: ' + crop.droughtTolerance.toUpperCase() + ' | Water need: ' + crop.waterNeedMm + 'mm/season'
      };
    }
    // Low break risk
    return {
      action: 'SOW_NOW',
      severity: 'ROUTINE',
      message: 'Conditions favorable for ' + crop.name.split(' (')[0] + '. Proceed with sowing.',
      soilNote: isVertisol ? 'Soil moisture adequate. Good window for sowing on black cotton soil.' : null,
      cropNote: 'Drought tolerance: ' + crop.droughtTolerance.toUpperCase() + ' | Water need: ' + crop.waterNeedMm + 'mm/season'
    };
  }

  // GERMINATION: Seeds just planted, very vulnerable
  if (stageId === 'germination') {
    if (breakRisk > 50) {
      return {
        action: irrigated ? 'IRRIGATE_NOW' : 'PROTECT_CROP',
        severity: breakRisk > 65 ? 'CRITICAL' : 'MODERATE',
        message: irrigated
          ? 'Seeds germinating — provide supplemental irrigation immediately. ' + breakRisk + '% dry spell risk.'
          : 'Seeds at critical stage. Apply mulch to retain soil moisture. Pray/wait for rain.',
        soilNote: isVertisol ? 'Vertisol cracks will expose seeds — apply thin organic mulch cover.' : (isLaterite ? 'Laterite drains fast — germinating seeds will dry out quickly without rain.' : null),
        cropNote: cropId === 'rice' ? 'Paddy seedlings die within 3 days without standing water.' : 'Germination is the most water-sensitive stage for ' + crop.name.split(' (')[0] + '.'
      };
    }
    return {
      action: 'MONITOR',
      severity: 'ROUTINE',
      message: 'Germination progressing. Monitor daily — this stage is most sensitive to dry spells.',
      soilNote: null,
      cropNote: null
    };
  }

  // FLOWERING: Second most critical stage
  if (stageId === 'flowering') {
    if (breakRisk > 50) {
      return {
        action: irrigated ? 'IRRIGATE_NOW' : 'PROTECT_CROP',
        severity: 'CRITICAL',
        message: irrigated
          ? 'Flowering stage — water stress NOW causes permanent yield loss. Irrigate immediately.'
          : crop.name.split(' (')[0] + ' is flowering. Dry spell at this stage reduces yield by 30-50%. No field remedy without irrigation.',
        soilNote: isVertisol ? 'Deep Vertisol may still have sub-surface moisture — check at 30cm depth.' : null,
        cropNote: 'Flowering-stage drought is the #1 cause of yield loss in Kharif ' + crop.name.split(' (')[0] + '.'
      };
    }
    return {
      action: 'MONITOR',
      severity: 'ROUTINE',
      message: 'Flowering in progress. Adequate moisture expected. Continue monitoring.',
      soilNote: null,
      cropNote: null
    };
  }

  // VEGETATIVE: Less critical, crop can recover
  if (stageId === 'vegetative') {
    if (breakRisk > 65) {
      return {
        action: irrigated ? 'IRRIGATE_SOON' : 'APPLY_MULCH',
        severity: 'MODERATE',
        message: irrigated
          ? 'Vegetative growth — plan irrigation within 2-3 days if rain doesn\'t arrive.'
          : 'Apply mulch to conserve soil moisture. ' + crop.name.split(' (')[0] + ' can partially recover from vegetative-stage stress.',
        soilNote: null,
        cropNote: 'Vegetative stage drought reduces growth but crop can partially recover if rain returns within 10 days.'
      };
    }
    return { action: 'MONITOR', severity: 'ROUTINE', message: 'Growth looks normal. Continue regular practices.', soilNote: null, cropNote: null };
  }

  // GRAIN FILLING: Important but crop is established
  if (stageId === 'grain_filling') {
    if (breakRisk > 55 && (cropId === 'rice' || cropId === 'soybean')) {
      return {
        action: irrigated ? 'IRRIGATE_NOW' : 'EARLY_HARVEST',
        severity: 'MODERATE',
        message: irrigated
          ? 'Grain filling needs consistent moisture. Irrigate to protect yield.'
          : 'If grains are 70%+ filled, consider early harvest to avoid shriveling from dry spell.',
        soilNote: null,
        cropNote: 'Grain filling in ' + crop.name.split(' (')[0] + ' needs steady moisture for full weight.'
      };
    }
    return { action: 'MONITOR', severity: 'ROUTINE', message: 'Grain filling in progress. Monitor maturity signs.', soilNote: null, cropNote: null };
  }

  // MATURITY: Dry weather is actually GOOD
  if (stageId === 'maturity') {
    return {
      action: breakRisk < 40 ? 'HARVEST_SOON' : 'CONTINUE',
      severity: breakRisk < 40 ? 'MODERATE' : 'ROUTINE',
      message: breakRisk < 40
        ? 'Rain expected — harvest immediately to avoid grain damage and fungal growth.'
        : 'Dry conditions favor harvest. Plan threshing within the dry window.',
      soilNote: null,
      cropNote: 'At maturity, rain is the ENEMY — causes grain discoloration, sprouting, and fungal damage.'
    };
  }

  return { action: 'MONITOR', severity: 'ROUTINE', message: 'Continue regular practices.', soilNote: null, cropNote: null };
}

// ============================================================
// PMFBY INSURANCE DEADLINES (Kharif 2026, Maharashtra)
// Source: Ministry of Agriculture, Pradhan Mantri Fasal Bima Yojana
// ============================================================

export const pmfbyDeadlines = {
  soybean:   { crop: 'Soybean',   lastDate: 'July 15', daysFromNow: 15, premium: '2%',   sumInsured: 44000 },
  cotton:    { crop: 'Cotton',    lastDate: 'July 31', daysFromNow: 31, premium: '5%',   sumInsured: 40000 },
  rice:      { crop: 'Rice',      lastDate: 'July 15', daysFromNow: 15, premium: '2%',   sumInsured: 52000 },
  jowar:     { crop: 'Jowar',     lastDate: 'July 31', daysFromNow: 31, premium: '2%',   sumInsured: 28000 },
  tur:       { crop: 'Tur Dal',   lastDate: 'Aug 15',  daysFromNow: 46, premium: '2%',   sumInsured: 36000 },
  bajra:     { crop: 'Bajra',     lastDate: 'July 31', daysFromNow: 31, premium: '2%',   sumInsured: 22000 },
  maize:     { crop: 'Maize',     lastDate: 'July 31', daysFromNow: 31, premium: '2%',   sumInsured: 30000 },
  groundnut: { crop: 'Groundnut', lastDate: 'July 15', daysFromNow: 15, premium: '5%',   sumInsured: 48000 },
};

// ============================================================
// KVK (Krishi Vigyan Kendra) HELPLINE DATA — 15 districts
// Source: ICAR KVK Portal (kvk.icar.gov.in)
// ============================================================

export const kvkDirectory = {
  beed:       { name: 'KVK Beed',       phone: '02442-230242', distance: '12 km', address: 'Kej Road, Beed' },
  latur:      { name: 'KVK Latur',      phone: '02382-250132', distance: '8 km',  address: 'Udgir Road, Latur' },
  solapur:    { name: 'KVK Solapur',    phone: '0217-2744022', distance: '15 km', address: 'Mohol, Solapur' },
  osmanabad:  { name: 'KVK Osmanabad',  phone: '02472-222580', distance: '10 km', address: 'Tuljapur Road' },
  ahmednagar: { name: 'KVK Ahmednagar', phone: '0241-2326523', distance: '18 km', address: 'Rahuri, MPKV Campus' },
  jalna:      { name: 'KVK Jalna',      phone: '02482-220044', distance: '14 km', address: 'Badnapur, Jalna' },
  aurangabad: { name: 'KVK Aurangabad', phone: '0240-2376001', distance: '20 km', address: 'Paithan Road' },
  pune:       { name: 'KVK Pune',       phone: '020-25690041', distance: '25 km', address: 'Mahatma Phule Krishi Vidyapeeth' },
  satara:     { name: 'KVK Satara',     phone: '02162-232046', distance: '12 km', address: 'Koregaon, Satara' },
  kolhapur:   { name: 'KVK Kolhapur',   phone: '0231-2690271', distance: '10 km', address: 'Shivaji University Campus' },
  nashik:     { name: 'KVK Nashik',     phone: '0253-2310025', distance: '16 km', address: 'Niphad, Nashik' },
  nagpur:     { name: 'KVK Nagpur',     phone: '0712-2500067', distance: '22 km', address: 'Dr PDKV Campus, Akola Road' },
  amravati:   { name: 'KVK Amravati',   phone: '0721-2662296', distance: '14 km', address: 'Dhamangaon Road' },
  wardha:     { name: 'KVK Wardha',     phone: '07152-243684', distance: '10 km', address: 'Panjabrao Deshmukh Krishi Vidyapeeth' },
  yavatmal:   { name: 'KVK Yavatmal',   phone: '07232-244530', distance: '16 km', address: 'Waghapur Road' },
};

// ============================================================
// SOWING WINDOW CALCULATOR
// Finds the first safe window based on break risk trajectory
// ============================================================

export function calculateSowingWindow(weeklyForecast, cropId) {
  const crop = availableCrops.find(c => c.id === cropId);
  if (!crop) return null;

  // Threshold depends on drought tolerance
  const riskThreshold = crop.droughtTolerance === 'very_high' ? 60 :
                         crop.droughtTolerance === 'high' ? 50 :
                         crop.droughtTolerance === 'medium' ? 40 : 30;

  // Find first week where break risk drops below threshold
  const today = new Date();
  for (let i = 0; i < weeklyForecast.length; i++) {
    const risk = weeklyForecast[i].probability || weeklyForecast[i].breakRisk || 50;
    if (risk < riskThreshold) {
      const startDate = new Date(today);
      startDate.setDate(startDate.getDate() + (i * 7));
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 6);

      const formatDate = (d) => d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
      return {
        found: true,
        weekNumber: i + 1,
        startDate: formatDate(startDate),
        endDate: formatDate(endDate),
        daysFromNow: i * 7,
        riskAtWindow: risk,
        message: i === 0
          ? 'Safe to sow THIS WEEK'
          : `Wait ${i * 7} days — safe window starts ${formatDate(startDate)}`,
        messageHi: i === 0
          ? 'इस सप्ताह बुआई सुरक्षित है'
          : `${i * 7} दिन रुकें — सुरक्षित समय ${formatDate(startDate)} से`,
      };
    }
  }

  return {
    found: false,
    message: 'No safe sowing window in next 4 weeks. Wait for updated forecast.',
    messageHi: 'अगले 4 सप्ताह में बुआई का सुरक्षित समय नहीं है। अपडेट का इंतज़ार करें।',
  };
}

// ============================================================
// CROP SWITCHING RECOMMENDER
// Suggests alternative crops when current crop is too risky
// ============================================================

export function getAlternativeCrops(currentCropId, stageId, breakRisk, soilType) {
  const alternatives = [];

  for (const crop of availableCrops) {
    if (crop.id === currentCropId) continue;
    if (stageId !== 'pre_sowing') continue; // Only suggest switching before sowing

    const adv = getCropAdvisory(crop.id, 'pre_sowing', breakRisk, soilType, false);

    if (adv.severity !== 'CRITICAL') {
      alternatives.push({
        cropId: crop.id,
        cropName: crop.name,
        droughtTolerance: crop.droughtTolerance,
        waterNeedMm: crop.waterNeedMm,
        action: adv.action,
        severity: adv.severity,
        reason: `${crop.name.split(' (')[0]} needs only ${crop.waterNeedMm}mm (drought: ${crop.droughtTolerance.replace('_',' ')})`,
        reasonHi: `${crop.name.split(' (')[1]?.replace(')','') || crop.name.split(' (')[0]} को सिर्फ ${crop.waterNeedMm}mm पानी चाहिए`,
      });
    }
  }

  // Sort by water need (lowest first = safest)
  alternatives.sort((a, b) => a.waterNeedMm - b.waterNeedMm);
  return alternatives.slice(0, 3); // Top 3
}

export const mockData = {
  districts,
  farmerProfile,
  advisory,
  availableCrops,
  cropStages,
  getCropAdvisory,
  calculateSowingWindow,
  getAlternativeCrops,
  pmfbyDeadlines,
  kvkDirectory,
  climateIndices,
  feedbackHistory,
  officerCalibrations,
  systemHealth,
  weeklyForecastBeed,
  falseOnsetFlag: true,
  forecast: [
    { week: 'Week 1', label: 'Normal Rain', prob: 72, risk: 'green' },
    { week: 'Week 2', label: 'Dry Spell Likely', prob: 68, risk: 'yellow' },
    { week: 'Week 3', label: 'Dry Continues', prob: 55, risk: 'red' },
    { week: 'Week 4', label: 'Revival Expected', prob: 61, risk: 'green' },
  ],
  analogDescription: 'Similar pattern in 2015 led to 14-day mid-July break in Marathwada.',
};

export default mockData;

