import Fetch from "@/lib/core/fetch/Fetch";
import { RawCertification,  } from "@/store/types";
import { cookies } from 'next/headers';
import CertificationDetail from './comp';


export default async ({ params }: { params: { id: string } }) => {

    const res = await Fetch.postWithAccessToken<{ certification: RawCertification, code: number, message: string }>('/api/certification/detail', {
        id: params.id, is_admin: true
    }, { access_token: cookies().get("access_token")?.value || '' });


    return <CertificationDetail certification={res.data.certification} />
};