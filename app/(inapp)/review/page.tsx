import { Metadata } from 'next';
import { ReviewPage } from './ReviewPage';

export const metadata: Metadata = {
  title: 'Ôn lại lỗi sai - WELE',
  description: 'Ôn lại lỗi sai - WELE',
};

export default function Page() {
  return <ReviewPage />;
}
