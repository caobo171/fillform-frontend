import { useSelector } from 'react-redux';
import { useAsync } from 'react-use';
import Fetch from '@/lib/core/fetch/Fetch';
import { RawUser } from '@/store/types';
import store from '../store'
import { UserFunctions } from './functions';

const useAll = () => {
    return useSelector((state: any) => {
        return state.user.users;
    });
}

const useFetchUsers = (ids: number[]): RawUser[] => {
    const state = useAsync(async () => {
        if (!ids) {
            return [];
        }
        const res = await Fetch.postWithAccessToken<{ users: RawUser[] }>('/api/user/ids', {
            ids: ids.join(',')
        });

        if (res.data.users) {
            UserFunctions.loadRawUsers(res.data.users);
        }
        return res.data.users;
    }, [ids.join(',')]);


    if (!state.value || state.error) {
        return []
    }

    return state.value;
};


const useUser = (user_id: number) => {
    return useSelector((state: any) => {
        return state.user.users[user_id];
    });
}


const useUserCount = () => {
    return useSelector((state: any) => {
        return Object.keys(state.user.users).length;
    });
}

export const UserHook = {
    useAll,
    useUser,
    useUserCount,
    useFetchUsers
}