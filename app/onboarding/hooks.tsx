import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import useSWRMutation from 'swr/mutation';

import { Code } from '@/core/Constants';
import Fetch from '@/lib/core/fetch/Fetch';
import { AnyObject } from '@/store/interface';
import { MeFunctions } from '@/store/me/functions';

export function useSaveAndContinue(
  field: string,
  value: string | number | undefined,
  nextRouter: string
) {
  const router = useRouter();

  const { trigger: update, isMutating } = useSWRMutation(
    '/api/me/update.single.info',
    Fetch.postFetcher.bind(Fetch)
  );

  const saveAndContinue = async () => {
    if (!value) {
      return;
    }

    const result: AnyObject = await update({
      payload: { field, value },
    });

    if (result?.data?.code === Code.Error) {
      toast.error(result?.data?.message, { position: 'top-center' });
    } else {
      router.push(nextRouter);

      // refresh to get latest data
      MeFunctions.loadProfile();
    }
  };

  return { saveAndContinue, isMutating };
}
