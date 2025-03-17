import Constants from '@/core/Constants';
import { Helper } from '@/services/Helper';
import Link from 'next/link';
import { RawChallenge } from '@/store/types';
import { Bars3BottomLeftIcon, CalendarIcon, UsersIcon } from '@heroicons/react/24/outline';
import DateUtil from '@/services/Date';
import { UIButton } from '@/components/ui/Button';

export const ActiveChallengeItem = ({ challenge }: { challenge: RawChallenge }) => {

    let metatype_text = challenge.metatype

    return (
        <Link className="h-64 w-full max-w-7xl mb-8 cursor-pointer relative shadow-md rounded-md overflow-hidden flex" href={`/challenges/detail/${Helper.generateCode(challenge.name)}/${challenge.id}`}>
            <div className='flex flex-col  justify-between px-4 py-8 min-w-[320px] w-[320px]'>
                <h1 className='font-medium text-2xl mb-4'>
                    {challenge.name}
                </h1>
                <div className='flex flex-col gap-y-2'>

                    <div className='flex text-gray-500 text-sm'>
                        <Bars3BottomLeftIcon className='h-4 w-4 shrink-0  mr-4' />
                        {Helper.extractContentByRegex(challenge.description)}
                    </div>
                    <div className='flex text-gray-500 text-sm'>
                        <CalendarIcon className='h-4 w-4 shrink-0 mr-4' />
                        {DateUtil.getDay(challenge.start_time)} to {DateUtil.getDay(challenge.end_time)}
                    </div>
                    <div className='flex text-gray-500 text-sm'>
                        <UsersIcon className='h-4 w-4 shrink-0  mr-4' />
                        34 members joined
                    </div>
                </div>

                <UIButton className='text-white bg- px-4 py-1 rounded '>Join challenge here</UIButton>
            </div>
            <img className="h-full cursor-pointer w-full object-cover" src={`${Constants.IMAGE_URL + challenge.background_image}`} alt="" />

        </Link >
    )
}