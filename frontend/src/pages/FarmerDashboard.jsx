import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, CloudRain, Sun, Info, ChevronDown, ChevronUp, Share2, Check, X, AlertTriangle, BarChart3, Globe2, Sprout, Layers, Droplets } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { farmerProfile, advisory, climateIndices, weeklyForecastBeed, districts, availableCrops, cropStages, getCropAdvisory } from '../data/mockData';

export default function FarmerDashboard() {
  const [toastVisible, setToastVisible] = useState(false);
  const [indicesExpanded, setIndicesExpanded] = useState(false);
  const [selectedCrop, setSelectedCrop] = useState('soybean');
  const [selectedStage, setSelectedStage] = useState('pre_sowing');

  // Get Beed district data for soil info
  const beed = districts.find(d => d.id === 'beed');
  const falseOnsetFlag = beed?.falseOnsetFlag ?? true;
  const breakRisk = beed?.predictions?.break_14d ?? 82;

  const forecast = [
    { week: 'Week 1', label: 'Normal Rain', prob: weeklyForecastBeed[0].probability, risk: 'green' },
    { week: 'Week 2', label: 'Dry Spell Likely', prob: weeklyForecastBeed[1].probability, risk: 'yellow' },
    { week: 'Week 3', label: 'Dry Continues', prob: weeklyForecastBeed[2].probability, risk: 'red' },
    { week: 'Week 4', label: 'Revival Expected', prob: weeklyForecastBeed[3].probability, risk: 'green' },
  ];

  // Compute crop-specific advisory dynamically
  const cropAdvisory = useMemo(() => {
    return getCropAdvisory(selectedCrop, selectedStage, breakRisk, beed?.soilType, farmerProfile.irrigation);
  }, [selectedCrop, selectedStage, breakRisk]);

  const selectedCropData = availableCrops.find(c => c.id === selectedCrop);

  const handleFeedback = () => {
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 3000);
  };

  const shareText = `*MonsoonSetu Alert — ${farmerProfile.village}, ${farmerProfile.district}*\n\n${advisory.headlineEn}\nCrop: ${selectedCropData?.name || 'Soybean'}\n${cropAdvisory.message}\n\nConfidence: ${advisory.confidence}%\n\nCheck forecast: monsoonsetu.in/saathi/beed`;

  const getColor = (risk) => {
    if (risk === 'red') return '#DC2626';
    if (risk === 'yellow') return '#EAB308';
    return '#16A34A';
  };

  const getSeverityStyle = (severity) => {
    if (severity === 'CRITICAL') return 'border-l-8 border-l-red-600';
    if (severity === 'MODERATE') return 'border-l-8 border-l-yellow-500';
    return 'border-l-8 border-l-green-600';
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans pb-48">
      {/* Header */}
      <header className="bg-blue-600 text-white p-4 flex items-center justify-between shadow-md sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <Link to="/" className="p-1 hover:bg-blue-700 rounded-full transition-colors">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <h1 className="text-xl font-bold">MonsoonSetu</h1>
        </div>
        <div className="text-sm text-right opacity-90">
          <div className="font-semibold">{farmerProfile.name}</div>
          <div className="text-xs">{farmerProfile.village}, {farmerProfile.district}</div>
        </div>
      </header>

      <main className="max-w-lg mx-auto p-4 space-y-5">
        
        {/* Toast */}
        {toastVisible && (
          <div className="fixed top-20 left-1/2 -translate-x-1/2 bg-gray-800 text-white px-4 py-2 rounded-full shadow-lg text-sm z-50 flex items-center gap-2">
            <Check className="w-4 h-4 text-green-400" />
            Thank you! Your feedback helps improve predictions.
          </div>
        )}

        {/* Section 1: Alert Banner */}
        {falseOnsetFlag && (
          <div className="bg-red-100 border-l-4 border-red-600 p-4 rounded-r-xl shadow-sm flex items-start gap-3">
            <AlertTriangle className="w-6 h-6 text-red-600 shrink-0 mt-0.5" />
            <div>
              <h2 className="text-red-800 font-bold text-lg leading-tight">⚠️ FALSE ONSET DETECTED</h2>
              <p className="text-red-700 font-medium mt-1">Do Not Sow — Rain is temporary</p>
            </div>
          </div>
        )}

        {/* Crop & Stage Selector */}
        <section className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
            <Sprout className="w-4 h-4 text-green-600" /> Your Crop & Stage
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-500 font-medium mb-1 block">Crop</label>
              <select 
                value={selectedCrop} 
                onChange={(e) => setSelectedCrop(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {availableCrops.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500 font-medium mb-1 block">Stage</label>
              <select 
                value={selectedStage} 
                onChange={(e) => setSelectedStage(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {cropStages.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
          </div>
          {selectedCropData && (
            <div className="mt-3 flex items-center gap-3 text-xs text-gray-500">
              <span className={`px-2 py-0.5 rounded-full font-medium ${
                selectedCropData.droughtTolerance === 'very_high' || selectedCropData.droughtTolerance === 'high' ? 'bg-green-100 text-green-700' :
                selectedCropData.droughtTolerance === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                'bg-red-100 text-red-700'
              }`}>
                Drought: {selectedCropData.droughtTolerance.replace('_', ' ')}
              </span>
              <span className="flex items-center gap-1">
                <Droplets className="w-3 h-3" /> {selectedCropData.waterNeedMm}mm/season
              </span>
            </div>
          )}
        </section>

        {/* Section 2: 4-Week Forecast Bar Chart */}
        <section className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-500" />
            Next 4 Weeks — Your Forecast
          </h2>
          <div className="h-48 w-full mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={forecast} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="week" tick={{ fontSize: 12, fill: '#6B7280' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#6B7280' }} axisLine={false} tickLine={false} domain={[0, 100]} />
                <Tooltip cursor={{ fill: '#F3F4F6' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="prob" name="Break Risk %" radius={[6, 6, 0, 0]}>
                  {forecast.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getColor(entry.risk)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-between mt-2 px-2 text-xs text-gray-500 font-medium">
            {forecast.map((w, i) => (
              <div key={i} className="flex flex-col items-center gap-1 w-1/4">
                {w.risk === 'green' ? <CloudRain className="w-5 h-5 text-blue-500" /> : <Sun className="w-5 h-5 text-yellow-500" />}
                <span className="text-center leading-tight">{w.label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Section 3: Crop-Specific Advisory Card */}
        <section className={`bg-white p-5 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden ${getSeverityStyle(cropAdvisory.severity)}`}>
          <div className="flex items-center gap-2 mb-2">
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
              cropAdvisory.severity === 'CRITICAL' ? 'bg-red-100 text-red-700' :
              cropAdvisory.severity === 'MODERATE' ? 'bg-yellow-100 text-yellow-700' :
              'bg-green-100 text-green-700'
            }`}>
              {cropAdvisory.action.replace(/_/g, ' ')}
            </span>
            <span className="text-xs text-gray-400">for {selectedCropData?.name?.split(' (')[0]} · {cropStages.find(s => s.id === selectedStage)?.name?.split(' (')[0]}</span>
          </div>
          
          <p className="text-base font-bold text-gray-900 mb-3 leading-snug">{cropAdvisory.message}</p>
          
          {/* Soil-specific note */}
          {cropAdvisory.soilNote && (
            <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 flex gap-3 mb-3">
              <Layers className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <p className="text-sm text-amber-800 leading-snug">{cropAdvisory.soilNote}</p>
            </div>
          )}

          {/* Crop detail note */}
          {cropAdvisory.cropNote && (
            <p className="text-xs text-gray-500 mb-3 bg-gray-50 px-3 py-2 rounded-lg">{cropAdvisory.cropNote}</p>
          )}

          {/* Weather explainer */}
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 flex gap-3 mb-3">
            <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <p className="text-sm text-blue-800 leading-snug">{advisory.explanation}</p>
          </div>

          <div className="flex items-center gap-3 text-sm font-medium text-gray-700">
            <span>Confidence: {advisory.confidence}%</span>
            <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-blue-600 rounded-full" style={{ width: `${advisory.confidence}%` }}></div>
            </div>
          </div>
        </section>

        {/* Soil Info Card */}
        {beed && (
          <section className="bg-amber-50 p-4 rounded-xl text-sm border border-amber-100">
            <div className="font-bold text-amber-900 mb-1 flex items-center gap-2">
              <Layers className="w-4 h-4" /> Your Soil: {beed.soilType}
            </div>
            <p className="text-amber-800 text-xs mb-1">{beed.soilDescription}</p>
            <p className="text-amber-700 text-xs font-medium">{beed.soilAdvisoryImpact}</p>
            <p className="text-[10px] text-amber-500 mt-2 italic">Source: NBSS&LUP Maharashtra Soil Survey · Block-level mapping</p>
          </section>
        )}

        {/* Section 4: Historical Context */}
        <section className="bg-gray-100 p-4 rounded-xl text-sm border border-gray-200">
          <div className="font-bold text-gray-800 mb-1 flex items-center gap-2">
            <span>📊</span> This year's pattern resembles {advisory.analogYear}
          </div>
          <p className="text-gray-600 mb-2">{advisory.analogDescription}</p>
          <p className="text-xs text-gray-400 italic">Supporting context — not a prediction</p>
        </section>

        {/* Climate Indices (Collapsible) */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <button 
            onClick={() => setIndicesExpanded(!indicesExpanded)}
            className="w-full p-4 flex items-center justify-between text-left font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <span className="flex items-center gap-2"><Globe2 className="w-5 h-5 text-gray-400"/> Climate Indices (Advanced)</span>
            {indicesExpanded ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
          </button>
          
          {indicesExpanded && (
            <div className="p-4 pt-0 border-t border-gray-100 grid grid-cols-3 gap-3">
              <div className="bg-gray-50 p-3 rounded-lg text-center border border-gray-100">
                <div className="text-xs text-gray-500 font-medium mb-1">ONI</div>
                <div className="font-bold text-gray-800">{climateIndices.ONI.value}</div>
                <div className="text-xs text-blue-600 mt-1">{climateIndices.ONI.status}</div>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg text-center border border-gray-100">
                <div className="text-xs text-gray-500 font-medium mb-1">DMI</div>
                <div className="font-bold text-gray-800">{climateIndices.DMI.value}</div>
                <div className="text-xs text-green-600 mt-1">{climateIndices.DMI.status}</div>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg text-center border border-gray-100">
                <div className="text-xs text-gray-500 font-medium mb-1">MJO</div>
                <div className="font-bold text-gray-800 text-sm truncate">{climateIndices.MJO.value}</div>
                <div className="text-xs text-gray-600 mt-1">{climateIndices.MJO.status}</div>
              </div>
            </div>
          )}
        </section>
      </main>

      {/* Sticky Bottom: Feedback + Share */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-20">
        <div className="max-w-lg mx-auto">
          <p className="text-center text-sm font-semibold text-gray-600 mb-3">Did it rain in your field today?</p>
          <div className="flex gap-3 mb-3">
            <button 
              onClick={handleFeedback}
              className="flex-1 bg-green-100 text-green-700 py-3 rounded-xl font-bold flex items-center justify-center gap-2 border border-green-200 active:scale-95 transition-transform"
            >
              <Check className="w-5 h-5" /> Yes
            </button>
            <button 
              onClick={handleFeedback}
              className="flex-1 bg-red-100 text-red-700 py-3 rounded-xl font-bold flex items-center justify-center gap-2 border border-red-200 active:scale-95 transition-transform"
            >
              <X className="w-5 h-5" /> No
            </button>
          </div>
          <a 
            href={`https://wa.me/?text=${encodeURIComponent(shareText)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-sm hover:bg-blue-700 active:scale-95 transition-all"
          >
            <Share2 className="w-5 h-5" /> Share on WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}
