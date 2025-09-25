import React from 'react';
import { EFAResult } from '@/store/types';
import { AdvanceModelType } from '@/store/data.service.types';

interface EFAResultsProps {
  efaResult: EFAResult;
  questions?: any[];
  mappingQuestionToVariable?: { [key: string]: string };
  model?: AdvanceModelType | null;
  className?: string;
}

export const EFAResults: React.FC<EFAResultsProps> = ({
  efaResult,
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

  // Function to get variable display info (name with order and description)
  const getVariableDisplayInfo = (questionId: string) => {
    if (!model || !questions.length) {
      return { displayName: questionId, description: '' };
    }

    let variableName = '';
    let description = '';

    // Find the question by ID
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

  // Get all unique variables and sort them by their primary factor contribution
  const allVariables = (() => {
    const variables = Array.from(new Set(
      efaResult.factors.flatMap(factor => Object.keys(factor.loadings))
    ));

    // For each variable, find which factor it loads highest on
    const variableFactorAssignments = variables.map(variable => {
      let maxLoading = 0;
      let primaryFactor = 0;

      efaResult.factors.forEach((factor, factorIndex) => {
        const loading = Math.abs(factor.loadings[variable] || 0);
        if (loading > Math.abs(maxLoading)) {
          maxLoading = factor.loadings[variable] || 0;
          primaryFactor = factorIndex;
        }
      });

      return {
        variable,
        primaryFactor,
        maxLoading: Math.abs(maxLoading)
      };
    });

    // Sort by primary factor, then by loading strength within each factor
    variableFactorAssignments.sort((a, b) => {
      if (a.primaryFactor !== b.primaryFactor) {
        return a.primaryFactor - b.primaryFactor;
      }
      return b.maxLoading - a.maxLoading; // Higher loadings first
    });

    return variableFactorAssignments.map(item => item.variable);
  })();

  return (
    <div className={`bg-white rounded shadow-sm p-6 border border-gray-100 mb-6 ${className}`}>
      <h3 className="text-md font-bold mb-4">Phân tích nhân tố khám phá (EFA)</h3>

      {/* EFA Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-50 p-4 rounded">
          <div className="text-sm text-gray-600">KMO Measure</div>
          <div className="text-md font-semibold">{efaResult.kmo_measure.toFixed(3)}</div>
        </div>
        <div className="bg-gray-50 p-4 rounded">
          <div className="text-sm text-gray-600">Bartlett's Test</div>
          <div className="text-md font-semibold">{efaResult.bartlett_test_statistic.toFixed(2)}</div>
        </div>
        <div className="bg-gray-50 p-4 rounded">
          <div className="text-sm text-gray-600">Bartlett's p-value</div>
          <div className="text-md font-semibold">
            {efaResult.bartlett_p_value < 0.001 ? '<0.001' : efaResult.bartlett_p_value.toFixed(3)}
          </div>
        </div>
        <div className="bg-gray-50 p-4 rounded">
          <div className="text-sm text-gray-600">Tổng phương sai giải thích</div>
          <div className="text-md font-semibold">{efaResult.total_variance_explained.toFixed(1)}%</div>
        </div>
      </div>

      {/* Factor Loadings */}
      {efaResult.factors && efaResult.factors.length > 0 && (
        <div>
          <h4 className="text-md font-semibold mb-3">Ma trận nhân tố</h4>
          <div className="overflow-x-auto max-h-[560px] overflow-y-auto">
            <table className="min-w-full table-auto">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-2 text-left">Biến</th>
                  {efaResult.factors.map((factor, index) => (
                    <th key={index} className="px-4 py-2 text-left text-sm">
                      Nhân tố {factor.factor_number}
                      <div className="text-xs text-gray-500">
                        (λ={factor.eigenvalue.toFixed(2)}, {factor.variance_explained.toFixed(1)}%)
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {allVariables.map((variable, varIndex) => {
                  const { displayName } = getVariableDisplayInfo(variable);
                  return (
                    <tr key={varIndex} className="border-t">
                      <td className="px-4 py-2 font-medium">{displayName}</td>
                      {efaResult.factors.map((factor, factorIndex) => (
                        <td key={factorIndex} className="px-4 py-2 text-left text-sm">
                          {factor.loadings[variable] ? (
                            <span className={`${Math.abs(factor.loadings[variable]) >= 0.5 ? 'font-bold text-green-600' : 'text-gray-400'}`}>
                              {factor.loadings[variable].toFixed(3)}
                            </span>
                          ) : '-'}
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="mt-4 text-sm text-gray-600">
            <p><span className="font-semibold text-green-600">Hệ số tải ≥ 0.5:</span> Có ý nghĩa thống kê</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default EFAResults;
