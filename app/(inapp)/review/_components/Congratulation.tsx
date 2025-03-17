import { CheckCircleIcon } from '@heroicons/react/20/solid'
import Link from 'next/link'

export function ReviewCongratulation() {


    const messages = [
        "Cố lên bạn nhé, mỗi từ vựng học được là một viên gạch xây nên ngôi nhà tri thức!",
        "Hôm nay ôn xong, mai gặp lại từ mới nhé! Cứ như thế thì tiếng Anh sẽ trở thành người bạn thân thôi!",
        "Đừng lo lắng nếu bạn chưa thuộc hết, cứ tiếp tục ôn tập, thành công sẽ gõ cửa!",
        "Tiếng Anh khó ư? Cứ học từng chút một, đến một ngày bạn sẽ nói tiếng Anh như gió!",
        "Học tiếng Anh là một cuộc hành trình, mỗi ngày thêm một từ, chẳng mấy chốc bạn sẽ tới đích!",
        "Cố lên! Mỗi bài ôn là một bước gần hơn đến việc xem phim không cần phụ đề!",
        "Cứ từ từ mà tiến, không ai học tiếng Anh giỏi ngay từ đầu, nhưng nỗ lực sẽ mang đến kết quả tuyệt vời!",
        "Bạn đang biến tiếng Anh thành môn sở trường của mình đấy, cứ kiên trì nhé!",
        "Học thêm một từ mới, nắm thêm một cơ hội mới! Cố lên bạn nhé!",
        "Ôn xong thì nghỉ ngơi, rồi lại tiếp tục! Mỗi bước nhỏ đều dẫn tới thành công lớn!"
    ];
    return (
        <div className="rounded-md bg-green-50 p-4">
            <div className="flex">
                <div className="flex-shrink-0">
                    <CheckCircleIcon aria-hidden="true" className="h-5 w-5 text-green-400" />
                </div>
                <div className="ml-3">
                    <h3 className="text-sm font-medium text-green-800">Bạn đã ôn tập xong</h3>
                    <div className="mt-2 text-sm text-green-700">
                        <p>{messages[new Date().getDay() % messages.length]}</p>
                    </div>
                    <div className="mt-4">
                        <div className="-mx-2 -my-1.5 flex">
                            <Link href={'/home'}
                                type="button"
                                className="rounded-md bg-green-50 px-2 py-1.5 text-sm font-medium text-green-800 hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-2 focus:ring-offset-green-50"
                            >
                                Về trang chủ
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
