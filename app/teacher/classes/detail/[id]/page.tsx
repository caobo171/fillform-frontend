import { ClassDetailPage } from '@/app/admin/classes/detail/[id]/ClassDetailPage';
import { generateMetadata as generateClassDetailMetadata } from '@/app/admin/classes/detail/[id]/page';
import { PageProps } from '@/store/types';

export async function generateMetadata(props: PageProps) {
  return generateClassDetailMetadata(props);
}

export default function Page({ params }: { params: { id: string } }) {
  return <ClassDetailPage params={params} routerGroup="teacher" />;
}
