import React from 'react';
import { AdvanceModelType } from '@/store/data.service.types';

interface EffectsResultsProps {
  effects: { [key: string]: { 
    direct?: number;
    indirect?: number;
    total?: number;
    from?: string;
    to?: string;
  } };
  questions?: any[];
  mappingQuestionToVariable?: { [key: string]: string };
  model?: AdvanceModelType | null;
  className?: string;
}

export const EffectsResults: React.FC<EffectsResultsProps> = ({
  effects,
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

  if (!effects || Object.keys(effects).length === 0) {
    return null;
  }

  const getEffectStatus = (effect: number) => {
    const absEffect = Math.abs(effect);
    if (absEffect >= 0.5) return { 
      color: effect > 0 ? 'text-green-600' : 'text-red-600', 
      strength: 'font-bold',
      level: 'Mạnh'
    };
    if (absEffect >= 0.3) return { 
      color: effect > 0 ? 'text-blue-600' : 'text-orange-600', 
      strength: 'font-medium',
      level: 'Trung bình'
    };
    if (absEffect >= 0.1) return { 
      color: 'text-gray-600', 
      strength: '',
      level: 'Yếu'
    };
    return { 
      color: 'text-gray-400', 
      strength: '',
      level: 'Rất yếu'
    };
  };

  const pathways = Object.keys(effects);

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${className}`}>
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Effects - Hiệu ứng tổng hợp
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Phân tích hiệu ứng trực tiếp, gián tiếp và tổng hợp giữa các khái niệm trong mô hình.
        </p>
      </div>

      <div className="overflow-x-auto max-h-[320px] overflow-y-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Pathway
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Direct Effect
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Indirect Effect
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total Effect
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Mediation
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {pathways.map((pathway) => {
              const data = effects[pathway];
              const direct = data.direct || 0;
              const indirect = data.indirect || 0;
              const total = data.total || 0;
              const from = data.from || '';
              const to = data.to || '';
              
              // Create display pathway
              let displayPathway = pathway;
              if (from && to) {
                const fromDisplay = getVariableDisplayInfo(from).displayName;
                const toDisplay = getVariableDisplayInfo(to).displayName;
                displayPathway = `${fromDisplay} → ${toDisplay}`;
              }
              
              const directStatus = getEffectStatus(direct);
              const indirectStatus = getEffectStatus(indirect);
              const totalStatus = getEffectStatus(total);
              
              // Determine mediation type
              const getMediationType = (direct: number, indirect: number) => {
                const hasDirectEffect = Math.abs(direct) > 0.1;
                const hasIndirectEffect = Math.abs(indirect) > 0.1;
                
                if (hasDirectEffect && hasIndirectEffect) {
                  return { type: 'Partial', color: 'text-blue-600', bgColor: 'bg-blue-50' };
                } else if (!hasDirectEffect && hasIndirectEffect) {
                  return { type: 'Full', color: 'text-green-600', bgColor: 'bg-green-50' };
                } else if (hasDirectEffect && !hasIndirectEffect) {
                  return { type: 'No mediation', color: 'text-gray-600', bgColor: 'bg-gray-50' };
                } else {
                  return { type: 'None', color: 'text-gray-400', bgColor: 'bg-gray-50' };
                }
              };
              
              const mediation = getMediationType(direct, indirect);
              
              return (
                <tr key={pathway} className="hover:bg-gray-50">
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                    {displayPathway}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-center">
                    <div className="flex flex-col items-center">
                      <span className={`font-mono ${directStatus.color} ${directStatus.strength}`}>
                        {direct.toFixed(3)}
                      </span>
                      <span className="text-xs text-gray-500">{directStatus.level}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-center">
                    <div className="flex flex-col items-center">
                      <span className={`font-mono ${indirectStatus.color} ${indirectStatus.strength}`}>
                        {indirect.toFixed(3)}
                      </span>
                      <span className="text-xs text-gray-500">{indirectStatus.level}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-center">
                    <div className="flex flex-col items-center">
                      <span className={`font-mono ${totalStatus.color} ${totalStatus.strength}`}>
                        {total.toFixed(3)}
                      </span>
                      <span className="text-xs text-gray-500">{totalStatus.level}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-center">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${mediation.bgColor} ${mediation.color}`}>
                      {mediation.type}
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
          <span className="text-gray-600">Full Mediation: Chỉ có hiệu ứng gián tiếp</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
          <span className="text-gray-600">Partial Mediation: Có cả 2 hiệu ứng</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-gray-500 rounded-full mr-2"></div>
          <span className="text-gray-600">No Mediation: Chỉ có hiệu ứng trực tiếp</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
          <span className="text-gray-600">|Effect| ≥ 0.5: Hiệu ứng mạnh</span>
        </div>
      </div>

      <div className="mt-4 text-sm text-gray-600">
        <p><strong>Direct Effect:</strong> Hiệu ứng trực tiếp - ảnh hưởng trực tiếp giữa hai khái niệm</p>
        <p><strong>Indirect Effect:</strong> Hiệu ứng gián tiếp - ảnh hưởng thông qua các biến trung gian</p>
        <p><strong>Total Effect:</strong> Hiệu ứng tổng hợp = Hiệu ứng trực tiếp + Hiệu ứng gián tiếp</p>
        <p><strong>Mediation:</strong> Vai trò trung gian của các biến trong mô hình</p>
      </div>
    </div>
  );
};

export default EffectsResults;
