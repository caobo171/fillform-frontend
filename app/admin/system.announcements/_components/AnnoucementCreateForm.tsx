import { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import useSWRMutation from 'swr/mutation';

import { Button, Input, Modal, ModalProps, Select } from '@/components/common';
import { FileUploader } from '@/components/form';
import Constants, { Code } from '@/core/Constants';
import Fetch from '@/lib/core/fetch/Fetch';
import { AnyObject } from '@/store/interface';
import { ReactQuillNoSSR } from '@/components/form/NoSSR';
import { RawSystemAnnoucement } from '@/store/types';

const announcementTypes = [
    { value: 'first_time', label: 'First Time Login' },
    { value: 'login', label: 'Every Login' },
];

interface AnnoucementFormProps extends ModalProps {
    onSuccess?: () => void;
    editMode?: boolean;
    announcement?: RawSystemAnnoucement;
}

export function AnnoucementCreateForm({ onCancel, onSuccess, editMode = false, announcement, ...rest }: AnnoucementFormProps) {
    const [image, setImage] = useState<File[]>([]);
    const [content, setContent] = useState('');
    const [link, setLink] = useState('');
    const [type, setType] = useState('first_time');
    const [existingImage, setExistingImage] = useState<string>('');

    const { trigger: create, isMutating: isCreating } = useSWRMutation(
        '/api/system.announcement/create',
        Fetch.postFetcher.bind(Fetch)
    );
    
    const { trigger: edit, isMutating: isEditing } = useSWRMutation(
        '/api/system.announcement/edit',
        Fetch.postFetcher.bind(Fetch)
    );
    
    const isLoading = isCreating || isEditing;

    const sendForm = useCallback(async () => {
        if ((!image.length && !existingImage) && !content) {
            toast.error('Vui lòng điền đầy đủ thông tin');
            return;
        }

        const payload: any = {
            content,
            link,
            // Only include type for new announcements, not for edits
            ...(editMode ? {} : { type }),
        };
        
        if (editMode && announcement) {
            payload.id = announcement.id;
            
            // Only include image if a new one is selected
            if (image.length > 0) {
                payload.image = image[0];
            }
            
            const result: AnyObject = await edit({
                payload,
            });

            if (result?.data?.code === Code.Error) {
                toast.error(result?.data?.message);
            } else {
                toast.success('Cập nhật thông báo thành công');
                onCancel?.();
                onSuccess?.();
            }
        } else {
            if (image.length > 0) {
                payload.image = image[0];
            }
            
            const result: AnyObject = await create({
                payload,
            });

            if (result?.data?.code === Code.Error) {
                toast.error(result?.data?.message);
            } else {
                toast.success('Tạo thông báo thành công');
                onCancel?.();
                onSuccess?.();
            }
        }
    }, [image, existingImage, content, link, type, editMode, announcement, create, edit, onCancel, onSuccess]);

    useEffect(() => {
        if (rest?.open && editMode && announcement) {
            setContent(announcement.content || '');
            setLink(announcement.link || '');
            setType(announcement.type || 'first_time');
            if (announcement.image) {
                setExistingImage(announcement.image);
            } else {
                setExistingImage('');
            }
            setImage([]);
        } else if (!rest?.open) {
            setImage([]);
            setContent('');
            setLink('');
            setType('first_time');
            setExistingImage('');
        }
    }, [rest?.open, editMode, announcement]);

    return (
        <Modal
            {...rest}
            title={editMode ? "Chỉnh sửa thông báo" : "Thêm thông báo"}
            width="560px"
            okText="Đóng"
            onCancel={onCancel}
            onOk={onCancel}
            cancelButtonProps={{ className: 'hidden' }}
        >
            <div className="py-4 text-sm text-gray-900">
                <div className="flex flex-col gap-3 mb-6 items-start">
                    <Select
                        className="w-full"
                        placeholder="Loại thông báo"
                        options={announcementTypes}
                        value={type}
                        onChange={(value) => setType(value as string)}
                        disabled={editMode}
                    />
                    {editMode && (
                        <p className="text-xs text-gray-500 mt-1">Loại thông báo không thể thay đổi sau khi tạo</p>
                    )}

                    <ReactQuillNoSSR
                        className="w-full"
                        placeholder="Nội dung thông báo"
                        defaultValue={content}
                        onChange={(value) => setContent(value)}
                    />

                    <Input
                        className="w-full"
                        placeholder="Link (nếu có), khi click vào ảnh"
                        value={link}
                        onChange={(e) => setLink(e.target.value)}
                    />

                    <div className="w-full">
                        {existingImage && (
                            <div className="mb-2">
                                <p className="text-sm text-gray-500 mb-2">Ảnh hiện tại:</p>
                                <div className="w-32 h-32 overflow-hidden rounded mb-2">
                                    <img 
                                        src={Constants.IMAGE_URL + existingImage} 
                                        alt="Current announcement image" 
                                        className="w-full h-full object-cover" 
                                    />
                                </div>
                            </div>
                        )}
                        <FileUploader
                            className="w-full"
                            icon={
                                <span className="text-gray-400 -mb-2">
                                    {existingImage ? 'Thay đổi ảnh (không bắt buộc)' : 'Ảnh để hiển thị'}
                                </span>
                            }
                            onChange={(files) => setImage(files)}
                        />
                    </div>

                    <Button loading={isLoading} onClick={sendForm}>
                        {editMode ? 'Cập nhật thông báo' : 'Tạo thông báo'}
                    </Button>
                </div>

                <p className="text-xs text-gray-500">
                    Chú ý: Thông báo sẽ được hiển thị cho người dùng sau khi đăng nhập vào hệ thống.
                    Thông báo sẽ ở trạng thái vô hiệu hóa sau khi tạo, bạn cần kích hoạt để hiển thị cho người dùng.
                </p>
            </div>
        </Modal>
    );
}
