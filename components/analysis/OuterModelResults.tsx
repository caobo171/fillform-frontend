import React from 'react';
import { AdvanceModelType } from '@/store/data.service.types';

interface OuterModelResultsProps {
  outerModel: { [key: string]: { [key: string]: number } };
  questions?: any[];
  mappingQuestionToVariable?: { [key: string]: string };
  model?: AdvanceModelType | null;
  className?: string;
}

export const OuterModelResults: React.FC<OuterModelResultsProps> = ({
  outerModel,
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
      description = question.question || question.text || question.title || question.description || '';
    }

    if (mappingQuestionToVariable && varQuestionMapping[questionId]) {
      variableName = varQuestionMapping[questionId];
    } else {
      variableName = questionId;
    }

    const displayName = `${variableName}`;
    return { displayName, description };
  };


  if (!outerModel || Object.keys(outerModel).length === 0) {
    return null;
  }

  // Extract outer loadings data
  const indicators = Object.keys(outerModel);

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${className}`}>
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Outer Model - Hệ số tải ngoài
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Đánh giá mối quan hệ giữa các biến quan sát và nhân tố tiềm ẩn. Hệ số tải ≥ 0.7 được coi là tốt.
        </p>
      </div>

      <div className="overflow-x-auto max-h-[320px] overflow-y-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Indicator
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Weight
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Loading
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Communality
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Redundancy
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Đánh giá
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {indicators.map((indicator) => {
              const { displayName } = getVariableDisplayInfo(indicator);
              const data = outerModel[indicator];
              const loading = data?.loading || 0;
              const weight = data?.weight || 0;
              const communality = data?.communality || 0;
              const redundancy = data?.redundancy || 0;
              
              const getLoadingStatus = (loading: number) => {
                if (loading >= 0.7) return { status: 'Tốt', color: 'text-green-600', bgColor: 'bg-green-50' };
                if (loading >= 0.4) return { status: 'Chấp nhận được', color: 'text-yellow-600', bgColor: 'bg-yellow-50' };
                return { status: 'Thấp', color: 'text-red-600', bgColor: 'bg-red-50' };
              };

              const loadingStatus = getLoadingStatus(Math.abs(loading));
              
              return (
                <tr key={indicator} className="hover:bg-gray-50">
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                    {displayName}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-center font-mono">
                    {weight.toFixed(3)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-center">
                    <span className={`font-mono ${Math.abs(loading) >= 0.7 ? 'text-green-600 font-bold' : Math.abs(loading) >= 0.4 ? 'text-yellow-600' : 'text-red-600'}`}>
                      {loading.toFixed(3)}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-center font-mono">
                    {communality.toFixed(3)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-center font-mono">
                    {redundancy.toFixed(3)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-center">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${loadingStatus.bgColor} ${loadingStatus.color}`}>
                      {loadingStatus.status}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
        <div className="flex items-center">
          <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
          <span className="text-gray-600">Loading ≥ 0.7: Tốt</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
          <span className="text-gray-600">Loading 0.4-0.7: Chấp nhận được</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
          <span className="text-gray-600">Loading &lt; 0.4: Thấp</span>
        </div>
      </div>

      <div className="mt-4 text-sm text-gray-600">
        <p><strong>Weight:</strong> Trọng số của biến quan sát trong việc tạo nên nhân tố tiềm ẩn</p>
        <p><strong>Loading:</strong> Hệ số tải - mức độ tương quan giữa biến quan sát và nhân tố tiềm ẩn</p>
        <p><strong>Communality:</strong> Phần phương sai của biến quan sát được giải thích bởi nhân tố tiềm ẩn</p>
      </div>
    </div>
  );
};

export default OuterModelResults;
