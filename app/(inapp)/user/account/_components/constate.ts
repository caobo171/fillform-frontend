import React, { useCallback, useEffect, useState } from 'react';
import constate from 'constate';
import { MeHook } from '@/store/me/hooks';
import Fetch from '@/lib/core/fetch/Fetch';
import { MeFunctions } from '@/store/me/functions';
import { Toast } from '@/services/Toast';
import { useRouter } from 'next/navigation';

function useProfile() {
    const me = MeHook.useMe();
    const router = useRouter();

    const [on_loading, setOnLoading] = useState(false);
    const [data, setUserData] = useState({
        fullname: '',
        username: '',
        facebook: '',
        address: '',
    });

    const [data_password, setDataPassword] = useState({
        password: '',
        confirm_password: '',
        present_password: '',
    })

    useEffect(() => {
        setUserData({
            ...data,
            fullname: me?.fullname || '',
            username: me?.username || '',
            facebook: me?.facebook || '',
            address: me?.address || ''
        });
    }, [me]);

    const changeData = useCallback((e: any) => {
        setUserData({ ...data, [e.target.name]: e.target.value });
    }, [data]);

    const changeDataPassword = useCallback((e: any) => {
        setDataPassword({ ...data_password, [e.target.name]: e.target.value });
    }, [data_password]);

    const changeAvatar = async (e: any) => {

        var files = e.target.files;
        if (files.length > 0 && window.confirm("Bạn có chắc muốn thay avatar ?")) {
            const res: any = await Fetch.postWithAccessToken('/api/me/change.avatar', {
                image: files[0]
            });

            await MeFunctions.loadProfile();
            if (res.data.code) {
                Toast.error(res.data.message);
            } else {
                Toast.success("Cập nhật thành công");
                await MeFunctions.loadProfile();
            }
        }
    };

    const changePassword = async (e: any) => {
        setOnLoading(true);
        const res: any = await Fetch.postWithAccessToken('/api/me/change.password', data_password);

        await MeFunctions.loadProfile();
        if (res.data.code) {
            Toast.error(res.data.message);
        } else {
            router.push("/authentication/login")
            Toast.success("Cập nhật thành công tiến hành đăng nhập!");
            await MeFunctions.logout();
        }
        setOnLoading(false);
    };

    const saveUserData = async () => {
        setOnLoading(true);
        const res: any = await Fetch.postWithAccessToken('/api/me/update.info', data);

        if (res.data.code) {
            Toast.error(res.data.message);
        } else {
            Toast.success("Cập nhật thành công");
            await MeFunctions.loadProfile();
        }
        setOnLoading(false);
    }

    return { changeData, changeAvatar, saveUserData, changeDataPassword, changePassword, data, data_password, on_loading };
};

const [
    ProfileProvider,
    useChangeAvatar,
    useSaveUserData,
    useChangeData,
    useChangeDataPassword,
    useChangePassword,
    useUserData,
    usePasswordData,
    useOnLoading
] = constate(
    useProfile,
    value => value.changeAvatar,
    value => value.saveUserData,
    value => value.changeData,
    value => value.changeDataPassword,
    value => value.changePassword,
    value => value.data,
    value => value.data_password,
    value => value.on_loading
);

export const ProfileConstate = {
    ProfileProvider,
    useChangeAvatar,
    useSaveUserData,
    useChangeData,
    useUserData,
    usePasswordData,
    useChangeDataPassword,
    useChangePassword,
    useOnLoading
};