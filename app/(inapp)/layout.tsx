'use client';

import { useLocalStorage } from '@uidotdev/usehooks';
import { usePathname, useRouter } from 'next/navigation';
import { PropsWithChildren, useEffect, useState } from 'react';
import NormalLayout from './_components/Layout';
import { ClientOnly } from '@/components/common/ClientOnly';
import { useMe } from '@/hooks/user';
import Fetch from '@/lib/core/fetch/Fetch';
import { RawSystemAnnoucement } from '@/store/types';
import { AnnouncementDialog } from '@/components/announcement/AnnouncementDialog';

export default function InappLayout({ children }: PropsWithChildren) {
  const me = useMe();
  const [first_annoucement, setFirstAnnoucement] = useState<RawSystemAnnoucement | null>(null);
  const [login_annoucement, setLoginAnnoucement] = useState<RawSystemAnnoucement | null>(null);

  const [showFirstAnnoucement, setShowFirstAnnoucement] = useState(false);
  const [showLoginAnnoucement, setShowLoginAnnoucement] = useState(false);

  useEffect(() => {
    (async () => {
      if (me.data && !first_annoucement && !login_annoucement) {
        const res = await Fetch.postWithAccessToken<any>('/api/system.announcement/user.get', {

        });
        const { first_annoucement, login_annoucement } = res.data;
        if (first_annoucement) {
          setFirstAnnoucement(first_annoucement);
        }
        if (login_annoucement) {
          setLoginAnnoucement(login_annoucement);
        }
      }
    })();
  }, [me]);


  useEffect(() => {
    if (first_annoucement) {
      // Check whether the local storage doesnt have the first_annoucement and the user is created today, showing Announcement here
      const created_at = me.data?.createdAt;
      if (!created_at) {
        return;
      }
      const created_date = new Date(created_at).getTime();
      const today = new Date().getTime();
      if (today - created_date > 24 * 2 * 60 * 60 * 1000) {
        return;
      }
      if (!localStorage.getItem('survify_first_annoucement_' + me.data?.id)) {
        localStorage.setItem('survify_first_annoucement_' + me.data?.id, 'true');
        setShowFirstAnnoucement(true);
      }
    }
  }, [first_annoucement, me]);

  useEffect(() => {
    if (login_annoucement) {

      const announcementKey = `survify_login_annoucement_${me.data?.id}_${login_annoucement.id}`;
      const storedTimestampStr = localStorage.getItem(announcementKey);
      const startOfToday = new Date().setHours(0, 0, 0, 0);

      let shouldShow = true;
      if (storedTimestampStr) {
        const storedTimestamp = parseInt(storedTimestampStr, 10);
        if (!isNaN(storedTimestamp) && storedTimestamp >= startOfToday) {
          shouldShow = false;
        }
      }

      if (shouldShow) {
        localStorage.setItem(announcementKey, Date.now().toString());
        setShowLoginAnnoucement(true);
      }
    }
  }, [login_annoucement, me]);


  return (
    <ClientOnly>
        <NormalLayout>
          {children}
        </NormalLayout>

        {
          first_annoucement && (
            <AnnouncementDialog
              announcement={first_annoucement}
              open={showFirstAnnoucement}
              onClose={() => setShowFirstAnnoucement(false)}
            />
          )
        }

        {
          login_annoucement && (
            <AnnouncementDialog
              announcement={login_annoucement}
              open={showLoginAnnoucement}
              onClose={() => setShowLoginAnnoucement(false)}
            />
          )
        }
    </ClientOnly>
  )
}
