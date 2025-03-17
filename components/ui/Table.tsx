import clsx from "clsx";
import { PropsWithChildren } from "react";

export function Table(props: PropsWithChildren<{}>) {
    return (
        <div className='bg-white shadow rounded'>

            <table className="min-w-full divide-y divide-gray-300">
                {props.children}
            </table>

        </div>
    );
}


export function TableHead(props: PropsWithChildren<{}>) {
    return (
        <thead>
            {props.children}
        </thead>
    );
}


export function TableTh(props: PropsWithChildren<{ style?: React.CSSProperties, className?: string }>) {
    return (
        <th style={props.style} className={"px-5 py-3.5 text-left text-sm font-semibold text-gray-900"}>
            {props.children}
        </th>
    );
}


export function TableBody(props: PropsWithChildren<{}>) {
    return (
        <tbody className='divide-y divide-gray-200 bg-white'>
            {props.children}
        </tbody>
    );
}


export function TableRow(props: PropsWithChildren<{}>) {
    return (
        <tr>
            {props.children}
        </tr>
    );
}


export function TableCell(props: PropsWithChildren<{ className?: string }>) {
    return (
        <td className={clsx("whitespace-nowrap px-5 py-3 text-sm text-gray-500", props.className)}>
            {props.children}
        </td>
    );
}


export function TableCellSkeleton(props: PropsWithChildren<{}>) {
    return (
        <td className="animate-pulse whitespace-nowrap px-3 py-3 text-sm text-gray-500">
            <div className="flex h-6 rounded-lg bg-gray-200 mt-2">
            </div>
        </td>
    )
}

export function TableSkeleton(props: PropsWithChildren<{ num: number, cells: any[] }>) {

    return <Table>
        <TableHead>
            {[...Array(props.cells.length).keys()].map(e => <TableTh style={{ width: props.cells ? props.cells[e] : '' }} key={e} />)}
        </TableHead>
        <TableBody>
            {[...Array(props.num).keys()].map(e => {
                return <TableRow key={e}>
                    {props.cells.map((cell, i) => <TableCell key={i}>
                        <TableCellSkeleton  />
                    </TableCell>)}
                </TableRow>
            })}
        </TableBody>

    </Table>;
}
