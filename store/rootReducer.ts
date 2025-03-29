import {combineReducers} from 'redux';

import MeReducer from './me/slice';
import LoadingReducer from './loading/slice';
import CongratReducer from './congrat/slice';

const appReducer = combineReducers({
    me: MeReducer,
    loading: LoadingReducer,
    congrat: CongratReducer,
});


export default appReducer;