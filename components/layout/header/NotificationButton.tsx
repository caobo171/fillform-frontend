import { BellIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import React from 'react';

import { useNotificationContext } from '@/components/layout/header/NotificationContext';

export function NotificationButton() {
  const { unseen, system_unseen: systemUnseen } = useNotificationContext();

  return (
    <Link
      href="/user/notifications"
      className="text-gray-900 relative w-10 h-10 rounded-full bg-gray-150 flex justify-center items-center hover:bg-gray-200"
    >
      <span className="sr-only">View notifications</span>
      <BellIcon className="h-5 w-auto" aria-hidden="true" />
      {unseen + systemUnseen > 0 && (
        <span className="absolute -top-2 -right-2 h-5 w-5 bg-red-500 rounded-full text-white text-sm">
          (unseen + system_unseen)
        </span>
      )}
    </Link>
  );
}
