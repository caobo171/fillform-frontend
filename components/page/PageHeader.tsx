import { PropsWithChildren } from "react";

export const PageHeader = (props: PropsWithChildren<{ title: string, subtitle?: string }>) => {
    return (<div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
            <h1 className="text-base font-semibold leading-6 text-gray-900">{props.title}</h1>
            {props.subtitle && <p className="mt-2 text-sm text-gray-700">
                {props.subtitle}
            </p>}
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 flex gap-x-2">
            {props.children}
        </div>
    </div>)
};