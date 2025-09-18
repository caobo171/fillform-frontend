import { PearsonCorrelation } from '@/store/types';
import React from 'react';

interface PearsonCorrelationsProps {
  correlations: PearsonCorrelation[];
  className?: string;
}

export const PearsonCorrelations: React.FC<PearsonCorrelationsProps> = ({
  correlations,
  className = ""
}) => {
  if (!correlations || correlations.length === 0) {
    return null;
  }

  // Sort correlations by absolute correlation coefficient (strongest first)
  const sortedCorrelations = [...correlations].sort((a, b) => 
    Math.abs(b.correlation_coefficient) - Math.abs(a.correlation_coefficient)
  );

  return (
    <div className={`bg-white rounded shadow-sm p-6 border border-gray-100 mb-4 ${className}`}>
      <h3 className="text-md font-bold mb-4">Phân tích tương quan Pearson (Pearson Correlations)</h3>
      
      {/* Summary Statistics */}
      <div className="mb-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-50 p-4 rounded">
            <div className="text-sm text-gray-600">Tổng số cặp</div>
            <div className="text-md font-semibold">{correlations.length}</div>
          </div>
          <div className="bg-gray-50 p-4 rounded">
            <div className="text-sm text-gray-600">Có ý nghĩa (p&lt;0.05)</div>
            <div className="text-md font-semibold">
              {correlations.filter(c => c.p_value < 0.05).length}
            </div>
          </div>
          <div className="bg-gray-50 p-4 rounded">
            <div className="text-sm text-gray-600">Tương quan mạnh (|r|≥0.7)</div>
            <div className="text-md font-semibold">
              {correlations.filter(c => Math.abs(c.correlation_coefficient) >= 0.7).length}
            </div>
          </div>
          <div className="bg-gray-50 p-4 rounded">
            <div className="text-sm text-gray-600">Tương quan trung bình (0.3≤|r|&lt;0.7)</div>
            <div className="text-md font-semibold">
              {correlations.filter(c => Math.abs(c.correlation_coefficient) >= 0.3 && Math.abs(c.correlation_coefficient) < 0.7).length}
            </div>
          </div>
        </div>
      </div>

      {/* Correlations Table */}
      <div>
        <h4 className="text-md font-semibold mb-3">Ma trận tương quan</h4>
        <div className="overflow-x-auto max-h-[300px] overflow-y-auto">
          <table className="min-w-full table-auto">
            <thead className="bg-gray-50 sticky top-0">
              <tr>
                <th className="px-4 py-1 text-left text-sm">Biến 1</th>
                <th className="px-4 py-1 text-left text-sm">Biến 2</th>
                <th className="px-4 py-1 text-left text-sm">Hệ số tương quan (r)</th>
                <th className="px-4 py-1 text-left text-sm">p-value</th>
                <th className="px-4 py-1 text-left text-sm">Ý nghĩa</th>
                <th className="px-4 py-1 text-left text-sm">Cỡ mẫu</th>
                <th className="px-4 py-1 text-left text-sm">Mức độ</th>
              </tr>
            </thead>
            <tbody>
              {sortedCorrelations.map((corr, index) => {
                const absCorr = Math.abs(corr.correlation_coefficient);
                let strengthLevel = 'Yếu';
                let strengthColor = 'text-gray-500';
                
                if (absCorr >= 0.7) {
                  strengthLevel = 'Mạnh';
                  strengthColor = 'text-red-600';
                } else if (absCorr >= 0.3) {
                  strengthLevel = 'Trung bình';
                  strengthColor = 'text-orange-600';
                }

                return (
                  <tr key={index} className="border-t">
                    <td className="px-4 py-1 font-medium text-left text-sm">{corr.variable1}</td>
                    <td className="px-4 py-1 font-medium text-left text-sm">{corr.variable2}</td>
                    <td className="px-4 py-1 text-left text-sm">
                      <span className={`font-semibold ${
                        absCorr >= 0.7 ? 'text-red-600' :
                        absCorr >= 0.3 ? 'text-orange-600' :
                        'text-gray-500'
                      }`}>
                        {corr.correlation_coefficient.toFixed(3)}
                      </span>
                    </td>
                    <td className="px-4 py-1 text-left text-sm">
                      {corr.p_value < 0.001 ? '<0.001' : corr.p_value.toFixed(3)}
                    </td>
                    <td className="px-4 py-1 text-left text-sm">
                      <span className={`font-semibold ${
                        corr.significance === '***' ? 'text-green-600' :
                        corr.significance === '**' ? 'text-blue-600' :
                        corr.significance === '*' ? 'text-yellow-600' :
                        'text-gray-400'
                      }`}>
                        {corr.significance || 'ns'}
                      </span>
                    </td>
                    <td className="px-4 py-1 text-left text-sm">{corr.sample_size}</td>
                    <td className="px-4 py-1 text-left text-sm">
                      <span className={`text-sm font-medium ${strengthColor}`}>
                        {strengthLevel}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="mt-4 text-sm text-gray-600">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="font-medium mb-2">Mức ý nghĩa thống kê:</p>
              <p>
                <span className="text-green-600 font-semibold">***:</span> p &lt; 0.001 | 
                <span className="text-blue-600 font-semibold ml-2">**:</span> p &lt; 0.01 | 
                <span className="text-yellow-600 font-semibold ml-2">*:</span> p &lt; 0.05 | 
                <span className="text-gray-400 font-semibold ml-2">ns:</span> không có ý nghĩa thống kê
              </p>
            </div>
            <div>
              <p className="font-medium mb-2">Mức độ tương quan:</p>
              <p>
                <span className="text-red-600 font-semibold">Mạnh:</span> |r| ≥ 0.7 | 
                <span className="text-orange-600 font-semibold ml-2">Trung bình:</span> 0.3 ≤ |r| &lt; 0.7 | 
                <span className="text-gray-500 font-semibold ml-2">Yếu:</span> |r| &lt; 0.3
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PearsonCorrelations;
