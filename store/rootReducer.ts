import {combineReducers} from 'redux';

import MeReducer from './me/slice';
import LoadingReducer from './loading/slice';
import UserReducer from  './user/slice';
import CongratReducer from './congrat/slice';

const appReducer = combineReducers({
    me: MeReducer,
    loading: LoadingReducer,
    user: UserReducer,
    congrat: CongratReducer,
});


export default appReducer;