import React from 'react';
import { getCropAdvisory } from '../data/mockData';
import { Droplets, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

const AdvisoryComparison = ({ cropId = 'soybean', stageId = 'sowing', breakRisk = 'high', soilType = 'shallow' }) => {
  // Get advisory with irrigation
  const advisoryWithBorewell = getCropAdvisory(cropId, stageId, breakRisk, soilType, true);
  // Get advisory without irrigation (rain-fed)
  const advisoryRainFed = getCropAdvisory(cropId, stageId, breakRisk, soilType, false);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-4 border-b border-gray-100 bg-gray-50">
        <h3 className="text-lg font-semibold text-gray-800">Irrigation Impact Comparison</h3>
        <p className="text-sm text-gray-500">Same weather, same crop, same soil — irrigation changes everything.</p>
      </div>
      
      <div className="flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-gray-100">
        {/* Left half - With Borewell */}
        <div className="flex-1 p-6 bg-green-50/50 hover:bg-green-50 transition-colors">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-green-100 text-green-700 rounded-full">
              <Droplets className="w-6 h-6" />
            </div>
            <h4 className="font-semibold text-green-900 text-lg">With Borewell</h4>
          </div>
          
          <div className="bg-white rounded-xl p-4 shadow-sm border border-green-100 mb-4 h-32">
            <div className="inline-block px-2.5 py-1 rounded-full text-xs font-medium mb-2 border border-green-200 bg-green-50 text-green-700">
              {advisoryWithBorewell?.action || 'SOW_WITH_CAUTION'}
            </div>
            <p className="text-gray-700 text-sm line-clamp-3">
              {advisoryWithBorewell?.message || 'With protective irrigation available, you can proceed with sowing but monitor rainfall carefully.'}
            </p>
          </div>
          
          <div className="flex items-center gap-2 text-green-800 font-medium">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span>Sow with supplemental irrigation</span>
          </div>
        </div>

        {/* Right half - Rain-fed Only */}
        <div className="flex-1 p-6 bg-red-50/50 hover:bg-red-50 transition-colors">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-red-100 text-red-700 rounded-full">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h4 className="font-semibold text-red-900 text-lg">Rain-fed Only</h4>
          </div>
          
          <div className="bg-white rounded-xl p-4 shadow-sm border border-red-100 mb-4 h-32">
            <div className="inline-block px-2.5 py-1 rounded-full text-xs font-medium mb-2 border border-red-200 bg-red-50 text-red-700">
              {advisoryRainFed?.action || 'DELAY_SOWING'}
            </div>
            <p className="text-gray-700 text-sm line-clamp-3">
              {advisoryRainFed?.message || 'High risk of dry spell. Delay sowing to avoid crop failure.'}
            </p>
          </div>
          
          <div className="flex items-center gap-2 text-red-800 font-medium">
            <XCircle className="w-5 h-5 text-red-600" />
            <span>DO NOT sow — wait 7 days</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvisoryComparison;
