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

    const state = useAsync(async () => {
        if (me) {
            let app = null;
            if (firebase.getApps().length === 0) {
                app = await firebase.initializeApp(FIREBASE_CONFIG);
            } else {
                app = await firebase.getApp();
            }

            const db = getFirestore(app);
            const notificationQuery = await query(collection(db, 'notifications', me.id.toString() as string, 'notifications'), orderBy("since", "desc"), limit(10));
            observer = onSnapshot(notificationQuery, (async (querySnapShot) => {
                querySnapShot.docChanges().forEach((change: any) => {

                    if (change.type == 'added') {
                    }

                    if (change.type == 'modified') {
                    }

                    if (change.type == 'removed') {
                    }
                });

                const res = await Fetch.postWithAccessToken<{ unseen: number }>('/api/notification/get.unseen', {});
                if (res.status == 200) {
                    setUnseen(res.data.unseen);
                }
            }));
        }
        else {
            if (observer) {
                observer();
            }
        }
    }, [me])

    const state2 = useAsync(async () => {
        if (me) {

            let app = null;
            if (firebase.getApps().length === 0) {
                app = await firebase.initializeApp(FIREBASE_CONFIG);
            } else {
                app = await firebase.getApp();
            }

            const db = getFirestore(app);
            const snotificationQuery = await query(collection(db, 'notifications', '-1', 'notifications'), orderBy("since", "desc"), limit(10));
            observer = onSnapshot(snotificationQuery, (async (querySnapShot) => {
                querySnapShot.docChanges().forEach((change: any) => {

                    if (change.type == 'added') {
                    }

                    if (change.type == 'modified') {
                    }

                    if (change.type == 'removed') {
                    }
                });

                var res = await Fetch.postWithAccessToken<{ unseen: number }>("/api/notification/get.system.unseen", {});
                if (res.status == 200) {
                    setSystemUnseen(res.data.unseen);
                }
            }));
        }
        else {
            if (system_observer) {
                system_observer();
            }
        }
    }, [me]);


    return (
        <NotificationContext.Provider value={{ unseen, system_unseen }}>
            {props.children}
        </NotificationContext.Provider>
    )
}