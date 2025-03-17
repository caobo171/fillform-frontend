import Fetch from "@/lib/core/fetch/Fetch";
import { MeFunctions } from '@/store/me/functions';
import { PodcastCollectionFunctions } from '@/store/podcast.collection/functions';
import * as firebase from 'firebase/app';
import LogEvent from "@/packages/firebase/LogEvent";
import { FIREBASE_CONFIG } from "@/core/Constants";
import { ChallengeFunctions } from "@/store/challenge/funtions";
import Cookie from "@/lib/core/fetch/Cookie";
import { Helper } from "@/services/Helper";

class Startup {
	async init() {
		if (firebase.getApps().length === 0) {
			firebase.initializeApp(FIREBASE_CONFIG);
		}


		//@ts-ignore
		if (Helper.getURLParam('access_token')) {
			Cookie.set('mobile', 'true', 100);
		}


		let access_token = Cookie.fromDocument("access_token");
		if (Helper.getURLParam('access_token')) {
			access_token = Helper.getURLParam('access_token');
		}



		if (access_token) {
			Cookie.set("access_token", access_token, 100);
			try {
			
				await MeFunctions.loadProfile();
			} catch (e) {

			}

		} else {

		}

		await PodcastCollectionFunctions.loadAll();
		LogEvent.sendEvent("first.event");
	}
}

export default new Startup();