import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Activity, Server, Database, CheckCircle, Clock } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';

export default function SysAdminDashboard() {
  const modelAccuracyData = [
    { name: 'Onset 7d', score: 0.72 },
    { name: 'Onset 14d', score: 0.68 },
    { name: 'Break 7d', score: 0.68 },
    { name: 'Break 14d', score: 0.65 },
    { name: 'Heavy 7d', score: 0.65 },
    { name: 'Heavy 14d', score: 0.60 },
  ];

  const getBarColor = (score) => {
    if (score >= 0.7) return '#16A34A'; // green
    if (score >= 0.65) return '#EAB308'; // yellow
    return '#DC2626'; // red
  };

  const confidenceData = [
    { name: 'High (>70%)', value: 45, color: '#16A34A' },
    { name: 'Medium (50-70%)', value: 35, color: '#EAB308' },
    { name: 'Low (<50%)', value: 20, color: '#DC2626' },
  ];

  const logs = [
    { time: '01:04', msg: 'ENSO scraper completed. ONI = +0.8' },
    { time: '01:05', msg: 'IOD scraper completed. DMI = -0.3' },
    { time: '01:05', msg: 'MJO data updated. Phase 6, Amplitude 1.4' },
    { time: '01:06', msg: 'Prediction engine run for 15 districts' },
    { time: '01:06', msg: '3 CRITICAL alerts dispatched' },
    { time: '01:07', msg: 'WhatsApp delivery: 156 messages sent' }
  ];

  return (
    <div className="min-h-screen bg-[#F9FAFB] p-4 md:p-6 text-gray-900">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Top Bar */}
        <div className="flex items-center gap-4 bg-white p-4 rounded-xl shadow-sm">
          <Link to="/" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-gray-900">System Administrator</h1>
            <p className="text-sm text-gray-500">Model Health & Pipeline Monitoring</p>
          </div>
        </div>

        {/* Row 1: Pipeline Status */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {['ENSO Scraper', 'IOD Scraper', 'MJO Scraper'].map((service, i) => (
            <div key={i} className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold text-gray-800 flex items-center gap-2"><Database className="w-4 h-4 text-gray-500" /> {service}</h3>
                <span className="bg-green-100 text-green-800 text-xs font-semibold px-2 py-1 rounded-full flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div> OK
                </span>
              </div>
              <p className="text-xs text-gray-500 flex items-center gap-1"><Clock className="w-3 h-3" /> Last run 2hrs ago</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* System Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 text-center">
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">Total Farmers</p>
                <p className="text-2xl font-bold text-gray-900">2,847</p>
              </div>
              <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 text-center">
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">Total Officers</p>
                <p className="text-2xl font-bold text-gray-900">23</p>
              </div>
              <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 text-center">
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">Predictions (24h)</p>
                <p className="text-2xl font-bold text-blue-600">1,240</p>
              </div>
            </div>

            {/* Model Accuracy Chart */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
                <Activity className="w-5 h-5 text-gray-600" /> Model Performance — Last 30 Days (F1 Score)
              </h2>
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={modelAccuracyData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 12}} />
                    <YAxis domain={[0, 1]} axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 12}} />
                    <Tooltip cursor={{fill: '#F3F4F6'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                    <Bar dataKey="score" radius={[4, 4, 0, 0]}>
                      {modelAccuracyData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={getBarColor(entry.score)} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            
            {/* Confidence Pie Chart */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <h2 className="text-lg font-semibold mb-4 text-center">Prediction Confidence</h2>
              <div className="h-[200px] w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={confidenceData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                      stroke="none"
                    >
                      {confidenceData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                {/* Center text manually as recharts center label can be finicky */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-2xl font-bold text-gray-800">45%</span>
                  <span className="text-xs text-gray-500">High Conf.</span>
                </div>
              </div>
              <div className="mt-4 space-y-2">
                {confidenceData.map((entry, i) => (
                  <div key={i} className="flex justify-between items-center text-sm">
                    <span className="flex items-center gap-2"><div className="w-3 h-3 rounded-full" style={{backgroundColor: entry.color}}></div> {entry.name}</span>
                    <span className="font-semibold">{entry.value}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Logs Terminal */}
            <div className="bg-gray-900 rounded-xl shadow-sm border border-gray-800 overflow-hidden text-gray-300 font-mono text-xs">
              <div className="bg-gray-800 p-3 border-b border-gray-700 flex items-center gap-2">
                <Server className="w-4 h-4 text-gray-400" /> <span className="font-semibold">Recent Pipeline Events</span>
              </div>
              <div className="p-4 space-y-2 h-[215px] overflow-y-auto">
                {logs.map((log, i) => (
                  <div key={i} className="break-all">
                    <span className="text-blue-400">[{log.time}]</span> {log.msg}
                  </div>
                ))}
                <div className="text-green-400 animate-pulse">_</div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
