'use client'
import Constants, { Code, LAYOUT_TYPES } from "@/core/Constants";
import React, { useCallback, useState } from "react";
import Fetch from "@/lib/core/fetch/Fetch";
import { RawCertification, RawUser } from "@/store/types";
import { Toast } from "@/services/Toast";
import { useRouter } from "next/navigation";
import ImageUploading, { ImageListType } from "react-images-uploading";
import { ReactQuillNoSSR } from '@/components/form/NoSSR';
import { useAsync, useThrottle } from "react-use";
import OutsideClickDetect from '@/components/ui/OutsideClickDetection';
import UI from "@/services/UI";
import { UserFunctions } from "@/store/user/functions";
import { UserHook } from "@/store/user/hooks";
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


const Create = () => {
    // property for user search //
    const [search, setSearch] = useState('');
    const [active, setActive] = useState(false);
    const throttled = useThrottle(search, 300);

    var users = UserHook.useAll();

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
    const onSubmitHandle = useCallback(async (e: any) => {
        setCurrentIndex(-1);
        if (!data.value) {
            return;
        }
        if (e.code == 'Enter') {
            const user = data.value[current_index];
            if (user) {
                onChangeUser(user.id.toString());
                setSearch('');
                setActive(false);
            }
        }

        if (e.code == 'ArrowDown') {
            setCurrentIndex(Math.min(data.value.length, current_index + 1));
        } else if (e.code == 'ArrowUp') {
            setCurrentIndex(Math.max(-1, current_index - 1));
        }
    }, [current_index, data.value]);

    const onChangeUser = (id: string) => {
        setForUserId(id);
    }
    // *** //

    const route = useRouter();
    const [on_loading, setOnLoading] = useState(false);
    const [images, setImages] = useState<ImageListType>([]);

    const [content, setContent] = useState('');
    const [certification_type, setCertificationType] = useState(Constants.CERTIFICATIONS[0].id);
    const [for_user_id, setForUserId] = useState('');

    const onImageSelectChange = (
        imageList: ImageListType,
        addUpdateIndex: number[] | undefined
    ) => {
        setImages(imageList);
    };

    const submitHandle = async () => {
        let params: any = {
            content: content,
            image: images.length > 0 ? images[0].file : undefined,
            for_user_id: for_user_id,
            certification_type: certification_type
        };
        const res: any = await Fetch.postWithAccessToken<{ code: number, message: string, certification: RawCertification }>(
            '/api/certification/create', params);

        if (res.data && res.data.code == Code.SUCCESS) {
            Toast.success('Created successfully');
            route.push('/admin/certifications');
        } else if (res.data) {
            Toast.error(res.data.message);
        } else {
            Toast.error("Something wrong");
        }
    }

    return (<>
        <Meta title={`WELE | Tạo Certification`} keywords={"Nghe chép"} description={""} />
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
                            <label className="text-base font-medium text-gray-600 mb-1.5 block" htmlFor="">Search User</label>
                            <div className="w-full">
                                <OutsideClickDetect handle={() => { setActive(false); setSearch('') }} className="relative">
                                    <div>
                                        <input className="my-1 w-full block outline-none focus:outline-none px-3 py-1 rounded border-primary border-opacity-10 border focus:border-opacity-90 transition-all duration-200"
                                            placeholder={'Tìm kiếm theo người dùng'} value={search} onFocus={() => setActive(true)} onChange={(e) => setSearch(e.target.value)} onKeyDown={onSubmitHandle} />
                                    </div>
                                    {active ? (<>
                                        <div className={`absolute top-full z-10 right-0 w-full`}>
                                            <div>
                                                <div className="bg-white border border-opacity-10 border-black rounded mt-1 w-full">
                                                    <ul className="py-3 px-3 m-0">
                                                        {
                                                            data.value && data.value.length > 0 ? data.value.map((user, index) => (
                                                                <li onMouseMove={() => setCurrentIndex(index)}
                                                                    onClick={() => {
                                                                        onChangeUser(user.id.toString());
                                                                        setSearch('');
                                                                        setActive(false);
                                                                    }}
                                                                    key={user.id}
                                                                    className={`rounded flex items-center justify-start cursor-pointer py-1 px-2 ${index == current_index ? 'bg-gray-200' : ''}`}
                                                                >
                                                                    {user.avatar ? (<>
                                                                        <div className="bg-cover bg-center h-10 w-10 rounded-full mr-1" style={{
                                                                            backgroundImage: `url("${Constants.IMAGE_URL + user.avatar}`
                                                                        }}>
                                                                        </div>
                                                                    </>) : (<>
                                                                        <div className="flex items-center justify-center h-10 w-10 rounded-full mr-1" style={{
                                                                            backgroundColor: UI.getColorByString(user.fullname)
                                                                        }}>
                                                                            <span className="text-lg text-white"> {user.fullname.slice(0, 2)} </span>
                                                                        </div>
                                                                    </>)}
                                                                    <div className="ml-2">
                                                                        {user.fullname} ({user.email})
                                                                    </div>
                                                                </li>
                                                            )) : (<>
                                                                <li className="flex justify-center">
                                                                    <span className="text-lg text-gray-400">Không có kết quả phù hợp</span>
                                                                </li>
                                                            </>)
                                                        }
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>
                                    </>) : (<></>)}
                                </OutsideClickDetect>
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
                                Add Notification
                            </button>
                        </div>
                    </div>
                </div>
                <div className='w-1/3 pl-5'>
                    <div className="shadow bg-white px-5 py-4 mb-20">
                        <div className="text-lg mb-2 font-medium">Image</div>
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
                                        {imageList.map((image, index) => (
                                            <div key={index} className="relative w-full mt-3">
                                                <img className="w-full" src={`${image[`data_url`]}`} />
                                            </div>
                                        ))}
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

Create.layout = LAYOUT_TYPES.Admin;
export default Create;