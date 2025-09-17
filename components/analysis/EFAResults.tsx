import React from 'react';
import { EFAResult } from '@/store/types';

interface EFAResultsProps {
  efaResult: EFAResult;
  className?: string;
}

export const EFAResults: React.FC<EFAResultsProps> = ({
  efaResult,
  className = ""
}) => {
  // Get all unique variables from all factors
  const allVariables = Array.from(new Set(
    efaResult.factors.flatMap(factor => Object.keys(factor.loadings))
  ));

  return (
    <div className={`bg-white rounded shadow-sm p-6 border border-gray-100 mb-6 ${className}`}>
      <h3 className="text-lg font-bold mb-4">Phân tích nhân tố khám phá (EFA)</h3>
      
      {/* EFA Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-50 p-4 rounded">
          <div className="text-sm text-gray-600">KMO Measure</div>
          <div className="text-lg font-semibold">{efaResult.kmo_measure.toFixed(3)}</div>
        </div>
        <div className="bg-gray-50 p-4 rounded">
          <div className="text-sm text-gray-600">Bartlett's Test</div>
          <div className="text-lg font-semibold">{efaResult.bartlett_test_statistic.toFixed(2)}</div>
        </div>
        <div className="bg-gray-50 p-4 rounded">
          <div className="text-sm text-gray-600">Bartlett's p-value</div>
          <div className="text-lg font-semibold">
            {efaResult.bartlett_p_value < 0.001 ? '<0.001' : efaResult.bartlett_p_value.toFixed(3)}
          </div>
        </div>
        <div className="bg-gray-50 p-4 rounded">
          <div className="text-sm text-gray-600">Tổng phương sai giải thích</div>
          <div className="text-lg font-semibold">{efaResult.total_variance_explained.toFixed(1)}%</div>
        </div>
      </div>

      {/* Factor Loadings */}
      {efaResult.factors && efaResult.factors.length > 0 && (
        <div>
          <h4 className="text-lg font-semibold mb-3">Ma trận nhân tố</h4>
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-2 text-left">Biến</th>
                  {efaResult.factors.map((factor, index) => (
                    <th key={index} className="px-4 py-2 text-right">
                      Nhân tố {factor.factor_number}
                      <div className="text-xs text-gray-500">
                        (λ={factor.eigenvalue.toFixed(2)}, {factor.variance_explained.toFixed(1)}%)
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {allVariables.map((variable, varIndex) => (
                  <tr key={varIndex} className="border-t">
                    <td className="px-4 py-2 font-medium">{variable}</td>
                    {efaResult.factors.map((factor, factorIndex) => (
                      <td key={factorIndex} className="px-4 py-2 text-right">
                        {factor.loadings[variable] ? (
                          <span className={`${Math.abs(factor.loadings[variable]) >= 0.5 ? 'font-bold text-blue-600' : ''}`}>
                            {factor.loadings[variable].toFixed(3)}
                          </span>
                        ) : '-'}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 text-sm text-gray-600">
            <p><span className="font-semibold text-blue-600">Hệ số tải ≥ 0.5:</span> Có ý nghĩa thống kê</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default EFAResults;
