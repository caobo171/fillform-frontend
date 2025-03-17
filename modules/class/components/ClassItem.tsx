import Constants from "@/core/Constants";
import { Helper } from "@/services/Helper";
import { RawWeleClass } from "@/store/types";
import Link from "next/link";
import { AiOutlineUser } from "react-icons/ai";

interface ClassItemProps {
    weleclass: RawWeleClass,
}

export const ClassItem = ({ weleclass }: ClassItemProps) => {
    return (<Link className="w-full h-full mx-auto flex flex-col box-border px-3 py-3 shadow-md hover:shadow-xl rounded-lg transition-all"
        href={`/classes/detail/${Helper.generateCode(weleclass.name)}/${weleclass.id}`} >
        <div className="flex items-center md:items-stretch">
            <div
                style={{
                    backgroundImage: `url(${Constants.IMAGE_URL + weleclass.image_url})`
                }}
                className="bg-center flex-shrink-0 bg-cover bg-no-repeat w-1/2 h-24 sm:h-28 md:h-20 2xl:h-24 rounded-lg">

            </div>
            <div className="pl-3 md:pl-2 flex-1 flex flex-col justify-between">
                <div className="">
                    <p className="text-base text-gray-900 line-clamp-2 leading-5 font-semibold">
                        {weleclass.name}
                    </p>

                </div>

                <div className="flex w-full mt-2">
                    <div className="flex items-center text-xs mr-2">
                        <span className="text-sm mr-1"><AiOutlineUser /></span>
                        <span className=" font-light">{weleclass.members.length}</span>
                    </div>
                </div>
            </div>
        </div>
        <div className="mt-4">
            <p className="text-sm text-gray-500 font-light line-clamp-2">
                {Helper.extractContentByRegex(weleclass.content)}
            </p>
        </div>
    </Link>
    );
};