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
import { PlaylistItem } from './PlayListItem';
import { usePlaylists } from '@/app/(inapp)/playlist/playlistHooks';

export const Playlists = memo(({ podcast }: { podcast: RawPodcast }) => {
    const playlists = usePlaylists().data || [];

    return (
        <ul role="list" className="divide-y divide-gray-100">
            {playlists.map(e => <PlaylistItem podcast={podcast} playlist={e} key={e.id} />)}
        </ul>
    )
});
Playlists.displayName = 'Playlists';