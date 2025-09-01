import { useMe } from '@/hooks/user';
import { RawDataModel } from '@/store/types';
import Link from 'next/link'

interface DataModelInfoSectionProps {
    dataModel?: {
        data_model: RawDataModel;
    };
}

export const DataModelInfoSection = ({ dataModel }: DataModelInfoSectionProps) => {

    return (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold mb-4 text-gray-900">Thông tin Model</h3>
            <div className="grid gap-4">
                <div className="relative">
                    <label htmlFor="urlCopy" className="absolute -top-2 left-2 inline-block bg-white px-1 text-xs font-medium text-gray-600">
                        Tên model
                    </label>
                    <div className="flex">
                        <span className="inline-flex items-center px-3 text-gray-500 bg-gray-50 border border-r-0 border-gray-300 rounded-l-md">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                        </span>
                        <input type="text" id="urlCopy" name="urlCopy" defaultValue={dataModel?.data_model.name}
                            className="rounded-r-md border-gray-300 flex-1 appearance-none border px-3 py-2 bg-white text-gray-700 placeholder-gray-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent" />
                    </div>
                </div>
            </div>
        </div>
    )
}
