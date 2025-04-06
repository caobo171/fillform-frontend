'use client'
import { FC } from 'react'
import Image from 'next/image'
import { Toast } from '@/services/Toast'
import { useMe, useMyBankInfo } from '@/hooks/user';


const CreditPage: FC<{}> = () => {

    const me = useMe();
    const bankInfo = useMyBankInfo();

    const copyText = (text: string) => {
        navigator.clipboard.writeText(text)
        Toast.success(`Đã sao chép: ${text}`)
    }

    return (
        <section id="about" className="about">
            <div className="container mx-auto text-center" data-aos="fade-up">
                <div className="card mx-auto p-6 mt-0 max-w-4xl">
                    <div className="card-body">
                        <h3 className="text-2xl font-bold mb-2">Nạp tiền vào tài khoản</h3>
                        <h3 className="text-2xl items-center gap-2 mb-2">
                            Số dư hiện tại: <span className="font-bold">{me?.data?.credit.toLocaleString()} VND</span>
                        </h3>
                        <h6 className="text-gray-600 mb-4">Username: <span className="font-bold">{me?.data?.username}</span></h6>

                        <div className="mb-6 text-left">
                            <p className="mb-4">
                                Bạn vui lòng chuyển khoản <span className="font-bold">chính xác nội dung chuyển tiền</span> bên dưới hệ thống sẽ tự động cộng tiền cho bạn sau 1 - 3 phút sau khi nhận được tiền.<br />
                                Sau khi thấy tài khoản chuyển tiền thành công, thử <span className="font-bold">Đăng xuất và Đăng nhập lại</span> để kiểm tra số dư FillForm nhé! <br />
                                Nếu sau 10 phút từ khi tiền trong tài khoản của bạn bị trừ mà vẫn chưa được cộng tiền vui lòng liên hệ hỗ trợ.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <div className="flex items-center">
                                    <span className="w-1/3">Tên Ngân Hàng</span>
                                    <div className="flex items-center gap-2">
                                        <button onClick={() => copyText(bankInfo.data?.name || "")} className="hover:opacity-70">📋</button>
                                        <span>{bankInfo.data?.name}</span>
                                    </div>
                                </div>

                                <div className="flex items-center">
                                    <span className="w-1/3">Số Tài Khoản</span>
                                    <div className="flex items-center gap-2">
                                        <button onClick={() => copyText(bankInfo.data?.number || "")} className="hover:opacity-70">📋</button>
                                        <span>{bankInfo.data?.number}</span>
                                    </div>
                                </div>

                                <div className="flex items-center">
                                    <span className="w-1/3">Tên Tài Khoản</span>
                                    <div className="flex items-center gap-2">
                                        <button onClick={() => copyText("VUONG TIEN DAT")} className="hover:opacity-70">📋</button>
                                        <span>VUONG TIEN DAT</span>
                                    </div>
                                </div>

                                <div className="flex items-center">
                                    <span className="w-1/3">Nội dung chuyển tiền</span>
                                    <div className="flex items-center gap-2">
                                        <button onClick={() => copyText(bankInfo.data?.message_credit || "")} className="hover:opacity-70">📋</button>
                                        <span>{bankInfo.data?.message_credit}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-center">
                                <Image
                                    src={bankInfo.data?.qr_link || ""}
                                    alt="QRCode"
                                    width={200}
                                    height={200}
                                    className="w-[200px] h-auto"
                                />
                            </div>
                        </div>

                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mt-12 text-left">
                            <h3 className="text-xl font-bold mb-2">ĐẶC BIỆT CHÚ Ý</h3>
                            <ul className="list-disc pl-5 space-y-1">
                                <li>FILLFORM sẽ hoàn tiền 100% nếu Tool lỗi / sử dụng dịch vụ không thành công.</li>
                                <li>Nạp tối thiểu: 10,000 đ. Cố tình nạp dưới mức tối thiểu sai cú pháp không hỗ trợ dưới mọi hình thức.</li>
                                <li>Nạp tiền sai cú pháp vui lòng liên hệ hỗ trợ đính kèm hóa đơn chuyển tiền và tên đăng nhập để được hỗ trợ.</li>
                                <li>Chỉ hỗ trợ các giao dịch nạp tiền sai cú pháp trong vòng 30 ngày kể từ ngày chuyển tiền, quá 30 ngày KHÔNG xử lý dưới mọi hình thức!</li>
                                <li>Nên chuyển tiền nhanh 24/7 để được cộng tiền ngay sau vài phút. Trường hợp chuyển tiền chậm sẽ được cộng tiền sau khi ngân hàng xử lý giao dịch.</li>
                                <li>Dữ liệu lịch sử nạp tiền có thể sẽ tự động xóa sau 30 ngày kể từ ngày nạp tiền!</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default CreditPage