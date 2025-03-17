'use client';
import Constants from "@/core/Constants";
import LogEvent from "@/packages/firebase/LogEvent";
import { RawPodcast, RawPodcastSubmit } from "@/store/types";
import React, { PropsWithChildren, useContext, useEffect, useState } from "react";
import { useAsync } from "react-use";
import * as uuid from 'uuid';

type PlayerContextProps = {
    podcast: RawPodcast,
    podcast_submit: RawPodcastSubmit,

    time_listen: number,
    playing: boolean,
    audio: HTMLAudioElement | undefined,
    play_rate: number,
    amount_time_adjust: number,
    is_looping: boolean,
    settings: {
        toggle_play: string,
        prev: string,
        next: string
    },

    togglePlay: any,
    changeCurrentTime: any,
    onChangeSettingKeyboard: any,
    changePlayRate: (value: number) => void,
    onSliding: any,
    goNextXSeconds: any,
    goPrevXSeconds: any,
    toggleLooping: any,
    onChangeAdjustTime: any
}

const PlayerContext = React.createContext<PlayerContextProps>({
    podcast: {} as RawPodcast,
    podcast_submit: {} as RawPodcastSubmit,
    settings: {
        toggle_play: "1",
        prev: "2",
        next: "3"
    },
    time_listen: 0,
    playing: false,
    audio: undefined,
    play_rate: 1,
    amount_time_adjust: 5,
    is_looping: true,

    togglePlay: () => { },
    changeCurrentTime: () => { },
    onChangeSettingKeyboard: () => { },
    onSliding: () => { },
    changePlayRate: () => { },
    goNextXSeconds: () => { },
    goPrevXSeconds: () => { },
    toggleLooping: () => { },

    onChangeAdjustTime: () => []
})


export const usePlayerContext = () => useContext(PlayerContext);

export const PlayerContextProvider = (props: PropsWithChildren<{
    podcast: RawPodcast,
    podcast_submit: RawPodcastSubmit
}>) => {

    const [audio, setAudio] = useState<HTMLAudioElement>();
    const [play_rate, setPlayRate] = useState(1);
    const [amount_time_adjust, setAmountTimeAdjust] = useState(5);
    const [is_looping, setLooping] = useState(true);
    // Keyboard settings
    const [settings, setSettings] = useState({
        toggle_play: "1",
        prev: "2",
        next: "3"
    });


    // State of audio
    const [playing, setPlaying] = useState(false);
    const [time_listen, setTimeListening] = useState(0);

    // UI 
    const [reset_interval, resetInterval] = useState('');

    const __init = useAsync(async () => {
        var audio = new Audio(Constants.IMAGE_URL + props.podcast.file_path);
        setAudio(audio);

        var settings = await localStorage.getItem('keyboard_listen_settings');
        if (settings) {
            setSettings(JSON.parse(settings));
        }

        var time_adjust = await localStorage.getItem('time_adjust');
        if (time_adjust) {
            setAmountTimeAdjust(parseInt(time_adjust));
        }
    }, []);


    const changeCurrentTime = (current: number, play: boolean = true) => {

        if (audio && !Number.isNaN(audio.duration) && current >= 0 && current <= audio.duration) {
            audio.currentTime = current;
            if (play) {
                audio.play();
                setPlaying(play);
            }

            setTimeListening(current)
            resetInterval(uuid.v4())
        }
    };


    const onChangeAdjustTime = async (e: any) => {
        LogEvent.sendEvent("listen.change_time_adjust");
        localStorage.setItem('time_adjust', parseInt(e.target.value).toString());
        setAmountTimeAdjust(parseInt(e.target.value));
    };


    const changePlayRate = (value: number) => {
        LogEvent.sendEvent("listen.play_rate_" + value);
        if (audio) {
            audio.playbackRate = value
            setPlayRate(value);
        }
    }


    const onChangeSettingKeyboard = async (e: any) => {
        LogEvent.sendEvent("listen.change_listen_settings");
        var new_settings = { ...settings };
        new_settings[e.target.name as 'toggle_play' | 'prev' | 'next'] = e.target.value;
        setSettings(new_settings);
        localStorage.setItem('keyboard_listen_settings', JSON.stringify(new_settings));
    };


    const goPrevXSeconds = (from_key: boolean) => {
        if (!from_key) {
            LogEvent.sendEvent("listen.go_prev_button");
        } else {
            LogEvent.sendEvent("listen.go_prev_key");
        }
        changeCurrentTime(Math.max(0, time_listen - amount_time_adjust));
    };


    const togglePlay = (from_key: boolean = false) => {
        if (!from_key) {
            LogEvent.sendEvent("listen.toggle_play_button");
        } else {
            LogEvent.sendEvent("listen.toggle_play_key");
        }

        if (audio) {
            if (!playing) {
                audio?.play();
                setPlaying(true);
            } else {
                audio?.pause();
                setPlaying(false);
            }
        }
    };


    const goNextXSeconds = (from_key: boolean = false) => {
        if (!from_key) {
            LogEvent.sendEvent("listen.go_next_button");
        } else {
            LogEvent.sendEvent("listen.go_next_key");
        }

        changeCurrentTime(time_listen + amount_time_adjust);
    };

    const toggleLooping = () => {
        setLooping(!is_looping)
    };


    useEffect(() => {
        const interval = setInterval(() => {
            if (audio && Number.isNaN(audio.duration)) {
                // setResetUi(uuid.v4());
            } else {
                changeCurrentTime(props.podcast_submit.current_time_listen || 0, false);
                clearInterval(interval);
            }
        }, 400);

        return () => {
            clearInterval(interval);
        }
    }, [audio]);


    const onSliding = (e: any) => {
        changeCurrentTime(parseInt(e.target.value), false);
    }


    // Interval for change time listening
    useEffect(() => {
        let current_time = time_listen;

        const interval_time = 1000 / (Math.floor(play_rate * 10) / 10);
        const interval = setInterval(() => {
            if (playing) {
                if (audio && !!audio.duration) {
                    if (current_time < audio.duration) {
                        current_time = parseInt(current_time.toString()) + 1;
                        setTimeListening(current_time)
                    } else {
                        if (is_looping) {
                            changeCurrentTime(0);
                        }
                        else {
                            clearInterval(interval);
                            setPlaying(false);
                        }
                    }
                }
            }
        }, interval_time);

        return () => {
            clearInterval(interval);
        };
    }, [playing, reset_interval, play_rate, is_looping])


    useEffect(() => {
        return () => {
            audio?.pause();
        }
    }, [audio])

    return (
        <PlayerContext.Provider value={{

            podcast: props.podcast,
            podcast_submit: props.podcast_submit,

            time_listen,
            playing,
            audio,
            play_rate,
            amount_time_adjust,
            is_looping,

            settings,

            togglePlay,
            changeCurrentTime,
            onChangeSettingKeyboard,
            onChangeAdjustTime,
            onSliding,
            changePlayRate,
            goNextXSeconds,
            goPrevXSeconds,
            toggleLooping
        }}>
            {props.children}
        </PlayerContext.Provider>
    )
}