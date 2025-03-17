'use client'

import { RawPodcastSource } from '@/store/types';
import { FiEdit, FiTrash } from 'react-icons/fi';
import { useSources } from '@/hooks/source';
import React, { useState } from 'react';
import Fetch from '@/lib/core/fetch/Fetch';
import { Code } from '@/core/Constants';
import { Toast } from '@/services/Toast';
import CreateModal from '@/app/admin/sources/_components/_CreateModal';
import { ReactSortable } from 'react-sortablejs';
import EditModal from '@/app/admin/sources/_components/_EditModal';

interface Props {
  source: RawPodcastSource,
  editSource: (source: RawPodcastSource) => void,
  deleteSource: (source: RawPodcastSource) => void,
}

const SourceItem = ({ source, editSource, deleteSource }: Props) => {
  return (
    <div className="flex items-center justify-between gap-x-6 py-3" draggable="true" style={{ cursor: "move" }}
    >

      <div className='min-w-0'>
        <div className='flex items-start gap-x-3'>
          <h5 className="text-sm font-semibold leading-6 text-gray-900">{source.name}</h5>

        </div>
        <p className="mt-1 flex items-center gap-x-2 text-xs leading-5 text-gray-500">{source.description}</p>

      </div>
      <div className="flex flex-none items-center gap-x-4">
				<span
          onClick={() => editSource(source)}
          className="cursor-pointer transition-all hover:bg-gray-300 px-1 py-1 bg-white shadow-md rounded-full mr-1"><FiEdit /> </span>
        <span onClick={() => deleteSource(source)}
              className="cursor-pointer transition-all hover:bg-gray-300 px-1 py-1 bg-white shadow-md rounded-full mr-1">
					<FiTrash />
				</span>
      </div>

    </div>
  )
};



export const SourceList = () => {

  let { data, isLoading, mutate } = useSources();


  let sources_sorted = data?.sources || [];
  const [selectedSource, setSelectedSource] = useState<RawPodcastSource>();
  const [openEditView, setOpenEditView] = useState(false);
  const editSource = (source: RawPodcastSource) => {
    setSelectedSource(source);
    setOpenEditView(true);
    mutate();
  }

  const deleteSource = async (source: RawPodcastSource) => {
    let result = await window.confirm("Do you want to remove source \" " + source.name + " \" ?");
    if (result) {
      let res = await Fetch.postWithAccessToken<{ code: number }>("/api/podcast.source/remove", {
        id: source.id
      });
      if (res.status == 200) {
        if (res.data.code == Code.SUCCESS) {

          Toast.success("Delete successfully")
          mutate();
          return;
        }
      }
      else {

      }
      Toast.error("Some errors occurred!")
    }
  }


  if (!data) {
    return <></>
  }

  return (<>
    <div className="flex justify-start items-center">
      <h3 className="text-lg font-semibold mr-3">Sources</h3>
      <CreateModal position={sources_sorted.length > 0 ? sources_sorted[sources_sorted.length - 1].position + 1 : 0} />
    </div>
    <div className="w-full shadow-md rounded-md px-5 py-5 my-4">

      <div className="divide-y divide-gray-100">
        <ReactSortable list={sources_sorted} setList={async (items: RawPodcastSource[]) => {
          const res_drag = await Fetch.postWithAccessToken<{ code: number }>("/api/podcast.source/orders", {
            sources: items.map(e => e.id).join(',')
          });

          mutate()
        }}>
          {sources_sorted.map((element, index) => (
            <SourceItem key={index} source={element} editSource={editSource} deleteSource={deleteSource} />
          ))}
        </ReactSortable>

      </div>
    </div>

    <EditModal source={selectedSource} open={openEditView} close={() => setOpenEditView(false)} />
  </>)
}
