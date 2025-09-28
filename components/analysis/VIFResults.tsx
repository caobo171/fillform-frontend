import React from 'react';
import { AdvanceModelType } from '@/store/data.service.types';

interface VIFResultsProps {
  vifResults: {
    inner_vif: {
      [variable: string]: {
        [variable: string]: number
      }
    },
    outer_vif: {
      [variable: string]: number
    }
  };
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
  const [activeTab, setActiveTab] = React.useState<'outer' | 'inner'>('outer');

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

  if (!vifResults || (!vifResults.outer_vif && !vifResults.inner_vif)) {
    return null;
  }

  const getVIFInterpretation = (vif: number) => {
    if (vif < 3) return { level: 'Tốt', color: 'text-green-600', bgColor: 'bg-green-50' };
    if (vif < 5) return { level: 'Chấp nhận được', color: 'text-yellow-600', bgColor: 'bg-yellow-50' };
    if (vif < 10) return { level: 'Cảnh báo', color: 'text-orange-600', bgColor: 'bg-orange-50' };
    return { level: 'Có vấn đề', color: 'text-red-600', bgColor: 'bg-red-50' };
  };

  // Render VIF table for outer model (indicators within constructs)
  const renderOuterVIF = () => {
    if (!vifResults.outer_vif || Object.keys(vifResults.outer_vif).length === 0) {
      return <div className="text-center py-8 text-gray-500">Không có dữ liệu Outer VIF</div>;
    }

    return (
      <div className="space-y-6">
        {Object.entries(vifResults.outer_vif).map(([construct, indicators]) => {
          const sortedIndicators = Object.entries(indicators).sort(([, a], [, b]) => b - a);

          return (
            <div key={construct} className="border border-gray-200 rounded-lg">
              <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                <h4 className="text-sm font-medium text-gray-900">Construct: {construct}</h4>
                <p className="text-xs text-gray-600 mt-1">VIF giữa các chỉ số đo lường trong cùng một khái niệm</p>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Indicator
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
                    {sortedIndicators.map(([indicator, vif]) => {
                      const { displayName } = getVariableDisplayInfo(indicator);
                      const interpretation = getVIFInterpretation(vif);

                      return (
                        <tr key={indicator} className="hover:bg-gray-50">
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                            {displayName}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-center">
                            <span className="text-sm font-medium text-gray-900">
                              {typeof vif === 'number' ? vif.toFixed(3) : 'N/A'}
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
            </div>
          );
        })}
      </div>
    );
  };

  // Render VIF table for inner model (constructs in structural model)
  const renderInnerVIF = () => {
    if (!vifResults.inner_vif || Object.keys(vifResults.inner_vif).length === 0) {
      return <div className="text-center py-8 text-gray-500">Không có dữ liệu Inner VIF</div>;
    }

    return (
      <div className="space-y-6">
        {Object.entries(vifResults.inner_vif).map(([targetConstruct, predictors]) => {
          const sortedPredictors = Object.entries(predictors).sort(([, a], [, b]) => b - a);

          return (
            <div key={targetConstruct} className="border border-gray-200 rounded-lg">
              <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                <h4 className="text-sm font-medium text-gray-900">Target: {targetConstruct}</h4>
                <p className="text-xs text-gray-600 mt-1">VIF giữa các khái niệm dự đoán cho khái niệm đích này</p>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Predictor Construct
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
                    {sortedPredictors.map(([predictor, vif]) => {
                      const interpretation = getVIFInterpretation(vif);

                      return (
                        <tr key={predictor} className="hover:bg-gray-50">
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                            {predictor}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-center">
                            <span className="text-sm font-medium text-gray-900">
                              {typeof vif === 'number' ? vif.toFixed(3) : 'N/A'}
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
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${className}`}>
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          VIF (Variance Inflation Factor)
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Kiểm tra hiện tượng đa cộng tuyến. VIF &lt; 5 là chấp nhận được, VIF &lt; 3 là tốt.
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('outer')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'outer'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
            >
              Outer VIF
              <span className="ml-2 text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                Measurement Model
              </span>
            </button>
            <button
              onClick={() => setActiveTab('inner')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'inner'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
            >
              Inner VIF
              <span className="ml-2 text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                Structural Model
              </span>
            </button>
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-h-[400px] overflow-y-auto">
        {activeTab === 'outer' ? renderOuterVIF() : renderInnerVIF()}
      </div>

      {/* Legend */}
      <div className="mt-6 flex flex-wrap gap-4 text-xs">
        <div className="flex items-center">
          <div className="w-3 h-3 bg-green-100 rounded mr-1"></div>
          <span className="text-green-600">Tốt (&lt; 3)</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-yellow-100 rounded mr-1"></div>
          <span className="text-yellow-600">Chấp nhận được (3-5)</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-orange-100 rounded mr-1"></div>
          <span className="text-orange-600">Cảnh báo (5-10)</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-red-100 rounded mr-1"></div>
          <span className="text-red-600">Có vấn đề (&gt; 10)</span>
        </div>
      </div>
    </div>
  );
};

export default VIFResults;
