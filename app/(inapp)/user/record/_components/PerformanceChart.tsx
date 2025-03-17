import {
  BarController,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  ChartOptions,
  Legend,
  LineController,
  LineElement,
  LinearScale,
  PointElement,
  Title,
  Tooltip,
} from 'chart.js';
import React, { useState } from 'react';
import { Chart } from 'react-chartjs-2';
import { twMerge } from 'tailwind-merge';

import { Select, SelectProps } from '@/components/common';
import { TimeFilter } from '@/hooks/RecordAnalyze/constants';
import { useRecordAnalyze } from '@/hooks/RecordAnalyze/useRecordAnalyze';
import { RawUserStats } from '@/store/types';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  LineController,
  BarController
);

const chartOptions: ChartOptions = {
  responsive: true,
  plugins: {
    legend: {
      position: 'top' as const,
    },
  },
};

const pointsChartOptions: ChartOptions = {
  ...chartOptions,
  scales: {
    totalPoints: {
      type: 'linear',
      display: true,
      position: 'left',
    },
    points: {
      type: 'linear',
      display: true,
      position: 'right',

      // grid line settings
      grid: {
        drawOnChartArea: false, // only want the grid lines for one axis to show up
      },
    },
  },
};

const listenedTimeChartOptions: ChartOptions = {
  ...chartOptions,
  scales: {
    totalListenedTime: {
      type: 'linear',
      display: true,
      position: 'left',
    },
    listenedTime: {
      type: 'linear',
      display: true,
      position: 'right',

      // grid line settings
      grid: {
        drawOnChartArea: false, // only want the grid lines for one axis to show up
      },
    },
  },
};

const averageAccuracyChartOptions: ChartOptions = {
  ...chartOptions,
  scales: {
    totalAverageAccuracy: {
      type: 'linear',
      display: true,
      position: 'left',
    },
    averageAccuracy: {
      type: 'linear',
      display: true,
      position: 'right',

      // grid line settings
      grid: {
        drawOnChartArea: false, // only want the grid lines for one axis to show up
      },
    },
  },
};

const wordsChartOptions: ChartOptions = {
  ...chartOptions,
  scales: {
    totalCorrectWords: {
      type: 'linear',
      display: true,
      position: 'left',
    },
    correctWords: {
      type: 'linear',
      display: true,
      position: 'right',

      // grid line settings
      grid: {
        drawOnChartArea: false, // only want the grid lines for one axis to show up
      },
    },
  },
};

type PerformanceProps = {
  data?: RawUserStats;
  className?: string;
};

const FilterOptions: SelectProps['options'] = [
  { label: '7 ngày vừa qua', value: TimeFilter.SevenDays },
  { label: '8 tuần vừa qua', value: TimeFilter.EightWeeks },
  { label: '12 tháng vừa qua', value: TimeFilter.TwelveMonths },
  { label: 'Tất cả', value: TimeFilter.All },
];

export function PerformanceChart(props: PerformanceProps) {
  const { data, className } = props;

  const [timeFilter, setTimeFilter] = useState<TimeFilter>(TimeFilter.All);

  const { chartData } = useRecordAnalyze(data?.record, timeFilter);

  const handleTimeFilterChange = (value: string | number | boolean) => {
    const val = String(value) as TimeFilter;

    setTimeFilter(val);
  };

  return (
    <div
      className={twMerge(
        'flex flex-col gap-10 rounded-lg bg-white p-6',
        className
      )}
    >
      <div className="flex justify-between items-center text-sm text-gray-900">
        <span className="font-semibold">Kết quả chi tiết</span>

        <Select
          options={FilterOptions}
          value={TimeFilter.All}
          popupClassName="w-[150px]"
          labelClassName="py-0 pr-8 ring-0 font-semibold"
          onChange={handleTimeFilterChange}
        />
      </div>

      <div className="flex flex-col gap-10">
        <div className="w-full">
          {chartData?.points && (
            <Chart
              type="bar"
              options={pointsChartOptions}
              data={chartData.points}
            />
          )}
        </div>

        <div className="w-full">
          {chartData?.listenedTime && (
            <Chart
              type="bar"
              options={listenedTimeChartOptions}
              data={chartData.listenedTime}
            />
          )}
        </div>

        <div className="w-full">
          {chartData?.averageAccuracy && (
            <Chart
              type="bar"
              options={averageAccuracyChartOptions}
              data={chartData.averageAccuracy}
            />
          )}
        </div>

        <div className="w-full">
          {chartData?.words && (
            <Chart
              type="bar"
              options={wordsChartOptions}
              data={chartData.words}
            />
          )}
        </div>
      </div>
    </div>
  );
}
