import React, { useState, useEffect } from 'react';
import { CloudRain, Sun, Sprout, AlertTriangle, CheckCircle, Clock, XCircle } from 'lucide-react';

const withoutSetuNodes = [
  { day: 'Day 1-3', label: 'It rained! 38mm in 3 days', icon: CloudRain, color: 'text-blue-500', bg: 'bg-blue-100' },
  { day: 'Day 4', label: 'Farmer sows seeds (spent ₹12,000)', icon: Sprout, color: 'text-green-500', bg: 'bg-green-100' },
  { day: 'Day 5-7', label: 'Light drizzle continues', icon: CloudRain, color: 'text-blue-400', bg: 'bg-blue-50' },
  { day: 'Day 8-18', label: '14 consecutive dry days', icon: Sun, color: 'text-orange-500', bg: 'bg-orange-100' },
  { day: 'Day 19', label: 'CROP FAILURE. ₹12,000 lost.', icon: XCircle, color: 'text-red-600', bg: 'bg-red-100' },
];

const withSetuNodes = [
  { day: 'Day 1-3', label: 'It rained! 38mm in 3 days', icon: CloudRain, color: 'text-blue-500', bg: 'bg-blue-100' },
  { day: 'Day 3', label: 'MonsoonSetu: FALSE ONSET DETECTED. El Nino + MJO Phase 6', icon: AlertTriangle, color: 'text-orange-500', bg: 'bg-orange-100' },
  { day: 'Day 4', label: 'Farmer WAITS (saved ₹12,000)', icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-100' },
  { day: 'Day 8-18', label: 'Dry spell confirmed. Advisory was correct.', icon: Sun, color: 'text-orange-500', bg: 'bg-orange-100' },
  { day: 'Day 22', label: 'Sustained rain arrives', icon: CloudRain, color: 'text-green-600', bg: 'bg-green-100' },
  { day: 'Day 23', label: 'Farmer sows safely. Successful harvest.', icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100' },
];

const TimelineRow = ({ title, nodes, theme, startAnimation }) => {
  return (
    <div className={`p-4 rounded-xl border ${theme === 'red' ? 'bg-red-50/50 border-red-200' : 'bg-green-50/50 border-green-200'}`}>
      <h4 className={`font-semibold mb-6 ${theme === 'red' ? 'text-red-800' : 'text-green-800'}`}>{title}</h4>
      
      <div className="flex items-start min-w-max pb-4 px-2">
        {nodes.map((node, index) => {
          const Icon = node.icon;
          const isLast = index === nodes.length - 1;
          
          return (
            <React.Fragment key={index}>
              <div 
                className="flex flex-col items-center w-36 relative transition-all duration-700 ease-out opacity-0 translate-y-4"
                style={{
                  opacity: startAnimation ? 1 : 0,
                  transform: startAnimation ? 'translateY(0)' : 'translateY(1rem)',
                  transitionDelay: `${index * 800}ms`
                }}
              >
                <div className="text-xs font-semibold text-gray-500 mb-2">{node.day}</div>
                <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 shadow-sm border border-white ${node.bg} ${node.color} z-10 transition-transform duration-300 hover:scale-110`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div className="text-xs text-center text-gray-700 font-medium px-2 leading-tight">
                  {node.label}
                </div>
              </div>
              
              {!isLast && (
                <div 
                  className="flex-1 h-0.5 mt-12 bg-gray-200 relative overflow-hidden transition-all"
                  style={{ width: '40px' }}
                >
                  <div 
                    className={`absolute inset-0 transition-all duration-1000 ease-linear ${theme === 'red' ? 'bg-red-400' : 'bg-green-400'}`}
                    style={{
                      transform: startAnimation ? 'translateX(0)' : 'translateX(-100%)',
                      transitionDelay: `${(index * 800) + 400}ms`
                    }}
                  />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

const FalseOnsetTimeline = () => {
  const [startAnimation, setStartAnimation] = useState(false);

  useEffect(() => {
    // Start animation slightly after mount
    const timer = setTimeout(() => {
      setStartAnimation(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 overflow-hidden">
      <div className="mb-6">
        <h3 className="text-xl font-bold text-gray-800">Why False Onset Detection Saves Crops</h3>
        <p className="text-gray-500 text-sm mt-1">Real scenario based on 2015 Marathwada drought pattern</p>
      </div>

      <div className="space-y-6 overflow-x-auto pb-4">
        <TimelineRow 
          title="Without MonsoonSetu" 
          nodes={withoutSetuNodes} 
          theme="red"
          startAnimation={startAnimation}
        />
        
        <TimelineRow 
          title="With MonsoonSetu" 
          nodes={withSetuNodes} 
          theme="green"
          startAnimation={startAnimation}
        />
      </div>
    </div>
  );
};

export default FalseOnsetTimeline;
