import AssignmentPage from '@/app/admin/classes/assignment/[id]/AssignmentPage';
import { generateMetadata as generateAssignmentMetadata } from '@/app/admin/classes/assignment/[id]/page';
import { PageProps } from '@/store/types';

export async function generateMetadata(props: PageProps) {
  return generateAssignmentMetadata(props);
}
export default function Page({ params }: { params: { id: string } }) {
  return <AssignmentPage params={params} routerGroup="teacher" />;
}
