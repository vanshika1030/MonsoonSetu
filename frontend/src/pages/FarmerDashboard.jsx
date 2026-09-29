import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, CloudRain, Sun, Info, ChevronDown, ChevronUp, Share2, Check, X, AlertTriangle, BarChart3, Globe2, Sprout, Layers, Droplets, Volume2, VolumeX, Languages } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { farmerProfile, advisory, climateIndices, weeklyForecastBeed, districts, availableCrops, cropStages, getCropAdvisory } from '../data/mockData';
import VoiceButton from '../components/VoiceButton';
import { useVoice } from '../hooks/useVoice';
import AdvisoryComparison from '../components/AdvisoryComparison';
import FalseOnsetTimeline from '../components/FalseOnsetTimeline';

// Bilingual text
const i18n = {
  en: {
    falseOnset: 'FALSE ONSET DETECTED',
    falseOnsetSub: 'Do Not Sow — Rain is temporary',
    yourCrop: 'Your Crop & Stage',
    crop: 'Crop',
    stage: 'Stage',
    drought: 'Drought',
    forecast: 'Next 4 Weeks',
    advisory: 'What should you do?',
    confidence: 'Confidence',
    soilTitle: 'Your Soil',
    soilSource: 'Source: NBSS&LUP Soil Survey',
    history: "Similar year",
    historyNote: 'Supporting context — not a prediction',
    climate: 'Climate Indices',
    feedback: 'Did it rain in your field today?',
    yes: 'Yes, it rained',
    no: 'No rain',
    share: 'Share on WhatsApp',
    irrigationCompare: 'If you had irrigation...',
    falseOnsetStory: 'Why we warn about false onset',
  },
  hi: {
    falseOnset: 'झूठी शुरुआत पकड़ी गई',
    falseOnsetSub: 'बुआई न करें — बारिश अस्थायी है',
    yourCrop: 'आपकी फसल और चरण',
    crop: 'फसल',
    stage: 'चरण',
    drought: 'सूखा सहनशीलता',
    forecast: 'अगले 4 सप्ताह',
    advisory: 'आपको क्या करना चाहिए?',
    confidence: 'भरोसा',
    soilTitle: 'आपकी मिट्टी',
    soilSource: 'स्रोत: NBSS&LUP मिट्टी सर्वेक्षण',
    history: 'मिलता-जुलता साल',
    historyNote: 'सहायक जानकारी — भविष्यवाणी नहीं',
    climate: 'जलवायु सूचकांक',
    feedback: 'आज आपके खेत में बारिश हुई?',
    yes: 'हाँ, बारिश हुई',
    no: 'नहीं हुई',
    share: 'WhatsApp पर भेजें',
    irrigationCompare: 'अगर आपके पास सिंचाई होती...',
    falseOnsetStory: 'हम झूठी शुरुआत की चेतावनी क्यों देते हैं',
  }
};

export default function FarmerDashboard() {
  const [toastVisible, setToastVisible] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const [selectedCrop, setSelectedCrop] = useState('soybean');
  const [selectedStage, setSelectedStage] = useState('pre_sowing');
  const [lang, setLang] = useState('hi');

  const { speakAdvisory, isSpeaking, stopSpeaking } = useVoice();
  const t = i18n[lang];

  const beed = districts.find(d => d.id === 'beed');
  const falseOnsetFlag = beed?.falseOnsetFlag ?? true;
  const breakRisk = beed?.predictions?.break_14d ?? 82;

  const forecast = [
    { week: lang === 'hi' ? 'सप्ताह 1' : 'Week 1', label: lang === 'hi' ? 'सामान्य बारिश' : 'Normal Rain', prob: weeklyForecastBeed[0].probability, risk: 'green' },
    { week: lang === 'hi' ? 'सप्ताह 2' : 'Week 2', label: lang === 'hi' ? 'सूखे की संभावना' : 'Dry Spell', prob: weeklyForecastBeed[1].probability, risk: 'yellow' },
    { week: lang === 'hi' ? 'सप्ताह 3' : 'Week 3', label: lang === 'hi' ? 'सूखा जारी' : 'Dry Continues', prob: weeklyForecastBeed[2].probability, risk: 'red' },
    { week: lang === 'hi' ? 'सप्ताह 4' : 'Week 4', label: lang === 'hi' ? 'बारिश लौटेगी' : 'Revival', prob: weeklyForecastBeed[3].probability, risk: 'green' },
  ];

  const cropAdvisory = useMemo(() => {
    return getCropAdvisory(selectedCrop, selectedStage, breakRisk, beed?.soilType, farmerProfile.irrigation);
  }, [selectedCrop, selectedStage, breakRisk]);

  const selectedCropData = availableCrops.find(c => c.id === selectedCrop);

  const handleFeedback = () => {
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 3000);
  };

  const shareText = `*MonsoonSetu — ${farmerProfile.village}, ${farmerProfile.district}*\n\n${advisory.headlineEn}\nCrop: ${selectedCropData?.name || 'Soybean'}\n${cropAdvisory.message}\n\nConfidence: ${advisory.confidence}%`;

  const getColor = (risk) => {
    if (risk === 'red') return '#DC2626';
    if (risk === 'yellow') return '#EAB308';
    return '#16A34A';
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans pb-44">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 flex items-center justify-between shadow-lg sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <Link to="/" className="p-1.5 hover:bg-white/10 rounded-full transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-lg font-bold leading-tight">MonsoonSetu</h1>
            <p className="text-[10px] text-blue-200">मानसून-सेतु</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setLang(lang === 'en' ? 'hi' : 'en')}
            className="px-2 py-1 bg-white/15 rounded-lg text-xs font-bold hover:bg-white/25 transition-colors flex items-center gap-1"
          >
            <Languages className="w-3.5 h-3.5" />
            {lang === 'en' ? 'हिंदी' : 'ENG'}
          </button>
          <div className="text-right text-xs">
            <div className="font-semibold">{farmerProfile.name}</div>
            <div className="text-blue-200 text-[10px]">{farmerProfile.village}, {farmerProfile.district}</div>
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto p-4 space-y-4">
        
        {/* Toast */}
        {toastVisible && (
          <div className="fixed top-20 left-1/2 -translate-x-1/2 bg-gray-800 text-white px-4 py-2 rounded-full shadow-lg text-sm z-50 flex items-center gap-2">
            <Check className="w-4 h-4 text-green-400" />
            {lang === 'hi' ? 'धन्यवाद! आपकी प्रतिक्रिया से पूर्वानुमान बेहतर होता है।' : 'Thank you! Your feedback improves predictions.'}
          </div>
        )}

        {/* 1. ALERT BANNER — Big, impossible to miss */}
        {falseOnsetFlag && (
          <div className="bg-gradient-to-r from-red-600 to-red-700 text-white p-5 rounded-2xl shadow-lg flex items-start gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
              <AlertTriangle className="w-7 h-7" />
            </div>
            <div>
              <h2 className="font-extrabold text-lg leading-tight">{t.falseOnset}</h2>
              <p className="text-red-100 text-sm mt-1 font-medium">{t.falseOnsetSub}</p>
            </div>
          </div>
        )}

        {/* 2. CROP SELECTOR — Simple, clean */}
        <section className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
            <Sprout className="w-4 h-4 text-green-600" /> {t.yourCrop}
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide mb-1 block">{t.crop}</label>
              <select 
                value={selectedCrop} 
                onChange={(e) => setSelectedCrop(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {availableCrops.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide mb-1 block">{t.stage}</label>
              <select 
                value={selectedStage} 
                onChange={(e) => setSelectedStage(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {cropStages.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
          </div>
          {selectedCropData && (
            <div className="mt-2.5 flex items-center gap-2 text-[11px] text-gray-500">
              <span className={`px-2 py-0.5 rounded-full font-semibold ${
                selectedCropData.droughtTolerance === 'very_high' || selectedCropData.droughtTolerance === 'high' ? 'bg-green-100 text-green-700' :
                selectedCropData.droughtTolerance === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                'bg-red-100 text-red-700'
              }`}>
                {t.drought}: {selectedCropData.droughtTolerance.replace('_', ' ')}
              </span>
              <span className="flex items-center gap-1">
                <Droplets className="w-3 h-3" /> {selectedCropData.waterNeedMm}mm
              </span>
            </div>
          )}
        </section>

        {/* 3. MAIN ADVISORY — The hero card */}
        <section className={`p-5 rounded-2xl shadow-sm border relative overflow-hidden ${
          cropAdvisory.severity === 'CRITICAL' ? 'bg-red-50 border-red-200' :
          cropAdvisory.severity === 'MODERATE' ? 'bg-amber-50 border-amber-200' :
          'bg-green-50 border-green-200'
        }`}>
          {/* Severity badge */}
          <div className="flex items-center justify-between mb-3">
            <span className={`text-xs font-extrabold px-3 py-1 rounded-full ${
              cropAdvisory.severity === 'CRITICAL' ? 'bg-red-600 text-white' :
              cropAdvisory.severity === 'MODERATE' ? 'bg-amber-500 text-white' :
              'bg-green-600 text-white'
            }`}>
              {cropAdvisory.action.replace(/_/g, ' ')}
            </span>
            <button 
              onClick={() => isSpeaking ? stopSpeaking() : speakAdvisory(cropAdvisory.message)}
              className={`p-2 rounded-full transition-colors ${
                isSpeaking ? 'bg-blue-600 text-white' : 'bg-white/80 text-gray-600 hover:bg-white'
              }`}
              aria-label="Read aloud"
            >
              {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
          </div>

          {/* Main message — BIG and clear */}
          <h3 className="text-lg font-extrabold text-gray-900 leading-snug mb-3">
            {cropAdvisory.message}
          </h3>
          
          {/* Crop + stage context */}
          <p className="text-xs text-gray-500 mb-3">
            {t.advisory} · {selectedCropData?.name?.split(' (')[0]} · {cropStages.find(s => s.id === selectedStage)?.name?.split(' (')[0]}
          </p>

          {/* Soil warning if applicable */}
          {cropAdvisory.soilNote && (
            <div className="bg-white/70 rounded-xl p-3 flex gap-2.5 mb-3 border border-amber-200/50">
              <Layers className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-800 leading-relaxed">{cropAdvisory.soilNote}</p>
            </div>
          )}

          {/* Confidence bar */}
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <span className="font-semibold">{t.confidence}: {advisory.confidence}%</span>
            <div className="flex-1 h-1.5 bg-white/60 rounded-full overflow-hidden">
              <div className="h-full bg-blue-600 rounded-full transition-all" style={{ width: `${advisory.confidence}%` }}></div>
            </div>
          </div>
        </section>

        {/* 4. FORECAST CHART */}
        <section className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-blue-500" /> {t.forecast}
          </h2>
          <div className="h-40 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={forecast} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                <XAxis dataKey="week" tick={{ fontSize: 11, fill: '#6B7280' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} domain={[0, 100]} />
                <Tooltip contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 4px 12px rgb(0 0 0 / 0.1)', fontSize: '12px' }} />
                <Bar dataKey="prob" name="%" radius={[8, 8, 0, 0]}>
                  {forecast.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getColor(entry.risk)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-between mt-1 px-1 text-[10px] text-gray-500 font-medium">
            {forecast.map((w, i) => (
              <div key={i} className="flex flex-col items-center gap-0.5 w-1/4">
                {w.risk === 'green' ? <CloudRain className="w-4 h-4 text-blue-400" /> : <Sun className="w-4 h-4 text-yellow-500" />}
                <span className="text-center leading-tight">{w.label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* 5. IRRIGATION COMPARISON — WOW feature */}
        <AdvisoryComparison
          cropId={selectedCrop}
          stageId={selectedStage}
          breakRisk={breakRisk}
          soilType={beed?.soilType}
        />

        {/* 6. Show More / Advanced sections */}
        <button
          onClick={() => setShowMore(!showMore)}
          className="w-full py-3 text-sm font-semibold text-blue-600 bg-blue-50 rounded-xl border border-blue-100 flex items-center justify-center gap-2 hover:bg-blue-100 transition-colors"
        >
          {showMore ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          {showMore ? (lang === 'hi' ? 'कम दिखाएँ' : 'Show Less') : (lang === 'hi' ? 'और जानकारी देखें' : 'See More Details')}
        </button>

        {showMore && (
          <div className="space-y-4">
            {/* False Onset Timeline */}
            {falseOnsetFlag && <FalseOnsetTimeline />}

            {/* Soil Info */}
            {beed && (
              <section className="bg-amber-50 p-4 rounded-xl text-sm border border-amber-100">
                <div className="font-bold text-amber-900 mb-1 flex items-center gap-2">
                  <Layers className="w-4 h-4" /> {t.soilTitle}: {beed.soilType}
                </div>
                <p className="text-amber-800 text-xs mb-1">{beed.soilDescription}</p>
                <p className="text-amber-700 text-xs font-medium">{beed.soilAdvisoryImpact}</p>
                <p className="text-[10px] text-amber-500 mt-2 italic">{t.soilSource}</p>
              </section>
            )}

            {/* Historical Analog */}
            <section className="bg-gray-50 p-4 rounded-xl text-sm border border-gray-200">
              <div className="font-bold text-gray-700 mb-1 flex items-center gap-2">
                📊 {t.history}: {advisory.analogYear}
              </div>
              <p className="text-gray-600 text-xs mb-1">{advisory.analogDescription}</p>
              <p className="text-[10px] text-gray-400 italic">{t.historyNote}</p>
            </section>

            {/* Climate Indices */}
            <section className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
              <h3 className="text-xs font-bold text-gray-600 mb-3 flex items-center gap-2">
                <Globe2 className="w-4 h-4 text-gray-400" /> {t.climate}
              </h3>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: 'ENSO', value: climateIndices.ONI.value, status: climateIndices.ONI.status, color: 'text-blue-600' },
                  { label: 'IOD', value: climateIndices.DMI.value, status: climateIndices.DMI.status, color: 'text-green-600' },
                  { label: 'MJO', value: climateIndices.MJO.value, status: climateIndices.MJO.status, color: 'text-purple-600' },
                ].map(idx => (
                  <div key={idx.label} className="bg-gray-50 p-2.5 rounded-lg text-center border border-gray-100">
                    <div className="text-[10px] text-gray-400 font-semibold uppercase">{idx.label}</div>
                    <div className="font-bold text-gray-800 text-sm">{idx.value}</div>
                    <div className={`text-[10px] ${idx.color} font-medium mt-0.5 truncate`}>{idx.status}</div>
                  </div>
                ))}
              </div>
            </section>

            {/* Crop detail */}
            {cropAdvisory.cropNote && (
              <p className="text-xs text-gray-500 bg-gray-50 px-4 py-3 rounded-xl border border-gray-100">
                <Info className="w-3.5 h-3.5 inline mr-1.5 text-gray-400" />
                {cropAdvisory.cropNote}
              </p>
            )}
          </div>
        )}
      </main>

      {/* Sticky Bottom: Feedback + Share */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-gray-200 p-3 shadow-[0_-4px_16px_rgba(0,0,0,0.06)] z-20">
        <div className="max-w-lg mx-auto">
          <p className="text-center text-xs font-semibold text-gray-500 mb-2">{t.feedback}</p>
          <div className="flex gap-2 mb-2">
            <button 
              onClick={handleFeedback}
              className="flex-1 bg-green-50 text-green-700 py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 border border-green-200 active:scale-95 transition-transform"
            >
              <Check className="w-4 h-4" /> {t.yes}
            </button>
            <button 
              onClick={handleFeedback}
              className="flex-1 bg-red-50 text-red-700 py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 border border-red-200 active:scale-95 transition-transform"
            >
              <X className="w-4 h-4" /> {t.no}
            </button>
          </div>
          <a 
            href={`https://wa.me/?text=${encodeURIComponent(shareText)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full bg-green-600 text-white py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-green-700 active:scale-95 transition-all"
          >
            <Share2 className="w-4 h-4" /> {t.share}
          </a>
        </div>
      </div>

      <VoiceButton 
        onCropDetected={setSelectedCrop}
        onStageDetected={setSelectedStage}
        onFeedback={handleFeedback}
        advisoryText={cropAdvisory.message}
        lang={lang}
      />
    </div>
  );
}
