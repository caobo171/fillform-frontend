'use client'
import Meta from '@/components/ui/Meta';
import Constants, { Code, LAYOUT_TYPES } from "@/core/Constants";
import { GetServerSideProps } from "next";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { FaPlay } from "react-icons/fa";
import { IoPause } from "react-icons/io5";
import { useAsync } from "react-use";
import Fetch from "@/lib/core/fetch/Fetch";
import { Helper } from "@/services/Helper";
import { Toast } from "@/services/Toast";
import { MeHook } from "@/store/me/hooks";
import { PodcastTranscriptionSentence, PodcastTranscriptionWord, RawPodcast, RawPodcastTranscription } from "@/store/types"
import * as uuid from 'uuid';
import $ from 'jquery'
 

const displayTime = (input: number) => {
    if (!Number.isNaN(input)) {
        let minutes = '';
        let seconds = '';
        minutes = Math.floor(input / 60) > 9 ? Math.floor(input / 60).toString() : "0" + Math.floor(input / 60).toString();
        seconds = Math.floor(input % 60) > 9 ? Math.floor(input % 60).toString() : "0" + Math.floor(input % 60).toString();
        return minutes + ":" + seconds;
    }
    else {
        return "00:00";
    }
};

const Transcript = ({ podcast }: { podcast: RawPodcast }) => {

    const [update_text, setUpdateText] = useState("");
    const [on_loading, setOnLoading] = useState(false);
    const [words, setWords] = useState<PodcastTranscriptionWord[]>([]);
    const [files, setFiles] = useState<File[]>([]);
    const [reload, setReload] = useState("");
    const me = MeHook.useMe()
    const [audio, setAudio] = useState<HTMLAudioElement>();
    const [playing, setPlaying] = useState(false);
    const [time_listen, setTimeListening] = useState(0);
    const [on_change_slide, setOnChangeSlide] = useState('');
    const [play_rate, setPlayRate] = useState(1);
    const [change_transcription, setChangeTranscription] = useState(false);
    const [upload_transcription, setUploadTranscription] = useState(podcast.result);

    const onChangeHandle = (e: any) => {
        changeCurrentTime(e.target.value)
    };

    const changeCurrentTime = (current: number, play: boolean = true) => {
        if (audio && !Number.isNaN(audio.duration) && current >= 0 && current <= audio.duration) {
            audio.currentTime = current;

            if (play) {
                audio.play();
                setPlaying(play);
            }

            setTimeListening(current)
            setOnChangeSlide(uuid.v4())
        }
    };

    const togglePlay = (from_key: boolean = false) => {
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

    const saveChangeDescription = async () => {
        if (!change_transcription) return;
        setOnLoading(true);

        var new_words: PodcastTranscriptionWord[] = [];
        var new_sentences: PodcastTranscriptionSentence[] = [];

        var word_count = 0;
        var sentence_count = 0;
        var current_sentence = "";
        var merge_texts: PodcastTranscriptionWord[] = [];
        var process_words = words.map(x => {
            var word = $(`#word_${x.id}`);
            if (word) {
                return {
                    ...x, w: word.text().replace(/\s+/g, " ")
                }
            }
            return {
                ...x, w: ""
            }
        })
        console.log("======================")
        // console.log(process_words);

        for (let index = 0; index < process_words.length; index++) {


            var word = { ...process_words[index] };
            // console.log("--", word.w, "--")
            current_sentence += word.w;

            // Check and start merge words
            if ((word.w[word.w.length - 1] != " ")) {
                console.log("1.1_", word.w)
                merge_texts.push({ ...word, w: word.w.trim() });
                continue;
            }

            if (!word.w) {
                console.log("1.2_", word.w)
                current_sentence = current_sentence.trim();
                merge_texts.push({ ...word, w: word.w.trim() });
                continue;
            }



            if (merge_texts.length > 0) {
                var merged_word: PodcastTranscriptionWord = {
                    id: word_count.toString(),
                    sid: sentence_count.toString(),
                    w: merge_texts.map(x => x.w).join("") + word.w,
                    s: merge_texts[0].s,
                    e: word.e
                };
                merge_texts = [];

                var split_words = merged_word.w.trim().split(" ").filter(x => x);
                for (let j = 0; j < split_words.length; j++) {
                    const split_word = split_words[j];
                    new_words.push({
                        id: word_count.toString(),
                        sid: sentence_count.toString(),
                        w: split_word,
                        s: word.s,
                        e: word.e
                    })

                    word_count += 1;
                }
                continue;
            }

            // =======
            // Check end sentence with `.`
            if (word.w.trimEnd()[word.w.trimEnd().length - 1] == '.') {
                new_sentences.push({
                    id: sentence_count.toString(),
                    // remove '.' at last
                    content: current_sentence.slice(0, -1)
                })

                // word remove '.' at last
                var split_words = word.w.trim().slice(0, -1).split(" ").filter(x => x);
                // console.log(word.w);
                // console.log("2.1_", split_words);
                for (let j = 0; j < split_words.length; j++) {
                    const split_word = split_words[j];

                    new_words.push({
                        id: word_count.toString(),
                        sid: sentence_count.toString(),
                        // word remove '.' at last
                        w: split_word,
                        s: word.s,
                        e: word.e
                    })

                    word_count += 1;
                }
                sentence_count += 1;
                current_sentence = "";
                continue;
            }
            // ==========

            // console.log(word.w);
            var split_words = word.w.trim().split(" ").filter(x => x);
            // console.log("3.1_", split_words);

            for (let j = 0; j < split_words.length; j++) {
                const split_word = split_words[j];

                new_words.push({
                    id: word_count.toString(),
                    sid: sentence_count.toString(),
                    w: split_word,
                    s: word.s,
                    e: word.e
                })

                word_count += 1;
            }
        }

        if (current_sentence) {
            new_sentences.push({
                id: sentence_count.toString(),
                content: current_sentence
            })
        }

        setChangeTranscription(false);

        const res = await Fetch.postWithAccessToken<{ code: number }>("/api/podcasts/update.transcription", {
            id: state.value?.id,
            transcription_words: JSON.stringify(new_words),
            transcription_sentences: JSON.stringify(new_sentences),
            result: upload_transcription
        })

        setOnLoading(false);

        if (res.status == 200 && res.data.code == Code.SUCCESS) {
            Toast.success("Save successful!")
            setReload(uuid.v4());
        }
        else {
            Toast.error("Error occurred!")
        }
    }

    const init = useAsync(async () => {
        var audio = new Audio(Constants.IMAGE_URL + podcast.file_path);
        setAudio(audio);
    }, []);

    const [reset_ui, setResetUi] = useState('');
    useEffect(() => {
        const cur_interval = setInterval(() => {
            if (audio && Number.isNaN(audio.duration)) {
                setResetUi(uuid.v4());
            }
            else {
                changeCurrentTime(0, false);
                clearInterval(cur_interval);
            }
        }, 400);

        return () => {
            clearInterval(cur_interval);
        }
    }, [audio])

    useEffect(() => {
        var $fill = $(".bar .fill");
        if (audio && audio.duration) {
            $fill.css("width", (time_listen / audio.duration * 100) + "%");
        }
    }, [time_listen]);

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
                        clearInterval(interval);
                        setPlaying(false);
                    }
                }
            }
        }, interval_time);

        return () => {
            clearInterval(interval);
        };
    }, [playing, on_change_slide, play_rate])

    // effect when run audio
    useEffect(() => {
        const interval = setInterval(() => {
            if (audio && audio.currentTime > 0) {
                var time = Math.floor(audio.currentTime * 10);
                var items = $(`.word_${time}`);
                if (items.length > 0) {
                    $(`.word.word-current`).removeClass("word-current");
                    items.addClass("word-current");
                }
            }
        }, 100)

        return () => {
            clearInterval(interval);
        };
    }, [audio])

    const onRevertTranscription = async () => {
        const res = await Fetch.postWithAccessToken<{
            code: number,
            transcription: RawPodcastTranscription
        }>("/api/podcasts/revert.transcription", {
            id: state.value?.id,
        })

        setOnLoading(false);
        if (res.status == 200 && res.data.code == Code.SUCCESS) {
            setReload(uuid.v4());
        }
        else {
            Toast.error("Đã có lỗi xảy ra!")
        }
    }


    const onStartTranscription = async () => {
        if (on_loading) return;

        setOnLoading(true)
        var res: any;
        try {
            res = await Fetch.postWithAccessToken<{
                code: number,
                transcription: RawPodcastTranscription
            }>("/api/podcasts/transcription", {
                id: podcast.id,
                audio: files[0]
            })
        }
        catch {

        }
        setOnLoading(false);

        if (res.status == 200 && res.data.code == Code.SUCCESS) {
            Toast.success("Transcript Finished")
        }
        else {
            Toast.error("Đã có lỗi xảy ra!")
        }
        setReload(uuid.v4());
    }

    const state = useAsync(async () => {
        if (me) {
            const res = await Fetch.postWithAccessToken<{ code: number, transcription: RawPodcastTranscription }>("/api/podcasts/get.transcription", {
                id: podcast.id
            })

            if (res.status == 200 && res.data.code == Code.SUCCESS) {
                var new_words = [];
                for (let index = 0; index < res.data.transcription.transcriptions.length; index++) {
                    var word = { ...res.data.transcription.transcriptions[index] };
                    const next_word = res.data.transcription.transcriptions[index + 1];
                    if (!next_word || next_word.sid != word.sid) {
                        word.w = word.w + ". ";
                    }
                    else {
                        word.w = word.w + " ";
                    }
                    new_words.push(word)
                }

                setWords(new_words);

                return {
                    id: res.data.transcription.id,
                    transcriptions: res.data.transcription.transcriptions,
                    transcription_sentences: res.data.transcription.transcription_sentences
                }
            }
        }

        return {
            id: -1,
            transcriptions: [],
            transcription_sentences: []
        }
    }, [me, reload])

    const SIZE_OF_CHECK_WORDS = 5;

    const render_transcription = useMemo(() => {
        if (state.value) {
            return (<>
                <span
                    onInput={(e) => {
                        setChangeTranscription(true);
                        setUpdateText(uuid.v4());
                    }}
                    role={"textbox"}
                    className="outline-none focus:outline-none flex flex-wrap"
                    suppressContentEditableWarning={true}
                    contentEditable={true}
                >
                    {
                        state.value.transcriptions.map((word, index) => {
                            var is_first_value = state.value && (index == 0 || word.sid != state.value.transcriptions[index - 1].sid);
                            var is_last_value = state.value && (index + 1 == state.value.transcriptions.length || word.sid != state.value.transcriptions[index + 1].sid);

                            return (
                                <React.Fragment key={index}>
                                    <span className="relative">
                                        <span
                                            id={`word_${word.id}`}
                                            className={`word word_${word.s * 10} ${is_first_value ? "capitalize" : ""} transition-all focus:outline-none outline-none focus:bg-gray-200 focus:text-black relative`}
                                            key={index}>
                                            {word.w}{is_last_value ? "." : ""}&nbsp;
                                        </span>
                                    </span>
                                </React.Fragment>
                            )
                        })
                    }
                </span>

            </>)
        }
    }, [state.value])

    useEffect(() => {
        var conflicts: { [key: string]: { r: string } } = {}



        if (words.length > 0) {
            var extracted_word = words.map(x => {
                var word = $(`#word_${x.id}`);
                if (word) {
                    return {
                        ...x, w: word.text().replace(/\s+/g, " ")
                    }
                }
                return {
                    ...x, w: ""
                }
            })

            // .replace(/\,|\.|\!|\"|\;|\?|\:\'|\(|\)|\@/g, " ")
            var result_words = upload_transcription.replace(/\s+/g, " ").split(" ").filter(e => e);
            var trans_words = extracted_word;

            // console.log(trans_words);
            // console.log(result_words)
            var ctr_result_w = 0;
            var ctr_trans_w = 0;

            while (ctr_trans_w < trans_words.length) {
                if (!result_words[ctr_result_w]) {
                    break;
                }

                // console.log(trans_words[ctr_trans_w].w.toLowerCase(), "__", result_words[ctr_result_w].toLowerCase())
                if (trans_words[ctr_trans_w].w.trim().toLowerCase() == result_words[ctr_result_w].trim().toLowerCase()) {
                }
                else {
                    var found = false;

                    for (let i = 0; i < SIZE_OF_CHECK_WORDS; i++) {
                        // console.log("i__", i);
                        if (trans_words[ctr_trans_w + i]) {
                            for (let j = 0; j < SIZE_OF_CHECK_WORDS; j++) {
                                // console.log("j__", j);
                                if (result_words[ctr_result_w + j]) {
                                    if (trans_words[ctr_trans_w + i].w.trim().toLowerCase() == result_words[ctr_result_w + j].trim().toLowerCase()) {
                                        // break loop
                                        // console.log("j_2__", j);
                                        found = true;
                                        conflicts[trans_words[ctr_trans_w + i - 1].id] = { r: result_words.slice(ctr_result_w, ctr_result_w + j).join(" ") };
                                        ctr_trans_w += i;
                                        ctr_result_w += j;
                                    }
                                }
                                if (found) {
                                    // console.log("found_i_", i, "_j_", j)
                                    break;
                                }
                            }
                        }

                        if (found) {
                            break;
                        }
                        else {
                            if (trans_words[ctr_trans_w + i]) {
                                // console.log("==", trans_words[ctr_trans_w + i].w, "==")
                                conflicts[trans_words[ctr_trans_w + i].id] = { r: "" };
                            }
                        }
                    }

                    if (!found) {
                        conflicts[trans_words[ctr_trans_w].id] = { r: result_words[ctr_result_w] };
                    }
                }
                ctr_trans_w += 1;
                ctr_result_w += 1;
            }
        }

        var conflict_words = Object.keys(conflicts);
        $(".word").removeClass("bg-red-400");
        $(".word").removeClass("text-white");
        for (let index = 0; index < conflict_words.length; index++) {
            const w_id = conflict_words[index];
            $("#word_" + w_id).addClass("bg-red-400");
            $("#word_" + w_id).addClass("text-white");
        }

    }, [upload_transcription, words, render_transcription, update_text])

    return (<>
        <Meta title={`WELE | Transcription Podcast ${podcast.name}`} />
        <div className="pb-24">
            {state.value && state.value.id == -1 && (<>
                <div className="flex items-center w-full px-5 py-4 rounded-lg shadow mb-3">
                    <button onClick={onStartTranscription} className="flex justify-center items-center outline-none focus:outline-none text-semibold text-white bg-primary w-56 px-5 py-2 rounded shadow">
                        <span>
                            Start Transcripting
                        </span>
                        {on_loading && <span className="animate-spin ml-2">
                            <AiOutlineLoading3Quarters />
                        </span>}
                    </button>

                    <div className="ml-5">
                        <div className="flex items-center">
                            <input type="file" id="file" name="file" onChange={(e) => {
                                if (e.target.files && e.target.files.length > 0) {
                                    setFiles([e.target.files[0]]);
                                }
                            }} />
                        </div>
                    </div>
                </div>
            </>)}

            {state.value && state.value.id != -1 && (<>
                <div className="flex items-center w-full px-5 py-4 rounded-lg shadow mb-3">
                    <button onClick={onRevertTranscription} className="flex justify-center items-center outline-none focus:outline-none text-sm text-white bg-primary w-56 px-3 py-1 rounded shadow">
                        <span>
                            Revert
                        </span>
                        {on_loading && <span className="animate-spin ml-2">
                            <AiOutlineLoading3Quarters />
                        </span>}
                    </button>
                </div>
            </>)}

            <div className="w-full px-5 py-4 rounded-lg shadow flex">
                <div className="w-1/2">
                    <h3 className="text-red-400 font-medium text-base block text-center">AUTO</h3>
                    <div className="mt-3 px-3 py-3 shadow rounded-md flex flex-wrap leading-7 font-light text-sm">


                        {state.loading ? (<>

                        </>) : (<>
                            {render_transcription}
                        </>)}
                    </div>
                </div>
                <div className="w-1/2">
                    <h3 className="text-green-400 font-medium text-base block text-center">UPLOAD</h3>
                    <div className="mt-3 px-3 py-3 shadow rounded-md flex flex-wrap leading-7 font-light text-sm">
                        <span
                            className="outline-none focus:outline-none"
                            onInput={(e) => {
                                e.preventDefault();
                                setUploadTranscription(e.currentTarget.textContent ? e.currentTarget.textContent : "")
                            }}
                            role="textbox" suppressContentEditableWarning={true} contentEditable={true}
                        >
                            {podcast.result}
                        </span>
                    </div>
                </div>
            </div>
        </div>
        {audio && (<>
            <div className="fixed bottom-0 left-0 w-full z-20 py-5 flex items-center px-10 bg-white shadow mt-3">
                <span onClick={() => togglePlay()} className="cursor-pointer  inline-block  text-2xl shadow-md text-white px-2 py-2 bg-primary hover:bg-primary-dark transition-all rounded-full">
                    {playing ? <IoPause /> : <FaPlay />}
                </span>
                <div className="flex-1 ml-5">
                    <div className="flex justify-between">
                        <p className="text-sm">{displayTime(time_listen)}</p>
                        <p className="text-sm">{displayTime(audio.duration)}</p>
                    </div>
                    <div className="relative slider-container">
                        <span className="bar cursor-pointer shadow absolute left-0 top-3 w-full h-2 rounded-full overflow-hidden bg-primary bg-opacity-30">
                            <span className="fill block w-0 h-full bg-primary"></span>
                        </span>
                        <input id="slider" type="range" min={0} max={Number.isNaN(audio.duration) ? 1 : audio.duration} value={time_listen} onChange={onChangeHandle}
                            className="slider cursor-pointer relative appearance-none w-full h-1 rounded-full outline-none bg-transparent" />
                    </div>
                </div>
                <button onClick={() => saveChangeDescription()} className={`ml-5 outline-none focus:outline-none cursor-pointer 
                flex justify-center items-center text-base shadow-md text-white 
                w-32 py-1 ${change_transcription ? "hover:bg-primary-dark bg-primary" : " bg-red-200"} transition-all rounded`}>
                    <span>
                        Save
                    </span>
                    {on_loading && <span className="animate-spin ml-2">
                        <AiOutlineLoading3Quarters />
                    </span>}
                </button>
            </div>
        </>)}
    </>)

}

export default Transcript