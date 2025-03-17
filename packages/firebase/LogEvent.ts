import Constants, { FIREBASE_CONFIG } from '@/core/Constants';
import * as firebase from 'firebase/app';
import analytic, {logEvent, getAnalytics} from 'firebase/analytics';
class LogEvent {
    async sendEvent(event_name: string, object?: any) {
        if (firebase.getApps().length === 0) {
            await firebase.initializeApp(FIREBASE_CONFIG);
        }
        const analytics = getAnalytics();
        //TODO: FIX LATER
        if (object) {
            console.log("firebase_app_" + firebase.getApps().length);
            await logEvent(analytics, event_name, object);

        }
        else {
            console.log("firebase_app_" + firebase.getApps().length);
            await logEvent(analytics, event_name);
        }
    }
}

export default new LogEvent();