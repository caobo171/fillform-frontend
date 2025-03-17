
import Fetch from '@/lib/core/fetch/Fetch';
import { RawUserActionLog } from '@/store/types';
import { NewsFeedDetail } from '../_components/Detail';



export default async ({ params }: { params: { id: string } }) => {

    const res = await Fetch.post<{ user_action_log: RawUserActionLog, code: number }>('/api/user.action.log/detail', {
        id: params.id
    })


    return <NewsFeedDetail action_log={res.data.user_action_log} />
};