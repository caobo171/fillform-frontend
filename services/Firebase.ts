import Constants, { FIREBASE_CONFIG } from '@/core/Constants';
import * as firebase from 'firebase/app';
import 'firebase/firestore';

const instanceFirebaseApp = ()=> {
    if(firebase.getApps().length == 0){
        firebase.initializeApp(FIREBASE_CONFIG);
    }

    return firebase.getApp();
}

export default instanceFirebaseApp;