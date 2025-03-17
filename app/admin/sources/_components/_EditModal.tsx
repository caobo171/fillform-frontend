import { useState, useEffect } from 'react';

import Fetch from '@/lib/core/fetch/Fetch';
import * as uuid from 'uuid'

import Modal from 'react-responsive-modal';
import { toast } from 'react-toastify';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';
import { FiEdit, FiTrash } from 'react-icons/fi';
import { Toast } from '@/services/Toast';
import { RawPodcastSource } from '@/store/types';
import { Code } from '@/core/Constants';
import { useSWRConfig } from 'swr';

const EditModal = ({ source, open, close }: { source: RawPodcastSource | undefined, open: boolean, close: () => void }) => {
    const [reload, setReload] = useState('')
    const [onLoading, setOnLoading] = useState(false);
    const { mutate } = useSWRConfig();

    const [name, setName] = useState(source?.name);
    const [website, setWebsite] = useState(source?.website);
    const [description, setDescription] = useState(source?.description);

    useEffect(() => {
        setName(source?.name);
        setDescription(source?.description);
        setOnLoading(false);
    }, [source])

    const onClose = () => {
        close();
    }

    const onSubmit = async () => {

        if (!name) {
            Toast.error("Name can not be empty");
            return;
        }


        try {
            setOnLoading(true);
            const res = await Fetch.postWithAccessToken<{ code: number }>("/api/podcast.source/update", {
                id: source?.id,
                name: name,
                description: description
            });

            if (res && res.status == 200) {
                if (res.data.code == Code.SUCCESS) {
                    mutate('/api/podcast.source/list');
                    Toast.success("Edit source successfully!")
                    setReload(uuid.v4())
                    setOnLoading(false);
                    onClose();
                    return;
                }
            }
        }
        catch {
        }

        Toast.error("Some errors occurred!")
        setOnLoading(false);
    }

    return (

        <>
            <Modal classNames={{
                modal: 'rounded-lg top-10 w-[520px]',
            }} open={open} onClose={() => { onClose() }}>
                <div className="">
                    <h2 className="mb-3 w-72 text-lg font-semibold">Sửa nguồn </h2>
                    <div className="">
                        <div className="w-full relative mb-3 bg-gray-100 rounded-lg">
                            <input className="rounded-lg bg-transparent outline-none border-2 border-transparent focus:border-primary  py-1.5 px-3 w-full transition-all" onChange={(e) => setName(e.target.value)} value={name} name="name" type="text" placeholder="Source name..." />
                        </div>
                        <div className="w-full relative mb-3 bg-gray-100 rounded-lg">
                            <input className="rounded-lg bg-transparent outline-none border-2 border-transparent focus:border-primary  py-1.5 px-3 w-full transition-all" onChange={(e) => setWebsite(e.target.value)} value={website} name="website" type="text" placeholder="Source website..." />
                        </div>
                        <div className="w-full relative mb-3 bg-gray-100 rounded-lg">
                            <textarea className="rounded-lg bg-transparent outline-none border-2 border-transparent focus:border-primary  py-1.5 px-3 w-full transition-all" onChange={(e) => setDescription(e.target.value)} value={description} name="description" placeholder="Source description..." ></textarea>
                        </div>


                        <div className="flex justify-end">
                            <a onClick={close}
                                className="px-2 py-1 cursor-pointer font-semibold text-gray-800 rounded-md shadow hover:bg-gray-300" type="button">Huỷ</a>
                            <a className="py-1 w-20 flex items-center justify-center text-center cursor-pointer ml-3 font-semibold text-white bg-primary hover:bg-primary-dark rounded-md shadow"
                                onClick={onSubmit}
                            > {onLoading && <span className="animate-spin text-sm mr-1"><AiOutlineLoading3Quarters /></span>}<span>Edit</span></a>
                        </div>
                    </div>
                </div>
            </Modal>
        </>
    )
}

export default EditModal;