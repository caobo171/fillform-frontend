import { useSelector } from 'react-redux'
import { RawUser } from '@/store/types';



const useMe = () => {
	return useSelector((state: any) => {
		return state.me.profile as RawUser | null
	});
};




export const MeHook = {
	useMe,
};