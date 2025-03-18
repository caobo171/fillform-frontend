'use client';
import { useAsync } from 'react-use';
import Constants, { FIREBASE_CONFIG } from '@/core/Constants';
import * as firebase from 'firebase/app';
import firestore, { collection, getFirestore, query, limit, orderBy, onSnapshot } from 'firebase/firestore';
import Fetch from '@/lib/core/fetch/Fetch';
import React, { PropsWithChildren, useContext, useState } from 'react';
import { useMe } from '@/hooks/user';


const NotificationContext = React.createContext({
    unseen: 0,
    system_unseen: 0
});

export const useNotificationContext = () => useContext(NotificationContext);

export const NotificationContextProvider = (props: PropsWithChildren<{}>) => {

    const [unseen, setUnseen] = useState(0);
    const [system_unseen, setSystemUnseen] = useState(0);
    let observer: () => void;
    let system_observer: () => void;
    const { data: me } = useMe()


    return (
        <NotificationContext.Provider value={{ unseen, system_unseen }}>
            {props.children}
        </NotificationContext.Provider>
    )
}