import React, { useCallback, useEffect, useState } from 'react';
import { Hook } from '@/services/Hook';
import { GoSearch } from 'react-icons/go';
import { usePathname, useSearchParams, useRouter } from 'next/navigation';

const SearchInput = () => {
    const route = useRouter();
    const pathname = usePathname();
    const query = useSearchParams().get('q')

    const [search, setSearch] = useState('');
    useEffect(() => {
        if (query) {
            const value = query as string;
            setSearch(value);
        }

    }, [query])

    const onChangeHandle = useCallback((e: any) => {
        setSearch(e.target.value);
    }, [search, setSearch]);

    const onSubmitHandle = useCallback((e: any) => {
        if (e.code == 'Enter') {
            route.push(pathname + '?q=' + search);
              
        }

    }, [search, route]);

    return (
        <div className="flex flex-row items-center focus:outline-none focus:border-opacity-90 border border-black border-opacity-20  px-3 py-1 rounded text-base">
            <GoSearch className='mr-2' />
            <input className="outline-none" name="name" placeholder="Tìm kiếm" onChange={onChangeHandle} onKeyDown={onSubmitHandle}></input>
        </div>

    )
};


export default SearchInput;