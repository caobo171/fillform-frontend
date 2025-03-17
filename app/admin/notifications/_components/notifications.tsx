'use client'
import OutsideClickDetect from '@/components/ui/OutsideClickDetection';
import Constants, { Code, MediaQuery } from "@/core/Constants";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import React, { useState } from "react";
import { AiFillEdit } from "react-icons/ai";
import { FaPlus, FaRegImage } from "react-icons/fa";
import { HiDotsVertical } from "react-icons/hi";
import { IoMdTrash } from "react-icons/io";
import { useAsync } from "react-use";
import Fetch from "@/lib/core/fetch/Fetch";
import { Helper } from "@/services/Helper";
import { Toast } from "@/services/Toast";
import { MeHook } from "@/store/me/hooks";
import { RawSystemNotification } from "@/store/types";
import * as uuid from 'uuid';

import Paginate from '@/components/paginate/Paginate';
//@ts-ignore
import ReactHtmlParser from 'react-html-parser'
import { useMediaQuery } from "react-responsive";
import Modal from "react-responsive-modal";
import Meta from '@/components/ui/Meta';

const SmallMenu = ({ notification, reload }: { notification: RawSystemNotification, reload: () => void }) => {
  const [open, setOpen] = useState(false);
  const onClickDelete = async () => {
    let result = await window.confirm("Are you sure to delete notifications " + notification.title + "?");
    if (result) {
      try {
        const res: any = await Fetch.postWithAccessToken<{ system_notification: RawSystemNotification, code: number }>("/api/system.notification/remove", {
          id: notification.id
        })

        if (res && res.data) {
          if (res.data.code != Code.SUCCESS) {
            Toast.error(res.data.message)
            return;
          }
          else {
            Toast.success("Remove Notification Successful!")
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
            <Link className=" flex items-center outline-none focus:outline-none  mb-1 hover:text-primary-dark transition-all" href={`/admin/notifications/edit/${notification.id}`}>
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

export const Inner = () => {
  const [reload, setReload] = useState('');
  const page = useSearchParams().get('page');
  const me = MeHook.useMe()
  const page_size = 12;

  const [openFilter, setOpenFilter] = useState(false);

  const isMd = useMediaQuery({ query: MediaQuery.isMd }, undefined, (matches) => {

    if (matches) {
      console.log(matches)
      setOpenFilter(true);
    }
    else {
      console.log(matches)
      setOpenFilter(false);
    }
  });

  const state = useAsync(async () => {
    if (me) {
      const res = await Fetch.postWithAccessToken<{ system_notifications: RawSystemNotification[], system_notification_num: number }>('/api/system.notification/list', {
        ...Helper.getURLParams(),
        page_size: page_size,
      });
      if (res.data) {
        return {
          system_notifications: res.data.system_notifications,
          system_notification_num: res.data.system_notification_num
        };
      }
    }

    return {
      system_notifications: [],
      system_notification_num: 0
    };
  }, [Helper.setAndGetURLParam([]), reload, me]);


  const [selected, setSelected] = useState<RawSystemNotification>();

  return (<>
    <Meta title={`WELE | Notifications`} />
    <Link className="fixed bottom-14 right-14 cursor-pointer px-2 py-2 text-white flex items-center justify-center bg-primary hover:bg-primary-dark rounded-full shadow-md text-2xl " href='/admin/notifications/create'>
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
          )) : ((state.value?.system_notifications as RawSystemNotification[]).length > 0 ? (state.value?.system_notifications as RawSystemNotification[]).map((notification, index) => {
            return (
              <div key={notification.id} className=" inline-block shadow hover:shadow-md transition-all cursor-pointer rounded-md px-3 py-2 w-full mx-auto mb-2">
                <div className="flex space-x-3 flex-col xs:flex-row">
                  <div onClick={() => setSelected(notification)} className=" w-full xs:w-36 h-24  flex-shrink-0 flex items-center justify-center">
                    {notification.image ? <div style={{ backgroundImage: `url(${Constants.IMAGE_URL + notification.image})` }}
                                               className="rounded bg-gray-200 h-full w-full bg-center bg-cover">
                    </div> : <span className=" text-6xl text-gray-200">
                                            <FaRegImage />
                                        </span>}

                  </div>
                  <div className="flex-1 flex py-1 relative">
                    <div className="w-full" onClick={() => setSelected(notification)}>
                      <div className="text-sm w-full overflow-hidden ">
                        <span className="text-primary text-sm xs:text-lg font-semibold"> {notification.title}</span>
                      </div>
                      <div className="w-full flex justify-between">
                        <p className=" text-sm text-gray-500 font-light line-clamp-2">{Helper.extractContentByRegex(notification.content)}</p>
                      </div>
                    </div>
                    <div className="absolute  xs:block right-0 top-0">
                      <SmallMenu notification={notification} reload={() => setReload(uuid.v4())} />
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
        {state.value && state.value.system_notification_num > page_size &&
          //@ts-ignore
          <Paginate num_items={state.value.podcast_num} page_size={page_size} current_page={page ? parseInt(page) : undefined} />
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
              <div className="mt-2 flex">
                <p className="mr-2 text-primary font-semibold text-lg" >{selected.title}</p>
              </div>
              <div className="mt-2 flex flex-wrap">
                <div className="flex-1">
                  <label className="text-sm font-medium text-primary-dark mb-1.5 block" htmlFor="">Url</label>
                  <img className="w-full h-auto rounded-lg" src={Constants.IMAGE_URL + selected.image} alt="" />
                </div>
              </div>
              <div className="mt-2">
                <label className="text-sm font-medium text-primary-dark mb-1.5 block" htmlFor="">Description</label>
                <div className="w-full">
                  <div className="font-sm bg-gray-50 px-1/5 py-1 rounded-lg">
                    {ReactHtmlParser(selected.content)}
                  </div>
                </div>
              </div>
              <div className="mt-2">
                <label className="text-sm font-medium text-primary-dark mb-1.5 block" htmlFor="">Link</label>
                <div className="w-full">
                  <div className="font-sm bg-gray-50 px-1/5 py-1 rounded-lg">
                    {selected.link}
                  </div>
                </div>
              </div>
            </div>

          </div>

        </>)}
      </>
    </Modal>
  </>)
}
