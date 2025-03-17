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
import { Playlists } from './PlayListList';
import { CreatePlaylist } from './CreatePlayList';







export const PlaylistsModal = ({ open, close, podcast }: { open: any, close: any, podcast: RawPodcast }) => {

	return (<Modal classNames={{
		modal: 'rounded-lg top-10 w-1/3 px-10'
	}} styles={{ modal: { margin: 0 }, modalContainer: { padding: 10 } }} open={open} onClose={close}>
		<Playlists podcast={podcast} />
		<CreatePlaylist />
	</Modal>);
};






