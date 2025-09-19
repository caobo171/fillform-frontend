import React from 'react';
import { AdvanceModelType } from '@/store/data.service.types';

interface VIFResultsProps {
  vifResults: { [key: string]: number };
  questions?: any[];
  mappingQuestionToVariable?: { [key: string]: string };
  model?: AdvanceModelType | null;
  className?: string;
}

export const VIFResults: React.FC<VIFResultsProps> = ({
  vifResults,
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

  if (!vifResults || Object.keys(vifResults).length === 0) {
    return null;
  }

  const getVIFInterpretation = (vif: number) => {
    if (vif < 3) return { level: 'Tốt', color: 'text-green-600', bgColor: 'bg-green-50' };
    if (vif < 5) return { level: 'Chấp nhận được', color: 'text-yellow-600', bgColor: 'bg-yellow-50' };
    if (vif < 10) return { level: 'Cảnh báo', color: 'text-orange-600', bgColor: 'bg-orange-50' };
    return { level: 'Có vấn đề', color: 'text-red-600', bgColor: 'bg-red-50' };
  };

  const sortedVIF = Object.entries(vifResults).sort(([,a], [,b]) => b - a);

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${className}`}>
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          VIF (Variance Inflation Factor)
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Kiểm tra hiện tượng đa cộng tuyến giữa các biến. VIF &lt; 5 là chấp nhận được, VIF &lt; 3 là tốt.
        </p>
      </div>

      <div className="overflow-x-auto max-h-[320px] overflow-y-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Variable
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                VIF Value
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Đánh giá
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedVIF.map(([variable, vif]) => {
              const { displayName } = getVariableDisplayInfo(variable);
              const interpretation = getVIFInterpretation(vif);
              
              return (
                <tr key={variable} className="hover:bg-gray-50">
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                    {displayName}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-center">
                    <span className={`font-mono ${interpretation.color}`}>
                      {isFinite(vif) ? vif.toFixed(3) : '∞'}
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
          <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
          <span className="text-gray-600">VIF &lt; 3: Tốt</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
          <span className="text-gray-600">VIF 3-5: Chấp nhận được</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-orange-500 rounded-full mr-2"></div>
          <span className="text-gray-600">VIF 5-10: Cảnh báo</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
          <span className="text-gray-600">VIF &gt; 10: Có vấn đề</span>
        </div>
      </div>

      <div className="mt-4 text-sm text-gray-600">
        <p><strong>Lưu ý:</strong> VIF cao cho thấy biến đó có thể được dự đoán tốt bởi các biến khác trong mô hình, gây ra hiện tượng đa cộng tuyến.</p>
      </div>
    </div>
  );
};

export default VIFResults;
