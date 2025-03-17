import { useState, memo, useEffect } from 'react';

import Fetch from '@/lib/core/fetch/Fetch';
import * as uuid from 'uuid'

import { FaFolderPlus, FaPlus, FaPlusCircle } from 'react-icons/fa';
import { Toast } from '@/services/Toast';
import { Code } from '@/core/Constants';
import Modal from 'react-responsive-modal';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';
import { FiCheckSquare, FiEdit, FiFolder, FiPlus, FiPlusCircle, FiSquare, FiTrash } from 'react-icons/fi';
import { MeHook } from '@/store/me/hooks';
import { RawPodcast, RawUserPlaylist } from '@/store/types';
import { MeFunctions } from '@/store/me/functions';
import { Helper } from '@/services/Helper'
import Constants from "../../core/Constants";
import Link from 'next/link'
import Image from 'next/image';

export const CreatePlaylist = memo(() => {

    const [name, setName] = useState('');
    const [open, setOpen] = useState(false);
    const [onLoading, setOnLoading] = useState(false);

    const onSubmit = async () => {
        if (!name) {
            Toast.error("Name can not be empty");
            return;
        }

        try {
            setOnLoading(true);
            const res = await Fetch.postWithAccessToken<{ code: number }>("/api/playlist/create", {
                name: name,
            });

            if (res && res.status == 200) {
                if (res.data.code == Code.SUCCESS) {
                    Toast.success("Create collection successfully!")
                    await MeFunctions.loadProfile();
                    setName('');
                    setOnLoading(false);
                    setOpen(false);
                    return;
                }
            }
        }
        catch {

        }
        Toast.error("Some errors occurred!")
        setOnLoading(false);
    }

    return <>
        <div
            onClick={(e) => { e.preventDefault(); setOpen(true) }}
            className="w-full cursor-pointer shadow rounded flex flex-row px-3 py-3 items-center">
            <div className={'px-2'}><FaPlus /></div> <div>Create new playlist</div>
        </div>

        <Modal classNames={{
            modal: 'rounded-lg top-10',
        }} open={open} onClose={() => setOpen(false)}>
            <div className="">
                <h2 className="mb-3 text-lg w-72 font-semibold">Create playlist</h2>
                <div className="">
                    <div className="w-full relative mb-3 bg-gray-100 rounded-lg">
                        <input className="rounded-lg bg-transparent outline-none border-2 border-transparent focus:border-primary  py-1.5 px-3 w-full transition-all" onChange={(e) => setName(e.target.value)} value={name} name="name" type="text" placeholder="Name" />
                    </div>

                    <div className="flex justify-end">
                        <a onClick={() => setOpen(false)}
                            className="px-2 py-1 cursor-pointer font-semibold text-gray-800 rounded-md shadow hover:bg-gray-300" type="button">Huỷ</a>
                        <a className="py-1 w-20 flex items-center justify-center text-center cursor-pointer ml-3 font-semibold text-white bg-primary hover:bg-primary-dark rounded-md shadow"
                            onClick={onSubmit}
                        > {onLoading && <span className="animate-spin text-sm mr-1"><AiOutlineLoading3Quarters /></span>}<span>Create</span></a>
                    </div>
                </div>
            </div>
        </Modal>
    </>

});
CreatePlaylist.displayName = 'CreatePlaylist';
