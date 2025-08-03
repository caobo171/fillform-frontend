'use client'
import { FC, useState } from 'react'
import { useMe, useMyBankInfo } from '@/hooks/user';
import { PaymentInformation } from '@/components/common'
import { CreateOrderForm } from '@/components/form'
import { OPTIONS_DELAY_ENUM } from '@/core/Constants'

const CreditPage: FC<{}> = () => {

    const me = useMe();
    const bankInfo = useMyBankInfo();
    const [numRequest, setNumRequest] = useState<number>(0);
    const [delayType, setDelayType] = useState<number>(OPTIONS_DELAY_ENUM.NO_DELAY);
    const [disabledDays, setDisabledDays] = useState<number[]>([]);
    const [scheduleEnabled, setScheduleEnabled] = useState(false);
    const [startTime, setStartTime] = useState('08:00');
    const [endTime, setEndTime] = useState('20:00');

    return (
        <section className="bg-gradient-to-b from-primary-50 to-white mx-auto px-4 sm:px-6">
            <div className="relative isolate overflow-hidden py-12">
                <div className="container mx-auto" data-aos="fade-up">
                    {/* Header */}
                    <div className="mb-8 text-center">
                        <h2 className="text-3xl font-bold mb-3">Nạp tiền vào tài khoản</h2>
                        <div className="text-2xl items-center gap-2 mb-2">
                            Số dư hiện tại: <span className="font-bold">{me?.data?.credit.toLocaleString()} VND</span>
                        </div>
                        <p className="text-gray-600">
                            Username: <span className="font-bold">{me?.data?.username}</span>
                        </p>
                    </div>

                    {/* Payment Information */}
                    <div className="bg-white shadow-sm rounded-lg border border-gray-100 mb-6">
                        <div className="p-6">
                            <div className="mb-6">
                                <p className="text-gray-700 mb-4">
                                    Bạn vui lòng chuyển khoản <span className="font-bold">chính xác nội dung chuyển tiền</span> bên dưới hệ thống sẽ tự động cộng tiền cho bạn sau 1 - 3 phút sau khi nhận được tiền.<br />
                                    Sau khi thấy tài khoản chuyển tiền thành công, thử <span className="font-bold">Đăng xuất và Đăng nhập lại</span> để kiểm tra số dư FillForm nhé! <br />
                                    Nếu sau 10 phút từ khi tiền trong tài khoản của bạn bị trừ mà vẫn chưa được cộng tiền vui lòng liên hệ hỗ trợ.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <PaymentInformation
                                        bankInfo={bankInfo}
                                        className="space-y-3"
                                    />
                                </div>

                                <CreateOrderForm
                                    userCredit={me?.data?.credit || 0}
                                    numRequest={numRequest}
                                    delayType={delayType}
                                    disabledDays={disabledDays}
                                    scheduleEnabled={scheduleEnabled}
                                    startTime={startTime}
                                    endTime={endTime}
                                    onNumRequestChange={setNumRequest}
                                    onDelayTypeChange={setDelayType}
                                    onScheduleEnabledChange={setScheduleEnabled}
                                    onStartTimeChange={setStartTime}
                                    onEndTimeChange={setEndTime}
                                    onDisabledDaysChange={setDisabledDays}
                                    className="flex flex-col justify-center bg-gray-50 p-4 rounded-lg"
                                    showTitle={false}
                                    showBackButton={false}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Important Notes */}
                    <div className="border border-gray-100 rounded-lg overflow-hidden mb-6">
                        <h3 className="text-xl font-bold p-4 bg-gray-50 border-b border-gray-100">ĐẶC BIỆT CHÚ Ý</h3>

                        <div className="p-6">
                            <ul className="list-disc pl-5 space-y-2 text-gray-700">
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