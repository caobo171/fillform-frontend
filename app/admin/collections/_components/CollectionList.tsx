'use client'

import { FiEdit, FiTrash } from 'react-icons/fi';
import { useCollections } from '@/hooks/collection';
import React, { useState } from 'react';
import { RawPodcastCollection } from '@/store/types';
import Fetch from '@/lib/core/fetch/Fetch';
import { Code } from '@/core/Constants';
import { Toast } from '@/services/Toast';
import CreateModal from '@/app/admin/collections/_components/_CreateModal';
import { ReactSortable } from 'react-sortablejs';
import EditModal from '@/app/admin/collections/_components/_EditModal';

interface Props {
  collection: RawPodcastCollection,
  editCollection: (collection: RawPodcastCollection) => void,
  deleteCollection: (collection: RawPodcastCollection) => void,
}

const CollectionItem = ({ collection, editCollection, deleteCollection }: Props) => {
  return (
    <div className="flex items-center justify-between gap-x-6 py-3" draggable="true" style={{ cursor: "move" }}
    >

      <div className='min-w-0'>
        <div className='flex items-start gap-x-3'>
          <h5 className="text-sm font-semibold leading-6 text-gray-900">{collection.name}</h5>

        </div>
        <p className="mt-1 flex items-center gap-x-2 text-xs leading-5 text-gray-500">{collection.description}</p>

      </div>
      <div className="flex flex-none items-center gap-x-4">
				<span
          onClick={() => editCollection(collection)}
          className="cursor-pointer transition-all hover:bg-gray-300 px-1 py-1 bg-white shadow-md rounded-full mr-1"><FiEdit /> </span>
        <span onClick={() => deleteCollection(collection)}
              className="cursor-pointer transition-all hover:bg-gray-300 px-1 py-1 bg-white shadow-md rounded-full mr-1">
					<FiTrash />
				</span>
      </div>

    </div>
  )
};



export const CollectionList = () => {
  console.log("Admin Collection Page");
  let { data, isLoading, mutate } = useCollections();


  let collections_sorted = data?.collections || [];
  const [selectedCollection, setSelectedCollection] = useState<RawPodcastCollection>();
  const [openEditView, setOpenEditView] = useState(false);
  const editCollection = (collection: RawPodcastCollection) => {
    setSelectedCollection(collection);
    setOpenEditView(true);
    mutate();
  }

  const deleteCollection = async (collection: RawPodcastCollection) => {
    let result = await window.confirm("Do you want to remove collection \" " + collection.name + " \" ?");
    if (result) {
      let res = await Fetch.postWithAccessToken<{ code: number }>("/api/podcast.collection/remove", {
        id: collection.id
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
      <h3 className="text-lg font-semibold mr-3">Collections</h3>
      <CreateModal position={collections_sorted.length > 0 ? collections_sorted[collections_sorted.length - 1].position + 1 : 0} />
    </div>
    <div className="w-full shadow-md rounded-md px-5 py-5 my-4">

      <div className="divide-y divide-gray-100">
        <ReactSortable list={collections_sorted} setList={async (items: RawPodcastCollection[]) => {
          const res_drag = await Fetch.postWithAccessToken<{ code: number }>("/api/podcast.collection/orders", {
            collections: items.map(e => e.id).join(',')
          });

          mutate()
        }}>
          {collections_sorted.map((element, index) => (
            <CollectionItem key={index} collection={element} editCollection={editCollection} deleteCollection={deleteCollection} />
          ))}
        </ReactSortable>

      </div>
    </div>

    <EditModal collection={selectedCollection} open={openEditView} close={() => setOpenEditView(false)} />
  </>)
}
