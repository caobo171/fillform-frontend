import React from 'react';

export const Skeleton = () => {
	return (
		<div className="w-full mb-8 ">
			<div className=" animate-pulse rounded shadow px-3 py-3">
				<div className="flex items-center mb-2">
					<div className=" flex-shrink-0 rounded-full w-14 h-14 bg-gray-200">

					</div>
					<div className="w-full px-4">
						<div className="h-4  w-full rounded-lg bg-gray-200 mb-2"></div>
						<div className="h-4  w-4/5 rounded-lg bg-gray-200"></div>
					</div>
				</div>
				<div className=" ml-16 mr-2">
					<div className=" w-full h-40 rounded-md bg-gray-200 mb-3">

					</div>
				</div>
			</div>
		</div>
	);
};
