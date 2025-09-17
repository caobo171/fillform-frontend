import React from 'react';
import { DescriptiveStatistic } from '@/store/types';

interface DescriptiveStatisticsProps {
  statistics: DescriptiveStatistic[];
  className?: string;
}

export const DescriptiveStatistics: React.FC<DescriptiveStatisticsProps> = ({
  statistics,
  className = ""
}) => {
  return (
    <div className={`bg-white rounded shadow-sm p-6 border border-gray-100 mb-4 ${className}`}>
      <h3 className="text-md font-bold mb-4">Thống kê mô tả (Descriptive Statistics)</h3>
      <div className="overflow-x-auto max-h-[200px] overflow-y-auto">
        <table className="min-w-full table-auto">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-4 py-1 text-left text-sm">Biến</th>
              <th className="px-4 py-1 text-left text-sm">N</th>
              <th className="px-4 py-1 text-left text-sm">Trung bình</th>
              <th className="px-4 py-1 text-left text-sm">Độ lệch chuẩn</th>
              <th className="px-4 py-1 text-left text-sm">Min</th>
              <th className="px-4 py-1 text-left text-sm">Q25</th>
              <th className="px-4 py-1 text-left text-sm">Trung vị</th>
              <th className="px-4 py-1 text-left text-sm">Q75</th>
              <th className="px-4 py-1 text-left text-sm">Max</th>
              <th className="px-4 py-1 text-left text-sm">Skewness</th>
              <th className="px-4 py-1 text-left text-sm">Kurtosis</th>
            </tr>
          </thead>
          <tbody>
            {statistics.map((stat, index) => (
              <tr key={index} className="border-t">
                <td className="px-4 py-1 font-medium text-left text-sm">{stat.variable}</td>
                <td className="px-4 py-1 text-left text-sm">{stat.count}</td>
                <td className="px-4 py-1 text-left text-sm">{stat.mean.toFixed(3)}</td>
                <td className="px-4 py-1 text-left text-sm">{stat.std.toFixed(3)}</td>
                <td className="px-4 py-1 text-left text-sm">{stat.min.toFixed(3)}</td>
                <td className="px-4 py-1 text-left text-sm">{stat.q25.toFixed(3)}</td>
                <td className="px-4 py-1 text-left text-sm">{stat.median.toFixed(3)}</td>
                <td className="px-4 py-1 text-left text-sm">{stat.q75.toFixed(3)}</td>
                <td className="px-4 py-1 text-left text-sm">{stat.max.toFixed(3)}</td>
                <td className="px-4 py-1 text-left text-sm">{stat.skewness.toFixed(3)}</td>
                <td className="px-4 py-1 text-left text-sm">{stat.kurtosis.toFixed(3)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DescriptiveStatistics;
