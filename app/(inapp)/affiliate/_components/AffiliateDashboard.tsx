'use client'

import { useState, useEffect } from 'react'
import { Loader2, Copy, CheckCircle } from 'lucide-react'
import Fetch from '@/lib/core/fetch/Fetch'
import { Toast } from '@/services/Toast'
import { AFFILIATE_URL, Code, MIN_DRAW_CREDIT, REFER_PERCENT } from '@/core/Constants'
import { useMe } from '@/hooks/user'
import Constants from '@/utils/transcriber/Constants'
import { useAsync } from 'react-use'
import { RawUser } from '@/store/types'
import useSWR, { mutate } from 'swr'

export default function AffiliateDashboard() {
  const { data: user } = useMe()

  const [copySuccess, setCopySuccess] = useState(false)
  const [withdrawalLoading, setWithdrawalLoading] = useState(false);

  const withdrawRequests = useSWR('/api/affiliate/list.withdraw', async () => {
    if (user) {
      const res = await Fetch.postWithAccessToken<any>(`/api/affiliate/list.withdraw`, {})
      if (res.data.code === Code.SUCCESS) {
        return res.data.requests
      }
    }
    return []
  })

  const referrals = useAsync(async () => {
    if (user) {
      const res = await Fetch.postWithAccessToken<any>(`/api/affiliate/list.referals`, {})
      if (res.data.code === Code.SUCCESS) {
        return res.data.users
      }
    }
    return []
  })
  const [withdrawalForm, setWithdrawalForm] = useState({
    bankName: '',
    accountNumber: '',
    accountName: ''
  })

  // Referral link
  const referralLink = `${AFFILIATE_URL}/authentication/register?ref=${user?.idcredit}`

  // Handle copy to clipboard
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(referralLink)
      setCopySuccess(true)
      setTimeout(() => setCopySuccess(false), 2000)
    } catch (err) {
      Toast.error('Không thể sao chép liên kết')
    }
  }

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setWithdrawalForm(prev => ({
      ...prev,
      [name]: value
    }))
  }

  // Handle withdrawal request
  const handleWithdrawalRequest = async () => {
    if (!withdrawalForm.bankName || !withdrawalForm.accountNumber || !withdrawalForm.accountName) {
      Toast.error('Vui lòng điền đầy đủ thông tin')
      return
    }

    setWithdrawalLoading(true)
    try {
      const res = await Fetch.postWithAccessToken<any>('/api/affiliate/request.withdraw', withdrawalForm)
      
      if (res.data.code === Code.SUCCESS) {
        Toast.success('Yêu cầu rút tiền đã được gửi')
        // Reset form
        setWithdrawalForm({
          bankName: '',
          accountNumber: '',
          accountName: ''
        })

        withdrawRequests.mutate();
        mutate('/api/me/profile');
      } else {
        Toast.error(res.data.message || 'Có lỗi xảy ra')
      }
    } catch (error) {
      Toast.error('Có lỗi xảy ra khi gửi yêu cầu')
    } finally {
      setWithdrawalLoading(false)
    }
  }


  if (!user) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    )
  }

  return (
    <section className="bg-gradient-to-b from-primary-50 to-white min-h-screen py-6 px-4 sm:px-6 mx-auto">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6" data-aos="fade-up">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Affiliate Account Information */}
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-bold mb-4">Tài khoản Affiliate</h2>
            <div className="space-y-2">
              <p><span className="font-medium">Email:</span> {user.email}</p>
              <p><span className="font-medium">Số hoa hồng tích lũy:</span> {user?.referCredit?.toLocaleString() || 0} VND</p>
              <p><span className="font-medium">Số hoa hồng đã nhận:</span> {user?.referCreditDone?.toLocaleString() || 0} VND</p>
            </div>
          </div>

          {/* Withdrawal Request Form */}
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-bold mb-4">Yêu cầu rút tiền</h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="bankName" className="block text-sm font-medium text-gray-700 mb-1">Ngân hàng</label>
                <input
                  type="text"
                  id="bankName"
                  name="bankName"
                  value={withdrawalForm.bankName}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Tên ngân hàng"
                />
              </div>
              <div>
                <label htmlFor="accountNumber" className="block text-sm font-medium text-gray-700 mb-1">Số tài khoản</label>
                <input
                  type="text"
                  id="accountNumber"
                  name="accountNumber"
                  value={withdrawalForm.accountNumber}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Số tài khoản"
                />
              </div>
              <div>
                <label htmlFor="accountName" className="block text-sm font-medium text-gray-700 mb-1">Tên tài khoản</label>
                <input
                  type="text"
                  id="accountName"
                  name="accountName"
                  value={withdrawalForm.accountName}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Tên tài khoản"
                />
              </div>
              <button
                onClick={handleWithdrawalRequest}
                disabled={withdrawalLoading || (user?.referCredit || 0) < MIN_DRAW_CREDIT}
                className={`w-full py-3 px-4 rounded-md text-white font-bold flex items-center justify-center transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 ${(user?.referCredit || 0) < MIN_DRAW_CREDIT ? 'bg-gray-400 cursor-not-allowed focus:ring-gray-300' : withdrawalLoading ? 'bg-primary-400 focus:ring-primary-300' : 'bg-primary-600 hover:bg-primary-700 focus:ring-primary-500'}`}
              >
                {withdrawalLoading ? (
                  <div className="flex items-center justify-center">
                    <Loader2 className="mr-2 w-5 h-5 animate-spin" />
                    <span>Đang xử lý...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Yêu cầu rút tiền</span>
                  </div>
                )}
              </button>
              {(user?.referCredit || 0) < MIN_DRAW_CREDIT && (
                <p className="text-sm text-red-500">Hoa hồng phải đạt tối thiểu {MIN_DRAW_CREDIT.toLocaleString()} VND để rút tiền</p>
              )}
            </div>
          </div>

          {/* Affiliate Benefits */}
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-medium text-blue-800 mb-2">Quyền lợi của bạn:</h3>
            <ul className="space-y-2 text-sm text-blue-700">
              <li>- Chỉ được tính affiliate với tài khoản giới thiệu đăng kí mới.</li>
              <li>- FillForm sẽ tặng bạn {REFER_PERCENT}% trên mỗi giao dịch nạp tiền thành công của người được giới thiệu.</li>
              <li>- Hoa hồng phải đạt 100.000 VND mới được yêu cầu rút tiền.</li>
              <li>- Tài khoản đang bị lỗi hoặc lạm dụng, spam sẽ bị từ chối tính affiliate.</li>
            </ul>
            
            <h3 className="text-lg font-medium text-blue-800 mt-4 mb-2">Quyền lợi của bạn bè được giới thiệu:</h3>
            <p className="text-sm text-blue-700">- Được tặng ngay 5000 credit vào tài khoản đăng kí mới.</p>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Program Info */}
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-bold mb-4">Chương trình affiliate</h2>
            <p className="mb-3">Giới thiệu ngay để nhận {REFER_PERCENT}% mỗi giao dịch tự động</p>
            <p className="mb-4">Copy link dưới đây và chia sẻ với bạn bè để đăng ký dùng FillForm nhé!</p>
            
            {/* Referral Link */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Link giới thiệu của bạn</label>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={referralLink}
                  readOnly
                  className="flex-1 p-2 border border-gray-300 rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                <button
                  onClick={handleCopyLink}
                  className="p-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-all focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                  title="Sao chép liên kết"
                >
                  {copySuccess ? <CheckCircle className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                </button>
              </div>
            </div>
          </div>

          {/* Referral List */}
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-bold mb-4">Danh sách giới thiệu</h2>
            {referrals.loading ? (
              <div className="flex justify-center items-center h-32">
                <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
              </div>
            ) : referrals.value?.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Username</th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ngày đăng kí</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {referrals.value?.map((referral: RawUser, index: number) => (
                      <tr key={index}>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{index + 1}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{referral.username}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{new Date(referral.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>Bạn chưa có người dùng giới thiệu nào</p>
              </div>
            )}
          </div>
          
          {/* Withdrawal Requests List */}
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100 mt-6">
            <h2 className="text-xl font-bold mb-4">Danh sách yêu cầu rút tiền</h2>
            {!withdrawRequests.data ? (
              <div className="flex justify-center items-center h-32">
                <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
              </div>
            ) : withdrawRequests.data?.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Số tiền</th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ngân hàng</th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ngày yêu cầu</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {withdrawRequests.data?.map((request: any, index: number) => (
                      <tr key={index}>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{index + 1}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{request.amount?.toLocaleString()} VND</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{request.bankName} - {request.accountNumber}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${request.status === 'done' ? 'bg-green-100 text-green-800' : request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'}`}>
                            {request.status === 'done' ? 'Đã thanh toán' : request.status === 'pending' ? 'Đang xử lý' : request.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{new Date(request.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>Bạn chưa có yêu cầu rút tiền nào</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
