import { ReactElement, useState } from "react";
import OutsideClickDetect from '@/components/ui/OutsideClickDetection';
import { CSSTransition } from "react-transition-group";

interface Props {
    button: ReactElement,
    content: { onClick: () => void, text: string }[],
    from_left?: boolean,
    class_width?: string,
    class_z_index?: string,
    min_width?: number,
    hover?: boolean,
    timeout?: number
}

const WrapperDropDown = ({
    button,
    content,
    from_left = true,
    class_width = 'w-full',
    class_z_index = "z-10",
    timeout = 300,
    hover = false,
    min_width }: Props) => {
    const [open, setOpen] = useState(false);

    return (<>
        <OutsideClickDetect handle={() => !hover && setOpen(false)} >
            <div className="relative" onMouseLeave={() => hover && setOpen(false)} onMouseEnter={() => hover && setOpen(true)}>
                <div onClick={() => !hover && setOpen(!open)}>
                    {button}
                </div>
                {/* @ts-ignore */}
                <CSSTransition
                    in={open}
                    timeout={(timeout || timeout == 0) ? timeout : 300}
                    classNames="small-slide-down"
                    unmountOnExit>
                    <div className={`absolute ${class_width} ${class_z_index} ${from_left ? "left-0" : "right-0"} top-full`}>

                        <ul style={{ minWidth: min_width ? min_width : 200 }} className="absolute right-0 z-10 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none ">
                            {content.map((item, index) => (
                                <li key={index}>
                                    <a onClick={() => { setOpen(false); item.onClick(); }}
                                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer">{item.text}</a>
                                </li>
                            ))}
                        </ul>

                    </div>
                </CSSTransition>
            </div>
        </OutsideClickDetect>
    </>)
}

export default WrapperDropDown;