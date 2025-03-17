import { Helper } from "@/services/Helper";
import { RawWeleClass } from "@/store/types";

export class WeleClass {

    static getURL(weleclass: RawWeleClass) {
        return `/classes/detail/${Helper.generateCode(weleclass.name)}/${weleclass.id}`
    }

    static getReportURL(weleclass: RawWeleClass) {
        return WeleClass.getURL(weleclass) + '/report';
    }

    static getPodcastsURL(weleclass: RawWeleClass) {
        return WeleClass.getURL(weleclass) + '/podcasts';
    }
}