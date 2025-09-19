import React from 'react';
import { AdvanceModelType } from '@/store/data.service.types';

interface EffectSizeResultsProps {
  effectSizeResults: { [key: string]: number };
  questions?: any[];
  mappingQuestionToVariable?: { [key: string]: string };
  model?: AdvanceModelType | null;
  className?: string;
}

export const EffectSizeResults: React.FC<EffectSizeResultsProps> = ({
  effectSizeResults,
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

  // Function to get variable display info
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

  if (!effectSizeResults || Object.keys(effectSizeResults).length === 0) {
    return null;
  }

  const getEffectSizeInterpretation = (f2: number) => {
    if (f2 < 0.02) return { level: 'Không có', color: 'text-gray-600', bgColor: 'bg-gray-50' };
    if (f2 < 0.15) return { level: 'Nhỏ', color: 'text-blue-600', bgColor: 'bg-blue-50' };
    if (f2 < 0.35) return { level: 'Trung bình', color: 'text-green-600', bgColor: 'bg-green-50' };
    return { level: 'Lớn', color: 'text-purple-600', bgColor: 'bg-purple-50' };
  };

  const sortedEffects = Object.entries(effectSizeResults).sort(([,a], [,b]) => b - a);

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${className}`}>
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          f² (Effect Size) - Kích thước hiệu ứng
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Đánh giá mức độ ảnh hưởng của từng biến độc lập lên R² của biến phụ thuộc.
        </p>
      </div>

      <div className="overflow-x-auto max-h-[320px] overflow-y-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Path (Relationship)
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                f² Value
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Effect Size
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedEffects.map(([path, f2]) => {
              const interpretation = getEffectSizeInterpretation(f2);
              
              // Parse path to get source and target for better display
              const pathParts = path.split(' -> ');
              let displayPath = path;
              if (pathParts.length === 2) {
                const sourceDisplay = getVariableDisplayInfo(pathParts[0]).displayName;
                const targetDisplay = getVariableDisplayInfo(pathParts[1]).displayName;
                displayPath = `${sourceDisplay} → ${targetDisplay}`;
              }
              
              return (
                <tr key={path} className="hover:bg-gray-50">
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                    {displayPath}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-center">
                    <span className={`font-mono ${interpretation.color}`}>
                      {isFinite(f2) ? f2.toFixed(3) : '∞'}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-center">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${interpretation.bgColor} ${interpretation.color}`}>
                      {interpretation.level}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
        <div className="flex items-center">
          <div className="w-3 h-3 bg-gray-500 rounded-full mr-2"></div>
          <span className="text-gray-600">f² &lt; 0.02: Không có</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
          <span className="text-gray-600">f² ≥ 0.02: Nhỏ</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
          <span className="text-gray-600">f² ≥ 0.15: Trung bình</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-purple-500 rounded-full mr-2"></div>
          <span className="text-gray-600">f² ≥ 0.35: Lớn</span>
        </div>
      </div>

      <div className="mt-4 text-sm text-gray-600">
        <p><strong>Công thức:</strong> f² = (R²included - R²excluded) / (1 - R²included)</p>
        <p><strong>Ý nghĩa:</strong> f² cho biết mức độ đóng góp của một biến độc lập vào khả năng giải thích của mô hình.</p>
      </div>
    </div>
  );
};

export default EffectSizeResults;
