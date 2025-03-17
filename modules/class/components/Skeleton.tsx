export const ClassSkeleton = ({ num }: { num: number }) => {
    const show_num = num ? num : 3;
    return <>
        {[...Array(show_num).keys()].map(e => (

            <a className="w-full animate-pulse mx-auto flex flex-col box-border px-3  pt-3 pb-4 shadow-md hover:shadow-xl rounded-lg transition-all">
                <div className="flex items-center md:items-stretch">
                    <div
                        className="flex-shrink-0 bg-gray-200 w-24 h-24 sm:w-28 sm:h-28 md:w-20  md:h-20 2xl:w-24 2xl:h-24 rounded-lg">
                    </div>
                    <div className="pl-3 flex-1 md:pl-2 flex flex-col">
                        <div className="w-full">
                            <div className="h-5 w-4/5  rounded bg-gray-200 ">

                            </div>
                        </div>

                        <div className="flex h-4 rounded-lg bg-gray-200 mt-2 h">
                        </div>
                        <div className="flex h-4 rounded-lg bg-gray-200 mt-2 h">
                        </div>
                    </div>
                </div>
            </a>

        ))}
    </>
};