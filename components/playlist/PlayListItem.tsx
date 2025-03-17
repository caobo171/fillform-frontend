import { useState, memo, useEffect } from 'react';

import Fetch from '@/lib/core/fetch/Fetch';
import * as uuid from 'uuid'

import { FaCheckSquare, FaFolderPlus, FaPlus, FaPlusCircle, FaRegSquare } from 'react-icons/fa';
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
import { PlaylistDetail } from './PlayListDetail';
import clsx from 'clsx';
import DateUtil from '@/services/Date';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';


export const PlaylistItem = memo(({ playlist, podcast }: { playlist: RawUserPlaylist, podcast: RawPodcast }) => {

    const [name, setName] = useState(playlist.name);
    const [open, setOpen] = useState(false);
    const [open_detail, setOpenDetail] = useState(false);
    const [onLoading, setOnLoading] = useState(false);

    const editPlaylist = async () => {
        if (!name) {
            Toast.error("Name can not be empty");
            return;
        }

        try {
            setOnLoading(true);
            const res = await Fetch.postWithAccessToken<{ code: number }>("/api/playlist/update", {
                id: playlist.id,
                name: name
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
    };


    const deletePlaylist = async () => {
        const confirmed = window.confirm("Are you sure");
        if (confirmed) {
            const res = await Fetch.postWithAccessToken<{ code: number }>("/api/playlist/remove", {
                podcast_id: podcast.id,
                id: playlist.id
            }, null, true);

            if (res && res.status == 200) {
                if (res.data.code == Code.SUCCESS) {
                    Toast.success("Successfully!")
                    await MeFunctions.loadProfile();
                    return;
                }
            }
        }
    };

    const addPlaylist = async () => {
        const res = await Fetch.postWithAccessToken<{ code: number }>("/api/playlist/add.podcast", {
            podcast_id: podcast.id,
            id: playlist.id
        }, null, true);

        if (res && res.status == 200) {
            if (res.data.code == Code.SUCCESS) {
                Toast.success("Successfully!")
                await MeFunctions.loadProfile();
                return;
            }
        }
    };



    const checked = playlist.podcasts.find(e => e.id == podcast.id);


    return <li className="flex items-center justify-between gap-x-6 py-5">
        <div className="min-w-0">
            <div className="flex items-center gap-x-3">
                <div onClick={addPlaylist} className='cursor-pointer text-primary'>{checked ? <FaCheckSquare /> : <FaRegSquare />}</div>
                <p className="text-sm font-semibold leading-6 text-gray-900">{playlist.name}</p>
            </div>
            <div className="mt-1 flex items-center gap-x-2 text-xs leading-5 text-gray-500">
                <p className="whitespace-nowrap">
                    Created on {DateUtil.getDayTime(playlist.since)}
                </p>
                <svg viewBox="0 0 2 2" className="h-0.5 w-0.5 fill-current">
                    <circle cx={1} cy={1} r={1} />
                </svg>
                <p className="truncate">{playlist.podcasts.length ? `${playlist.podcasts.length} podcasts` : `No podcasts yet`}</p>
            </div>
        </div>
        <div className="flex flex-none items-center gap-x-4">
            <span onClick={() => setOpen(true)}
                className=" cursor-pointer transition-all hover:bg-gray-100 p-2 bg-white rounded"><PencilIcon className='w-4 h-4' /> </span>
            <span onClick={deletePlaylist}
                className=" cursor-pointer transition-all hover:bg-gray-100 p-2 bg-white rounded">
                <TrashIcon className='w-4 h-4' />
            </span>
        </div>
        <Modal classNames={{
            modal: 'rounded-lg top-10',
        }} open={open} onClose={() => setOpen(false)}>
            <div className="">
                <h2 className="mb-3 text-lg w-72 font-semibold">Edit playlist</h2>
                <div className="">
                    <div className="w-full relative mb-3 bg-gray-100 rounded-lg">
                        <input className="rounded-lg bg-transparent outline-none border-2 border-transparent focus:border-primary  py-1.5 px-3 w-full transition-all" onChange={(e) => setName(e.target.value)} value={name} name="name" type="text" placeholder="Name" />
                    </div>

                    <div className="flex justify-end">
                        <a onClick={() => setOpen(false)}
                            className="px-2 py-1 cursor-pointer font-semibold text-gray-800 rounded-md shadow hover:bg-gray-300" type="button">Huỷ</a>
                        <a className="py-1 w-20 flex items-center justify-center text-center cursor-pointer ml-3 font-semibold text-white bg-primary hover:bg-primary-dark rounded-md shadow"
                            onClick={editPlaylist}
                        > {onLoading && <span className="animate-spin text-sm mr-1"><AiOutlineLoading3Quarters /></span>}<span>Edit</span></a>
                    </div>
                </div>
            </div>
        </Modal>
        <Modal classNames={{
            modal: 'rounded-lg top-10 w-1/3 px-10',
        }} open={open_detail} onClose={() => setOpenDetail(false)}>
            <PlaylistDetail playlist={playlist} />
        </Modal>
    </li>


    return <div className="w-full  shadow rounded">
        <div className="flex relative items-center mb-4">
            <div className='w-full flex flex-row items-center  px-3 py-3'>
                <div onClick={addPlaylist} className='px-2 cursor-pointer'>{checked ? <FiCheckSquare /> : <FiSquare />}</div>
                <div onClick={() => setOpenDetail(true)} className="text-lg cursor-pointer">{playlist.name}</div>
            </div>
            <div className="absolute  top-3 right-0 w-20 flex flex-row">

            </div>
        </div>


        <Modal classNames={{
            modal: 'rounded-lg top-10',
        }} open={open} onClose={() => setOpen(false)}>
            <div className="">
                <h2 className="mb-3 text-lg w-72 font-semibold">Edit playlist</h2>
                <div className="">
                    <div className="w-full relative mb-3 bg-gray-100 rounded-lg">
                        <input className="rounded-lg bg-transparent outline-none border-2 border-transparent focus:border-primary  py-1.5 px-3 w-full transition-all" onChange={(e) => setName(e.target.value)} value={name} name="name" type="text" placeholder="Name" />
                    </div>

                    <div className="flex justify-end">
                        <a onClick={() => setOpen(false)}
                            className="px-2 py-1 cursor-pointer font-semibold text-gray-800 rounded-md shadow hover:bg-gray-300" type="button">Huỷ</a>
                        <a className="py-1 w-20 flex items-center justify-center text-center cursor-pointer ml-3 font-semibold text-white bg-primary hover:bg-primary-dark rounded-md shadow"
                            onClick={editPlaylist}
                        > {onLoading && <span className="animate-spin text-sm mr-1"><AiOutlineLoading3Quarters /></span>}<span>Edit</span></a>
                    </div>
                </div>
            </div>
        </Modal>


        <Modal classNames={{
            modal: 'rounded-lg top-10 w-1/3 px-10',
        }} open={open_detail} onClose={() => setOpenDetail(false)}>
            <PlaylistDetail playlist={playlist} />
        </Modal>
    </div>
});
PlaylistItem.displayName = 'PlaylistItem';