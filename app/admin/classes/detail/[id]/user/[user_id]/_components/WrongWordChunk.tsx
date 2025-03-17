import { usePodcastSubmitByPodcastId } from "@/hooks/podcast";
import { TranscriptAnalyze } from "@/services/TranscriptAnalyze";
import React, { useCallback, useEffect } from "react";
import { useMemo } from "react";
import HintHelpers from '@/helpers/hint';
import { Spinner } from "@/components/transcriber/TranscribeButton";
import Constants from "@/core/Constants";
import { PlayerContextProvider, usePlayerContext } from "@/app/(inapp)/podcasts/_components/PlayerContext";
import { PodcastPlayer } from "@/app/(inapp)/podcasts/listen/[name]/[id]/_components/Player";
import { RawPodcast, RawPodcastSubmit } from "@/store/types";
import clsx from "clsx";

const {
    splitWords,
    shouldAddNoSpaceNext,
    shouldAddNoSpacePrevious,
    shouldAddNoSpaceWithAcronym,
} = HintHelpers;

type Props = {
    wordIndex: number,
    podcastId: number,
    userId?: number
}

export const WrongWordChunk = (props: Props) => {

    const res = usePodcastSubmitByPodcastId(props.podcastId, props.userId);



    if (res.isLoading) {
        return <Spinner text="Loading" />
    }

    if (!res.data?.podcast || !res.data?.podcast_submit) {
        return <div>Not found</div>
    }

    return (<>
        <PlayerContextProvider podcast={res.data?.podcast} podcast_submit={res.data?.podcast_submit}>
            <Inner wordIndex={props.wordIndex} />
        </PlayerContextProvider>


    </>)

}


const Inner = (props: { wordIndex: number }) => {

    const { podcast, podcast_submit, changeCurrentTime, audio } = usePlayerContext();

    const text = useMemo(() => {
        const chunk = new TranscriptAnalyze(podcast.transcript || []).getResultChunkWithWordIndex(podcast_submit, props.wordIndex)
        return chunk;
    }, [podcast, podcast_submit, props.wordIndex]);

    console.log(text);

    useEffect(() => {
        if (text && audio && audio.duration && text.timestamp?.[0]) {

            setTimeout(() => {
                changeCurrentTime(text.timestamp?.[0] - 3, true);
            }, 0)

        }
    }, [audio?.duration, text])


    const getParagraph = useCallback(() => {
        if (!text) {
            return <></>
        }

        const subParagraph = Object.values(podcast_submit.result_array).slice(text.range.start, text.range.end);

        const isAddNoSpaceCondition = (index: number) =>
            subParagraph[index + 1] === undefined ||
            shouldAddNoSpaceNext(
                subParagraph[index],
                subParagraph[index + 1]
            ) ||
            (!!subParagraph[index - 1] &&
                shouldAddNoSpacePrevious(
                    subParagraph[index - 1],
                    subParagraph[index]
                )) ||
            shouldAddNoSpaceWithAcronym(
                subParagraph[index],
                subParagraph[index + 2]
            );

        return subParagraph.map((e: string, index: number) => {
            let data = e;
            if (!isAddNoSpaceCondition(index)) {
                data += data === '\n' ? '' : ' ';
            }

            return (
                <React.Fragment key={index}>
                    {data === '\n' ? <br key={index} /> : <span className={clsx([
                        {'bg-yellow-200' : text.range.start !== undefined && (index == props.wordIndex - (text.range.start || 0))},
                    ])}>{data}</span>}
                </React.Fragment>
            );
        });

    }, [text, podcast_submit.result_array]);

    return <>
        <div className="text-gray-400">
            Podcast <b className="text-gray-900">{podcast.name || ''}</b>
        </div>

        <div className="mt-8 p-4 bg-gray-100 rounded-md">
            {getParagraph()}
        </div>


        <div className="w-full bg-gray-100 rounded-md mt-8 p-4">
            <PodcastPlayer />
        </div>
    </>

};