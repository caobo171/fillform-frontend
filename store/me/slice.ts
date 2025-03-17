import { createSlice } from '@reduxjs/toolkit'
import { RawSubscription, RawUser, RawUserPlaylist, RawWeleClass } from '../types'
import _ from 'lodash';

type State = {
	profile: RawUser | null,
	classes: RawWeleClass[],
	playlists: RawUserPlaylist[],
	sub: RawSubscription | null,
};

const initialState: State = {
	profile: null,
	classes: [],
	playlists: [],
	sub: null,
};

type LoadProfilePayload = {
	user: RawUser | null,
	weleclasses: RawWeleClass[],
	playlists?: RawUserPlaylist[],
	sub: RawSubscription | null
}

const meSlice = createSlice({
	name: 'me',
	initialState,
	reducers: {
		loadProfile(state, action: { payload: LoadProfilePayload }) {
			state = {
				...state,
				profile: action.payload.user,
				classes: action.payload.weleclasses,
				playlists: action.payload.playlists ? action.payload.playlists : [],
				sub: action.payload.sub
			};

			return state;
		},

		loadClasses(state, action: { payload: { classes: RawWeleClass[] } }) {
			state = {
				...state,
				classes: action.payload.classes
			};

			return state;
		}
	},
})

export const { loadProfile, loadClasses } = meSlice.actions
export default meSlice.reducer