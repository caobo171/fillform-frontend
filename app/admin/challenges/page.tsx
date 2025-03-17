import type { Metadata } from 'next';

import { Challenges } from './Challenges';

export const metadata: Metadata = {
  title: 'Challenges - WELE',
  description: 'List of challenges',
};

export default function Page() {
  return <Challenges />;
}
