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
import React from 'react';
import { Chart } from 'react-chartjs-2';
import { twMerge } from 'tailwind-merge';

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

type PerformanceProps = {
  data?: RawUserStats;
  className?: string;
};

export function Performance(props: PerformanceProps) {
  const { data, className } = props;

  const { chartData } = useRecordAnalyze(data?.record, TimeFilter.TwelveMonths);

  return (
    <div className={twMerge('flex flex-col gap-3', className)}>
      <div className="flex justify-between items-end text-sm text-gray-900">
        <span className="font-semibold">Kết quả 12 tháng vừa qua</span>
      </div>

      <div className="flex flex-col gap-10 rounded-lg bg-white p-6">
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
            {chartData?.averageAccuracy && (
              <Chart
                type="bar"
                options={listenedTimeChartOptions}
                data={chartData.listenedTime}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
