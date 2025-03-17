import {useSelector} from 'react-redux';
import { State } from './slice';

const useBadges = ()=>{
    return useSelector((state: {badge: State})=>{
        return {
            badges: state.badge.badges,
        }
    });
};


export const BadgeHook = {
    useBadges
};