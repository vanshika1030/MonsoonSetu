import React, { useState } from 'react';
import { AlertTriangle, MapPin, Calendar, CheckCircle2, ShieldAlert } from 'lucide-react';
import { weeklyForecastBeed } from '../data/mockData';

export default function SarkariParcha() {
  const [printDate] = useState(new Date().toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }));

  const handlePrint = () => {
    window.print();
  };

  const alertLevel = 'RED'; // From mock data logic ideally, hardcoding for visual

  return (
    <div className="min-h-screen bg-gray-100 p-8 print:p-0 print:bg-white flex justify-center">
      
      {/* Print Button - Hidden on Print */}
      <div className="fixed top-4 right-4 print:hidden">
        <button 
          onClick={handlePrint}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg shadow-md transition-colors"
        >
          🖨️ Print Parcha
        </button>
      </div>

      {/* A4 Page Container */}
      <div className="bg-white w-[210mm] min-h-[297mm] shadow-2xl print:shadow-none p-8 border border-gray-300 print:border-none relative">
        
        {/* Header Section */}
        <div className="text-center border-b-4 border-black pb-4 mb-6">
          <div className="flex justify-center mb-2">
            {/* Emblem Placeholder */}
            <div className="w-16 h-16 border-2 border-black rounded-full flex items-center justify-center">
              <span className="text-[10px] font-bold text-center leading-tight">GOVT<br/>EMBLEM</span>
            </div>
          </div>
          <h1 className="text-3xl font-black mb-1">मानसून सलागार पत्रक</h1>
          <h2 className="text-xl font-bold text-gray-700">Monsoon Advisory Bulletin</h2>
        </div>

        {/* Location & Date */}
        <div className="flex justify-between items-center mb-6 font-semibold text-lg border-b border-gray-400 pb-2">
          <div className="flex items-center gap-2">
            <MapPin size={20} />
            District: Beed | Block: Shirur Kasar
          </div>
          <div className="flex items-center gap-2">
            <Calendar size={20} />
            Date: {printDate}
          </div>
        </div>

        {/* ALERT STATUS BANNER */}
        <div className="bg-red-600 text-white text-center py-3 font-black text-2xl tracking-wider mb-8 uppercase flex items-center justify-center gap-3">
          <ShieldAlert size={28} />
          ALERT STATUS: {alertLevel}
        </div>

        {/* Advisory Section */}
        <div className="mb-8 bg-gray-50 p-6 border-l-4 border-black">
          <h3 className="text-2xl font-bold mb-3 text-red-700">⚠️ सावधान: अतिवृष्टीचा इशारा</h3>
          <p className="text-xl font-medium mb-4 leading-relaxed">
            पुढील ४८ तासात मुसळधार पावसाची शक्यता आहे. शेतकर्‍यांनी शेतातील पाणी बाहेर काढण्याची व्यवस्था करावी आणि फवारणी टाळावी.
          </p>
          <div className="border-t border-gray-300 pt-3 mt-3">
            <p className="text-gray-800 italic">
              <strong>English Translation:</strong> Heavy rainfall expected in next 48 hours. Ensure field drainage and avoid spraying operations.
            </p>
          </div>
        </div>

        {/* 4-Week Forecast Table */}
        <div className="mb-8">
          <h4 className="font-bold text-lg mb-3">4-Week Outlook</h4>
          <table className="w-full border-collapse border border-black">
            <thead>
              <tr className="bg-gray-200">
                <th className="border border-black p-2 text-left">Week</th>
                <th className="border border-black p-2 text-left">Condition</th>
                <th className="border border-black p-2 text-left">Risk Level</th>
              </tr>
            </thead>
            <tbody>
              {weeklyForecastBeed ? weeklyForecastBeed.map((week, idx) => (
                <tr key={idx}>
                  <td className="border border-black p-2 font-medium">Week {idx + 1}</td>
                  <td className="border border-black p-2">{week.condition || 'Heavy Rain'}</td>
                  <td className="border border-black p-2 font-bold text-red-600">High Risk</td>
                </tr>
              )) : (
                <>
                  <tr>
                    <td className="border border-black p-2">Week 1 (Current)</td>
                    <td className="border border-black p-2">Heavy Rainfall</td>
                    <td className="border border-black p-2 font-bold text-red-600">High</td>
                  </tr>
                  <tr>
                    <td className="border border-black p-2">Week 2</td>
                    <td className="border border-black p-2">Moderate Rain</td>
                    <td className="border border-black p-2 font-bold text-yellow-600">Medium</td>
                  </tr>
                  <tr>
                    <td className="border border-black p-2">Week 3</td>
                    <td className="border border-black p-2">Light Showers</td>
                    <td className="border border-black p-2 font-bold text-green-600">Low</td>
                  </tr>
                  <tr>
                    <td className="border border-black p-2">Week 4</td>
                    <td className="border border-black p-2">Dry Spell</td>
                    <td className="border border-black p-2 font-bold text-green-600">Low</td>
                  </tr>
                </>
              )}
            </tbody>
          </table>
        </div>

        {/* Actionable Advice */}
        <div className="mb-8">
          <h4 className="font-bold text-lg mb-3">Crop-Specific Action (Soybean / Black Cotton Soil)</h4>
          <ul className="list-disc pl-5 space-y-2">
            <li>Ensure proper drainage channels are open.</li>
            <li>Postpone urea application until heavy rains subside.</li>
            <li>Check for stem fly infestation if waterlogging occurs.</li>
          </ul>
        </div>

        {/* Climate Indices */}
        <div className="mb-8 text-sm text-gray-600">
          <strong>Climate Indices:</strong> ONI: +1.2 (El Niño) | DMI: +0.4 (Positive) | MJO: Phase 3
        </div>

        {/* Footer & QR */}
        <div className="absolute bottom-8 left-8 right-8 border-t-2 border-black pt-4 flex justify-between items-end">
          <div className="text-sm">
            <p className="font-bold mb-1">Source: MonsoonSetu | NCMRWF | IMD Gridded Data</p>
            <p className="italic">This is an automated advisory. Consult local KVK for field-specific guidance.</p>
          </div>
          <div className="text-center">
            <div className="w-20 h-20 border-2 border-black border-dashed flex items-center justify-center mb-1">
              <span className="text-[10px] leading-tight">QR CODE<br/>HERE</span>
            </div>
            <span className="text-[10px] font-bold">Scan for daily updates</span>
          </div>
        </div>

      </div>
    </div>
  );
}
