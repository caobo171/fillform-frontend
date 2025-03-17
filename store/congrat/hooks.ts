import {useSelector} from 'react-redux';
import { State } from './slice';

const useCongrat = ()=>{
    return useSelector((state: {congrat: State})=>{
        return {
            congrat: state.congrat.congrat_msg,
        }
    });
};


export const CongratHook = {
    useCongrat
};