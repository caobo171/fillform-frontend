import Select from 'react-select';
import { FaChevronDown, FaChevronUp, FaBookmark, FaRegBookmark } from 'react-icons/fa';
import { useEffect, useState } from 'react';


type SearchItem ={
    value: string,
    label: string
}

interface Props{
    data: SearchItem[],
    placeholder?: string,
    onChange?: (e: SearchItem) => void,
    value?: SearchItem | null,
    defaultValue?: SearchItem | null
}

const SelectSearch = ({data = [], value = null, defaultValue = null,placeholder = "Select ...", onChange}:Props) => {
    const [isOpen, setOpen] = useState(false);
    const [valueIn, setValueIn] = useState<SearchItem | null>(value);

    const toggleOpen = () => { setOpen(!isOpen) }

    const onSelectChange = (value: any) => {
        toggleOpen();
        setValueIn(value);
        if(onChange){
            onChange(value);
        }
    }

    const onBlur = () => {
        if(!valueIn){
            setValueIn(defaultValue);
        }
    }

    useEffect(()=> {
        if(defaultValue){
            if(!value){
                setValueIn(defaultValue);
            }
        }
    }, [])

    return (
        <>
            <div className="w-full relative">
                <Dropdown
                    isOpen={isOpen}
                    onClose={toggleOpen}
                    target={
                        <div
                            onClick={toggleOpen}
                            className="flex justify-between items-center cursor-pointer px-3 text-sm py-1 bg-gray-50"
                        >
                            <span>{valueIn ? valueIn.label : placeholder}</span>
                            <span><FaChevronDown/></span>
                        </div>
                    }
                >
                    <Select
                        autoFocus
                        components={{ DropdownIndicator: null, IndicatorSeparator: null }}
                        backspaceRemovesValue={false}
                        controlShouldRenderValue={false}
                        hideSelectedOptions={false}
                        isClearable={false}
                        menuIsOpen
                        onChange={onSelectChange}
                        onBlur={onBlur}
                        options={data}
                        placeholder={placeholder}
                        styles={ {
                            control: (provided: any) => ({ ...provided,borderColor:'#ffa514'
                                    , margin: 8, boxShadow: 'none', ':hover':{borderColor: '#ffa514'} }),
                            // menu: () => ({ boxShadow: 'inset 0 1px 0 rgba(0, 0, 0, 0.1)' }),
                            option: (base, { data, isDisabled, isFocused, isSelected }) => ({...base, backgroundColor: isSelected? '#e3fbe7'
                                : isFocused
                                ?  '#ffedc4'
                                : 'transparent'}),

                        }}
                        tabSelectsValue={false}
                        value={value}
                    />
                </Dropdown>
            </div>
        </>
    );
}
// styled components

const Menu = (props: any) => {
    return (
        <div
            className="shadow-md bg-white rounded mt-2 absolute w-full z-10"
            {...props}
        />
    );
};
const Blanket = (props: any) => (
    <div
        className="top-0 bottom-0 right-0 left-0 fixed z-1"
        {...props}
    />
);

const Dropdown = ({ children, isOpen, target, onClose }: { children: any, isOpen: boolean, target: any, onClose: any }) => (
    <div className="relative">
        {target}
        {isOpen ? <Menu>{children}</Menu> : null}
        {isOpen ? <Blanket onClick={onClose} /> : null}
    </div>
);

export default SelectSearch;


