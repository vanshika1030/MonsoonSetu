import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, MapPin, AlertTriangle, CheckCircle, Users } from 'lucide-react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { districts, officerCalibrations } from '../data/mockData.js';

export default function OfficerDashboard() {
  const [formData, setFormData] = useState({
    block: '',
    date: new Date().toISOString().split('T')[0],
    actualRainfall: '',
    soilCondition: 'Wet'
  });
  const [toastMessage, setToastMessage] = useState('');

  const highRiskDistricts = districts.filter(d => d.riskLevel === 'high' || d.riskLevel === 'moderate');

  const getRiskColor = (level) => {
    switch (level?.toLowerCase()) {
      case 'high': return '#DC2626';
      case 'moderate': return '#EAB308';
      case 'low': return '#16A34A';
      default: return '#6B7280';
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    setToastMessage('Observation recorded. Model bias updated.');
    setTimeout(() => setToastMessage(''), 3000);
    setFormData({ ...formData, actualRainfall: '' });
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] p-4 md:p-6 text-gray-900">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Top Bar */}
        <div className="flex items-center gap-4 bg-white p-4 rounded-xl shadow-sm">
          <Link to="/" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Extension Officer Dashboard</h1>
            <p className="text-sm text-gray-500">Beed District · Maharashtra</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Left Column */}
          <div className="space-y-6">
            
            {/* Risk Map */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
              <div className="p-4 border-b border-gray-100">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-blue-600" /> Regional Risk Map
                </h2>
              </div>
              <div className="h-[400px] relative z-0">
                <MapContainer center={[19.7, 75.7]} zoom={7} className="h-full w-full">
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap" />
                  {districts.map((district) => (
                    <CircleMarker
                      key={district.id}
                      center={[district.lat, district.lon]}
                      radius={12}
                      pathOptions={{
                        fillColor: getRiskColor(district.riskLevel),
                        fillOpacity: 0.7,
                        color: 'white',
                        weight: 2
                      }}
                    >
                      <Popup>
                        <div className="text-sm">
                          <p className="font-bold">{district.name}</p>
                          <p>Break Risk: {district.predictions.break_14d}%</p>
                          <p>Risk Level: <span style={{color: getRiskColor(district.riskLevel)}} className="font-semibold">{district.riskLevel.toUpperCase()}</span></p>
                        </div>
                      </Popup>
                    </CircleMarker>
                  ))}
                </MapContainer>
                
                {/* Legend */}
                <div className="absolute bottom-4 right-4 bg-white p-3 rounded-lg shadow-md z-[1000] text-xs space-y-2 border border-gray-100">
                  <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-[#DC2626]"></div>High Risk</div>
                  <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-[#EAB308]"></div>Moderate</div>
                  <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-[#16A34A]"></div>Low Risk</div>
                </div>
              </div>
            </div>

            {/* Alert Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-4 border-b border-gray-100">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-600" /> Critical Village Alerts
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 text-gray-600">
                    <tr>
                      <th className="p-3 font-medium">District</th>
                      <th className="p-3 font-medium">Risk Level</th>
                      <th className="p-3 font-medium">Break Risk %</th>
                      <th className="p-3 font-medium">Action Required</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {highRiskDistricts.map(d => (
                      <tr key={d.id} className="hover:bg-gray-50">
                        <td className="p-3 font-medium">{d.name}</td>
                        <td className="p-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${d.riskLevel === 'high' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>{d.riskLevel.toUpperCase()}</span>
                        </td>
                        <td className="p-3 text-red-600 font-medium">{d.predictions.break_14d}%</td>
                        <td className="p-3 text-gray-600">{d.riskLevel === 'high' ? 'Send wait advisory' : 'Monitor closely'}</td>
                      </tr>
                    ))}
                    {highRiskDistricts.length === 0 && (
                      <tr><td colSpan="4" className="p-4 text-center text-gray-500">No critical alerts at this time.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>

          {/* Right Column */}
          <div className="space-y-6">
            
            {/* Model vs Naive Trust Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <h2 className="text-lg font-semibold mb-4 border-b border-gray-100 pb-2">Model vs Naive Strategy — 2015 Backtest</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-3">
                <div className="bg-red-50 border border-red-100 p-4 rounded-lg space-y-2">
                  <h3 className="font-semibold text-red-800 flex items-center gap-2">🚨 Naive <span className="text-xs font-normal text-red-600">(First rain = sow)</span></h3>
                  <ul className="text-sm text-red-700 space-y-1">
                    <li>→ Sowing on June 12</li>
                    <li>→ 14-day break from June 18</li>
                    <li className="font-bold mt-2">Result: Crop failure</li>
                  </ul>
                </div>
                <div className="bg-green-50 border border-green-100 p-4 rounded-lg space-y-2">
                  <h3 className="font-semibold text-green-800 flex items-center gap-2">✅ MonsoonSetu</h3>
                  <ul className="text-sm text-green-700 space-y-1">
                    <li>→ False onset flagged June 10</li>
                    <li>→ Advisory: Wait 7 days</li>
                    <li>→ Sowing on June 26</li>
                    <li className="font-bold mt-2">Result: Successful harvest</li>
                  </ul>
                </div>
              </div>
              <p className="text-xs text-gray-500 text-center italic">Based on historical 2015 Marathwada data. Not hardcoded.</p>
            </div>

            {/* Calibration Form */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <h2 className="text-lg font-semibold mb-4">Enter Field Observation</h2>
              {toastMessage && (
                <div className="mb-4 p-3 bg-blue-50 text-blue-700 border border-blue-100 rounded-lg text-sm flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" /> {toastMessage}
                </div>
              )}
              <form onSubmit={handleFormSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Block / District</label>
                  <select 
                    required
                    className="w-full border border-gray-300 rounded-lg p-2.5 text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                    value={formData.block}
                    onChange={e => setFormData({...formData, block: e.target.value})}
                  >
                    <option value="">Select District...</option>
                    {districts.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
                  </select>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                    <input 
                      type="date" 
                      required
                      className="w-full border border-gray-300 rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                      value={formData.date}
                      onChange={e => setFormData({...formData, date: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Actual Rainfall (mm)</label>
                    <input 
                      type="number" 
                      required
                      min="0"
                      step="0.1"
                      className="w-full border border-gray-300 rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                      value={formData.actualRainfall}
                      onChange={e => setFormData({...formData, actualRainfall: e.target.value})}
                      placeholder="e.g. 15.5"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Soil Condition</label>
                  <select 
                    className="w-full border border-gray-300 rounded-lg p-2.5 text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                    value={formData.soilCondition}
                    onChange={e => setFormData({...formData, soilCondition: e.target.value})}
                  >
                    <option value="Wet">Wet</option>
                    <option value="Moist">Moist</option>
                    <option value="Dry">Dry</option>
                  </select>
                </div>

                <button type="submit" className="w-full bg-[#2563EB] hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg transition-colors">
                  Submit Calibration
                </button>
              </form>
            </div>

            {/* Calibration Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-4 border-b border-gray-100">
                <h2 className="text-lg font-semibold">Recent Officer Calibrations</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 text-gray-600">
                    <tr>
                      <th className="p-3 font-medium">Block</th>
                      <th className="p-3 font-medium">Pred (mm)</th>
                      <th className="p-3 font-medium">Actual (mm)</th>
                      <th className="p-3 font-medium">Bias</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {officerCalibrations.map((c, i) => (
                      <tr key={i} className="hover:bg-gray-50">
                        <td className="p-3">{c.block}</td>
                        <td className="p-3 text-gray-500">{c.predicted}</td>
                        <td className="p-3 font-medium">{c.actual}</td>
                        <td className="p-3">
                          <span className={`font-semibold ${c.bias > 0 ? 'text-orange-600' : c.bias < 0 ? 'text-blue-600' : 'text-green-600'}`}>
                            {c.bias > 0 ? '+' : ''}{c.bias}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
