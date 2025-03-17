import { useState } from "react";
import { BoardResponse } from "./interface";
import Fetch from "../../lib/core/fetch/Fetch";
import Constants, {Code} from "@/core/Constants";

const useBoard = () => {
    const [boardLoading, setBoardLoading] = useState<boolean>(false);
    const [monthBoard, setMonthBoard] = useState<BoardResponse>({} as BoardResponse);

    const getMonthBoard = async () => {
        setBoardLoading(true);
        const result: any = await Fetch.post('/api/home/month.metrics', {});
        if (result) {
            const { data } = result;
            if (data.code !== Code.NOTFOUND) {
                setMonthBoard(data.data);
            }
        }
        setBoardLoading(false);
    }

    return {
        boardLoading,
        monthBoard,
        setMonthBoard,
        getMonthBoard
    }
}

export default useBoard;