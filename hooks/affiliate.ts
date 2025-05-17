import useSWR from 'swr';
import Fetch from '@/lib/core/fetch/Fetch';
import { Code } from '@/core/Constants';

export function useAdminWithdrawals(page: number, pageSize: number, filters: any = {}) {
  const { q } = filters;
  
  return useSWR(
    ['/api/affiliate/list.withdraw.admin', page, pageSize, q],
    async () => {
      const res = await Fetch.postWithAccessToken<any>('/api/affiliate/list.withdraw.admin', {
        page,
        page_size: pageSize,
        q
      });
      
      if (res.data.code === Code.SUCCESS) {
        return {
          requests: res.data.requests || [],
          total: res.data.total || 0
        };
      }
      
      return {
        requests: [],
        total: 0
      };
    }
  );
}

export function markWithdrawalAsDone(id: string) {
  return Fetch.postWithAccessToken<any>('/api/affiliate/request.markdone', {
    id
  });
}
