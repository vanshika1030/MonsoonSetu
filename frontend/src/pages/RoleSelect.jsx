import React from 'react';
import { Link } from 'react-router-dom';

export default function RoleSelect() {
  const roles = [
    {
      title: 'Farmer',
      path: '/farmer',
      emoji: '👨‍🌾',
      desc: 'View your forecast and advisory'
    },
    {
      title: 'Extension Officer',
      path: '/officer',
      emoji: '👮',
      desc: 'Risk maps and calibration'
    },
    {
      title: 'Admin',
      path: '/admin',
      emoji: '🏛️',
      desc: 'State overview and allocation'
    },
    {
      title: 'System Admin',
      path: '/sysadmin',
      emoji: '⚙️',
      desc: 'Model health and accuracy'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-gray-900">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold text-blue-600 mb-2">MonsoonSetu</h1>
        <h2 className="text-2xl font-semibold text-gray-700 mb-1">मानसून-सेतु</h2>
        <p className="text-gray-500 font-medium">Block-Level Monsoon Intelligence</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-3xl">
        {roles.map((role) => (
          <Link
            key={role.path}
            to={role.path}
            className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md hover:scale-[1.02] transition-all duration-200 flex flex-col items-center text-center group"
          >
            <div className="text-6xl mb-4 group-hover:scale-110 transition-transform">{role.emoji}</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">{role.title}</h3>
            <p className="text-gray-500">{role.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
