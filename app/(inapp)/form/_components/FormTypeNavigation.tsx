import { useMe } from '@/hooks/user';
import Link from 'next/link'

interface FormTypeNavigationProps {
  formId?: string | number;
  type: 'rate' | 'prefill' | 'ai' | 'build';
}

export const FormTypeNavigation = ({ formId, type }: FormTypeNavigationProps) => {

  const user = useMe();
  const buttonStyles = (isActive: boolean) =>
    `flex items-center px-5 py-2.5 rounded-lg font-medium transition ${isActive
      ? 'bg-primary-600 text-white hover:bg-primary-700'
      : 'border border-primary-600 text-primary-600 hover:bg-primary-50'
    }`;

  return (
    <div className="flex flex-wrap justify-center gap-2 my-6">
      <Link href={`/form/${formId}`} className={buttonStyles(type === 'rate')}>
        <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
        Điền theo tỉ lệ mong muốn
      </Link>
      <Link href={`/form/prefill/${formId}`} className={buttonStyles(type === 'prefill')}>
        <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 7v10c0 2 1 3 3 3h10c2 0 3-1 3-3V7c0-2-1-3-3-3H7c-2 0-3 1-3 3z M8 4.5V7 M12 4.5V7 M16 4.5V7 M8 12h8" />
        </svg>
        Điền theo data có trước
      </Link>

      <Link href={`/form/build/${formId}`} className={buttonStyles(type === 'build')}>
        <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 21h18M9 8h1m-1 4h1m-1 4h1m4-8h1m-1 4h1m-1 4h1M5 21V5a2 2 0 012-2h10a2 2 0 012 2v16" />
        </svg>
        <span className="flex items-center">Điền theo mô hình NCKH
          {/* <span className="ml-1.5 text-xs px-1.5 py-0.5 bg-amber-100 text-amber-800 rounded-md font-medium">Beta</span> */}
        </span>
      </Link>
      <Link href={`/form/ai/${formId}`} className={buttonStyles(type === 'ai')}>
        <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
        </svg>
        <span className="flex items-center">Điền form bằng AI agent
          {/* <span className="ml-1.5 text-xs px-1.5 py-0.5 bg-amber-100 text-amber-800 rounded-md font-medium">Beta</span> */}
        </span>
      </Link>



    </div>
  )
}
