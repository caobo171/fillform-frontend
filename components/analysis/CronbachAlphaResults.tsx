import React from 'react';
import { CronbachAlpha } from '@/store/types';
import { AdvanceModelType } from '@/store/data.service.types';

interface CronbachAlphaResultsProps {
  cronbachAlphas: CronbachAlpha[];
  className?: string;
}

export const CronbachAlphaResults: React.FC<CronbachAlphaResultsProps> = ({
  cronbachAlphas,
  className = ""
}) => {
  return (
    <div className={`bg-white rounded shadow-sm p-6 border border-gray-100 mb-6 ${className}`}>
      <h3 className="text-lg font-bold mb-4">Độ tin cậy Cronbach's Alpha</h3>
      <div className="overflow-x-auto max-h-[320px] overflow-y-auto">
        <table className="min-w-full table-auto">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-4 py-2 text-left">Nhân tố</th>
              <th className="px-4 py-2 text-right">Cronbach's Alpha</th>
              <th className="px-4 py-2 text-right">Số biến</th>
              <th className="px-4 py-2 text-left">Các biến</th>
            </tr>
          </thead>
          <tbody>
            {cronbachAlphas.map((alpha, index) => (
              <tr key={index} className="border-t">
                <td className="px-4 py-2 font-medium">{alpha.construct_name}</td>
                <td className="px-4 py-2 text-right">
                  <span className={`font-semibold ${alpha.alpha >= 0.7 ? 'text-green-600' :
                      alpha.alpha >= 0.6 ? 'text-yellow-600' :
                        'text-red-600'
                    }`}>
                    {alpha.alpha.toFixed(3)}
                  </span>
                </td>
                <td className="px-4 py-2 text-right">{alpha.items.length}</td>
                <td className="px-4 py-2 text-sm text-gray-600">{alpha.items.join(', ')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-4 text-sm text-gray-600">
        <p>
          <span className="text-green-600 font-semibold">≥ 0.7:</span> Độ tin cậy tốt |
          <span className="text-yellow-600 font-semibold ml-2">0.6-0.7:</span> Độ tin cậy chấp nhận được |
          <span className="text-red-600 font-semibold ml-2">&lt; 0.6:</span> Độ tin cậy kém
        </p>
      </div>
    </div>
  );
};

export default CronbachAlphaResults;
