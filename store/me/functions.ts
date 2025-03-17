import { Code } from '@/core/Constants';
import Fetch from '@/lib/core/fetch/Fetch';
import store from '../store';
import { RawSubscription, RawUser, RawUserPlaylist, RawWeleClass } from '../types';
import * as MeSlice from './slice';
import Cookie from '@/lib/core/fetch/Cookie';
import { mutate } from 'swr';


const loadProfile = async (storex = store) => {
	const res = await Fetch.postWithAccessToken<{
		user: RawUser,
		weleclasses: RawWeleClass[],
		playlists: RawUserPlaylist[],
		sub: RawSubscription,
		code: number
	}>(`/api/me/profile`, {});
	if (res.data && res.data.code == Code.SUCCESS) {
		mutate('/api/me/profile');
		return await storex.dispatch(MeSlice.loadProfile({ user: res.data.user, weleclasses: res.data.weleclasses, playlists: res.data.playlists, sub: res.data.sub }));
	} else {
		return await storex.dispatch(MeSlice.loadProfile({ user: null, weleclasses: [], playlists: [], sub: null }));
	}
};


const logout = async (storex = store) => {
	const res = await Fetch.postWithAccessToken<any>(`/api/auth/signout`, {});

	localStorage.removeItem("access_token");
	Cookie.set("access_token", "", 1);
	Cookie.set("mobile", "", 1);
	Cookie.set("weleclass", "", 1);
	Cookie.set("user", "", 1);
	Cookie.set("hide_banner", "", 1);
	await storex.dispatch(MeSlice.loadProfile({ user: null, weleclasses: [], playlists: [], sub: null }));
	mutate('/api/me/profile');
};


export const MeFunctions = {
	loadProfile,
	logout
};