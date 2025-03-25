import { createSlice } from '@reduxjs/toolkit'
import { RawUser } from '../types'

type State = {
	profile: RawUser | null,
};

const initialState: State = {
	profile: null,
};

type LoadProfilePayload = {
	user: RawUser | null,
}

const meSlice = createSlice({
	name: 'me',
	initialState,
	reducers: {
		loadProfile(state, action: { payload: LoadProfilePayload }) {
			state = {
				...state,
				profile: action.payload.user,
			};

			return state;
		},
	},
})

export const { loadProfile } = meSlice.actions
export default meSlice.reducer