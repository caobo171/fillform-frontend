'use client';


import { ReactQuillNoSSR } from '@/components/form/NoSSR';
import HintEditor from '@/app/(inapp)/podcasts/listen/[name]/[id]/_components/HintEditor';
import $ from 'jquery';
import { useEffect, useMemo, useState } from 'react';

import './editor.css';
import { WordReviewListeningExercise } from '@/store/types';
import { usePodcastSubmitById, usePodcastSubmitByPodcastId } from '@/hooks/podcast';
import ListeningEditor from './ListeningEditor';
import { TranscriptAnalyze } from '@/services/TranscriptAnalyze';
import Constants from '@/core/Constants';
import { ReviewPlayerProvider } from './ReviewPlayerProvider';
import { ListeningPlayer } from './ListeningPlayer';
import { PodcastItem } from '@/modules/podcast/components/PodcastItem';
import Link from 'next/link';
import { Podcast } from '@/modules/podcast/podcast';
import { Button } from '@/components/common';
import Fetch from '@/lib/core/fetch/Fetch';


export function ListeningExercise({ exercise, ...props }: { exercise: WordReviewListeningExercise, onSubmit: (data: any, status: number) => void }) {

    const state = usePodcastSubmitById(exercise.data.submit_id)
    const [content_array, setContentArray] = useState<string[]>([]);
    const [reload, setReload] = useState<string>('');

    const chunk = useMemo(() => {
        if (!state.data?.podcast) {
            return null;
        }
        const chunk = new TranscriptAnalyze(state.data?.podcast.transcript || [])
            .getResultChunkWithWordIndex(state.data.podcast_submit, exercise.data.word_index)
        return chunk;
    }, [state.data?.podcast, exercise]);

    // Reset content array
    useEffect(() => {
       setContentArray(exercise.submit_data?.content_array || []);
       setReload(exercise.id);
    }, [exercise])


    const result = useMemo(() => {
        if (!state.data?.podcast_submit.result_array) {
            return []
        }

        if (chunk) {
            return Object.values(state.data?.podcast_submit.result_array).slice(chunk.range.start, chunk.range.end)
        }

        return [];
    }, [chunk, exercise]);


    const hintIndexes = useMemo(() => {
        if (!chunk) {
            return []
        }

        return [exercise.data.word_index - chunk.range.start];
    }, [chunk, exercise]);


    const onSubmit = () => {

        // Compute algorithm
        let status = 1;
        for (let i = 0; i < hintIndexes.length; i++) {
            if (content_array[hintIndexes[i]]?.toLocaleLowerCase() != result[hintIndexes[i]]?.toLocaleLowerCase()) {
                status = -1;
            };
        }

        props.onSubmit({
            content_array: content_array,
            result: result,
            hint_indexes: hintIndexes
        }, status);
    };



    const handleIgnore = async () => {

        await Fetch.postWithAccessToken('/api/word.review/ignore', {
            word: exercise.data.word,
            submit_id: exercise.data.submit_id,
            podcast_id: exercise.data.podcast_id,
            word_index: exercise.data.word_index
        });

        props.onSubmit({
            content_array: content_array,
            result: result,
            hint_indexes: hintIndexes
        }, 1);
    };


    if (!chunk || !state.data?.podcast) {
        return <div className="w-full js-text-writing max-w-[700px] mx-auto pt-20">
            Loading ...
        </div>
    }


    return (
        <div className="w-full js-text-writing max-w-[700px] mx-auto">

            <ReviewPlayerProvider audio_url={Constants.IMAGE_URL + state.data?.podcast.file_path} range={{
                start: chunk.timestamp[0] - 3,
                end: chunk.timestamp[1] + 3
            }} >
                <div>
                    <div>
                        Điền vào ô trống từ bạn nghe được nhé
                    </div>
                    <ListeningEditor
                        content_array={content_array}
                        setContentArray={setContentArray}
                        result={result} hint_indexes={hintIndexes}
                        reload={reload}

                    />
                    <div className='mt-8 flex-row flex justify-between'>
                        <div>

                            <div className='text-gray-400 hover:text-primary transition-all cursor-pointer' onClick={handleIgnore}>
                                Đừng cho tôi xem lại bài tập này
                            </div>
                        </div>

                        <div className='max-w-[320px]'>

                            Source: &nbsp;
                            <Link
                                className="underline hover:text-primary transition-all"
                                href={Podcast.getURL(state.data.podcast)}
                                target="_blank"
                            >
                                {state.data.podcast.name} [ESL {state.data.podcast.sub_name}]
                            </Link>
                        </div>
                    </div>
                </div>



                <div className='h-8'></div>
                <ListeningPlayer />
                <div className='h-8'></div>

                <div className='flex-row flex justify-between'>
                    <div></div>

                    <Button title='Nộp bài' onClick={onSubmit} >
                        Nộp bài
                    </Button>
                </div>

            </ReviewPlayerProvider>

        </div>
    );
}
