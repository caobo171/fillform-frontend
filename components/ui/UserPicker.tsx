import OutsideClickDetect from '@/components/ui/OutsideClickDetection';
import Constants from '@/core/Constants';
import React, { useState } from 'react';
import { useCallback } from 'react';
import { HiOutlineX } from 'react-icons/hi';
import { useAsync, useThrottle } from 'react-use';
import Fetch from '@/lib/core/fetch/Fetch';
import { Helper } from '@/services/Helper';
import UI from '@/services/UI';
import { RawUser } from '@/store/types';
import { UserFunctions } from '@/store/user/functions';
import { UserHook } from '@/store/user/hooks';
import Image from 'next/image';

interface Props {
    users: any[],
    managed?: any,
    setUsers: (value: RawUser[]) => void,
    onAddUser?: (value: RawUser) => Promise<boolean>,
    onRemoveUser?: (value: RawUser) => Promise<boolean>
}

export const UserPicker = ({ users, setUsers, onAddUser, onRemoveUser, managed }: Props) => {

    const [search, setSearch] = useState('');
    const [active, setActive] = useState(false);
    const throttled = useThrottle(search, 300);

    const data = useAsync(async () => {
        if (throttled != "") {
            const result = await Fetch.postWithAccessToken<{
                users: RawUser[]
            }>('/api/user/list.universe', { q: throttled });

            if (result.data.users) {
                UserFunctions.loadRawUsers(result.data.users);
            }

            return result.data;
        } else {
            const result = await Fetch.postWithAccessToken<{
                users: RawUser[]
            }>('/api/user/list.universe', {});


            if (result.data.users) {
                UserFunctions.loadRawUsers(result.data.users);
            }
            return result.data;
        }

    }, [throttled]);

    const onChangeHandle = (e: any) => {
        setSearch(e.target.value);
    };

    const [current_index, setCurrentIndex] = useState(-1);
    const onSubmitHandle = useCallback(async (e: any) => {
        setCurrentIndex(-1);
        if (!data.value) {
            return;
        }
        if (e.code == 'Enter') {

            const user = data.value.users[current_index];
            if (!users.find(e => e.id == user.id || e.user_id == user.id)) {
                if (onAddUser) {
                    var res = await onAddUser(user);
                    if (res) {
                        setUsers([...users, user]);
                    }
                } else {
                    setUsers([...users, user]);
                }
            }

        }

        if (e.code == 'ArrowDown') {
            setCurrentIndex(Math.min(data.value.users.length, current_index + 1));
        } else if (e.code == 'ArrowUp') {
            setCurrentIndex(Math.max(-1, current_index - 1));
        }
    }, [search, current_index, data.value, setCurrentIndex, users, setUsers]);


    const onClickHandle = async (user: RawUser) => {
        if (!users.find(e => e.id == user.id || e.user_id == user.id)) {
            if (onAddUser) {
                var res = await onAddUser(user);
                if (res) {
                    setUsers([...users, user]);
                }
            } else {
                setUsers([...users, user]);
            }
        }
    }


    const onRemoveHandle = async (user: RawUser) => {
        if (users.find(e => e.id == user.id)) {
            if (onRemoveUser) {
                var res = await onRemoveUser(user);
                if (res) {
                    setUsers(users.filter(e => e.id != user.id))
                }
            } else {
                setUsers(users.filter(e => e.id != user.id))
            }
        }
    }

    return (
        <div className="relative flex flex-wrap items-center ">
            {users.map(user => <UserItem key={user.id || user.user_id} user_id={user.id || user.user_id} onRemoveUser={onRemoveHandle} managed={managed} />)}
            {managed && <div className="inline-block ml-2.5  relative" style={{ cursor: 'pointer', userSelect: 'none' }}  >
                <span className="cursor-pointer flex text-base font-medium text-gray-400 px-5 py-1.5 hover:bg-gray-200 hover:text-gray-600 transition-all duration-200"
                    onClick={() => setActive(true)}>Thêm người dùng</span>
                {
                    active && <OutsideClickDetect handle={() => setActive(false)}
                        className={`absolute top-full z-10 bg-white border border-opacity-10 border-black rounded`} style={{ minWidth: 300 }}>
                        <ul className="py-2 px-3">
                            <li>
                                <input className="my-1 block w-full outline-none focus:outline-none px-3 py-1 rounded border-black border-opacity-10 border focus:border-opacity-90 transition-all duration-200"
                                    placeholder={'Tìm kiếm'} value={search} onChange={onChangeHandle} onKeyDown={onSubmitHandle} />
                            </li>
                            {
                                data.value && data.value.users.map((user, index) => (
                                    <li onMouseMove={() => setCurrentIndex(index)}
                                        style={{ padding: 4 }}
                                        onClick={() => onClickHandle(user)}
                                        key={user.id}
                                        className={`rounded ${index == current_index ? 'bg-gray-200' : ''}`}
                                    >{user.username} (@{user.username})</li>
                                ))
                            }
                        </ul>
                    </OutsideClickDetect>
                }
            </div>}
        </div>
    )
};


export const UserItem = ({ user_id, onRemoveUser, managed }: { user_id: number, onRemoveUser?: (value: RawUser) => any, managed: any }) => {
    var user = UserHook.useUser(user_id);
    if (!user) {
        return null;
    }
    return (<>
        <div data-tip={user.username} className="rounded-full flex items-center justify-center relative h-10 w-10" style={{ background: UI.getColorByString(user.username), userSelect: 'none', marginLeft: -8, border: '2px solid #fff' }}>
            {user.avatar ?
                <Image width={32} alt={user.username} className="object-cover rounded-full" src={Constants.IMAGE_URL + Helper.normalizeUrl(user.avatar)} /> :
                <div className="text-white uppercase flex items-center justify-center font-semibold">{user.username[0]}</div>}
            <div className="absolute w-full h-full top-0 left-0 opacity-0 hover:opacity-100 transition-all duration-200">
                {managed && <div
                    onClick={() => onRemoveUser && onRemoveUser(user)}
                    className="rounded-full absolute bg-gray-100 -top-1 -right-1 flex items-center justify-center cursor-pointer w-5 h-5  z-10">
                    <span><HiOutlineX /></span>
                </div>}
            </div>
        </div>
    </>)
}

export default UserPicker;