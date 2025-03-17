import Fetch from '@/lib/core/fetch/Fetch';
import { RawBadge } from '@/store/types';
import store from '../store';
import * as CongratActions from './slice';

const load = async (msg: string, storex = store) => {
    return storex.dispatch(CongratActions.load(msg));
}


const reset = async (storex = store) => {
    return storex.dispatch(CongratActions.reset(''));
}




export const CongratFunctions = {
    reset,
    load
};