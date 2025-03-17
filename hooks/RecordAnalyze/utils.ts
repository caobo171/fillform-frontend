import { sortBy } from 'lodash';

import { TimeFilter } from '@/hooks/RecordAnalyze/constants';
import { RawCacheSubmit, RawPersonalRecord } from '@/store/types';

type CacheSubmitObject = {
  listenedTime: number;
  submitTime: number | Date;
  points: number;
  averageAccuracy: number;
  wrongWords: number;
  totalPoints: number;
  totalListenedTime: number;
  totalAverageAccuracy: number;
};

function groupByDay(
  records: RawCacheSubmit[]
): Record<string, RawCacheSubmit[]> {
  // Create a Map to store grouped records
  const groupedByDay = new Map();

  // Iterate through each record
  records.forEach((record) => {
    // Convert submit_time to Date object (assuming it's a timestamp or date string)
    const date = new Date(record.submit_time);

    // Create a date string in YYYY-MM-DD format for grouping
    const dayKey = date.toISOString().split('T')[0];

    // If this day doesn't exist in the map yet, create new array
    if (!groupedByDay.has(dayKey)) {
      groupedByDay.set(dayKey, []);
    }

    // Add the record to its day's array
    groupedByDay.get(dayKey).push(record);
  });

  // Optional: Convert Map to object for easier use
  return Object.fromEntries(groupedByDay);
}

function groupByWeek(
  records: RawCacheSubmit[]
): Record<string, RawCacheSubmit[]> {
  // Create a Map to store weekly groups
  const weeklyGroups = new Map();

  // Function to get week number and year from a date
  const getWeekKey = (date: number) => {
    const d = new Date(date);
    // Set to start of day to avoid time affecting week calculation
    d.setHours(0, 0, 0, 0);

    // Get year
    const year = d.getFullYear();

    // Calculate week number
    const oneJan = new Date(year, 0, 1);
    // eslint-disable-next-line
    // @ts-ignore
    const daysOffset = (d - oneJan) / 86400000; // Convert ms to days
    const weekNumber = Math.ceil((daysOffset + oneJan.getDay() + 1) / 7);

    return `${year}-W${weekNumber.toString().padStart(2, '0')}`;
  };

  // Process each record
  records.forEach((record) => {
    if (!record.submit_time) return; // Skip if no submit_time

    const weekKey = getWeekKey(record.submit_time);

    // Initialize array for this week if it doesn't exist
    if (!weeklyGroups.has(weekKey)) {
      weeklyGroups.set(weekKey, []);
    }

    // Add record to its week group
    weeklyGroups.get(weekKey).push(record);
  });

  // Convert Map to more usable object format
  const result: Record<string, RawCacheSubmit[]> = {};
  weeklyGroups.forEach((value, key) => {
    result[key] = value;
  });

  return result;
}

function groupByMonth(
  records: RawCacheSubmit[]
): Record<string, RawCacheSubmit[]> {
  // Create an object to store grouped data
  const grouped: Record<string, RawCacheSubmit[]> = {};

  // Iterate through each record
  records.forEach((record) => {
    // Convert submit_time to Date object if it isn't already
    const date = new Date(record.submit_time);

    // Get year and month (adding 1 to month since getMonth() is 0-based)
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Ensure 2 digits

    // Create key in format "YYYY-MM"
    const key = `${year}-${month}`;

    // Initialize array for this month if it doesn't exist
    if (!grouped[key]) {
      grouped[key] = [];
    }

    // Add record to the appropriate month group
    grouped[key].push(record);
  });

  return grouped;
}

function groupByYear(
  records: RawCacheSubmit[]
): Record<string, RawCacheSubmit[]> {
  // Use reduce to group records by year
  const grouped: Record<string, RawCacheSubmit[]> = records.reduce(
    (acc: Record<string, RawCacheSubmit[]>, record) => {
      // Convert submit_time to Date object and get year
      const date = new Date(record.submit_time);
      const year = date.getFullYear();

      // If this year doesn't exist in accumulator, create new array
      if (!acc[year]) {
        acc[year] = [];
      }

      // Add record to appropriate year array
      acc[year].push(record);
      return acc;
    },
    {}
  );

  return grouped;
}
function summarizeRecords(
  groupedRecords: Record<string, RawCacheSubmit[]>
): Record<string, CacheSubmitObject> {
  const result: Record<string, CacheSubmitObject> = {};

  let runningTotalPoints = 0;
  let runningTotalListenedTime = 0;
  let runningTotalAccuracySum = 0;
  let totalRecordsProcessed = 0;

  Object.entries(groupedRecords).forEach(([date, records]) => {
    // Initialize with default values to ensure all properties are defined
    const summaries = records.reduce(
      (summary: CacheSubmitObject, record: RawCacheSubmit) => {
        const wrongWordsCount = Object.keys(
          record.compare_result.wrong_phrases
        ).length;

        return {
          listenedTime: summary.listenedTime + record.listen_time,
          submitTime: record.submit_time, // Last record's submit_time
          points: summary.points + record.value,
          averageAccuracy:
            summary.averageAccuracy + record.compare_result.percent,
          wrongWords: summary.wrongWords + wrongWordsCount,
          totalPoints: summary.totalPoints, // These will be updated later
          totalListenedTime: summary.totalListenedTime,
          totalAverageAccuracy: summary.totalAverageAccuracy,
        };
      },
      {
        listenedTime: 0,
        submitTime: 0, // Will be overwritten
        points: 0,
        averageAccuracy: 0,
        wrongWords: 0,
        totalPoints: 0, // Placeholder
        totalListenedTime: 0, // Placeholder
        totalAverageAccuracy: 0, // Placeholder
      }
    );

    // Finalize daily averages
    summaries.averageAccuracy /= records.length;

    // Update running totals
    runningTotalPoints += summaries.points;
    runningTotalListenedTime += summaries.listenedTime;
    runningTotalAccuracySum += summaries.averageAccuracy;
    totalRecordsProcessed += 1;

    // Update cumulative totals
    summaries.totalPoints = runningTotalPoints;
    summaries.totalListenedTime = runningTotalListenedTime;
    summaries.totalAverageAccuracy =
      runningTotalAccuracySum / totalRecordsProcessed;

    result[date] = summaries;
  });

  return result;
}

// Helper to get ISO week number
const getWeekNumber = (date: Date): number => {
  const d = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
  );
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
};

// Function to generate date key based on granularity
const getDateKey = (date: Date, granularity: Granularity): string => {
  switch (granularity) {
    case 'day':
      return date.toISOString().split('T')[0]; // YYYY-MM-DD
    case 'week': {
      const year = date.getFullYear();
      const week = getWeekNumber(date);
      return `${year}-W${week.toString().padStart(2, '0')}`; // YYYY-WWW
    }
    case 'month':
      return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`; // YYYY-MM
    case 'year':
      return date.getFullYear().toString(); // YYYY
    default:
      throw new Error(`Unsupported granularity: ${granularity}`); // Satisfies ESLint
  }
};

const getSubmitTimeForKey = (key: string, granularity: Granularity): number => {
  switch (granularity) {
    case 'day':
      return Math.floor(new Date(key).getTime());
    case 'week': {
      const [year, week] = key.split('-W');
      const date = new Date(Date.UTC(Number(year), 0, 1));
      date.setUTCDate(date.getUTCDate() + (Number(week) - 1) * 7);
      return Math.floor(date.getTime());
    }
    case 'month':
      return Math.floor(new Date(`${key}-01`).getTime());
    case 'year':
      return Math.floor(new Date(`${key}-01-01`).getTime());
    default:
      throw new Error(`Unsupported granularity: ${granularity}`);
  }
};

type FillStrategy = 'null' | 'zero' | 'carry-forward' | 'carry-half-forward';
type Granularity = 'day' | 'week' | 'month' | 'year';

export function fillDataGaps(
  summarizedData: Record<string, CacheSubmitObject>,
  startDate: Date,
  endDate: Date,
  granularity: Granularity,
  strategy: FillStrategy = 'null'
): Record<string, CacheSubmitObject> {
  const filledData: Record<string, CacheSubmitObject> = {};

  // Generate all keys in the range
  const keys: string[] = [];
  const currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    keys.push(getDateKey(currentDate, granularity));

    switch (granularity) {
      case 'day':
        currentDate.setDate(currentDate.getDate() + 1);
        break;
      case 'week':
        currentDate.setDate(currentDate.getDate() + 7);
        break;
      case 'month':
        currentDate.setMonth(currentDate.getMonth() + 1);
        break;
      case 'year':
        currentDate.setFullYear(currentDate.getFullYear() + 1);
        break;
      default:
        throw new Error(`Unsupported granularity: ${granularity}`); // Satisfies ESLint
    }
  }

  // Remove duplicates
  const uniqueKeys = [...new Set(keys)];

  let lastKnownData: CacheSubmitObject | null = null;

  // Fill the data for each key
  uniqueKeys.forEach((key, index) => {
    const existingData = summarizedData[key];

    if (existingData) {
      filledData[key] = { ...existingData };
      lastKnownData = filledData[key];
    } else {
      const submitTime = getSubmitTimeForKey(key, granularity); // Unique timestamp per key

      switch (strategy) {
        case 'null':
          filledData[key] = {
            listenedTime: 0,
            submitTime,
            points: 0,
            averageAccuracy: 0,
            wrongWords: 0,
            totalPoints: 0,
            totalListenedTime: 0,
            totalAverageAccuracy: 0,
          };
          break;
        case 'zero':
          filledData[key] = {
            listenedTime: 0,
            submitTime,
            points: 0,
            averageAccuracy: 0,
            wrongWords: 0,
            totalPoints:
              index === 0 ? 0 : filledData[uniqueKeys[index - 1]].totalPoints,
            totalListenedTime:
              index === 0
                ? 0
                : filledData[uniqueKeys[index - 1]].totalListenedTime,
            totalAverageAccuracy:
              index === 0
                ? 0
                : filledData[uniqueKeys[index - 1]].totalAverageAccuracy,
          };
          break;
        case 'carry-forward':
          if (lastKnownData) {
            filledData[key] = { ...lastKnownData, submitTime };
          } else {
            filledData[key] = {
              listenedTime: 0,
              submitTime,
              points: 0,
              averageAccuracy: 0,
              wrongWords: 0,
              totalPoints: 0,
              totalListenedTime: 0,
              totalAverageAccuracy: 0,
            };
          }
          break;
        case 'carry-half-forward':
          if (lastKnownData) {
            // carry forward total[something] data
            // reset the others
            filledData[key] = {
              ...lastKnownData,
              listenedTime: 0,
              submitTime,
              points: 0,
              averageAccuracy: 0,
              wrongWords: 0,
            };
          } else {
            filledData[key] = {
              listenedTime: 0,
              submitTime,
              points: 0,
              averageAccuracy: 0,
              wrongWords: 0,
              totalPoints: 0,
              totalListenedTime: 0,
              totalAverageAccuracy: 0,
            };
          }
          break;
        default:
          throw new Error(`Unsupported fill strategy: ${strategy}`); // Satisfies ESLint
      }
    }
  });

  return filledData;
}

export const convertCacheSubmits = (
  data: RawPersonalRecord['cache_submits'],
  timeFilter: TimeFilter
): CacheSubmitObject[] => {
  // filter out records without submit_time
  const filtered = Object.values(data).filter((record) => !!record.submit_time);

  // convert submit_time to milliseconds
  const mapped = filtered.map((record) => ({
    ...record,
    submit_time: record.submit_time * 1000,
  }));

  // records need to be sorted by time to make sure everything will be calculated accurately
  const records = sortBy(mapped, 'submit_time');

  const today = new Date(); // Current date from system info

  if (timeFilter === TimeFilter.SevenDays) {
    const grouped = groupByDay(records);

    const summarized = summarizeRecords(grouped);

    const sevenDaysAgo = new Date(today);

    sevenDaysAgo.setDate(today.getDate() - 6);

    const filled = fillDataGaps(
      summarized,
      sevenDaysAgo,
      today,
      'day',
      'carry-half-forward'
    );

    return Object.values(filled);
  }

  if (timeFilter === TimeFilter.EightWeeks) {
    const grouped = groupByWeek(records);

    const summarized = summarizeRecords(grouped);

    const eightWeeksAgo = new Date(today);

    eightWeeksAgo.setDate(today.getDate() - 55); // 8 weeks = 56 days

    const filled = fillDataGaps(
      summarized,
      eightWeeksAgo,
      today,
      'week',
      'carry-half-forward'
    );

    return Object.values(filled);
  }

  if (timeFilter === TimeFilter.TwelveMonths) {
    const grouped = groupByMonth(records);

    const summarized = summarizeRecords(grouped);

    const twelveMonthsAgo = new Date(today);

    twelveMonthsAgo.setMonth(today.getMonth() - 11);

    const filled = fillDataGaps(
      summarized,
      twelveMonthsAgo,
      today,
      'month',
      'carry-half-forward'
    );

    return Object.values(filled);
  }

  if (timeFilter === TimeFilter.All) {
    const grouped = groupByYear(records);

    const summarized = summarizeRecords(grouped);

    return Object.values(summarized);
  }

  return [];
};
