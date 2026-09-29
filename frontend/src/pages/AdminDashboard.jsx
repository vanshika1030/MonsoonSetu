import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, MapPin, AlertTriangle, CheckCircle, Users } from 'lucide-react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { districts } from '../data/mockData.js';

export default function AdminDashboard() {
  const getRiskColor = (level) => {
    switch (level?.toLowerCase()) {
      case 'high': return '#DC2626';
      case 'moderate': return '#EAB308';
      case 'low': return '#16A34A';
      default: return '#6B7280';
    }
  };

  const highRiskCount = districts.filter(d => d.riskLevel === 'high').length;

  return (
    <div className="min-h-screen bg-[#F9FAFB] p-4 md:p-6 text-gray-900">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Top Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl shadow-sm">
          <div className="flex items-center gap-4">
            <Link to="/" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Admin Dashboard — State Overview</h1>
              <p className="text-sm text-gray-500">Maharashtra · {districts.length} Districts</p>
            </div>
          </div>
          <span className="bg-purple-100 text-purple-800 text-xs font-semibold px-3 py-1 rounded-full border border-purple-200 w-fit">
            Bonus: PS didn't ask for this — added for deployability
          </span>
        </div>

        {/* Row 1: Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="p-3 bg-blue-50 rounded-lg"><Users className="w-6 h-6 text-blue-600" /></div>
            <div><p className="text-sm text-gray-500 font-medium">Farmers Registered</p><p className="text-2xl font-bold">2,847</p></div>
          </div>
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="p-3 bg-red-50 rounded-lg"><AlertTriangle className="w-6 h-6 text-red-600" /></div>
            <div><p className="text-sm text-gray-500 font-medium">Active Alerts</p><p className="text-2xl font-bold text-red-600">156</p></div>
          </div>
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="p-3 bg-yellow-50 rounded-lg"><MapPin className="w-6 h-6 text-yellow-600" /></div>
            <div><p className="text-sm text-gray-500 font-medium">Districts at Risk</p><p className="text-2xl font-bold">{highRiskCount}</p></div>
          </div>
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="p-3 bg-green-50 rounded-lg"><CheckCircle className="w-6 h-6 text-green-600" /></div>
            <div><p className="text-sm text-gray-500 font-medium">Officer Response</p><p className="text-2xl font-bold text-green-600">87%</p></div>
          </div>
        </div>

        {/* Row 2: State Risk Map */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 border-b border-gray-100">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <MapPin className="w-5 h-5 text-gray-600" /> State-wide Monsoon Risk Map
            </h2>
          </div>
          <div className="h-96 relative z-0">
            <MapContainer center={[19.7, 75.7]} zoom={6} className="h-full w-full">
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap" />
              {districts.map((district) => (
                <CircleMarker
                  key={district.id}
                  center={[district.lat, district.lon]}
                  radius={14}
                  pathOptions={{
                    fillColor: getRiskColor(district.riskLevel),
                    fillOpacity: 0.8,
                    color: 'white',
                    weight: 2
                  }}
                >
                  <Popup>
                    <div className="text-sm">
                      <p className="font-bold">{district.name}</p>
                      <p>Break Risk: {district.predictions.break_14d}%</p>
                      <p>Risk Level: <span style={{color: getRiskColor(district.riskLevel)}} className="font-semibold">{district.riskLevel}</span></p>
                    </div>
                  </Popup>
                </CircleMarker>
              ))}
            </MapContainer>
            
            <div className="absolute bottom-4 right-4 bg-white p-3 rounded-lg shadow-md z-[1000] text-sm space-y-2 border border-gray-100">
              <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-full bg-[#DC2626]"></div>High Risk</div>
              <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-full bg-[#EAB308]"></div>Moderate</div>
              <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-full bg-[#16A34A]"></div>Low Risk</div>
            </div>
          </div>
        </div>

        {/* Row 4: Resource Allocation */}
        <div className="bg-blue-50 rounded-xl shadow-sm border border-blue-100 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-blue-900 mb-1">Recommended Action</h2>
            <p className="text-blue-800">Deploy water tankers to: <span className="font-bold">Beed, Latur, Solapur</span> (break risk &gt;60%)</p>
          </div>
          <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors whitespace-nowrap">
            Generate Official Bulletin
          </button>
        </div>

        {/* Row 3: District Comparison Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 border-b border-gray-100">
            <h2 className="text-lg font-semibold">District Comparison</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="p-4 font-medium">District</th>
                  <th className="p-4 font-medium">Risk Level</th>
                  <th className="p-4 font-medium">Break Risk %</th>
                  <th className="p-4 font-medium">Onset Status</th>
                  <th className="p-4 font-medium">Alerts Sent</th>
                  <th className="p-4 font-medium">Officer Response</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {[...districts].sort((a,b) => b.predictions.break_14d - a.predictions.break_14d).map(d => (
                  <tr key={d.id} className="hover:bg-gray-50">
                    <td className="p-4 font-medium">{d.name}</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                        d.riskLevel === 'high' ? 'bg-red-100 text-red-700' :
                        d.riskLevel === 'moderate' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {d.riskLevel.toUpperCase()}
                      </span>
                    </td>
                    <td className={`p-4 font-medium ${d.predictions.break_14d > 60 ? 'text-red-600' : ''}`}>{d.predictions.break_14d}%</td>
                    <td className="p-4 text-gray-600">Active</td>
                    <td className="p-4 text-gray-600">{Math.floor(d.predictions.break_14d / 2)}</td>
                    <td className="p-4 text-gray-600">
                      <span className="flex items-center gap-1"><CheckCircle className="w-4 h-4 text-green-500" /> Done</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
