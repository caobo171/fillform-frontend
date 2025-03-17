import { createSlice } from '@reduxjs/toolkit'
import _ from 'lodash';

type State = {
    loading: boolean,
    status: string,
    progress: number,
};

const initialState: State = {
    loading: false,
    status: 'success',
    progress: 0
};

const loadingSlice = createSlice({
    name: 'loading',
    initialState,
    reducers: {
        loading: (state, action: { payload: {value: boolean, progress: number} }) => {
            state = {
                ...state,
                loading: action.payload.value,
                progress: action.payload.progress
            };

            return {
                ...state
            }
        }
    },
})

export const { loading } = loadingSlice.actions
export default loadingSlice.reducer