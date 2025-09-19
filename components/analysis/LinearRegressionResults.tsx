import { RegressionResult } from '@/store/types';
import React from 'react';



interface LinearRegressionResultsProps {
  regressionResult: RegressionResult;
  className?: string;
}

export const LinearRegressionResults: React.FC<LinearRegressionResultsProps> = ({
  regressionResult,
  className = ""
}) => {
  return (
    <div className={`bg-white rounded shadow-sm p-6 border border-gray-100 mb-8 ${className}`}>
      <h3 className="text-lg font-bold mb-4">Phân tích hồi quy tuyến tính (Linear Regression)</h3>
      
      {/* Model Summary */}
      <div className="mb-6">
        <h4 className="text-lg font-semibold mb-3">Tóm tắt mô hình</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-50 p-4 rounded">
            <div className="text-sm text-gray-600">R²</div>
            <div className="text-lg font-semibold">{regressionResult.r_squared.toFixed(3)}</div>
          </div>
          <div className="bg-gray-50 p-4 rounded">
            <div className="text-sm text-gray-600">Adjusted R²</div>
            <div className="text-lg font-semibold">{regressionResult.adjusted_r_squared.toFixed(3)}</div>
          </div>
          <div className="bg-gray-50 p-4 rounded">
            <div className="text-sm text-gray-600">F-Statistic</div>
            <div className="text-lg font-semibold">{regressionResult.f_statistic.toFixed(3)}</div>
          </div>
          <div className="bg-gray-50 p-4 rounded">
            <div className="text-sm text-gray-600">F p-value</div>
            <div className="text-lg font-semibold">
              {regressionResult.f_p_value < 0.001 ? '<0.001' : regressionResult.f_p_value.toFixed(3)}
            </div>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-50 p-4 rounded">
            <div className="text-sm text-gray-600">Mô hình</div>
            <div className="text-sm font-medium">{regressionResult.hypothesis}</div>
          </div>
          <div className="bg-gray-50 p-4 rounded">
            <div className="text-sm text-gray-600">Số quan sát</div>
            <div className="text-lg font-semibold">{regressionResult.n_observations}</div>
          </div>
          <div className="bg-gray-50 p-4 rounded">
            <div className="text-sm text-gray-600">Sai số chuẩn</div>
            <div className="text-lg font-semibold">{regressionResult.residual_std_error.toFixed(3)}</div>
          </div>
        </div>
      </div>

      {/* Coefficients Table */}
      <div>
        <h4 className="text-lg font-semibold mb-3">Hệ số hồi quy</h4>
        <div className="overflow-x-auto max-h-[320px] overflow-y-auto">
          <table className="min-w-full table-auto">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-4 py-2 text-left">Biến</th>
                <th className="px-4 py-2 text-right">Hệ số</th>
                <th className="px-4 py-2 text-right">Sai số chuẩn</th>
                <th className="px-4 py-2 text-right">t-Statistic</th>
                <th className="px-4 py-2 text-right">p-value</th>
                <th className="px-4 py-2 text-center">Ý nghĩa</th>
              </tr>
            </thead>
            <tbody>
              {regressionResult.coefficients.map((coeff, index) => (
                <tr key={index} className="border-t">
                  <td className="px-4 py-2 font-medium">{coeff.variable}</td>
                  <td className="px-4 py-2 text-right">{coeff.coefficient.toFixed(4)}</td>
                  <td className="px-4 py-2 text-right">{coeff.std_error.toFixed(4)}</td>
                  <td className="px-4 py-2 text-right">{coeff.t_statistic.toFixed(3)}</td>
                  <td className="px-4 py-2 text-right">
                    {coeff.p_value < 0.001 ? '<0.001' : coeff.p_value.toFixed(3)}
                  </td>
                  <td className="px-4 py-2 text-center">
                    <span className={`font-semibold ${
                      coeff.significance === '***' ? 'text-green-600' :
                      coeff.significance === '**' ? 'text-blue-600' :
                      coeff.significance === '*' ? 'text-yellow-600' :
                      'text-gray-400'
                    }`}>
                      {coeff.significance || 'ns'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 text-sm text-gray-600">
          <p>
            <span className="text-green-600 font-semibold">***:</span> p &lt; 0.001 | 
            <span className="text-blue-600 font-semibold ml-2">**:</span> p &lt; 0.01 | 
            <span className="text-yellow-600 font-semibold ml-2">*:</span> p &lt; 0.05 | 
            <span className="text-gray-400 font-semibold ml-2">ns:</span> không có ý nghĩa thống kê
          </p>
        </div>
      </div>
    </div>
  );
};

export default LinearRegressionResults;
