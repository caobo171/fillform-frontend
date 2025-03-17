import React, { ReactElement } from 'react';


interface Props {
	title: string | ReactElement,
	subtitle?: string | ReactElement,
	image: ReactElement
}
const UIBlock = ({ title, subtitle, image }: Props) => {
	return (
		<div className="flex flex-row h-12 overflow-hidden">
			<div className="h-12 w-12 mr-3 flex items-center justify-center" style={{minWidth: 32}}>
				{image}
			</div>
			<div className="flex flex-col items-start text-left justify-center ">
				<div className="font-bold truncate">{title}</div>
				{subtitle && <div className="text-gray-400">{subtitle}</div>}
			</div>
		</div>
	)
};

export default UIBlock;