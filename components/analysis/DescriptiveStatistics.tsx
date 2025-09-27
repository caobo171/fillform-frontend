import React from 'react';
import { DescriptiveStatistic } from '@/store/types';
import { AdvanceModelType } from '@/store/data.service.types';

interface DescriptiveStatisticsProps {
  statistics: DescriptiveStatistic[];
  questions?: any[];
  mappingQuestionToVariable?: { [key: string]: string };
  model?: AdvanceModelType | null;
  className?: string;
}

export const DescriptiveStatistics: React.FC<DescriptiveStatisticsProps> = ({
  statistics,
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

  return (
    <div className={`bg-white rounded shadow-sm p-6 border border-gray-100 mb-4 ${className}`}>
      <h3 className="text-md font-bold mb-4">Thống kê mô tả (Descriptive Statistics)</h3>
      <div className="overflow-x-auto max-h-[320px] overflow-y-auto">
        <table className="min-w-full table-auto">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-4 py-1 text-left text-sm">Biến</th>
              <th className="px-4 py-1 text-left text-sm">Mô tả</th>
              <th className="px-4 py-1 text-left text-sm">N</th>
              <th className="px-4 py-1 text-left text-sm">Trung bình</th>
              <th className="px-4 py-1 text-left text-sm">Độ lệch chuẩn</th>
              <th className="px-4 py-1 text-left text-sm">Min</th>
              {/* <th className="px-4 py-1 text-left text-sm">Q25</th> */}
              <th className="px-4 py-1 text-left text-sm">Trung vị</th>
              {/* <th className="px-4 py-1 text-left text-sm">Q75</th> */}
              <th className="px-4 py-1 text-left text-sm">Max</th>
              {/* <th className="px-4 py-1 text-left text-sm">Skewness</th>
              <th className="px-4 py-1 text-left text-sm">Kurtosis</th> */}
            </tr>
          </thead>
          <tbody>
            {statistics
              .sort((a, b) => {
                const displayNameA = getVariableDisplayInfo(a.variable).displayName;
                const displayNameB = getVariableDisplayInfo(b.variable).displayName;
                return displayNameA.localeCompare(displayNameB);
              })
              .map((stat, index) => {
                const { displayName, description } = getVariableDisplayInfo(stat.variable);
                return (
                  <tr key={index} className="border-t">
                    <td className="px-4 py-1 font-medium text-left text-sm">{displayName}</td>
                    <td className="px-4 py-1 text-left text-sm max-w-xs truncate" title={description}>
                      {description}
                    </td>
                    <td className="px-4 py-1 text-left text-sm">{stat.count}</td>
                    <td className="px-4 py-1 text-left text-sm">{stat.mean.toFixed(3)}</td>
                    <td className="px-4 py-1 text-left text-sm">{stat.std.toFixed(3)}</td>
                    <td className="px-4 py-1 text-left text-sm">{stat.min.toFixed(3)}</td>
                    {/* <td className="px-4 py-1 text-left text-sm">{stat.q25.toFixed(3)}</td> */}
                    <td className="px-4 py-1 text-left text-sm">{stat.median.toFixed(3)}</td>
                    {/* <td className="px-4 py-1 text-left text-sm">{stat.q75.toFixed(3)}</td> */}
                    <td className="px-4 py-1 text-left text-sm">{stat.max.toFixed(3)}</td>
                    {/* <td className="px-4 py-1 text-left text-sm">{stat.skewness.toFixed(3)}</td>
                    <td className="px-4 py-1 text-left text-sm">{stat.kurtosis.toFixed(3)}</td> */}
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DescriptiveStatistics;
