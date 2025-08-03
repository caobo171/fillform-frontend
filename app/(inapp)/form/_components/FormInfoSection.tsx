import { useMe } from '@/hooks/user';
import { RawForm } from '@/store/types';
import Link from 'next/link'

interface FormInfoSectionProps {
    dataForm?: {
        form: RawForm;
        config: any;

    };
}

export const FormInfoSection = ({ dataForm }: FormInfoSectionProps) => {

    return (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold mb-4 text-gray-900">Thông tin Form</h3>
            <div className="grid md:grid-cols-2 gap-4">
                <div className="relative">
                    <label htmlFor="urlMain" className="absolute -top-2 left-2 inline-block bg-white px-1 text-xs font-medium text-gray-600">
                        Link Form
                    </label>
                    <div className="flex">
                        <span className="inline-flex items-center px-3 text-gray-500 bg-gray-50 border border-r-0 border-gray-300 rounded-l-md">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                            </svg>
                        </span>
                        <input type="text" id="urlMain" name="urlMain" defaultValue={dataForm?.form.urlMain}
                            className="rounded-r-md border-gray-300 flex-1 appearance-none border px-3 py-2 bg-white text-gray-700 placeholder-gray-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent" />
                    </div>
                </div>
                <div className="relative">
                    <label htmlFor="urlCopy" className="absolute -top-2 left-2 inline-block bg-white px-1 text-xs font-medium text-gray-600">
                        Tên Form
                    </label>
                    <div className="flex">
                        <span className="inline-flex items-center px-3 text-gray-500 bg-gray-50 border border-r-0 border-gray-300 rounded-l-md">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                        </span>
                        <input type="text" id="urlCopy" name="urlCopy" defaultValue={dataForm?.form.name}
                            className="rounded-r-md border-gray-300 flex-1 appearance-none border px-3 py-2 bg-white text-gray-700 placeholder-gray-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent" />
                    </div>
                </div>
            </div>
        </div>
    )
}
