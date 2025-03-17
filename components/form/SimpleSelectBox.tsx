import OutsideClickDetect from '@/components/ui/OutsideClickDetection';
import { useState } from 'react';
import { FaChevronDown, FaChevronUp, FaBookmark, FaRegBookmark } from 'react-icons/fa';
import { CSSTransition } from 'react-transition-group';

import './SelectBox.css';

type Data = {
    id: string,
    name: string
}

const SimpleSelectBox = ({data, onChange, value, zIndex}: {data: Data[], onChange:(input:Data)=> void, value: Data, zIndex?: number }) => {
    const [openSelectBox, setOpenSelectBox] = useState(false);

    const select = (input: Data)=> {
        onChange(input);
        setOpenSelectBox(false);
    }

    const convertZIndex = (zIndex: number)=>{
        if(zIndex == 1){
            return "z-1";
        }
        if(zIndex == 2){
            return "z-2";
        }
        if(zIndex == 3){
            return "z-3";
        }
        if(zIndex == 4){
            return "z-4";
        }
        if(zIndex == 5){
            return "z-5";
        }
        if(zIndex == 6){
            return "z-6";
        }
        if(zIndex == 7){
            return "z-7";
        }
        if(zIndex == 8){
            return "z-8";
        }
        if(zIndex == 9){
            return "z-9";
        }
        if(zIndex == 10){
            return "z-10";
        }
        if(zIndex == 11){
            return "z-11";
        }
        if(zIndex == 12){
            return "z-12";
        }
        if(zIndex == 13){
            return "z-13";
        }
        if(zIndex == 14){
            return "z-14";
        }
        if(zIndex == 15){
            return "z-15";
        }
        if(zIndex == 16){
            return "z-16";
        }
        if(zIndex == 17){
            return "z-17";
        }
        if(zIndex == 18){
            return "z-18";
        }
        if(zIndex == 19){
            return "z-19";
        }
        if(zIndex == 20){
            return "z-20";
        }
    }

    return (<>
        <OutsideClickDetect handle={() => setOpenSelectBox(false)}>
            <div className="px-5 py-1.5 cursor-pointer text-sm rounded-lg bg-gray-50 flex relative justify-between items-center">
                <span>Empty</span>
                <span> <FaChevronDown /> </span>
                <div
                    onClick={() => { setOpenSelectBox(!openSelectBox) }}
                    className={`${(zIndex?`${convertZIndex(zIndex + 1)}`: "z-20" )} px-3 py-1.5 rounded-lg text-sm bg-gray-50 flex absolute justify-between items-center w-full top-0 left-0`}>
                    <span>{value.name}</span>
                    <span> {openSelectBox ? <FaChevronUp /> : <FaChevronDown />} </span>
                </div>
                <div className={`${(zIndex?`${convertZIndex(zIndex)}`: "z-10" )} absolute top-full left-0 w-full`}>

                    <CSSTransition
                        in={openSelectBox}
                        classNames="simple-select-box"
                        timeout={300}
                        unmountOnExit={true}
                    >
                        <ul className="select-box py-1 rounded-lg shadow-md list-none mt-1 p-0 w-full">
                            {
                                data.map((e, index) => (
                                    <li key={index} onClick={()=> select(e)} className="bg-white px-3 py-2 border-b border-gray-200 border-opacity-50
                                        hover:bg-primary transition-all hover:text-white
                                    ">{e.name}</li>
                                ))
                            }
                        </ul>
                    </CSSTransition>

                </div>

            </div>
        </OutsideClickDetect>
    </>)
}

export default SimpleSelectBox;