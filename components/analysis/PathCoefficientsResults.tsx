import React from 'react';
import { AdvanceModelType } from '@/store/data.service.types';

interface PathCoefficientsResultsProps {
  pathCoefficients: { [key: string]: { [key: string]: number } };
  questions?: any[];
  mappingQuestionToVariable?: { [key: string]: string };
  model?: AdvanceModelType | null;
  className?: string;
}

export const PathCoefficientsResults: React.FC<PathCoefficientsResultsProps> = ({
  pathCoefficients,
  questions = [],
  mappingQuestionToVariable,
  model,
  className = ""
}) => {
  const varCodeMapping: Record<string, any> = {};
  const varQuestionMapping: Record<string, any> = {};

  for (let i = 0; i < questions.length; i++) {
    const question = questions[i];

    let varCode = '';
    if (mappingQuestionToVariable) {
      varCode = model?.nodes?.find(node => node.id == mappingQuestionToVariable[question.id])?.data?.label || '';
    }

    let varCodeIndex = varCodeMapping[varCode] || 0;
    varCodeMapping[varCode] = varCodeIndex + 1;
    varQuestionMapping[question.id] = varCode + '_' + (varCodeIndex + 1);
  }

  const getVariableDisplayInfo = (questionId: string) => {
    if (!model || !questions.length) {
      return { displayName: questionId, description: '' };
    }

    let variableName = '';
    let description = '';

    const question = questions.find(q => q.id == questionId);
    if (question) {
      description = question.question || question.text || question.title || question.description;
    }

    if (mappingQuestionToVariable && varQuestionMapping[questionId]) {
      variableName = varQuestionMapping[questionId];
    } else {
      variableName = questionId;
    }

    const displayName = `${variableName}`;
    return { displayName, description };
  };

  if (!pathCoefficients || Object.keys(pathCoefficients).length === 0) {
    return null;
  }

  // In plspm library: pathCoefficients[target][source] = coefficient from source -> target
  const targets = Object.keys(pathCoefficients); // These are actually the target constructs (rows)
  const allSources = new Set<string>();
  
  // Get all source constructs
  targets.forEach(target => {
    Object.keys(pathCoefficients[target]).forEach(source => {
      allSources.add(source);
    });
  });

  const sources = Array.from(allSources);

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${className}`}>
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Path Coefficients - Hệ số đường dẫn
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Ma trận hệ số đường dẫn giữa các khái niệm trong mô hình cấu trúc. Giá trị khác 0 thể hiện mối quan hệ trực tiếp.
        </p>
      </div>

      <div className="overflow-x-auto max-h-[320px] overflow-y-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">
                From \ To
              </th>
              {targets.map((target) => {
                const { displayName } = getVariableDisplayInfo(target);
                return (
                  <th key={target} className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {displayName}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sources.map((source) => {
              const { displayName: sourceDisplayName } = getVariableDisplayInfo(source);
              
              // Check if this source has any non-zero coefficients
              const hasCoefficients = targets.some(target => 
                pathCoefficients[target]?.[source] && pathCoefficients[target][source] !== 0
              );
              
              if (!hasCoefficients) return null;
              
              return (
                <tr key={source} className="hover:bg-gray-50">
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                    {sourceDisplayName}
                  </td>
                  {targets.map((target) => {
                    const coefficient = pathCoefficients[target]?.[source] || 0;
                    
                    const getCoeffStatus = (coeff: number) => {
                      const absCoeff = Math.abs(coeff);
                      if (absCoeff === 0) return { color: 'text-gray-400', strength: '' };
                      if (absCoeff >= 0.5) return { 
                        color: coeff > 0 ? 'text-green-600' : 'text-red-600', 
                        strength: 'font-bold',
                        bg: coeff > 0 ? 'bg-green-50' : 'bg-red-50'
                      };
                      if (absCoeff >= 0.3) return { 
                        color: coeff > 0 ? 'text-blue-600' : 'text-orange-600', 
                        strength: 'font-medium',
                        bg: coeff > 0 ? 'bg-blue-50' : 'bg-orange-50'
                      };
                      return { 
                        color: 'text-gray-600', 
                        strength: '',
                        bg: ''
                      };
                    };

                    const status = getCoeffStatus(coefficient);
                    
                    return (
                      <td key={target} className="px-4 py-3 whitespace-nowrap text-sm text-center">
                        {coefficient !== 0 ? (
                          <span className={`font-mono px-2 py-1 rounded ${status.color} ${status.strength} ${status.bg || ''}`}>
                            {coefficient.toFixed(3)}
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
        <div className="flex items-center">
          <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
          <span className="text-gray-600">|β| ≥ 0.5: Ảnh hưởng mạnh (+)</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
          <span className="text-gray-600">|β| ≥ 0.5: Ảnh hưởng mạnh (-)</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
          <span className="text-gray-600">|β| ≥ 0.3: Ảnh hưởng trung bình (+)</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-orange-500 rounded-full mr-2"></div>
          <span className="text-gray-600">|β| ≥ 0.3: Ảnh hưởng trung bình (-)</span>
        </div>
      </div>

      <div className="mt-4 text-sm text-gray-600">
        <p><strong>Hệ số đường dẫn (β):</strong> Đo lường mức độ ảnh hưởng trực tiếp giữa các khái niệm</p>
        <p><strong>Giá trị dương (+):</strong> Mối quan hệ thuận chiều - khi biến độc lập tăng, biến phụ thuộc cũng tăng</p>
        <p><strong>Giá trị âm (-):</strong> Mối quan hệ nghịch chiều - khi biến độc lập tăng, biến phụ thuộc giảm</p>
        <p><strong>Lưu ý:</strong> Cần kiểm tra tính có ý nghĩa thống kê thông qua bootstrapping</p>
      </div>
    </div>
  );
};

export default PathCoefficientsResults;
