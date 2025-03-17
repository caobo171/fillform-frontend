import Constants from "@/core/Constants"
import Link from "next/link"
import { AiOutlineCalendar } from "react-icons/ai"
import { GrScorecard } from "react-icons/gr"
import { Challenge } from "../challenge"
import DateUtil from "@/services/Date"
import { Helper } from "@/services/Helper"
import { FaUsers } from "react-icons/fa"
import { RawChallenge } from "@/app/(inapp)/challenges/challengeType"

export const ChallengeItem = ({ challenge }: { challenge: RawChallenge }) => {
    return (
        <div className="overflow-hidden pt-2 pb-6 shadow-lg transition-all rounded-lg">
            <div className="max-h-30 bg-center flex-shrink-0 bg-contain bg-no-repeat flex justify-center items-center overflow-hidden rounded-t">
                <Link className="w-full" href={Challenge.getURL(challenge)}>
                    <img className="h-32 object-cover w-full" src={`${Constants.IMAGE_URL + challenge.image_url}`} alt="" />
                </Link>
            </div>
            <div className="justify-between items-center w-full px-4 py-4">
                <Link href={Challenge.getURL(challenge)}>
                    <div className="text-base font-medium text-blue-800 cursor-pointer block "> {challenge.name.length >= 28 ? challenge.name.substring(0, 26) + ".." : challenge.name}</div>
                </Link>
                <div className='flex items-center mt-1'>
                    <div><AiOutlineCalendar /></div>
                    <div className='flex text-xs text-gray-600'>
                        <div className="ml-1">{DateUtil.getExactDay(challenge.data.start_time || challenge.created_at)}</div>
                        <div className="ml-1">{challenge.data.end_time ? DateUtil.getExactDay(challenge.data.end_time) : '--'}</div>
                    </div>
                </div>
                <div className='flex items-center mt-1'>
                    <div ><GrScorecard className='h-4' /></div>
                    <div className='text-xs text-gray-600 ml-2'>{Helper.extractContentByRegex(challenge.description || '')}</div>
                </div>
                <div className='flex items-center mt-1'>
                    <div><FaUsers /></div>
                    <div className='text-xs text-gray-600 ml-2'>{challenge.members?.length || 0} participants</div>
                </div>
                <Link href={Challenge.getURL(challenge)}>
                    <div className='mr-5 mt-3'>
                        <button className='bg-green-700 font-medium text-white w-full rounded-full text-sm py-1'>Detail</button>
                    </div>
                </Link>
            </div>
        </div>

    )
}