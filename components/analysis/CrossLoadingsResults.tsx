import React from 'react';
import { AdvanceModelType } from '@/store/data.service.types';

interface CrossLoadingsResultsProps {
  crossLoadings: { [key: string]: { [key: string]: number } };
  questions?: any[];
  mappingQuestionToVariable?: { [key: string]: string };
  model?: AdvanceModelType | null;
  className?: string;
}

export const CrossLoadingsResults: React.FC<CrossLoadingsResultsProps> = ({
  crossLoadings,
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

  if (!crossLoadings || Object.keys(crossLoadings).length === 0) {
    return null;
  }

  const indicators = Object.keys(crossLoadings);
  const constructs = Object.keys(crossLoadings[indicators[0]] || {});

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${className}`}>
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Cross Loadings - Hệ số tải chéo
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Ma trận hệ số tải của các biến quan sát trên tất cả các nhân tố tiềm ẩn. Hệ số tải trên nhân tố chính phải cao hơn trên các nhân tố khác.
        </p>
      </div>

      <div className="overflow-x-auto max-h-[320px] overflow-y-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Indicator
              </th>
              {constructs.map((construct) => {
                const { displayName } = getVariableDisplayInfo(construct);
                return (
                  <th key={construct} className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {displayName}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {indicators.map((indicator) => {
              const { displayName: indicatorDisplayName } = getVariableDisplayInfo(indicator);
              const loadings = crossLoadings[indicator];
              
              // Find the highest loading to highlight the main construct
              const maxLoading = Math.max(...Object.values(loadings).map(Math.abs));
              
              return (
                <tr key={indicator} className="hover:bg-gray-50">
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                    {indicatorDisplayName}
                  </td>
                  {constructs.map((construct) => {
                    const loading = loadings[construct] || 0;
                    const isHighest = Math.abs(loading) === maxLoading;
                    const isGoodLoading = Math.abs(loading) >= 0.7;
                    const isAcceptableLoading = Math.abs(loading) >= 0.4;
                    
                    return (
                      <td key={construct} className="px-4 py-3 whitespace-nowrap text-sm text-center">
                        <span className={`font-mono ${
                          isHighest && isGoodLoading
                            ? 'text-green-600 font-bold bg-green-50 px-2 py-1 rounded'
                            : isHighest && isAcceptableLoading
                              ? 'text-yellow-600 font-bold bg-yellow-50 px-2 py-1 rounded'
                              : isHighest
                                ? 'text-red-600 font-bold bg-red-50 px-2 py-1 rounded'
                                : Math.abs(loading) >= 0.4
                                  ? 'text-orange-600'
                                  : 'text-gray-400'
                        }`}>
                          {loading.toFixed(3)}
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

      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
        <div className="flex items-center">
          <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
          <span className="text-gray-600">Hệ số tải chính ≥ 0.7: Tốt</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
          <span className="text-gray-600">Hệ số tải chính 0.4-0.7: Chấp nhận được</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-orange-500 rounded-full mr-2"></div>
          <span className="text-gray-600">Hệ số tải chéo ≥ 0.4: Cần xem xét</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
          <span className="text-gray-600">Hệ số tải chính &lt; 0.4: Có vấn đề</span>
        </div>
      </div>

      <div className="mt-4 text-sm text-gray-600">
        <p><strong>Nguyên tắc:</strong> Hệ số tải của biến quan sát trên nhân tố chính (được tô nền) phải cao hơn hệ số tải trên các nhân tố khác.</p>
        <p><strong>Cảnh báo:</strong> Nếu hệ số tải chéo quá cao có thể ảnh hưởng đến tính phân biệt giữa các khái niệm.</p>
      </div>
    </div>
  );
};

export default CrossLoadingsResults;
