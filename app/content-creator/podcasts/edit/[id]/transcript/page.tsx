import Fetch from "@/lib/core/fetch/Fetch";
import { RawCertification, RawPodcast,  } from "@/store/types";
import { cookies } from 'next/headers';
import Detail from './comp';


export default async ({ params }: { params: { id: string } }) => {

    const res = await Fetch.postWithAccessToken<{ podcast: RawPodcast, code: number, message: string }>('/api/podcasts/detail', {
        id: params.id, is_admin: true
    }, { access_token: cookies().get("access_token")?.value || '' });


    return <Detail podcast={res.data.podcast} />
};