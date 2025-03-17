import clsx from 'clsx';
import { ReactElement } from 'react';

import { nunitoSans } from '@/app/(outside)/constants';

import './styles.css';

export default function Layout({ children }: { children: ReactElement }) {
  return (
    <div className={clsx('min-h-full', nunitoSans.className)}>
      <main>{children}</main>
    </div>
  );
}
