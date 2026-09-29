import React from 'react';
import { Link } from 'react-router-dom';
import { CloudRain, Users, Shield, Settings, FileText } from 'lucide-react';

export default function RoleSelect() {
  const roles = [
    {
      title: 'Farmer',
      titleHi: 'किसान',
      path: '/farmer',
      icon: CloudRain,
      color: 'bg-green-600',
      hoverColor: 'hover:bg-green-700',
      desc: 'Your forecast & advisory',
      descHi: 'आपका पूर्वानुमान और सलाह',
    },
    {
      title: 'Extension Officer',
      titleHi: 'विस्तार अधिकारी',
      path: '/officer',
      icon: Users,
      color: 'bg-blue-600',
      hoverColor: 'hover:bg-blue-700',
      desc: 'Risk maps & calibration',
      descHi: 'जोखिम नक्शे और अंशांकन',
    },
    {
      title: 'Admin',
      titleHi: 'प्रशासक',
      path: '/admin',
      icon: Shield,
      color: 'bg-purple-600',
      hoverColor: 'hover:bg-purple-700',
      desc: 'State overview & allocation',
      descHi: 'राज्य अवलोकन',
    },
    {
      title: 'System Admin',
      titleHi: 'सिस्टम प्रशासक',
      path: '/sysadmin',
      icon: Settings,
      color: 'bg-gray-700',
      hoverColor: 'hover:bg-gray-800',
      desc: 'Model health & pipeline',
      descHi: 'मॉडल स्वास्थ्य',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-green-50 flex flex-col items-center justify-center p-6 text-gray-900">
      
      {/* Logo & Title */}
      <div className="text-center mb-12">
        <div className="w-20 h-20 mx-auto mb-5 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200">
          <CloudRain className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-1">MonsoonSetu</h1>
        <h2 className="text-xl font-semibold text-blue-600 mb-2">मानसून-सेतु</h2>
        <p className="text-gray-500 text-sm max-w-xs mx-auto leading-relaxed">
          Block-level monsoon intelligence for Indian farmers
        </p>
        <p className="text-gray-400 text-xs mt-1">
          भारतीय किसानों के लिए ब्लॉक-स्तरीय मानसून पूर्वानुमान
        </p>
      </div>

      {/* Role Cards */}
      <div className="grid grid-cols-2 gap-4 w-full max-w-md">
        {roles.map((role) => {
          const Icon = role.icon;
          return (
            <Link
              key={role.path}
              to={role.path}
              className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg hover:scale-[1.03] transition-all duration-200 flex flex-col items-center text-center group"
            >
              <div className={`w-14 h-14 ${role.color} ${role.hoverColor} rounded-xl flex items-center justify-center mb-3 shadow-sm group-hover:scale-105 transition-all`}>
                <Icon className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-sm font-bold text-gray-800 mb-0.5">{role.title}</h3>
              <p className="text-xs text-blue-600 font-medium mb-1">{role.titleHi}</p>
              <p className="text-xs text-gray-400 leading-tight">{role.desc}</p>
            </Link>
          );
        })}
      </div>

      {/* Quick Links */}
      <div className="mt-8 flex items-center gap-4">
        <Link to="/parcha" className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-blue-600 transition-colors">
          <FileText className="w-3.5 h-3.5" />
          <span>Sarkari Parcha</span>
        </Link>
        <span className="text-gray-300">|</span>
        <span className="text-xs text-gray-400">SIH 2026 · PS 26086</span>
      </div>
      
      {/* Stats Bar */}
      <div className="mt-6 grid grid-cols-3 gap-4 text-center">
        <div>
          <div className="text-lg font-bold text-gray-800">15</div>
          <div className="text-[10px] text-gray-400 uppercase tracking-wide">Districts</div>
        </div>
        <div>
          <div className="text-lg font-bold text-gray-800">12</div>
          <div className="text-[10px] text-gray-400 uppercase tracking-wide">ML Models</div>
        </div>
        <div>
          <div className="text-lg font-bold text-gray-800">33</div>
          <div className="text-[10px] text-gray-400 uppercase tracking-wide">Features</div>
        </div>
      </div>
    </div>
  );
}
