'use client'
import Constants, { Code, FILLER_TEXT, OtherSource, PodcastSource, PostCastSubmitType } from '@/core/Constants';
import React, { useEffect, useState } from 'react'
import { FaHeadphonesAlt } from 'react-icons/fa'
import { GrResources } from 'react-icons/gr'
import { RawPodcast, RawPodcastCollection, RawPodcastSubmit } from '@/store/types'

import Link from 'next/link';
import { Helper } from '@/services/Helper';
import { useMemo } from 'react';
import { useCollections } from '@/hooks/collection';
import clsx from 'clsx';
import { useSourceByID } from '@/hooks/source';

interface PodcastItemProps {
	podcast: RawPodcast,
}

export const BigPodcastItem = ({ podcast }: PodcastItemProps) => {

	const { data, isLoading } = useCollections();

	if (isLoading) {
		return <></>;
	}


	const first_collection = data?.collections.find(x => podcast.collections.includes(x.id.toString())) || null;
	return (
		<Link className="items-start w-full flex-col box-border  px-3  py-5 mr-2 hover:shadow-lg rounded-lg transition-all" href={`/podcasts/detail/${Helper.generateCode(podcast.name)}/${podcast.id}`}>
			<div
				className="max-h-28 bg-center flex-shrink-0 bg-contain bg-no-repeat md:w-full w-24  sm:w-28 rounded-lg flex justify-center items-center overflow-hidden">
				<img src={Constants.IMAGE_URL + podcast.image_url} alt="" />
			</div>
			<div className="flex mt-3 px-0 justify-items-start justify-between w-full ">
				<div className="">
					<h4 className="mb-0.5 mt-0 text-xs font-bold">ESL {podcast.sub_name}</h4>
					<p className="text-base text-gray-500 leading-5 line-clamp-2">
						{podcast.name}
					</p>

					{podcast.podcast_submit && (<div className="relative pt-1">
						<div className={clsx(`overflow-hidden h-2 mb-4 text-xs flex rounded`, podcast.podcast_submit.status == PostCastSubmitType.SUBMITTED ? 'bg-red-600' : 'bg-gray-200')}>
							<div style={{ width: `${podcast.podcast_submit.current_result.percent * 100}%` }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-green-500"></div>
						</div>
					</div>)}
				</div>

				<div className="text-xs whitespace-nowrap mb-2 md:mb-0 md:ml-3 flex items-center">
					<span className="text-primary-dark bg-primary-light font-medium rounded px-1 py-1">
						{first_collection ? first_collection.name : "Tự do"}
					</span>
				</div>
			</div>
		</Link>
	);
};




export const PodcastItem = ({ podcast }: PodcastItemProps) => {

	const source = useSourceByID(podcast.source_key);
	return (
		<Link className="js-podcast-item w-full flex items-center md:items-stretch box-border px-2 py-2 hover:shadow-lg rounded-lg transition-all cursor-pointer" href={`/podcasts/detail/${Helper.generateCode(podcast.name)}/${podcast.id}`}>
			<div
				style={{
					backgroundImage: `url(${Constants.IMAGE_URL + podcast.image_url})`
				}}
				className="bg-center flex-shrink-0 bg-cover bg-no-repeat w-24 h-24 sm:w-28 sm:h-28 md:w-20  md:h-20 2xl:w-24 2xl:h-24 rounded-lg">

			</div>
			<div className="pl-3 w-full md:pl-2 flex flex-col">
				<div className="">
					<h4 className="mb-0.5 mt-0 text-xs font-bold">ESL {podcast.sub_name}</h4>
					<p className="text-base text-gray-500 leading-5 line-clamp-2">
						{podcast.name}
					</p>
					{podcast.podcast_submit && (<div className="relative pt-1">
						<div title={`${(podcast.podcast_submit.current_result.percent * 100).toFixed(2)}%`} className={clsx(`overflow-hidden h-2 mb-4 text-xs flex rounded`, podcast.podcast_submit.status == PostCastSubmitType.SUBMITTED ? 'bg-red-600' : 'bg-gray-200')}>
							<div style={{ width: `${podcast.podcast_submit.current_result.percent * 100}%` }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-green-500"></div>
						</div>
					</div>)}

				</div>

				<div className="w-full mt-1">
					<div className="flex items-center text-xs">
						<span className="text-sm mr-2"><FaHeadphonesAlt /></span>
						<span className=" font-light">{podcast.views ? podcast.views : 0}</span>
					</div>
					<div className="flex items-center text-xs">
						<span className="text-sm mr-2"><GrResources /></span>
						<span className="font-light"> {source.name} </span>
					</div>
				</div>
			</div>
		</Link>
	);
}
