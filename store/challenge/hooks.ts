import { useSelector } from 'react-redux';
import { State } from './slice';

const useFetchChallengeByPodcastID = (podcast_id: number) => {
    return useSelector((state: { challenge: State }) => {
        if (state.challenge.map_challenge_by_podcast_id[podcast_id])
            return state.challenge.map_challenge_by_podcast_id[podcast_id];
        return state.challenge.map_challenge_by_podcast_id[0];
    });
};

const useFetchChallengeByID = (id: number) => {
    return useSelector((state: { challenge: State }) => {
        return state.challenge.map_challenge_by_id[id];
    });
};

export const ChallengeHook = {
    useFetchChallengeByPodcastID,
    useFetchChallengeByID
}