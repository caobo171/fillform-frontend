import { useState, useEffect } from 'react';

import Fetch from '@/lib/core/fetch/Fetch';
import * as uuid from 'uuid'

import { FaPlus } from 'react-icons/fa';

import Modal from 'react-responsive-modal';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';
import { toast } from 'react-toastify';
import { FiEdit, FiTrash } from 'react-icons/fi';
import { Toast } from '@/services/Toast';
import { Code } from '@/core/Constants';
import { PodcastCollectionFunctions } from '@/store/podcast.collection/functions';
import { useSWRConfig } from 'swr';

const CreateModal = ({ position }: { position: number }) => {

	const { mutate } = useSWRConfig();
	const [reload, setReload] = useState('')
	const [show, setShow] = useState(false);
	const [onLoading, setOnLoading] = useState(false);

	const [name, setName] = useState('');
	const [description, setDescription] = useState('');

	const handleShow = () => setShow(true);
	const handleClose = () => {
		setShow(false);
		setName('');
		setDescription('');
	}

	const onSubmit = async () => {
		if (!name) {
			Toast.error("Name can not be empty");
			return;
		}

		try {
			setOnLoading(true);
			const res = await Fetch.postWithAccessToken<{ code: number }>("/api/podcast.collection/create", {
				name: name,
				description: description,
				position: position
			});

			if (res && res.status == 200) {
				if (res.data.code == Code.SUCCESS) {
					Toast.success("Create collection successfully!")
					mutate('/api/podcast.collection/list');
					setReload(uuid.v4())
					setName('');
					setDescription('');
					setShow(false);
					setOnLoading(false);
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
			<a
				onClick={(e) => { e.preventDefault(); handleShow() }}
				className="cursor-pointer px-1.5 py-1.5 text-gray-500 flex items-center justify-center hover:bg-gray-100 rounded-full shadow-md text-lg">
				<span><FaPlus /> </span>
			</a>

			<Modal classNames={{
				modal: 'rounded-lg top-10 w-[520px]',
			}} open={show} onClose={() => handleClose()}>
				<div className="">
					<h2 className="mb-3 text-lg w-72 font-semibold">Create Collection</h2>
					<div className="">
						<div className="w-full relative mb-3 bg-gray-100 rounded-lg">
							<input className="rounded-lg bg-transparent outline-none border-2 border-transparent focus:border-primary  py-1.5 px-3 w-full transition-all" onChange={(e) => setName(e.target.value)} value={name} name="name" type="text" placeholder="Collection name..." />
						</div>

						<div className="w-full relative mb-3 bg-gray-100 rounded-lg">
							<textarea className="rounded-lg bg-transparent outline-none border-2 border-transparent focus:border-primary  py-1.5 px-3 w-full transition-all" onChange={(e) => setDescription(e.target.value)} value={description} name="description" placeholder="Collection description..." ></textarea>
						</div>
						<div className="flex justify-end">
							<a onClick={handleClose}
								className="px-2 py-1 cursor-pointer font-semibold text-gray-800 rounded-md shadow hover:bg-gray-300" type="button">Huỷ</a>
							<a className="py-1 w-20 flex items-center justify-center text-center cursor-pointer ml-3 font-semibold text-white bg-primary hover:bg-primary-dark rounded-md shadow"
								onClick={onSubmit}
							> {onLoading && <span className="animate-spin text-sm mr-1"><AiOutlineLoading3Quarters /></span>}<span>Create</span></a>
						</div>
					</div>
				</div>
			</Modal>
		</>
	)
}

export default CreateModal;