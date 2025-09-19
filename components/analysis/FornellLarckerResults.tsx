import React from 'react';
import { AdvanceModelType } from '@/store/data.service.types';

interface FornellLarckerResultsProps {
  fornellLarckerMatrix: { [key: string]: { [key: string]: number } };
  questions?: any[];
  mappingQuestionToVariable?: { [key: string]: string };
  model?: AdvanceModelType | null;
  className?: string;
}

export const FornellLarckerResults: React.FC<FornellLarckerResultsProps> = ({
  fornellLarckerMatrix,
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

  if (!fornellLarckerMatrix || Object.keys(fornellLarckerMatrix).length === 0) {
    return null;
  }

  const variables = Object.keys(fornellLarckerMatrix);

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${className}`}>
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Tiêu chí Fornell-Larcker
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Đánh giá tính phân biệt. Căn bậc hai của AVE (đường chéo) phải lớn hơn tương quan với các khái niệm khác.
        </p>
      </div>

      <div className="overflow-x-auto max-h-[320px] overflow-y-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Variable
              </th>
              {variables.map((variable) => {
                const { displayName } = getVariableDisplayInfo(variable);
                return (
                  <th key={variable} className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {displayName}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {variables.map((rowVar) => {
              const { displayName: rowDisplayName } = getVariableDisplayInfo(rowVar);
              return (
                <tr key={rowVar}>
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                    {rowDisplayName}
                  </td>
                  {variables.map((colVar) => {
                    const value = fornellLarckerMatrix[rowVar]?.[colVar] || 0;
                    const isDiagonal = rowVar === colVar;
                    const diagonalValue = fornellLarckerMatrix[rowVar]?.[rowVar] || 0;
                    const isProblematic = !isDiagonal && Math.abs(value) >= diagonalValue;
                    
                    return (
                      <td key={colVar} className="px-4 py-3 whitespace-nowrap text-sm text-center">
                        <span className={`${
                          isDiagonal 
                            ? 'text-blue-600 font-bold' 
                            : isProblematic 
                              ? 'text-red-600 font-bold' 
                              : 'text-gray-600'
                        }`}>
                          {value.toFixed(3)}
                        </span>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-4 text-sm text-gray-600">
        <p><span className="font-semibold text-blue-600">Đường chéo (√AVE):</span> Căn bậc hai của phương sai trích trung bình</p>
        <p><span className="font-semibold text-gray-600">Ngoài đường chéo:</span> Tương quan giữa các khái niệm</p>
        <p><span className="font-semibold text-red-600">Cảnh báo:</span> Tương quan ≥ √AVE có thể có vấn đề tính phân biệt</p>
      </div>
    </div>
  );
};

export default FornellLarckerResults;
