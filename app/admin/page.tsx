import { Metadata } from 'next';
import Users from './users/_components/Users';


export const metadata: Metadata = {
  title: 'Users - Admin - Fillform',
  description: 'Users - Admin - Fillform',
  alternates: {
    canonical: 'https://appv2.fillform.info/admin/users',
  },
};

export default function Page() {
  return <Users />
}
