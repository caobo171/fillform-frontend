'use client'
import Constants, { Code, LAYOUT_TYPES } from "@/core/Constants";
import { GetServerSideProps } from "next";
import React, { useCallback, useState } from "react";
import Fetch from "@/lib/core/fetch/Fetch";
import { RawSystemNotification } from "@/store/types";
import { Toast } from "@/services/Toast";
import { useRouter } from "next/router";
import ImageUploading, { ImageListType } from "react-images-uploading";
import { ReactQuillNoSSR } from '@/components/form/NoSSR';
import { MeHook } from "@/store/me/hooks";
import { Helper } from "@/services/Helper";
import Meta from '@/components/ui/Meta';


const modules = {
    toolbar: [
        [{ 'header': [1, 2, false] }],
        ['bold', 'italic', 'underline', 'strike', 'blockquote'],
        [{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'indent': '-1' }, { 'indent': '+1' }],
    ],
};

const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike', 'blockquote',
    'list', 'bullet', 'indent'
]


const Edit = ({ notification }: { notification: RawSystemNotification }) => {
    const me = MeHook.useMe()
    const route = useRouter();
    const [on_loading, setOnLoading] = useState(false);
    const [reload_value, reload] = useState('');
    const [images, setImages] = useState<ImageListType>([]);

    const [content, setContent] = useState(notification.content);
    const [state, setState] = useState({
        title: notification.title,
        link: notification.link
    });

    const onChangeHandle = useCallback((e: any) => {
        var new_val = {
            ...state,
            [e.target.name]: e.target.value
        };
        setState(new_val);
    }, [state]);

    const onImageSelectChange = (
        imageList: ImageListType,
        addUpdateIndex: number[] | undefined
    ) => {
        setImages(imageList);
    };

    const submitHandle = async () => {
        let params: any = {
            id: notification.id,
            content: content,
            image: images.length > 0 ? images[0].file : undefined,
            ...state
        };
        const res: any = await Fetch.postWithAccessToken<{ code: number, message: string, system_notification: RawSystemNotification }>(
            '/api/system.notification/update', params);

        if (res.data && res.data.code == Code.SUCCESS) {
            Toast.success('Update successfully');
            route.push('/admin/notifications');
        } else if (res.data) {
            Toast.error(res.data.message);
        } else {
            Toast.error("Something wrong");
        }
    }

    return (<>
        <Meta title={`WELE | Notification ${notification.id}`} />
        <div className="w-full px-5 py-5 rounded-lg shadow">
            <div className="w-full flex flex-wrap">
                <div className="w-full semi-lg:w-2/3">
                    <div className="shadow bg-white px-5 py-4 mb-20">
                        <div className="w-full mb-3">
                            <label className="text-base font-medium text-gray-600 mb-1.5 block" htmlFor="">Notification Title</label>
                            <div className="w-full">
                                <input value={state.title} className="w-full outline-none focus:outline-none px-2 py-1 rounded-lg bg-gray-50 mr-3 border-2 border-transparent focus:border-primary transition-all" type="text" name="title" id="" placeholder="Title..." onChange={onChangeHandle} />
                            </div>
                        </div>
                        <div className="w-full mb-3">
                            <label className="text-base font-medium text-gray-600 mb-1.5 block" htmlFor="">Notification Link</label>
                            <div className="w-full">
                                <input value={state.link} className="w-full outline-none focus:outline-none px-2 py-1 rounded-lg bg-gray-50 mr-3 border-2 border-transparent focus:border-primary transition-all" type="text" name="link" id="" placeholder="Link..." onChange={onChangeHandle} />
                            </div>
                        </div>
                        <div className="w-full mb-3">
                            <label className="text-base font-medium text-gray-600 mb-1.5 block" htmlFor="">Content</label>
                            <div className="w-full sm:mb-0 mb-14">
                                <ReactQuillNoSSR theme="snow"
                                    modules={modules}
                                    formats={formats}
                                    className=" h-full w-full pb-5"
                                    value={content} onChange={setContent} />
                            </div>
                        </div>
                        <div className="w-full mb-3">

                        </div>
                        <div className="w-full">
                            <button onClick={submitHandle} className="mt-3 text-white text-sm hover:bg-gray-600 bg-primary font-medium py-2 px-4 rounded">
                                Edit Notification
                            </button>
                        </div>
                    </div>
                </div>
                <div className='w-1/3 pl-5'>
                    <div className="shadow bg-white px-5 py-4 mb-20">
                        <div className="text-lg mb-2 font-medium">Ảnh thông báo</div>
                        <div className="">
                            <ImageUploading
                                value={images}
                                onChange={onImageSelectChange}
                                maxNumber={1}
                                dataURLKey="data_url"
                            >
                                {({
                                    imageList,
                                    onImageUpload,
                                    onImageRemoveAll,
                                    onImageUpdate,
                                    onImageRemove,
                                    isDragging,
                                    dragProps,
                                }) => (
                                    // write your building UI
                                    <div className="upload__image-wrapper">
                                        <button

                                            className={` py-4 text-base w-full text-center outline-none focus:outline-none border-dotted border`}
                                            style={isDragging ? { color: 'red' } : undefined}
                                            onClick={onImageUpload}
                                            {...dragProps}
                                        >
                                            Kéo thả ảnh hoặc click để chọn ảnh
                                        </button>
                                        {imageList.length > 0 ? imageList.map((image, index) => (
                                            <div key={index} className="relative w-full mt-3">
                                                <img className="w-full" src={`${image[`data_url`]}`} />
                                            </div>
                                        )) : (<>
                                            {
                                                notification.image && <div className="relative w-full mt-3">
                                                    <img className="w-full" src={Constants.IMAGE_URL + notification.image} />
                                                </div>
                                            }
                                        </>)}
                                    </div>
                                )}
                            </ImageUploading>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </>)
}


export default Edit;