import Fetch from "@/lib/core/fetch/Fetch";
import { RawCertification, RawPodcast, RawSystemNotification, } from "@/store/types";
import { cookies } from 'next/headers';
import Detail from './comp';


export default async ({ params }: { params: { id: string } }) => {

    const res = await Fetch.postWithAccessToken<{ system_notification: RawSystemNotification, code: number, message: string }>('/api/system.notification/detail', {
        id: params.id, is_admin: true
    }, { access_token: cookies().get("access_token")?.value || '' });



    return <Detail notification={res.data.system_notification} />
};