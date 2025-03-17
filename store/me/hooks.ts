import { useSelector } from 'react-redux'
import { RawSubscription, RawUser, RawUserPlaylist, RawWeleClass } from '@/store/types';



const useMe = () => {
	return useSelector((state: any) => {
		return state.me.profile as RawUser | null
	});
};


const useSubscription = () => {
	return useSelector((state: any) => {
		return state.me.sub as RawSubscription
	});
};



const useClasses = () => {
	return useSelector((state: any) => {
		return state.me.classes as RawWeleClass[]
	});
};



export const MeHook = {
	useMe,
	useClasses,
	useSubscription
};