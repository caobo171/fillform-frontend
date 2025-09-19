import React from 'react';
import { AdvanceModelType } from '@/store/data.service.types';

interface UnidimensionalityResultsProps {
  unidimensionality: { [key: string]: { 
    cronbach_alpha?: number;
    dillon_goldstein_rho?: number;
    eig_1st?: number;
    eig_2nd?: number;
    mode?: string;
    mvs?: number;
  } };
  questions?: any[];
  mappingQuestionToVariable?: { [key: string]: string };
  model?: AdvanceModelType | null;
  className?: string;
}

export const UnidimensionalityResults: React.FC<UnidimensionalityResultsProps> = ({
  unidimensionality,
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

  if (!unidimensionality || Object.keys(unidimensionality).length === 0) {
    return null;
  }

  const getReliabilityStatus = (value: number, threshold: number = 0.7) => {
    if (value >= 0.9) return { status: 'Xuất sắc', color: 'text-green-600', bgColor: 'bg-green-50' };
    if (value >= 0.8) return { status: 'Tốt', color: 'text-green-600', bgColor: 'bg-green-50' };
    if (value >= threshold) return { status: 'Chấp nhận được', color: 'text-yellow-600', bgColor: 'bg-yellow-50' };
    return { status: 'Thấp', color: 'text-red-600', bgColor: 'bg-red-50' };
  };

  const constructs = Object.keys(unidimensionality);

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${className}`}>
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Unidimensionality - Độ tin cậy thang đo
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Đánh giá độ tin cậy và tính nhất quán nội tại của thang đo. Cronbach's Alpha và Composite Reliability ≥ 0.7 là chấp nhận được.
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
                Mode
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                MVs
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Cronbach's α
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Composite Reliability
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                1st Eigenvalue
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                2nd Eigenvalue
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {constructs.map((construct) => {
              const { displayName } = getVariableDisplayInfo(construct);

              console.log('displayName', displayName, construct)
              const data = unidimensionality[construct];
              const cronbachAlpha = data.cronbach_alpha || 0;
              const compositeReliability = data.dillon_goldstein_rho || 0;
              const eig1st = data.eig_1st || 0;
              const eig2nd = data.eig_2nd || 0;
              const mode = data.mode || 'A';
              const mvs = data.mvs || 0;
              
              const cronbachStatus = getReliabilityStatus(cronbachAlpha);
              const crStatus = getReliabilityStatus(compositeReliability);
              
              return (
                <tr key={construct} className="hover:bg-gray-50">
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                    {displayName}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-center">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      mode === 'A' 
                        ? 'bg-blue-50 text-blue-600' 
                        : 'bg-purple-50 text-purple-600'
                    }`}>
                      {mode}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-center font-mono">
                    {mvs}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-center">
                    <div className="flex flex-col items-center">
                      <span className={`font-mono ${cronbachAlpha >= 0.7 ? 'text-green-600 font-bold' : 'text-red-600'}`}>
                        {cronbachAlpha.toFixed(3)}
                      </span>
                      <span className={`inline-flex px-1 py-0.5 text-xs font-medium rounded ${cronbachStatus.bgColor} ${cronbachStatus.color}`}>
                        {cronbachStatus.status}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-center">
                    <div className="flex flex-col items-center">
                      <span className={`font-mono ${compositeReliability >= 0.7 ? 'text-green-600 font-bold' : 'text-red-600'}`}>
                        {compositeReliability.toFixed(3)}
                      </span>
                      <span className={`inline-flex px-1 py-0.5 text-xs font-medium rounded ${crStatus.bgColor} ${crStatus.color}`}>
                        {crStatus.status}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-center font-mono">
                    <span className={eig1st > 1 ? 'text-green-600 font-bold' : 'text-gray-600'}>
                      {eig1st.toFixed(3)}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-center font-mono">
                    <span className={eig2nd < 1 ? 'text-green-600' : 'text-orange-600'}>
                      {eig2nd.toFixed(3)}
                    </span>
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
          <span className="text-gray-600">α, CR ≥ 0.9: Xuất sắc</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
          <span className="text-gray-600">α, CR ≥ 0.8: Tốt</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
          <span className="text-gray-600">α, CR ≥ 0.7: Chấp nhận được</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
          <span className="text-gray-600">α, CR &lt; 0.7: Thấp</span>
        </div>
      </div>

      <div className="mt-4 text-sm text-gray-600">
        <p><strong>Mode A:</strong> Reflective measurement model (mô hình đo lường phản ánh)</p>
        <p><strong>Mode B:</strong> Formative measurement model (mô hình đo lường hình thành)</p>
        <p><strong>MVs:</strong> Số lượng biến quan sát (Manifest Variables)</p>
        <p><strong>Cronbach's Alpha:</strong> Độ tin cậy nội tại, đo lường tính nhất quán của thang đo</p>
        <p><strong>Composite Reliability:</strong> Độ tin cậy tổng hợp, chính xác hơn Cronbach's Alpha</p>
        <p><strong>Eigenvalues:</strong> Giá trị riêng thứ nhất &gt; 1 và thứ hai &lt; 1 cho thấy tính đơn hướng tốt</p>
      </div>
    </div>
  );
};

export default UnidimensionalityResults;
