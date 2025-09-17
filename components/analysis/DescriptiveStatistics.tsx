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
    <div className={`bg-white rounded shadow-sm p-6 border border-gray-100 mb-6 ${className}`}>
      <h3 className="text-lg font-bold mb-4">Thống kê mô tả (Descriptive Statistics)</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full table-auto">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-4 py-2 text-left">Biến</th>
              <th className="px-4 py-2 text-right">N</th>
              <th className="px-4 py-2 text-right">Trung bình</th>
              <th className="px-4 py-2 text-right">Độ lệch chuẩn</th>
              <th className="px-4 py-2 text-right">Min</th>
              <th className="px-4 py-2 text-right">Q25</th>
              <th className="px-4 py-2 text-right">Trung vị</th>
              <th className="px-4 py-2 text-right">Q75</th>
              <th className="px-4 py-2 text-right">Max</th>
              <th className="px-4 py-2 text-right">Skewness</th>
              <th className="px-4 py-2 text-right">Kurtosis</th>
            </tr>
          </thead>
          <tbody>
            {statistics.map((stat, index) => (
              <tr key={index} className="border-t">
                <td className="px-4 py-2 font-medium">{stat.variable}</td>
                <td className="px-4 py-2 text-right">{stat.count}</td>
                <td className="px-4 py-2 text-right">{stat.mean.toFixed(3)}</td>
                <td className="px-4 py-2 text-right">{stat.std.toFixed(3)}</td>
                <td className="px-4 py-2 text-right">{stat.min.toFixed(3)}</td>
                <td className="px-4 py-2 text-right">{stat.q25.toFixed(3)}</td>
                <td className="px-4 py-2 text-right">{stat.median.toFixed(3)}</td>
                <td className="px-4 py-2 text-right">{stat.q75.toFixed(3)}</td>
                <td className="px-4 py-2 text-right">{stat.max.toFixed(3)}</td>
                <td className="px-4 py-2 text-right">{stat.skewness.toFixed(3)}</td>
                <td className="px-4 py-2 text-right">{stat.kurtosis.toFixed(3)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DescriptiveStatistics;
