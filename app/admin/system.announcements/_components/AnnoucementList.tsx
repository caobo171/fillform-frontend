import { useCallback, useState } from 'react';
import { toast } from 'react-toastify';
import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';
import { EyeIcon, SearchIcon } from 'lucide-react';

import { Badge, Button, LocalPagination } from '@/components/common';
import Constants, { Code } from '@/core/Constants';
import Fetch from '@/lib/core/fetch/Fetch';
import { RawSystemAnnoucement } from '@/store/types';
import { AnyObject } from '@/store/interface';
import { AnnoucementCreateForm } from './AnnoucementCreateForm';
import LoadingAbsolute from '@/components/loading';
import { Helper } from '@/services/Helper';
import { AnnouncementDialog } from '@/components/announcement/AnnouncementDialog';

const ITEMS_PER_PAGE = 10;

export function AnnoucementList() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<RawSystemAnnoucement | undefined>(undefined);
  const [previewAnnouncement, setPreviewAnnouncement] = useState<RawSystemAnnoucement | undefined>(undefined);

  const { data, mutate } = useSWR(`/api/system.announcement/list.admin`, async (url) => {
    const response = await Fetch.postWithAccessToken<any>(url, {
    });
    const responseData = response.data as any;
    return {
      annoucements: responseData.annoucements as RawSystemAnnoucement[],
      annoucement_num: responseData.annoucement_num as number,
      code: responseData.code as number
    };
  });
  const annoucements: RawSystemAnnoucement[] = data?.annoucements || [];

  const { trigger: enableAnnoucement } = useSWRMutation(
    '/api/system.announcement/enable',
    Fetch.postFetcher.bind(Fetch)
  );

  const { trigger: removeAnnoucement } = useSWRMutation(
    '/api/system.announcement/remove',
    Fetch.postFetcher.bind(Fetch)
  );

  const handleToggleStatus = useCallback(async (id: number, currentStatus: string) => {
    const result: AnyObject = await enableAnnoucement({
      payload: {
        id,
        status: currentStatus === 'enabled' ? 'disabled' : 'enabled',
      },
    });

    if (result?.data?.code === Code.Error) {
      toast.error(result?.data?.message);
    } else {
      toast.success('Cập nhật trạng thái thành công');
      mutate();
    }
  }, [enableAnnoucement, mutate]);

  const handleRemove = useCallback(async (id: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa thông báo này?')) {
      return;
    }

    setIsLoading(true);
    try {
      const result: AnyObject = await removeAnnoucement({
        payload: { id },
      });

      if (result?.data?.code === Code.Error) {
        toast.error(result?.data?.message);
      } else {
        toast.success('Xóa thông báo thành công');
        mutate();
      }
    } catch (error) {
      toast.error('Có lỗi xảy ra khi xóa thông báo');
    } finally {
      setIsLoading(false);
    }
  }, [removeAnnoucement, mutate]);
  
  const handleEdit = useCallback((announcement: RawSystemAnnoucement) => {
    setSelectedAnnouncement(announcement);
    setIsEditModalOpen(true);
  }, []);
  
  const handlePreview = useCallback((announcement: RawSystemAnnoucement) => {
    setPreviewAnnouncement(announcement);
    setIsPreviewModalOpen(true);
  }, []);

  const onPageChange = useCallback(
    (value: number) => {
      setCurrentPage(value);
      mutate();
    },
    [mutate]
  );

  const handleSearch = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        const { value } = e.currentTarget;
        setQuery(value);
        setCurrentPage(1);
        mutate();
      }
    },
    [mutate]
  );

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Thông báo hệ thống</h1>
          <p className="mt-2 text-sm text-gray-700">
            Danh sách tất cả các thông báo hệ thống
          </p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none flex gap-4">
          <div className="mt-2 grid grid-cols-1">
            <input
              type="text"
              placeholder="Nhấn enter để tìm kiếm"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleSearch}
              className="col-start-1 row-start-1 block w-full rounded-md bg-white py-1.5 pl-10 pr-3 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:pl-9 sm:text-sm/6"
            />
            <SearchIcon
              aria-hidden="true"
              className="pointer-events-none col-start-1 row-start-1 ml-3 size-5 self-center text-gray-400 sm:size-4"
            />
          </div>
          <Button onClick={() => setIsCreateModalOpen(true)}>
            Thêm thông báo mới
          </Button>
        </div>
      </div>

      {isLoading ? <LoadingAbsolute /> : null}

      <div className="mt-4 flow-root">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            {data?.annoucements?.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-gray-500">Không có thông báo nào</p>
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="py-3.5 md:pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0">
                      #
                    </th>
                    <th scope="col" className="py-3.5 md:pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0">
                      Ảnh
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Nội dung
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Loại
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Trạng thái
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Ngày tạo
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Hành động
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {annoucements.map((announcement, index) => (
                    <tr key={announcement.id}>
                      <td className="whitespace-nowrap py-2 md:pl-4 pr-3 text-sm sm:pl-0">
                        {((currentPage - 1) * ITEMS_PER_PAGE + index + 1).toString().padStart(2, '0')}
                      </td>
                      <td className="whitespace-nowrap py-2 md:pl-4 pr-3 text-sm sm:pl-0">
                        <div className="w-16 h-16 overflow-hidden rounded">
                          {announcement.image ? (
                            <img src={Constants.IMAGE_URL + announcement.image} alt="Announcement" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500">
                              No Image
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-3 py-2 text-sm text-gray-900">
                        <div className="max-w-md truncate">{Helper.purify(announcement.content)}</div>
                        {announcement.link && (
                          <div className="text-xs text-blue-600 mt-1 truncate">
                            <a href={announcement.link} target="_blank" rel="noopener noreferrer">
                              {announcement.link}
                            </a>
                          </div>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-3 py-2 text-sm text-gray-500">
                        <Badge type={announcement.type === 'first_time' ? 'blue' : 'green'}>
                          {announcement.type === 'first_time' ? 'First Time' : 'Every Login'}
                        </Badge>
                      </td>
                      <td className="whitespace-nowrap px-3 py-2 text-sm text-gray-500">
                        <Badge type={announcement.status === 'enabled' ? 'green' : 'gray'}>
                          {announcement.status === 'enabled' ? 'Kích hoạt' : 'Vô hiệu'}
                        </Badge>
                      </td>
                      <td className="whitespace-nowrap px-3 py-2 text-sm text-gray-500">
                        {new Date(announcement.createdAt).toLocaleDateString()}
                      </td>
                      <td className="whitespace-nowrap px-3 py-2 text-sm text-gray-500">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleToggleStatus(announcement.id, announcement.status)}
                            className={`inline-flex items-center p-2 ${announcement.status === 'enabled' ? 'text-yellow-600 hover:bg-yellow-50' : 'text-green-600 hover:bg-green-50'} rounded`}
                            title={announcement.status === 'enabled' ? 'Vô hiệu hóa' : 'Kích hoạt'}
                          >
                            <span className="sr-only">{announcement.status === 'enabled' ? 'Vô hiệu hóa' : 'Kích hoạt'}</span>
                            {announcement.status === 'enabled' ? (
                              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                              </svg>
                            ) : (
                              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                              </svg>
                            )}
                          </button>
                          <button
                            onClick={() => handlePreview(announcement)}
                            className="inline-flex items-center p-2 text-indigo-600 hover:bg-indigo-50 rounded"
                            title="Xem trước thông báo"
                          >
                            <span className="sr-only">Xem trước</span>
                            <EyeIcon className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleEdit(announcement)}
                            className="inline-flex items-center p-2 text-blue-600 hover:bg-blue-50 rounded"
                            title="Chỉnh sửa thông báo"
                          >
                            <span className="sr-only">Chỉnh sửa</span>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleRemove(announcement.id)}
                            className="inline-flex items-center p-2 text-red-600 hover:bg-red-50 rounded"
                            title="Xóa thông báo"
                          >
                            <span className="sr-only">Xóa</span>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      <LocalPagination
        total={data?.annoucement_num || 0}
        current={currentPage}
        pageSize={ITEMS_PER_PAGE}
        onChange={onPageChange}
      />

      <AnnoucementCreateForm
        open={isCreateModalOpen}
        onCancel={() => setIsCreateModalOpen(false)}
        onSuccess={() => mutate()}
      />
      
      <AnnoucementCreateForm
        open={isEditModalOpen}
        editMode={true}
        announcement={selectedAnnouncement}
        onCancel={() => {
          setIsEditModalOpen(false);
          setSelectedAnnouncement(undefined);
        }}
        onSuccess={() => {
          mutate();
          setSelectedAnnouncement(undefined);
        }}
      />
      
      <AnnouncementDialog
        open={isPreviewModalOpen}
        announcement={previewAnnouncement}
        onClose={() => {
          setIsPreviewModalOpen(false);
          setPreviewAnnouncement(undefined);
        }}
      />
    </div>
  );
}
