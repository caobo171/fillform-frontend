import { PropsWithChildren } from "react";

export function GridWrapper(props: PropsWithChildren) {
    return <div className="mx-auto grid max-w-2xl grid-cols-1 gap-x-8 gap-y-4 lg:mx-0 lg:max-w-none lg:grid-cols-3">
        {
            props.children
        }
    </div>
}