'use client'
import Constants, { Code, LAYOUT_TYPES } from "@/core/Constants";
import { GetServerSideProps } from "next";
import React, { useCallback, useState } from "react";
import Fetch from "@/lib/core/fetch/Fetch";
import { RawCertification, RawSystemNotification, RawUser } from "@/store/types";
import { Toast } from "@/services/Toast";
import { useRouter } from "next/router";
import ImageUploading, { ImageListType } from "react-images-uploading";
import { ReactQuillNoSSR } from '@/components/form/NoSSR';
import { MeHook } from "@/store/me/hooks";
import { Helper } from "@/services/Helper";
import { UserHook } from "@/store/user/hooks";
import { useAsync, useThrottle } from "react-use";
import { UserFunctions } from "@/store/user/functions";
import UI from "@/services/UI";
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


const Edit = ({ certification }: { certification: RawCertification }) => {
    // property for user search //
    const [search, setSearch] = useState('');
    const [active, setActive] = useState(false);
    const throttled = useThrottle(search, 300);

    var users = UserHook.useAll();

    UserHook.useFetchUsers([certification.for_user_id])

    const data = useAsync(async () => {
        if (throttled != "") {
            const result = await Fetch.postWithAccessToken<{
                users: RawUser[]
            }>('/api/user/search.user', { q: throttled }, null, false);

            if (result.data.users) {
                UserFunctions.loadRawUsers(result.data.users);
            }

            return result.data.users;
        } else {
            const result = await Fetch.postWithAccessToken<{
                users: RawUser[]
            }>('/api/user/search.user', {}, null, false);

            if (result.data.users) {
                UserFunctions.loadRawUsers(result.data.users);
            }

            return result.data.users;
        }
    }, [throttled]);

    const [current_index, setCurrentIndex] = useState(-1);


    // *** //

    const me = MeHook.useMe()
    const route = useRouter();
    const [images, setImages] = useState<ImageListType>([]);

    const [content, setContent] = useState(certification.content);
    const [certification_type, setCertificationType] = useState(certification.certification_type);
    const [for_user_id, setForUserId] = useState(certification.for_user_id.toString());

    const onImageSelectChange = (
        imageList: ImageListType,
        addUpdateIndex: number[] | undefined
    ) => {
        setImages(imageList);
    };

    const submitHandle = async () => {
        let params: any = {
            id: certification.id,
            content: content,
            image: images.length > 0 ? images[0].file : undefined,
            // ...state
        };
        const res: any = await Fetch.postWithAccessToken<{ code: number, message: string, system_notification: RawSystemNotification }>(
            '/api/system.notification/update', params);

        if (res.data && res.data.code == Code.SUCCESS) {
            Toast.success('Update successfully');
            route.push('/admin/certifications');
        } else if (res.data) {
            Toast.error(res.data.message);
        } else {
            Toast.error("Something wrong");
        }
    }

    return (<>
        <Meta title={`Fillform | Certification ${certification.id}`} />
        <div className="w-full px-5 py-5 rounded-lg shadow">
            <div className="w-full flex flex-wrap">
                <div className="w-full semi-lg:w-2/3">
                    <div className="shadow bg-white px-5 py-4 mb-20">
                        <div className="w-full flex flex-wrap mb-3">
                            <div className="w-1/2">
                                <label className="text-base font-medium text-gray-600 mb-1.5 block" htmlFor="">Certification Type</label>
                                <div className="w-full">
                                    <select value={certification_type} onChange={(e) => setCertificationType(Number(e.target.value))} className="flex-1 outline-none focus:outline-none px-2 py-1 rounded-lg bg-gray-50 mr-3 border-2 border-transparent focus:border-primary transition-all">
                                        {Constants.CERTIFICATIONS.map(e =>
                                            <option key={e.id} value={e.id}>{e.label}</option>
                                        )}
                                    </select>
                                </div>
                            </div>
                            {for_user_id && users[Number(for_user_id)] && (
                                <div className="w-1/2">
                                    <label className="text-base font-medium text-gray-600 mb-1.5 block" htmlFor="">Target User</label>
                                    <div className="w-full flex items-center">
                                        <div className="flex-shrink-0">
                                            {users[Number(for_user_id)].avatar ? (<>
                                                <div className="bg-cover bg-center h-10 w-10 rounded-full mr-1" style={{
                                                    backgroundImage: `url("${Constants.IMAGE_URL + users[Number(for_user_id)].avatar}`
                                                }}>
                                                </div>
                                            </>) : (<>
                                                <div className="flex items-center justify-center h-10 w-10 rounded-full mr-1" style={{
                                                    backgroundColor: UI.getColorByString(users[Number(for_user_id)].fullname)
                                                }}>
                                                    <span className="text-lg text-white"> {users[Number(for_user_id)].fullname.slice(0, 2)} </span>
                                                </div>
                                            </>)}
                                        </div>
                                        <div className="ml-2">
                                            {users[Number(for_user_id)].fullname} ({users[Number(for_user_id)].email})
                                        </div>
                                    </div>
                                </div>
                            )}
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
                                                certification.image && <div className="relative w-full mt-3">
                                                    <img className="w-full" src={Constants.IMAGE_URL + certification.image} />
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