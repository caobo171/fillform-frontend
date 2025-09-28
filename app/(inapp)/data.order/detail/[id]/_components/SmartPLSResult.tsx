'use client'

import { useState } from 'react'
import clsx from 'clsx'
import { AdvanceModelType } from '@/store/data.service.types'
import { type SmartPLSResult } from '@/store/types'
import HTMTResults from '@/components/analysis/HTMTResults'
import FornellLarckerResults from '@/components/analysis/FornellLarckerResults'
import VIFResults from '@/components/analysis/VIFResults'
import EffectSizeResults from '@/components/analysis/EffectSizeResults'
import OuterModelResults from '@/components/analysis/OuterModelResults'
import CrossLoadingsResults from '@/components/analysis/CrossLoadingsResults'
import InnerSummaryResults from '@/components/analysis/InnerSummaryResults'
import UnidimensionalityResults from '@/components/analysis/UnidimensionalityResults'
import PathCoefficientsResults from '@/components/analysis/PathCoefficientsResults'
import EffectsResults from '@/components/analysis/EffectsResults'
import InnerModelResults from '@/components/analysis/InnerModelResults'

interface SmartPLSResultProps {
  data: SmartPLSResult
  title?: string
  className?: string,
  questions?: any[];
  mappingQuestionToVariable?: { [key: string]: string };
  model?: AdvanceModelType | null;
}

interface TabData {
  key: string,
  label: string,
  data: Record<string, any>
}

const SmartPLSResult = ({ 
  data,
  title,
  className,
  questions = [],
  mappingQuestionToVariable,
  model }: SmartPLSResultProps) => {
  const [activeTab, setActiveTab] = useState(0)

  // Define tabs with specialized components
  const tabs = [
    {
      key: 'outer_model',
      label: 'Outer Model',
      hasData: data?.raw_outer_model && Object.keys(data.raw_outer_model).length > 0,
      component: <OuterModelResults 
        outerModel={data?.raw_outer_model || {}} 
        questions={questions}
        mappingQuestionToVariable={mappingQuestionToVariable}
        model={model}
      />
    },
    {
      key: 'cross_loadings',
      label: 'Cross Loadings',
      hasData: data?.raw_crossloadings && Object.keys(data.raw_crossloadings).length > 0,
      component: <CrossLoadingsResults 
        crossLoadings={data?.raw_crossloadings || {}} 
        questions={questions}
        mappingQuestionToVariable={mappingQuestionToVariable}
        model={model}
      />
    },
    {
      key: 'unidimensionality',
      label: 'Reliability',
      hasData: data?.raw_unidimensionality && Object.keys(data.raw_unidimensionality).length > 0,
      component: <UnidimensionalityResults 
        unidimensionality={data?.raw_unidimensionality || {}} 
        questions={questions}
        mappingQuestionToVariable={mappingQuestionToVariable}
        model={model}
      />
    },
    {
      key: 'inner_summary',
      label: 'Inner Summary',
      hasData: data?.raw_inner_summary && Object.keys(data.raw_inner_summary).length > 0,
      component: <InnerSummaryResults 
        innerSummary={data?.raw_inner_summary || {}} 
        questions={questions}
        mappingQuestionToVariable={mappingQuestionToVariable}
        model={model}
      />
    },
    // {
    //   key: 'path_coefficients',
    //   label: 'Path Coefficients',
    //   hasData: data?.raw_path_coefficients && Object.keys(data.raw_path_coefficients).length > 0,
    //   component: <PathCoefficientsResults 
    //     pathCoefficients={data?.raw_path_coefficients || {}} 
    //     questions={questions}
    //     mappingQuestionToVariable={mappingQuestionToVariable}
    //     model={model}
    //   />
    // },
    {
      key: 'inner_model',
      label: 'Significance Testing',
      hasData: data?.raw_inner_model && Object.keys(data.raw_inner_model).length > 0,
      component: <InnerModelResults 
        innerModel={data?.raw_inner_model || {}} 
        questions={questions}
        mappingQuestionToVariable={mappingQuestionToVariable}
        model={model}
      />
    },
    {
      key: 'effects',
      label: 'Effects Analysis',
      hasData: data?.raw_effects && Object.keys(data.raw_effects).length > 0,
      component: <EffectsResults 
        effects={data?.raw_effects || {}} 
        questions={questions}
        mappingQuestionToVariable={mappingQuestionToVariable}
        model={model}
      />
    },
    {
      key: 'htmt',
      label: 'HTMT',
      hasData: data?.raw_htmt && Object.keys(data.raw_htmt).length > 0,
      component: <HTMTResults 
        htmtMatrix={data?.raw_htmt || {}} 
        questions={questions}
        mappingQuestionToVariable={mappingQuestionToVariable}
        model={model}
      />
    },
    // {
    //   key: 'fornell_larcker',
    //   label: 'Fornell-Larcker',
    //   hasData: data?.raw_fornell_larcker && Object.keys(data.raw_fornell_larcker).length > 0,
    //   component: <FornellLarckerResults 
    //     fornellLarckerMatrix={data?.raw_fornell_larcker || {}} 
    //     questions={questions}
    //     mappingQuestionToVariable={mappingQuestionToVariable}
    //     model={model}
    //   />
    // },
    {
      key: 'vif',
      label: 'VIF',
      hasData: data?.raw_vif?.inner_vif && data?.raw_vif?.outer_vif,
      component: <VIFResults 
        vifResults={data?.raw_vif} 
        questions={questions}
        mappingQuestionToVariable={mappingQuestionToVariable}
        model={model}
      />
    },
    // {
    //   key: 'effect_size',
    //   label: 'Effect Size (f²)',
    //   hasData: data?.raw_f_squared && Object.keys(data.raw_f_squared).length > 0,
    //   component: <EffectSizeResults 
    //     effectSizeResults={data?.raw_f_squared || {}} 
    //     questions={questions}
    //     mappingQuestionToVariable={mappingQuestionToVariable}
    //     model={model}
    //   />
    // }
  ].filter(tab => tab.hasData)

  if (tabs.length === 0) {
    return (
      <div className={clsx("bg-white rounded-lg border border-gray-100 p-6", className)}>
        {title && <h3 className="text-md font-semibold mb-4">{title}</h3>}
        <div className="text-center py-8 text-gray-500">
          No SmartPLS analysis data available
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
            Kết quả phân tích PLS-SEM với các chỉ số đánh giá độ tin cậy và tính hợp lệ của mô hình
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

export default SmartPLSResult