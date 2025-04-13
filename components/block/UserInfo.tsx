'use client'
import SideBanner from "@/components/ui/SideBanner";
import Constants from '@/core/Constants';
import React, { useMemo } from "react";
import { BsThreeDots } from "react-icons/bs";

import UI from "@/services/UI";
import { MeHook } from "@/store/me/hooks";
import { useUser, useUserStats } from "@/hooks/user";
import { RawUser } from "@/store/types";
import { Skeleton } from "@/components/ui/skeleton";
import { GoDotFill } from "react-icons/go";
import { MdEmail } from "react-icons/md";
import { Helper } from "@/services/Helper";
import DateUtil from "@/services/Date";
import { ImFacebook } from "react-icons/im";


const UserInfo = (props: { user: RawUser }) => {

    const { data, isLoading } = useUserStats(props.user.id);

    const last_active = useMemo(() => {
        if (data?.latest_active_time && data?.latest_active_time > 0) {
            var value = Helper.time() - data?.latest_active_time;
            if (value > 60 * 60 * 24) {
                return `, last active ${Math.floor(value / (60 * 60 * 24))} days ago`
            }
            else if (value > 60 * 60) {
                return `, last active ${Math.floor(value / (60 * 60))} hours ago`
            }
            else if (value > 60) {
                return `, last active ${Math.floor(value / (60))} minutes ago`
            }
            else {
                return `, last active ${value} seconds ago`
            }
        }
        return "";
    }, [data?.latest_active_time])

    if (isLoading) {
        return <div className="rounded-lg bg-white shadow-md pt-5 pb-10 px-6">
            <div className="flex flex-col items-center justify-center">
                <Skeleton className="w-20 h-20 rounded-full bg-cover bg-center" />
                <Skeleton className="w-40 h-6 mt-8" />
                <Skeleton className="w-32 h-6 mt-8" />
            </div>


        </div>
    }



    return (<>
        <div className="rounded-lg bg-white shadow-md pt-5 pb-10 px-6">
            <div className="flex items-center justify-center">
                <div className="rounded-full p-0.5 border border-black border-opacity-10">
                    {props.user?.avatar ? (<>
                        <div style={{ backgroundImage: `url(${Constants.IMAGE_URL + props.user.avatar})` }}
                            className="w-20 h-20 rounded-full bg-cover bg-center">
                        </div>
                    </>) : (<>
                        <div style={{ backgroundColor: UI.getColorByString(props.user.username) }}
                            className="w-20 h-20 rounded-full bg-cover bg-center flex items-center justify-center">
                            <span className="text-white font-medium text-3xl">{props.user.username.slice(0, 2)}</span>
                        </div>
                    </>)}
                </div>
            </div>

            <h3 className="text-center mt-2 font-medium text-xl">
                {props.user.username}
            </h3>
            <p className="text-center text-sm text-gray-500">{props.user.username}</p>
            <div className="flex items-center justify-between mt-3">
                <div className="flex flex-col  items-center">
                    <p className="font-medium text-lg">{data?.num_submits || 0}</p>
                    <p className="text-xs text-gray-500">Podcasts</p>
                </div>
                <div className=" flex justify-center">
                    <span className="text-xs"><GoDotFill /></span>
                </div>
                <div className="flex flex-col  items-center">
                    <p className="font-medium text-lg">{data?.listened_words || 0}</p>
                    <p className="text-xs text-gray-500">Listend words</p>
                </div>
                <div className=" flex justify-center">
                    <span className="text-xs"><GoDotFill /></span>
                </div>
                <div className="flex flex-col  items-center">
                    <p className="font-medium text-lg">{data?.num_action_logs || 0}</p>
                    <p className="text-xs text-gray-500">Activities</p>
                </div>
            </div>

            <div className="mt-5">
                <h5 className="font-medium text-base">Activities</h5>
                <div className="mt-1">
                    <p className="text-gray-400 italic text-sm">Joined in {DateUtil.getDay(props.user.since)} {last_active}</p>
                </div>
            </div>
            <div className="mt-5">
                <h5 className="font-medium text-base">Contact {props.user.username}</h5>
                <div className="mt-1 flex pt-2">

                    <a href={`mailto:${props.user.email}`} target={`_blank`} className="mr-3 w-10 h-10 rounded-full flex justify-center items-center bg-red-400 text-lg text-white">
                        <MdEmail />
                    </a>


                    <a href={props.user.facebook} target={`_blank`} className="mr-3 w-10 h-10 rounded-full flex justify-center items-center bg-blue-400 text-white">
                        <ImFacebook />
                    </a>

                </div>
            </div>
        </div>
    </>)
}

export default UserInfo;