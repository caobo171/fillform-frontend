export type CacheSubmitObject = {
  listenedTime: number;
  submitTime: number | Date;
  points: number;
  averageAccuracy: number;
  wrongWords: number;
  totalPoints: number;
  totalListenedTime: number;
  totalAverageAccuracy: number;
};

export const MINIMUM_SAMPLE_SIZE = 5;

export const TimeADay = 24 * 60 * 60 * 1000; // in milliseconds

export const TimeAWeek = 7 * TimeADay; // in milliseconds

// sort by 'day' index from Date object
export const DayOfTheWeek = [
  'Chủ nhật',
  'Thứ 2',
  'Thứ 3',
  'Thứ 4',
  'Thứ 5',
  'Thứ 6',
  'Thứ 7',
];

export enum GroupDataBy {
  Day,
  Week,
  Month,
  Year,
}

export enum TimeFilter {
  SevenDays = '7days',
  EightWeeks = '8weeks',
  TwelveMonths = '12months',
  All = 'all',
}
