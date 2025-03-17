'use client'
import { Metadata, ResolvingMetadata } from 'next';
import { cookies } from 'next/headers';

import { Container } from '@/components/layout/container/container';
import Constants from '@/core/Constants';
import Fetch from '@/lib/core/fetch/Fetch';
import { ProfileProps, WordReviewListeningExercise } from '@/store/types';
import { useWordReviews } from '@/hooks/word.review';
import { useEffect, useMemo, useState } from 'react';
import { ListeningExercise } from './_components/ListeningExercise';
import { v4 } from 'uuid';
import ProgressBar from './_components/ProgressBar';
import Congrat from '@/components/congrat/Congrat';
import { ReviewCongratulation } from './_components/Congratulation';
import { MeHook } from '@/store/me/hooks';
import { Helper } from '@/services/Helper';
import { PremiumWarning } from '../_components/PremiumWarning';



export function ReviewPage() {

    const wordReviews = useWordReviews();

    const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
    const [exercises, setExercises] = useState<WordReviewListeningExercise[]>([]);
    const [loading, setLoading] = useState(false);
    const [isCompleted, setIsCompleted] = useState(false);

    const sub = MeHook.useSubscription();
    const isPremiumUser = useMemo(() => Helper.isPremiumUser(sub), [sub]);


    function shuffle(array: any[]) {
        let currentIndex = array.length;

        // While there remain elements to shuffle...
        while (currentIndex != 0) {

            // Pick a remaining element...
            let randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex--;

            // And swap it with the current element.
            [array[currentIndex], array[randomIndex]] = [
                array[randomIndex], array[currentIndex]];
        }
    }

    /**
     * @desc Build exercises
     */
    useEffect(() => {
        if (!isPremiumUser) {
            return;
        }
        if (!wordReviews.data?.word_reviews) {
            setExercises([]);
            return;
        }

        let res: WordReviewListeningExercise[] = [];
        for (let i = 0; i < wordReviews.data.word_reviews.length; i++) {
            let wordReview = wordReviews.data.word_reviews[i];

            let podcastKeys = Object.keys(wordReview.real_wrong_stats);
            for (let podcastIndex = 0; podcastIndex < podcastKeys.length; podcastIndex++) {
                let podcastKey = podcastKeys[podcastIndex];
                let wrongPhrases = wordReview.real_wrong_stats[podcastKey];

                for (let j = 0; j < wrongPhrases.length; j++) {
                    res.push({
                        type: 'listening',
                        id: v4(),
                        data: {
                            word: wordReview.word,
                            word_index: wrongPhrases[j].index,
                            submit_id: wrongPhrases[j].submit_id,
                            user_word: wrongPhrases[j].user_word,
                            podcast_id: Number(podcastKey)
                        }
                    });
                };
            }
        }

        shuffle(res);
        setExercises(res);

    }, [wordReviews.data?.word_reviews, isPremiumUser]);


    const onSubmitExercise = async (data: any, status: number = 1) => {
        setLoading(true);
        let currentExercise = exercises[currentExerciseIndex];
        let updatedExercises = exercises.map((exercise, index) => {
            let e = { ...exercise };
            if (index == currentExerciseIndex) {
                e.status = status;
                e.submit_data = data;
            }
            return e;
        });


        let word = currentExercise.data.word;
        let totalWordExercises = updatedExercises.filter(e => e.data.word == word).length;


        let completedWordExercises = updatedExercises.filter(e => e.data.word == word && e.status == 1).length;

        if (completedWordExercises >= 1 && (completedWordExercises / totalWordExercises) >= 0.5) {
            // Congratulation
            await Fetch.postWithAccessToken('/api/word.review/complete', {
                word: word,
            });
        }


        setExercises(updatedExercises);


        if (currentExerciseIndex + 1 >= exercises.length) {
            // Congratulation
            setIsCompleted(true);
            await Fetch.postWithAccessToken('/api/word.review/complete.today', {

            });
        } else {


            setCurrentExerciseIndex(currentExerciseIndex + 1);
        }

        setLoading(false);

    }

    const renderExercise = (exercise: WordReviewListeningExercise) => {
        if (!exercise) {
            return <></>
        }
        if (exercise.type == 'listening') {
            return <ListeningExercise onSubmit={onSubmitExercise} exercise={exercise} />
        }

        return <> </>
    };


    if (!wordReviews.data?.word_reviews || wordReviews.isLoading || wordReviews.isValidating) {
        return <></>
    }

    if (!isPremiumUser) {
        return <PremiumWarning />;
    }


    return (
        <div className="bg-gray-50 min-h-screen mb-[-40px] pb-6">
            <Container>
                <div className='h-8'></div>
                {!isCompleted && !wordReviews.data?.review_action_log && <ProgressBar exercises={exercises} currentExerciseIndex={currentExerciseIndex} setCurrentExerciseIndex={setCurrentExerciseIndex} />}
                <div className='h-8'></div>
                <div className='bg-white rounded-sm p-8'>
                    {
                        wordReviews.data?.review_action_log && <>
                            <ReviewCongratulation />
                        </>
                    }
                    {isCompleted ?
                        <ReviewCongratulation />
                        : <>{loading ? <div className='text-center'>Loading ...</div> : renderExercise(exercises[currentExerciseIndex])}</>}
                </div>

            </Container>
        </div>
    );
}
