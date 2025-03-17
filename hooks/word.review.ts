import Fetch from "@/lib/core/fetch/Fetch";
import { RawBillboard, RawUserActionLog, WordReview } from "@/store/types";
import useSWR from "swr";

export const useWordReviews = () => {
    const res = useSWR(['/api/word.review/list', {}], async ([url]) => {
        const res = await Fetch.postWithAccessToken<{ word_reviews: WordReview[], review_action_log: RawUserActionLog | null }>(url, {

        });

        return {
            word_reviews: res.data.word_reviews,
            review_action_log: res.data.review_action_log
        }

    }, {

    });

    return res;
};
