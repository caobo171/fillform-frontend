import DateUtil from "@/services/Date";
import { useEffect, useState } from "react";

function getIntialData(start_time: number, end_time: number) {
    if (start_time > DateUtil.time()) {
        return {
            value: start_time - DateUtil.time(),
            is_register: true
        }
    }

    if (end_time > DateUtil.time()) {
        return {
            value: end_time - DateUtil.time(),
            is_register: false
        }
    }

    return {
        value: 0,
        is_register: false
    }
}

export const CountDown = ({ start_time, end_time }: { start_time: number, end_time: number }) => {

    const [time, setTime] = useState(getIntialData(start_time, end_time));

    useEffect(() => {
        let interval = setInterval(() => { setTime({ ...time, value: time.value - 1 }) }, 1000);
        if (time.value <= 0) {
            clearInterval(interval);
            if (time.is_register) {
                interval = setInterval(() => { setTime({ ...time, value: end_time - DateUtil.time() }) }, 1000);
            }
        }

        return () => {
            clearInterval(interval);
        }

    }, [time]);

    return (
        <div>
            {
                time.value > 0
                    ? `${DateUtil.getTime(time.value)} left`
                    : time.is_register ? <div className="font-medium">Start...</div>
                        : <div className="font-medium">Finised</div>
            }
        </div>
    )
}