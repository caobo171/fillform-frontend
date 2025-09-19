import React from 'react';
import { AdvanceModelType } from '@/store/data.service.types';

interface HTMTResultsProps {
  htmtMatrix: { [key: string]: { [key: string]: number } };
  questions?: any[];
  mappingQuestionToVariable?: { [key: string]: string };
  model?: AdvanceModelType | null;
  className?: string;
}

export const HTMTResults: React.FC<HTMTResultsProps> = ({
  htmtMatrix,
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

  if (!htmtMatrix || Object.keys(htmtMatrix).length === 0) {
    return null;
  }

  const variables = Object.keys(htmtMatrix);

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${className}`}>
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          HTMT (Heterotrait-Monotrait Ratio)
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Đánh giá tính phân biệt giữa các khái niệm. Giá trị HTMT &lt; 0.9 cho thấy tính phân biệt tốt.
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
                    const value = htmtMatrix[rowVar]?.[colVar] || 0;
                    const isProblematic = value >= 0.9 && rowVar !== colVar;
                    const isDiagonal = rowVar === colVar;
                    
                    return (
                      <td key={colVar} className="px-4 py-3 whitespace-nowrap text-sm text-center">
                        <span className={`${
                          isDiagonal 
                            ? 'text-gray-400' 
                            : isProblematic 
                              ? 'text-red-600 font-bold' 
                              : 'text-green-600'
                        }`}>
                          {isDiagonal ? '1.000' : value.toFixed(3)}
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
        <p><span className="font-semibold text-green-600">HTMT &lt; 0.9:</span> Tính phân biệt tốt</p>
        <p><span className="font-semibold text-red-600">HTMT ≥ 0.9:</span> Có thể có vấn đề về tính phân biệt</p>
      </div>
    </div>
  );
};

export default HTMTResults;
