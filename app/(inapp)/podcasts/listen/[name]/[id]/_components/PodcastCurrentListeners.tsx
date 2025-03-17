'use client';

import { useMe } from "@/hooks/user";
import { RawUserActionLog } from "@/store/types";
import { useMemo } from "react";
import { FaAssistiveListeningSystems } from "react-icons/fa";

export function PodcastCurrentListeners(props: { current_action_logs: RawUserActionLog[] }) {

    const { data: me } = useMe();
    const current_user_ids = useMemo(() => {
        if (me && props.current_action_logs) {
            var set_user_ids = new Set<number>();
            for (let i = 0; i < props.current_action_logs.length; i++) {
                const log = props.current_action_logs[i];
                if (log.user_id != me.id) {
                    set_user_ids.add(log.user_id);
                }
            }

            return [...set_user_ids];
        }

        return [];
    }, [props.current_action_logs, me])

    return <div className='mt-3'>
        {current_user_ids.length > 0 &&
            <div className="flex items-center text-xs">
                <span className="text-sm mr-1 text-primary font-semibold"><FaAssistiveListeningSystems /></span>
                <span className="text-gray-400 font-semibold">
                    <span className='text-primary'>{current_user_ids.length}</span>
                    <span>{"người đang nghe"}</span>
                </span>
            </div>
        }
    </div>
}