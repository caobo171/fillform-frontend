import React from 'react';
import { AdvanceModelType } from '@/store/data.service.types';

interface InnerSummaryResultsProps {
  innerSummary: { [key: string]: { 
    ave?: number;
    r_squared?: number;
    r_squared_adj?: number;
    block_communality?: number;
    mean_redundancy?: number;
    type?: string;
  } };
  questions?: any[];
  mappingQuestionToVariable?: { [key: string]: string };
  model?: AdvanceModelType | null;
  className?: string;
}

export const InnerSummaryResults: React.FC<InnerSummaryResultsProps> = ({
  innerSummary,
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

  if (!innerSummary || Object.keys(innerSummary).length === 0) {
    return null;
  }

  const getAVEStatus = (ave: number) => {
    if (ave >= 0.5) return { status: 'Đạt', color: 'text-green-600', bgColor: 'bg-green-50' };
    return { status: 'Chưa đạt', color: 'text-red-600', bgColor: 'bg-red-50' };
  };

  const getRSquaredStatus = (r2: number) => {
    if (r2 >= 0.67) return { status: 'Mạnh', color: 'text-green-600', bgColor: 'bg-green-50' };
    if (r2 >= 0.33) return { status: 'Trung bình', color: 'text-blue-600', bgColor: 'bg-blue-50' };
    if (r2 >= 0.19) return { status: 'Yếu', color: 'text-yellow-600', bgColor: 'bg-yellow-50' };
    return { status: 'Rất yếu', color: 'text-red-600', bgColor: 'bg-red-50' };
  };

  const constructs = Object.keys(innerSummary);

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${className}`}>
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Inner Summary - Tóm tắt mô hình cấu trúc
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Các chỉ số đánh giá chất lượng mô hình: AVE ≥ 0.5 (giá trị hội tụ), R² đánh giá khả năng giải thích.
        </p>
      </div>

      <div className="overflow-x-auto max-h-[320px] overflow-y-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Construct
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                AVE
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                R²
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                R² Adj
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Block Communality
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Mean Redundancy
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {constructs.map((construct) => {
              const { displayName } = getVariableDisplayInfo(construct);
              const data = innerSummary[construct];
              const ave = data.ave || 0;
              const r2 = data.r_squared || 0;
              const r2Adj = data.r_squared_adj || 0;
              const blockCommunality = data.block_communality || 0;
              const meanRedundancy = data.mean_redundancy || 0;
              const type = data.type || 'Unknown';
              
              const aveStatus = getAVEStatus(ave);
              const r2Status = getRSquaredStatus(r2);
              
              return (
                <tr key={construct} className="hover:bg-gray-50">
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                    {displayName}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-center">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      type === 'Exogenous' 
                        ? 'bg-blue-50 text-blue-600' 
                        : 'bg-purple-50 text-purple-600'
                    }`}>
                      {type === 'Exogenous' ? 'Ngoại sinh' : 'Nội sinh'}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-center">
                    <div className="flex flex-col items-center">
                      <span className={`font-mono ${ave >= 0.5 ? 'text-green-600 font-bold' : 'text-red-600'}`}>
                        {ave.toFixed(3)}
                      </span>
                      <span className={`inline-flex px-1 py-0.5 text-xs font-medium rounded ${aveStatus.bgColor} ${aveStatus.color}`}>
                        {aveStatus.status}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-center">
                    {r2 > 0 ? (
                      <div className="flex flex-col items-center">
                        <span className={`font-mono ${r2 >= 0.33 ? 'text-green-600 font-bold' : r2 >= 0.19 ? 'text-yellow-600' : 'text-red-600'}`}>
                          {r2.toFixed(3)}
                        </span>
                        <span className={`inline-flex px-1 py-0.5 text-xs font-medium rounded ${r2Status.bgColor} ${r2Status.color}`}>
                          {r2Status.status}
                        </span>
                      </div>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-center font-mono">
                    {r2Adj > 0 ? r2Adj.toFixed(3) : '-'}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-center font-mono">
                    {blockCommunality.toFixed(3)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-center font-mono">
                    {meanRedundancy > 0 ? meanRedundancy.toFixed(3) : '-'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
        <div className="flex items-center">
          <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
          <span className="text-gray-600">AVE ≥ 0.5: Đạt giá trị hội tụ</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
          <span className="text-gray-600">R² ≥ 0.67: Mạnh</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
          <span className="text-gray-600">R² ≥ 0.33: Trung bình</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
          <span className="text-gray-600">R² ≥ 0.19: Yếu</span>
        </div>
      </div>

      <div className="mt-4 text-sm text-gray-600">
        <p><strong>AVE (Average Variance Extracted):</strong> Phương sai trích trung bình - đo lường giá trị hội tụ</p>
        <p><strong>R²:</strong> Hệ số xác định - tỷ lệ phương sai của biến phụ thuộc được giải thích bởi các biến độc lập</p>
        <p><strong>Block Communality:</strong> Phần phương sai chung của khối biến quan sát</p>
      </div>
    </div>
  );
};

export default InnerSummaryResults;
