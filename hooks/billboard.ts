import Fetch from "@/lib/core/fetch/Fetch";
import { RawBillboard } from "@/store/types";
import useSWR from "swr";

export const useBillboards = (search_params: URLSearchParams) => {

    if (!search_params) {
        search_params = new URLSearchParams();
    }
    const res = useSWR('/api/user/billboard.get?' + search_params.toString(), async (url) => {
        const res = await Fetch.post<{ billboards: RawBillboard[], ts: string, type: string }>('/api/user/billboard.get', {
            ...Object.fromEntries(search_params.entries()),
        });

        return {
            billboards: res.data.billboards,
        }

    }, {

    });

    return res;
}