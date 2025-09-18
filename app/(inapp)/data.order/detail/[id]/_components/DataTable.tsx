'use client'

import { useState } from 'react'
import clsx from 'clsx'

interface DataTableProps {
  data: Record<string, any>
  title?: string
  className?: string
}

interface TabData {
  key: string
  label: string
  data: Record<string, any>
}

const DataTable = ({ data, title, className }: DataTableProps) => {
  const [activeTab, setActiveTab] = useState(0)

  // Define the tabs based on the SmartPLS analysis structure
  const tabs: TabData[] = [
    {
      key: 'raw_crossloading',
      label: 'Cross Loadings',
      data: data?.raw_crossloading || {}
    },
    {
      key: 'raw_path_coefficient',
      label: 'Path Coefficients',
      data: data?.raw_path_coefficient || {}
    },
    {
      key: 'raw_effects',
      label: 'Effects',
      data: data?.raw_effects || {}
    },
    {
      key: 'raw_inner_model',
      label: 'Inner Model',
      data: data?.raw_inner_model || {}
    },
    {
      key: 'raw_inner_summary',
      label: 'Inner Summary',
      data: data?.raw_inner_summary || {}
    },
    {
      key: 'raw_outer_model',
      label: 'Outer Model',
      data: data?.raw_outer_model || {}
    },
    {
      key: 'raw_unidimensionality',
      label: 'Unidimensionality',
      data: data?.raw_unidimensionality || {}
    }
  ].filter(tab => Object.keys(tab.data).length > 0) // Only show tabs with data

  const renderTable = (tabData: Record<string, any>) => {
    if (!tabData || Object.keys(tabData).length === 0) {
      return (
        <div className="text-center py-8 text-gray-500">
          No data available for this metric
        </div>
      )
    }

    // Get all unique column headers from the data
    const allColumns = new Set<string>()
    Object.values(tabData).forEach((row: any) => {
      if (typeof row === 'object' && row !== null) {
        Object.keys(row).forEach(key => allColumns.add(key))
      }
    })

    const columns = Array.from(allColumns)
    const rows = Object.keys(tabData)

    // Handle simple key-value pairs (like effects, inner_model)
    if (columns.length === 0) {
      const firstRow = Object.values(tabData)[0]
      if (typeof firstRow === 'object' && firstRow !== null) {
        const keys = Object.keys(firstRow)
        return (
          <div className="overflow-x-auto max-h-96 overflow-y-auto border border-gray-200 rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 sticky top-0 z-10">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Item
                  </th>
                  {keys.map((key) => (
                    <th key={key} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {rows.map((rowKey) => (
                  <tr key={rowKey} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-left">
                      {rowKey}
                    </td>
                    {keys.map((key) => (
                      <td key={key} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-left">
                        {typeof tabData[rowKey][key] === 'number' 
                          ? Number(tabData[rowKey][key]).toFixed(4)
                          : tabData[rowKey][key]?.toString() || '-'
                        }
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      }
    }

    // Handle matrix-like data (like crossloading, path_coefficient)
    return (
      <div className="overflow-x-auto max-h-96 overflow-y-auto border border-gray-200 rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50 sticky top-0 z-10">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Variable
              </th>
              {columns.map((col) => (
                <th key={col} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {rows.map((rowKey) => (
              <tr key={rowKey} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-left">
                  {rowKey}
                </td>
                {columns.map((col) => (
                  <td key={col} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-left">
                    {typeof tabData[rowKey]?.[col] === 'number' 
                      ? Number(tabData[rowKey][col]).toFixed(4)
                      : tabData[rowKey]?.[col]?.toString() || '-'
                    }
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  if (tabs.length === 0) {
    return (
      <div className={clsx("bg-white rounded-lg border border-gray-100 p-6", className)}>
        {title && <h3 className="text-md font-semibold mb-4">{title}</h3>}
        <div className="text-center py-8 text-gray-500">
          No analysis data available
        </div>
      </div>
    )
  }

  return (
    <div className={clsx("bg-white rounded-lg border border-gray-100", className)}>
      {title && (
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-md font-semibold">{title}</h3>
        </div>
      )}
      
      {/* Tabs Navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-6" aria-label="Tabs">
          {tabs.map((tab, index) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(index)}
              className={clsx(
                "py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap",
                activeTab === index
                  ? "border-primary-500 text-primary-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              )}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {tabs[activeTab] && renderTable(tabs[activeTab].data)}
      </div>
    </div>
  )
}

export default DataTable