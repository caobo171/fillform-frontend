'use client';

import Fetch from "@/lib/core/fetch/Fetch";
import { RawCertification, RawPodcast, } from "@/store/types";
import { cookies } from 'next/headers';
import Edit from './comp';
import { useAsync } from "react-use";
import { useEffect, useState } from "react";

type ResponseType = {
    podcasts: RawPodcast[];
    podcast_num: number;
    code: number;
};


export default ({ params }: { params: { id: string } }) => {

    let [currentPodcastIndex, setCurrentPodcastIndex] = useState<number>(0);
    const podcastListState = useAsync(async () => {
        const res = await Fetch.postWithAccessToken<ResponseType>(
            '/api/podcasts/list.admin',
            {
                page: 0,
                page_size: 5000,
            }
        );

        return {
            podcasts: res?.data?.podcasts ?? [],
            podcast_num: res?.data?.podcast_num ?? 0,
        };
    }, []);

    const podcasts = (podcastListState.value?.podcasts ?? []).filter(podcast => !podcast.has_transcript && podcast.file_path && podcast.version >= 2)
    useEffect(()=>{
        if(podcasts.length > 0){
            setCurrentPodcastIndex(0);
        }
    }, [podcasts.length]);

    if (podcasts[currentPodcastIndex]){
        console.log('Current podcast', podcasts[currentPodcastIndex]?.id);

        return <Edit key={podcasts[currentPodcastIndex]?.id} podcast={podcasts[currentPodcastIndex]} onTranscribeDone={() => {
            setCurrentPodcastIndex(currentPodcastIndex + 1);
        }} />
    }

    return <div>Preparing</div>
    
};