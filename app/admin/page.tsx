import { Metadata } from 'next';
import Users from './users/_components/Users';


export const metadata: Metadata = {
  title: 'Podcasts',
};

export default function Page() {
  return <Users />
}
