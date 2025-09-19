'use client'

import { useState } from 'react'
import clsx from 'clsx'
import { AdvanceModelType } from '@/store/data.service.types'
import DescriptiveStatistics from '@/components/analysis/DescriptiveStatistics'
import PearsonCorrelations from '@/components/analysis/PearsonCorrelations'
import CronbachAlphaResults from '@/components/analysis/CronbachAlphaResults'
import EFAResults from '@/components/analysis/EFAResults'
import LinearRegressionResults from '@/components/analysis/LinearRegressionResults'

interface SPSSResultProps {
  basicAnalysis?: {
    descriptive_statistics?: any[];
    pearson_correlations?: any[];
    cronbach_alphas?: any[];
    efa_result?: any;
  };
  linearRegressionAnalysis?: {
    regression_result?: any;
  };
  title?: string;
  className?: string;
  questions?: any[];
  mappingQuestionToVariable?: { [key: string]: string };
  model?: AdvanceModelType | null;
}

const SPSSResult = ({ 
  basicAnalysis,
  linearRegressionAnalysis,
  title,
  className,
  questions = [],
  mappingQuestionToVariable,
  model 
}: SPSSResultProps) => {
  const [activeTab, setActiveTab] = useState(0)

  // Define tabs with specialized components
  const tabs = [
    {
      key: 'descriptive_statistics',
      label: 'Descriptive Statistics',
      hasData: basicAnalysis?.descriptive_statistics && basicAnalysis.descriptive_statistics.length > 0,
      component: <DescriptiveStatistics
        mappingQuestionToVariable={mappingQuestionToVariable}
        model={model}
        questions={questions}
        statistics={basicAnalysis?.descriptive_statistics || []}
      />
    },
    {
      key: 'pearson_correlations',
      label: 'Pearson Correlations',
      hasData: basicAnalysis?.pearson_correlations && basicAnalysis.pearson_correlations.length > 0,
      component: <PearsonCorrelations
        correlations={basicAnalysis?.pearson_correlations || []}
      />
    },
    {
      key: 'cronbach_alphas',
      label: 'Cronbach\'s Alpha',
      hasData: basicAnalysis?.cronbach_alphas && basicAnalysis.cronbach_alphas.length > 0,
      component: <CronbachAlphaResults
        cronbachAlphas={basicAnalysis?.cronbach_alphas || []}
      />
    },
    {
      key: 'efa_result',
      label: 'EFA Results',
      hasData: basicAnalysis?.efa_result && Object.keys(basicAnalysis.efa_result).length > 0,
      component: <EFAResults
        mappingQuestionToVariable={mappingQuestionToVariable}
        model={model}
        questions={questions}
        efaResult={basicAnalysis?.efa_result}
      />
    },
    {
      key: 'linear_regression',
      label: 'Linear Regression',
      hasData: linearRegressionAnalysis?.regression_result && Object.keys(linearRegressionAnalysis.regression_result).length > 0,
      component: <LinearRegressionResults
        regressionResult={linearRegressionAnalysis?.regression_result}
      />
    }
  ].filter(tab => tab.hasData)

  if (tabs.length === 0) {
    return (
      <div className={clsx("bg-white rounded-lg border border-gray-100 p-6", className)}>
        {title && <h3 className="text-md font-semibold mb-4">{title}</h3>}
        <div className="text-center py-8 text-gray-500">
          No SPSS analysis data available
        </div>
      </div>
    )
  }

  return (
    <div className={clsx("bg-white rounded-lg border border-gray-100", className)}>
      {title && (
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
          <p className="text-sm text-gray-600 mt-2">
            Kết quả phân tích thống kê mô tả, tương quan, độ tin cậy và phân tích nhân tố khám phá
          </p>
        </div>
      )}

      {/* Tabs Navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex flex-wrap gap-2 px-6 py-2" aria-label="Tabs">
          {tabs.map((tab, index) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(index)}
              className={clsx(
                "py-2 px-3 border-b-2 font-medium text-sm whitespace-nowrap rounded-t-lg transition-colors",
                activeTab === index
                  ? "border-blue-500 text-blue-600 bg-blue-50"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 hover:bg-gray-50"
              )}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {tabs[activeTab]?.component}
      </div>
    </div>
  )
}

export default SPSSResult
