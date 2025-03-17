import React, { useCallback, useMemo } from 'react';

import { Accordion } from '@/components/common';
import { FILLER_TEXT } from '@/core/Constants';
import hintHelpers from '@/helpers/hint';
import { RawPodcastSubmit } from '@/store/types';

const {
  splitWords,
  shouldAddNoSpaceNext,
  shouldAddNoSpacePrevious,
  shouldAddNoSpaceWithAcronym,
  specialPunctuations
} = hintHelpers;

type SubmitListProps = {
  data: RawPodcastSubmit[];
};

export function SubmitList(props: SubmitListProps) {

    /**
   * @desc Display diff between user answer and correct answer
   */
    const renderDiffs = useCallback(
      (podcastSubmit: RawPodcastSubmit) => {

        const diffs = podcastSubmit?.compare_result?.diffs ?? [];

        const isAddNoSpaceCondition = (i: number) =>
          shouldAddNoSpaceNext(
            podcastSubmit.result_array[i],
            podcastSubmit.result_array[i + 1]
          ) ||
          (!!podcastSubmit.result_array[i - 1] &&
            shouldAddNoSpacePrevious(
              podcastSubmit.result_array[i - 1],
              podcastSubmit.result_array[i]
            )) ||
          shouldAddNoSpaceWithAcronym(
            podcastSubmit.result_array[i],
            podcastSubmit.result_array[i + 2]
          );
  
        const hints = podcastSubmit.podcast_hints;
        const result = [];
        for (let index = 0; index < diffs.length; index++) {
          const e = diffs[index];
          if (e.length === 1) {
            let data = e[0][1];
  
            if (hints.includes(index) && !specialPunctuations.includes(data) && podcastSubmit.metatype == 'hint') {
              result.push(
                <React.Fragment key={index}>
                  <span key={index} className="bg-green-200 hover:text-gray-800" data-index={index}>
                    {data}
                  </span>
                  {!isAddNoSpaceCondition(index) && ' '}
                  {data === '\n' && <br />}
                </React.Fragment>
              );
            } else {
              result.push(
                <React.Fragment key={index}>
                  <span key={index} className="hover:text-gray-800" data-index={index}>
                    {data}
                  </span>
                  {!isAddNoSpaceCondition(index) && ' '}
                  {data === '\n' && <br />}
                </React.Fragment>
              );
            }
          }
          if (e.length === 2) {
            // const wrong_data = e[0][1];
            const wrong_data = e[0][1] === FILLER_TEXT ? '' : e[0][1];
            const correct_data = e[1][1];
  
            result.push(
              <React.Fragment key={index}>
                {wrong_data.length > 0 && (
                  <>
                    <del
                      className="bg-red-200 cursor-pointer hover:text-gray-800"
                      data-index={index}
                      // onClick={() => handlePlayAtWord(index)}
                    >
                      {wrong_data}
                    </del>
                    &nbsp;
                  </>
                )}
                {correct_data.length > 0 && (
                  <span className="bg-yellow-200 hover:text-gray-800" data-index={index}>{correct_data}</span>
                )}
                {!isAddNoSpaceCondition(index) && <>&nbsp;</>}
              </React.Fragment>
            );
          }
        }
  
        return result;
      },
      []
    );


  const { data } = props;

  const items = useMemo(() => {
    if (!Array.isArray(data)) {
      return [];
    }

    return data.map((item) => ({
      title: `ESL ${item.podcast_subname} - ${item.podcast_name}`,
      content: renderDiffs(item),
    }));
  }, [data, renderDiffs]);

  return (
    <div className="rounded-lg bg-white p-6">
      <Accordion items={items} title={`Submitted podcasts (${data?.length})`} />
    </div>
  );
}
