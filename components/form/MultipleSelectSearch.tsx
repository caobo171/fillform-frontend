import { useRef } from 'react';
import { useState } from 'react';
import { FaChevronDown, FaChevronUp, FaBookmark, FaRegBookmark } from 'react-icons/fa';

import Select from 'react-select';

type SearchItem = {
    value: string,
    label: string
}


interface Props {
    data: SearchItem[],
    placeholder?: string,
    onChange?: (e: SearchItem) => void,
    value?: SearchItem | null,
    defaultValue?: SearchItem | null
}



const MultipleSelectSearch = ({ data = [], value = null, defaultValue = null, placeholder = "Select ...", onChange }: Props) => {
    const onSelectChange = (value: any) => {
        if (onChange) {
            onChange(value);
        }
    }

    return (<>
        <Select
            components={{ DropdownIndicator: null, IndicatorSeparator: null }}
            defaultValue={defaultValue}
            isClearable={true}
            isSearchable={true}
            placeholder={placeholder}
            onChange={onSelectChange}
            options={data}
            className="text-sm"
            styles={{
                control: (provided: any) => ({
                    ...provided,
                    borderRadius: 8,
                    border: `2px solid transparent`,
                    backgroundColor: `rgba(249, 250, 251)`
                    , margin: 0, padding:0, boxShadow: 'none', ':hover': { borderColor: '#ffa514'}, ':focus': { borderColor: '#ffa514'}
                }),
                container:(style)=>({
                    ...style, backgroundColor: `rgba(249, 250, 251)`
                }),
                valueContainer:(style)=>({
                    ...style, padding:'0 0.75rem', backgroundColor: `rgba(249, 250, 251)`
                }),
                
                menu: (style) => ({...style, boxShadow: 'inset 0 1px 0 rgba(0, 0, 0, 0.1)', zIndex: 11, width: '100%' }),
                option: (base, { data, isDisabled, isFocused, isSelected }) => ({
                    ...base, backgroundColor: isSelected ? '#e3fbe7'
                        : isFocused
                            ? '#ffedc4'
                            : 'transparent'
                }),

            }}
            value={value}
        />
    </>)
}

export default MultipleSelectSearch