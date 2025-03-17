'use client'

import { RawCertification } from '@/store/types';
import React, { useState } from 'react';
import Fetch from '@/lib/core/fetch/Fetch';
import Constants, { Code, LAYOUT_TYPES } from '@/core/Constants';
import { Toast } from '@/services/Toast';
import OutsideClickDetect from '@/components/ui/OutsideClickDetection';
import { HiDotsVertical } from 'react-icons/hi';
import Link from 'next/link';
import { AiFillEdit } from 'react-icons/ai';
import { IoMdTrash } from 'react-icons/io';
import { useSearchParams } from 'next/navigation';
import { MeHook } from '@/store/me/hooks';
import { useAsync } from 'react-use';
import { Helper } from '@/services/Helper';
import Meta from '@/components/ui/Meta';
import { FaPlus, FaRegImage } from 'react-icons/fa';
import * as uuid from 'uuid';
import Paginate from '@/components/paginate/Paginate';
import Modal from 'react-responsive-modal';
//@ts-ignore
import ReactHtmlParser from 'react-html-parser'

type ResponseType = {
  certifications: RawCertification[],
  certification_num: number,
  code: number
}

const SmallMenu = ({ certification, reload }: { certification: RawCertification, reload: () => void }) => {
  const [open, setOpen] = useState(false);
  const onClickDelete = async () => {
    let result = await window.confirm("Are you sure to delete certificate ");
    if (result) {
      try {
        const res: any = await Fetch.postWithAccessToken<{ certification: RawCertification, code: number }>("/api/certification/remove", {
          id: certification.id
        })

        if (res && res.data) {
          if (res.data.code != Code.SUCCESS) {
            Toast.error(res.data.message)
            return;
          }
          else {
            Toast.success("Remove Successful!")
            reload();
            return;
          }
        }
      }
      catch {

      }
      Toast.error("Some errors occurred!")
    }
  }

  return (<>
    <OutsideClickDetect handle={() => setOpen(false)}>
      <div className="flex relative flex-col justify-end items-end">

				<span
          onClick={(e) => { e.preventDefault(); setOpen(!open) }}
          className=" cursor-pointer px-1.5 py-1.5 mb-2 bg-white shadow-md text-lg rounded-full transition-all hover:bg-gray-200">
					<HiDotsVertical />
				</span>

        {open && <div className="top-full right-0 absolute ">
          <div className="px-2 py-1 rounded-md shadow bg-white text-gray-600">
            <Link className=" flex items-center outline-none focus:outline-none  mb-1 hover:text-primary-dark transition-all" href={`/admin/certifications/edit/${certification.id}`}>
              <span className="mr-1"><AiFillEdit /></span>
              <span>Edit</span>
            </Link>
            <a onClick={(e) => { e.preventDefault(); onClickDelete() }} className="cursor-pointer flex items-center outline-none focus:outline-none mb-1 hover:text-primary-dark transition-all">
              <span className="mr-1"><IoMdTrash /></span>
              <span>Delete</span>
            </a>
          </div>
        </div>}
      </div>
    </OutsideClickDetect>
  </>)
}

const CertificationList = () => {
  const page_size = 12;
  const page = useSearchParams().get('page');
  const [reload, setReload] = useState('');
  const [selected, setSelected] = useState<RawCertification>();
  const me = MeHook.useMe()

  const search_params = useSearchParams()
  const state = useAsync(async () => {
    if (me) {
      const res = await Fetch.postWithAccessToken<ResponseType>('/api/certification/list', {
        ...Helper.getURLParams(),
        page_size: page_size,
      });

      if (res.status == 200) {
        if (res.data && res.data.code == Code.SUCCESS) {
          return {
            certifications: res.data.certifications,
            certification_num: res.data.certification_num
          }
        }
      }
    }

    return {
      certifications: [],
      certification_num: 0
    }
  }, [search_params.toString(), reload, me])

  return (<>
    <Meta title={`WELE | Certifications`} />
    <Link className="fixed bottom-14 right-14 cursor-pointer px-2 py-2 text-white flex items-center justify-center bg-primary hover:bg-primary-dark rounded-full shadow-md text-2xl " href='/admin/certifications/create'>
      <span><FaPlus /> </span>
    </Link>
    <div className="w-full flex container mx-auto">
      <div className="w-full md:w-3/4 md:pr-7">
        {
          (state.loading) ? [1, 2, 3, 4, 5].map((e) => (
            <div key={e} className="shadow rounded-md px-3 py-2 w-full mx-auto mb-2">
              <div className="animate-pulse flex flex-col xs:flex-row space-x-3">
                <div className=" rounded bg-gray-200  h-24 xs:w-36 w-full"></div>
                <div className="flex-1 space-y-1 py-1">
                  <div className="h-11 bg-gray-200 rounded w-full"></div>
                  <div className="">
                    <div className="h-4 bg-gray-200 w-3/4 rounded"></div>
                  </div>
                </div>
              </div>
            </div>
          )) : (state.value && state.value.certifications.length > 0 ? (state.value?.certifications as RawCertification[]).map((certification, index) => {
            return (
              <div key={certification.id} className=" inline-block shadow hover:shadow-md transition-all cursor-pointer rounded-md px-3 py-2 w-full mx-auto mb-2">
                <div className="flex space-x-3 flex-col xs:flex-row">
                  <div onClick={() => setSelected(certification)} className=" w-full xs:w-36 h-24  flex-shrink-0 flex items-center justify-center">
                    {certification.image ? <div style={{ backgroundImage: `url(${Constants.IMAGE_URL + certification.image})` }}
                                                className="rounded bg-gray-200 h-full w-full bg-center bg-cover">
                    </div> : <span className=" text-6xl text-gray-200">
											<FaRegImage />
										</span>}

                  </div>
                  <div className="flex-1 flex py-1 relative">
                    <div className="w-full" onClick={() => setSelected(certification)}>
                      <div className="w-full flex justify-between">
                        <p className=" text-sm text-gray-500 font-light line-clamp-2">{Helper.extractContent(certification.content)}</p>
                      </div>
                    </div>
                    <div className="absolute  xs:block right-0 top-0">
                      <SmallMenu certification={certification} reload={() => setReload(uuid.v4())} />
                    </div>
                  </div>
                </div>
              </div>
            )
          }) : (<>
            <div className="w-full px-5 py-5 text-center rounded-lg shadow">
              <h5>Không có kết quả phù hợp</h5>
            </div>
          </>))
        }
        {state.value && state.value.certification_num > page_size &&
          //@ts-ignore
          <Paginate num_items={state.value.certification_num} page_size={page_size} current_page={page ? parseInt(page) : undefined} />
        }
      </div>
    </div>

    <Modal
      classNames={{
        modal: "rounded-lg overflow-x-hidden w-11/12"
      }}
      onClose={() => setSelected(undefined)} open={!!selected}>
      <>
        {selected && (<>
          <div className="w-full flex flex-wrap">
            <div className="w-full">
              <div className="mt-2">
                <label className="text-sm font-medium text-primary-dark mb-1.5 block" htmlFor="">Description</label>
                <div className="w-full">
                  <div className="font-sm bg-gray-50 px-1/5 py-1 rounded-lg">
                    {ReactHtmlParser(selected.content)}
                  </div>
                </div>
                <div>
                  {selected.image && (<>
                    <img src={Constants.IMAGE_URL + selected.image} alt="" />
                  </>)}

                </div>
              </div>
            </div>
          </div>

        </>)}
      </>
    </Modal>
  </>)
}

export default CertificationList;

CertificationList.layout = LAYOUT_TYPES.Admin;
