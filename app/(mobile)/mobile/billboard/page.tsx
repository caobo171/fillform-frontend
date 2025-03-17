import { Billboard } from '@/app/(inapp)/billboard/Billboard';
import type { Metadata } from 'next';


export const metadata: Metadata = {
    title: 'Bảng xếp hạng - WELE',
    description: 'Bảng xếp hạng - WELE',
};

export default function Page() {
    return <Billboard />;
}
