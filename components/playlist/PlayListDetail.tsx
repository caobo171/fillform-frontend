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




export const PlaylistDetail = ({ playlist }: { playlist: RawUserPlaylist }) => {


    return <div>
        <div className='text-md mb-4 mt-2'>{playlist.name}</div>
        <div>
            {playlist.podcasts.map((e: any) => {
                return <div key={e.id} className="">
                    <Link target={'_blank'} href={`/podcasts/detail/${Helper.generateCode(e.name)}_${Helper.generateCode(e.sub_name)}/${e.id}`}>
                        <div className="mb-2 flex items-center">
                            <div className="mr-3 flex-shrink-0 rounded overflow-hidden">
                                <Image width={32} src={Constants.IMAGE_URL + e.image_url} className="w-20" alt="" />
                            </div>
                            <div className="flex-1">
                                <p className="text-gray-400 text-sm">ESL {e.sub_name}</p>
                                <h5 className="font-medium">{e.name}</h5>
                            </div>
                        </div>
                    </Link>
                </div>

            })}
        </div>
    </div>
};
