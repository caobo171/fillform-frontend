import { useSelector } from 'react-redux';
import store from '../store'
import { RawPodcastCollection } from '@/store/types';

const useAll = () => {
    return useSelector((state: any) => {
        return state.podcastCollection.collections as RawPodcastCollection[];
    });
}


export const PodcastCollectionHook = {
    useAll
}