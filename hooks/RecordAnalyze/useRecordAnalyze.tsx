import { orderBy, sum } from 'lodash';
import moment from 'moment';
import { useEffect, useMemo, useState } from 'react';

import {
  CacheSubmitObject,
  DayOfTheWeek,
  GroupDataBy,
  MINIMUM_SAMPLE_SIZE,
  TimeADay,
  TimeFilter,
} from '@/hooks/RecordAnalyze/constants';
import { convertCacheSubmits } from '@/hooks/RecordAnalyze/utils';
import {
  RawPersonalRecord,
  ReferenceWrongWord,
  ReportWordType,
} from '@/store/types';

export function useRecordAnalyze(
  record?: RawPersonalRecord | null,
  timeFilter: TimeFilter = TimeFilter.All
) {
  // to store the filtered list (by time)
  const [filteredSubmits, setFilteredSubmits] = useState<CacheSubmitObject[]>(
    []
  );

  const [podcastSubmitLogs, setPodcastSubmitLogs] = useState<
    RawPersonalRecord['podcast_submit_logs']
  >([]);

  useEffect(() => {
    const { cache_submits: submits } = record ?? {};

    setFilteredSubmits(convertCacheSubmits(submits ?? [], timeFilter));

    const sumAllVocabs = record?.podcast_submit_logs?.reduce(
      (acc, item) => acc + item.added_vocabs.length,
      0
    );

    if (
      record?.podcast_submit_logs?.length &&
      sumAllVocabs !==
        // eslint-disable-next-line no-unsafe-optional-chaining
        record?.podcast_submit_logs[record?.podcast_submit_logs.length - 1]
          ?.total_vocabs.length
    ) {
      console.error('Sum of all vocabs is not equal to the last total vocabs');
      // For debug purpose
      // eslint-disable-next-line
      // @ts-ignore
      window.podcast_submit_logs = record?.podcast_submit_logs;
    } else {
      console.log('Sum of all vocabs is equal to the last total vocabs');
    }

    setPodcastSubmitLogs(record?.podcast_submit_logs ?? []);
  }, [record, timeFilter]);

  const points = useMemo(
    () => Math.floor(sum(filteredSubmits.map((x) => x.points)) * 100) / 100,
    [filteredSubmits]
  );

  const listenedTime = useMemo(
    () => sum(filteredSubmits.map((e) => e.listenedTime ?? 0)),
    [filteredSubmits]
  );

  const averageAccuracy = useMemo(() => {
    const accuracies = filteredSubmits.map((item) => item.averageAccuracy);

    if (accuracies.length > 0) {
      return ((sum(accuracies) / accuracies.length) * 100).toFixed(2);
    }

    return 0;
  }, [filteredSubmits]);

  const summarizeWords = useMemo(() => {
    if (!record?.cache_submits) {
      return [];
    }

    const results = Object.values(record.cache_submits).filter(
      (e) => e.compare_result
    );
    const podcastIds = Object.keys(record.cache_submits).map((e) => Number(e));

    const wrongWordList: {
      [key: string]: {
        references: ReferenceWrongWord[];
        freq: number;
      };
    } = {};

    for (let i = 0; i < results.length; i++) {
      const keys = Object.keys(results[i].compare_result.wrong_phrases);
      keys.forEach((key) => {
        if (!wrongWordList[key]) {
          wrongWordList[key] = {
            references: [],
            freq: 0,
          };
        }

        wrongWordList[key].references = [
          ...wrongWordList[key].references,
          ...results[i].compare_result.wrong_phrases[key].map((e) => {
            // if the word is a phrase, we need to get the index of the word in the phrase
            if (typeof e === 'string') {
              return {
                user_word: e,
                index: -1,
                podcast_id: podcastIds[i],
                user_id: record.user_id,
              };
            }

            return {
              user_word: e.user_word,
              index: e.index,
              podcast_id: podcastIds[i],
              user_id: record.user_id,
            };
          }),
        ];

        wrongWordList[key].freq +=
          results[i].compare_result.wrong_phrases[key].length;
      });
    }

    const correctKeys = Object.keys(record.cache_vocabs);

    correctKeys.forEach((key) => {
      if (wrongWordList[key]) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        wrongWordList[key].freq -= record.cache_vocabs[key]
          ? record.cache_vocabs[key]
          : 0;
      }
    });

    return Object.keys(wrongWordList).map((key) => ({
      label: key,
      freq: wrongWordList[key].freq,
      references: wrongWordList[key].references,
    }));
  }, [record]);

  const wrongWordList: ReportWordType[] = useMemo(
    () =>
      orderBy(
        summarizeWords.filter((x) => x.freq > 0 && x.label.length < 50),
        ['freq'],
        ['desc'] // negative number
      ),
    [summarizeWords]
  );

  const correctWordList: ReportWordType[] = useMemo(
    () =>
      orderBy(
        summarizeWords.filter((x) => x.freq < -3 && x.label.length < 50),
        ['freq'],
        ['asc'] // positive number
      ),
    [summarizeWords]
  );

  // get frequency vocabs from cache_frequency_vocabs
  // map frequency vocabs filter the words that user listen to more than MINIMUM_SAMPLE_SIZE times
  const mapFrequencyVocabs: ReportWordType[] = useMemo(() => {
    const cacheFrequencyVocabs = { ...record?.cache_frequency_vocabs };

    return Object.keys(record?.cache_frequency_vocabs ?? [])
      .filter((e) => cacheFrequencyVocabs[e].length > MINIMUM_SAMPLE_SIZE)
      .map((e) => {
        const freqVocab = cacheFrequencyVocabs[e];
        const numberOneLength = (freqVocab.match(/1/g) || []).length;
        const cacheFrequencyVocabsLength = freqVocab.length;
        return {
          label: e,
          freq: numberOneLength / cacheFrequencyVocabsLength,
          statsFreq: freqVocab,
        };
      });
  }, [record?.cache_frequency_vocabs]);

  // get master words from cache_frequency_vocabs
  // if the word is listened more than 80% of the time, it is considered as master word
  const masterWords: ReportWordType[] = useMemo(
    () => mapFrequencyVocabs.filter((e) => e.freq > 0.8),
    [mapFrequencyVocabs]
  );

  // get not master words from cache_frequency_vocabs
  // if the word is listened less than 30% of the time, it is considered as not master word
  const notMasterWords: ReportWordType[] = useMemo(
    () => mapFrequencyVocabs.filter((e) => e.freq < 0.3),
    [mapFrequencyVocabs]
  );

  // get valuable words from master words
  const valuableWords: ReportWordType[] = useMemo(
    () =>
      // filter the words that user listen first MINIMUM_SAMPLE_SIZE times have less than 3 listen right answer
      masterWords.filter(
        (e) =>
          (
            record?.cache_frequency_vocabs[e.label]
              ?.slice(0, MINIMUM_SAMPLE_SIZE)
              ?.match(/1/g) || []
          ).length < 3
      ),
    [masterWords, record?.cache_frequency_vocabs]
  );

  const filterPodcastSubmitLogs: {
    submit_time: string;
    total_vocabs: string[];
    added_vocabs: string[];
  }[] = useMemo(() => {
    const groupData = podcastSubmitLogs?.reduce(
      (acc, item) => {
        const submitTime = new Date(item.submit_time * 1000);
        let timeString = '';

        const groupDataBy =
          timeFilter === TimeFilter.TwelveMonths
            ? GroupDataBy.Month
            : GroupDataBy.Day;

        // if (groupDataBy === GroupDataBy.Year) {
        //   timeString = `${submitTime.getFullYear()}`;
        // }

        if (groupDataBy === GroupDataBy.Month) {
          timeString = `${submitTime.getMonth()}/${submitTime.getFullYear()}`;
        }
        if (groupDataBy === GroupDataBy.Day) {
          timeString = moment(submitTime).format('DD/MM/YYYY');
        }

        if (acc[timeString]) {
          acc[timeString].added_vocabs = [
            ...acc[timeString].added_vocabs,
            ...item.added_vocabs,
          ];
          acc[timeString].total_vocabs = [
            ...acc[timeString].total_vocabs,
            ...item.added_vocabs,
          ];
        } else {
          acc[timeString] = {
            submit_time: timeString,
            total_vocabs: item.total_vocabs,
            added_vocabs: item.added_vocabs,
          };
        }

        return acc;
      },
      {} as {
        [key: string]: {
          submit_time: string;
          total_vocabs: string[];
          added_vocabs: string[];
        };
      }
    );

    if (timeFilter === TimeFilter.SevenDays) {
      const Last7Days = [6, 5, 4, 3, 2, 1, 0].map((item) =>
        moment(new Date().getTime() - item * TimeADay).format('L')
      );

      return Last7Days.map((timeString) => {
        if (groupData[timeString]) {
          return groupData[timeString];
        }

        return {
          submit_time: timeString,
          total_vocabs: [],
          added_vocabs: [],
        };
      });
    }

    if (timeFilter === TimeFilter.TwelveMonths) {
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear();
      const currentMonth = currentDate.getMonth();

      const months = Array.from({ length: 12 }, (_, i) => {
        const monthIndex = (currentMonth - i + 12) % 12;
        const year = currentMonth - i < 0 ? currentYear - 1 : currentYear;
        return `${monthIndex}/${year}`;
      }).reverse();

      return months.map(
        (month) =>
          groupData[month] || {
            submit_time: month,
            total_vocabs: [],
            added_vocabs: [],
          }
      );
    }
    return Object.values(groupData);
  }, [podcastSubmitLogs, timeFilter]);

  const listenedWords = useMemo(() => {
    const lastItem = podcastSubmitLogs[podcastSubmitLogs.length - 1];
    return lastItem?.total_vocabs.length || 0;
  }, [podcastSubmitLogs]);

  const chartData = useMemo(() => {
    const labels = filteredSubmits.map((e) => {
      const date = new Date(e.submitTime);

      if (timeFilter === TimeFilter.TwelveMonths) {
        return `Th ${date.getMonth() + 1}`;
      }

      if (timeFilter === TimeFilter.SevenDays) {
        return DayOfTheWeek[date.getDay()];
      }

      if (timeFilter === TimeFilter.All) {
        return `${date.getMonth() + 1}/${date.getFullYear()}`;
      }

      return `${date.getDate()}/${date.getMonth() + 1}`;
    });

    const vocabLabels = filterPodcastSubmitLogs.map((e) => {
      if (timeFilter === TimeFilter.TwelveMonths) {
        return `Th ${Number(e.submit_time.split('/')[0]) + 1}`;
      }

      if (timeFilter === TimeFilter.SevenDays) {
        return DayOfTheWeek[new Date(e.submit_time).getDay()];
      }

      return e.submit_time;
    });

    const pointDataset = [
      {
        type: 'line' as const,
        label: 'Tổng WELE scores',
        data: filteredSubmits.map((e) => e.totalPoints),
        fill: false,
        backgroundColor: '#22c55e',
        borderColor: '#22c55e',
        cubicInterpolationMode: 'monotone' as const,
        yAxisID: 'totalPoints',
      },
      {
        type: 'bar' as const,
        label: 'WELE scores',
        data: filteredSubmits.map((e) => e.points),
        fill: false,
        backgroundColor: '#bbf7d0',
        borderRadius: 2,
        yAxisID: 'points',
      },
    ];

    const listenedTimeDataset = [
      {
        type: 'line' as const,
        label: 'Tổng thời gian nghe (phút)',
        data: filteredSubmits.map((e) => e.totalListenedTime / 60),
        fill: false,
        backgroundColor: '#f97316',
        borderColor: '#f97316',
        cubicInterpolationMode: 'monotone' as const,
        yAxisID: 'totalListenedTime',
      },
      {
        type: 'bar' as const,
        label: 'Thời gian nghe (phút)',
        data: filteredSubmits.map((e) => e.listenedTime / 60),
        fill: false,
        backgroundColor: '#fed7aa',
        borderRadius: 2,
        yAxisID: 'listenedTime',
      },
    ];

    const accuracyDataset = [
      {
        type: 'line' as const,
        label: 'Trung bình độ chính xác (%)',
        data: filteredSubmits.map((e) =>
          (e.totalAverageAccuracy * 100).toFixed(2)
        ),
        fill: false,
        backgroundColor: '#a855f7',
        borderColor: '#a855f7',
        cubicInterpolationMode: 'monotone' as const,
        yAxisID: 'totalAverageAccuracy',
      },
      {
        type: 'bar' as const,
        label: 'Độ chính xác (%)',
        data: filteredSubmits.map((e) => (e.averageAccuracy * 100).toFixed(2)),
        fill: false,
        backgroundColor: '#e9d5ff',
        borderRadius: 2,
        yAxisID: 'averageAccuracy',
      },
    ];

    const wordDataset = [
      {
        type: 'line' as const,
        label: 'Tổng từ nghe đúng',
        data: filterPodcastSubmitLogs.map((e) => e.total_vocabs.length),
        fill: false,
        backgroundColor: '#3b82f6',
        borderColor: '#3b82f6',
        cubicInterpolationMode: 'monotone' as const,
        yAxisID: 'totalCorrectWords',
      },
      {
        type: 'bar' as const,
        label: 'Từ nghe đúng',
        data: filterPodcastSubmitLogs.map((e) => e.added_vocabs.length),
        fill: false,
        backgroundColor: '#bfdbfe',
        borderRadius: 2,
        yAxisID: 'correctWords',
      },
    ];

    return {
      masteredWords: {
        labels,
        datasets: [wordDataset[2]],
      },
      points: {
        labels,
        datasets: pointDataset,
      },
      words: {
        labels: vocabLabels,
        datasets: wordDataset,
      },
      averageAccuracy: {
        labels,
        datasets: accuracyDataset,
      },
      listenedTime: {
        labels,
        datasets: listenedTimeDataset,
      },
    };
  }, [filterPodcastSubmitLogs, filteredSubmits, timeFilter]);

  return {
    chartData,
    points,
    listenedTime,
    listenedWords,
    averageAccuracy,
    wrongWordList,
    correctWordList,
    masterWords,
    notMasterWords,
    valuableWords,
  };
}
