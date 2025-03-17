import {useSelector} from 'react-redux';
import { State } from './slice';

const useLoading = ()=>{
    return useSelector((state: {loading: State})=>{
        return {
            progress: state.loading.progress,
            loading: state.loading.loading,
            show_loading: state.loading.show_loading
        }
    });
};


export const LoadingHook = {
    useLoading
};