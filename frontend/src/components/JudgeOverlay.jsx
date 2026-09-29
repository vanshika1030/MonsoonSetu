import React, { useState, useEffect } from 'react';
import { X, CheckCircle } from 'lucide-react';

export default function JudgeOverlay() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('architecture');

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'J') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 left-4 z-50 bg-gray-800 text-white text-xs px-3 py-1.5 rounded-full shadow-lg hover:bg-gray-700 transition-colors print:hidden flex items-center gap-1"
      >
        <span>🧑‍⚖️</span> Judge Mode
      </button>
    );
  }

  const tabs = [
    { id: 'architecture', label: 'Architecture' },
    { id: 'innovations', label: 'Innovations' },
    { id: 'compliance', label: 'PS Compliance' },
    { id: 'diff', label: 'vs Meghdoot' }
  ];

  return (
    <div className="fixed inset-y-0 right-0 w-96 bg-gray-900/95 text-white z-50 shadow-2xl backdrop-blur-sm transform transition-transform duration-300 ease-in-out print:hidden flex flex-col h-full border-l border-gray-700">
      
      {/* Header */}
      <div className="flex justify-between items-center p-4 border-b border-gray-700">
        <h2 className="text-lg font-bold flex items-center gap-2">
          <span>🧑‍⚖️</span> Judge Mode Overlay
        </h2>
        <button 
          onClick={() => setIsOpen(false)}
          className="p-1 hover:bg-gray-800 rounded-full transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex overflow-x-auto border-b border-gray-700 no-scrollbar">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors ${
              activeTab === tab.id 
                ? 'text-blue-400 border-b-2 border-blue-400' 
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-5 text-sm">
        
        {activeTab === 'architecture' && (
          <div className="space-y-4">
            <h3 className="font-bold text-blue-400 uppercase tracking-wider text-xs">Architecture Details</h3>
            <div className="space-y-3 text-gray-300">
              <p><strong className="text-white">Tech Stack:</strong> React, FastAPI, scikit-learn StackingClassifier, XGBoost, RandomForest, GradientBoosting</p>
              <p><strong className="text-white">Model:</strong> 12 calibrated ensembles (onset/break/heavy × 7/14/21/30d)</p>
              <p><strong className="text-white">Data:</strong> IMD 0.25° gridded 1990-2023 (34 years), ENSO/IOD/MJO indices</p>
              <p><strong className="text-white">Features:</strong> 33 engineered features including DTR humidity proxy (Dai et al., 1999)</p>
              <p><strong className="text-white">Calibration:</strong> Isotonic regression via CalibratedClassifierCV</p>
            </div>
          </div>
        )}

        {activeTab === 'innovations' && (
          <div className="space-y-4">
            <h3 className="font-bold text-blue-400 uppercase tracking-wider text-xs">Innovation List</h3>
            <ul className="space-y-3 text-gray-300">
              <li><strong>🔬 Tier 1 (Novel):</strong> Farmer Feedback Loop, Officer Calibration, Confidence Branching, Trust Card, LLM-for-Tone</li>
              <li><strong>⚙️ Tier 2 (Engineering):</strong> False Onset Detector, Historical Analog Year, Severity Auto-Routing, Daily Cadence</li>
              <li><strong>📱 Tier 3 (UX):</strong> 4-Week Bar Chart, wa.me Share, 1-Liner Explainer, Sarkari Parcha, Farmer-Saathi, Judge Mode</li>
            </ul>
          </div>
        )}

        {activeTab === 'compliance' && (
          <div className="space-y-4">
            <h3 className="font-bold text-blue-400 uppercase tracking-wider text-xs">Problem Statement Compliance</h3>
            <div className="space-y-2 text-gray-300">
              <div className="flex items-start gap-2">
                <CheckCircle size={16} className="text-green-400 mt-0.5 shrink-0" />
                <span>Hybrid ML model (ENSO+IOD+MJO → local predictions)</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle size={16} className="text-green-400 mt-0.5 shrink-0" />
                <span>Color-coded risk maps (Leaflet + CircleMarkers)</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle size={16} className="text-green-400 mt-0.5 shrink-0" />
                <span>1-4 week probabilistic forecast (4-week bar chart)</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle size={16} className="text-green-400 mt-0.5 shrink-0" />
                <span>Crop-specific advisory engine (8 crops × 6 stages × soil)</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle size={16} className="text-green-400 mt-0.5 shrink-0" />
                <span>Mobile web app (React, mobile-first)</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle size={16} className="text-green-400 mt-0.5 shrink-0" />
                <span>WhatsApp delivery (wa.me deep links)</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle size={16} className="text-green-400 mt-0.5 shrink-0" />
                <span>Regional languages (Hindi + Marathi)</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle size={16} className="text-green-400 mt-0.5 shrink-0" />
                <span>Extension officer dashboard</span>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'diff' && (
          <div className="space-y-4">
            <h3 className="font-bold text-blue-400 uppercase tracking-wider text-xs">How We're Different from Meghdoot</h3>
            <ul className="space-y-3 text-gray-300 list-disc pl-4">
              <li><strong>Meghdoot:</strong> 43M farmers, block-level, twice-weekly, ~72hr lag</li>
              <li><strong>MonsoonSetu:</strong> Panchayat-scale, daily, farmer feedback loop, false onset detection</li>
            </ul>
            <div className="mt-6 p-3 bg-blue-900/30 border border-blue-800 rounded-lg text-center text-blue-200 italic font-medium">
              "We don't compete with IMD — we complete IMD"
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
