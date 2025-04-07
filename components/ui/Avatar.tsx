import clsx from 'clsx';
import Link from 'next/link';
import React, { useMemo, useState } from 'react';
import { twMerge } from 'tailwind-merge';

import Constants from '@/core/Constants';
import { Helper } from '@/services/Helper';
import UI from '@/services/UI';
import { RawUser } from '@/store/types';

interface Props {
  user: RawUser;
  size?: number;
  unlink?: boolean;
  className?: string;
  textClassName?: string;
}

function Avatar({ user, size, unlink, className, textClassName }: Props) {
  const [loadImageError, setLoadImageError] = useState<boolean>(false);

  const realSize = useMemo(() => size || 40, [size]);

  const style: React.CSSProperties = useMemo(
    () => ({
      height: realSize,
      width: realSize,
      maxHeight: realSize,
      minWith: realSize,
      minHeight: realSize,
      minWidth: realSize,
    }),
    [realSize]
  );

  if (!user) {
    return null;
  }

  if (unlink) {
    return (
      <div
        title={user.username}
        style={{ ...style }}
        className={clsx(
          'rounded-full flex justify-center items-center ring-2 ring-gray-100 overflow-hidden',
          className
        )}
      >
        {user?.avatar && !loadImageError ? (
          <img
            alt={user.username}
            style={{ ...style }}
            src={Constants.IMAGE_URL + user.avatar}
            onError={() => setLoadImageError(true)}
          />
        ) : (
          <div
            style={{
              backgroundColor: UI.getColorByString(user?.username),
              ...style,
            }}
            className="w-9 h-9 rounded-full bg-cover bg-center flex items-center justify-center px-2"
          >
            <span
              className={twMerge(
                'text-white font-medium text-sm',
                textClassName
              )}
            >
              {user?.username?.slice(0, 2)}
            </span>
          </div>
        )}
      </div>
    );
  }

  return (
    <Link
      href={`/`}
    >
      <div
        style={{ ...style }}
        className={clsx(
          'rounded-full cursor-pointer flex justify-center items-center ring-2 ring-gray-100 overflow-hidden',
          className
        )}
      >
        {user?.avatar && !loadImageError ? (
          <img
            alt={user.username}
            style={{ ...style }}
            src={Constants.IMAGE_URL + user.avatar}
            onError={() => setLoadImageError(true)}
          />
        ) : (
          <div
            style={{
              backgroundColor: UI.getColorByString(user.username),
              ...style,
            }}
            className="w-9 h-9 rounded-full bg-cover bg-center flex items-center justify-center px-2"
          >
            <span
              className={twMerge(
                'text-white font-medium text-sm',
                textClassName
              )}
            >
              {user?.fullname?.slice(0, 2)}
            </span>
          </div>
        )}
      </div>
    </Link>
  );
}

export default Avatar;
