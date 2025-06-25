'use client'

import Fetch from '@/lib/core/fetch/Fetch'
import { mutate } from 'swr'
import { useState } from 'react'
import { Loader2 } from 'lucide-react';
import { Code, MIN_DRAW_CREDIT, REFER_PERCENT } from '@/core/Constants';
import { Toast } from '@/services/Toast';

export default function AffiliateComponent() {

  const [loading, setLoading] = useState(false);

  const handleRegisterPartner = async () => {
    // Implement the registration logic here
    console.log('Register as partner');
    setLoading(true);
    const res = await Fetch.postWithAccessToken<any>('/api/affiliate/register', {});
    //console.log(res);
    // You might want to redirect to a registration form or show a modal
    if (res.data.code == Code.SUCCESS) {
      
      Toast.success('Đăng kí thành công');
    } else {
      Toast.error(res.data.message);
    }

    mutate('/api/me/profile');
    setLoading(false);
  }

  return (
    <section className="bg-gradient-to-b from-primary-50 to-white py-12 px-4 sm:px-6 mx-auto">
      <div className="max-w-2xl mx-auto" data-aos="fade-up">
        {/* Affiliate Program Information */}
        <div className="bg-white rounded-xl p-8 shadow-md border border-gray-100">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold mb-3">Lưu ý chương trình affiliate</h1>
            <p className="text-gray-600">Các chế độ ưu đãi có thể thay đổi tùy theo điểm kinh doanh</p>
          </div>

          <div className="space-y-8">
            <div className="bg-primary-50 p-5 rounded-lg border-l-4 border-primary-500">
              <h2 className="text-xl font-semibold mb-3 text-primary-700">Quyền lợi của bạn:</h2>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Chỉ được tính affiliate với tài khoản giới thiệu đăng kí mới.</li>
                <li>FillForm sẽ tặng bạn <span className="font-semibold text-primary-600">{REFER_PERCENT}%</span> trên mỗi giao dịch nạp tiền/thanh công của người được giới thiệu.</li>
                <li>Hoa hồng phải đạt <span className="font-semibold text-primary-600">{MIN_DRAW_CREDIT.toLocaleString()} VND</span> mới được yêu cầu rút tiền.</li>
                <li>Tài khoản đăng kí lại hoặc lạm dụng, spam sẽ bị từ chối tính affiliate.</li>
              </ul>
            </div>

            <div className="bg-green-50 p-5 rounded-lg border-l-4 border-green-500">
              <h2 className="text-xl font-semibold mb-3 text-green-700">Quyền lợi của bạn bè được giới thiệu:</h2>
              <ul className="list-disc pl-6 text-gray-700">
                <li>Được tặng ngay <span className="font-semibold text-green-600">5000 credit</span> vào tài khoản đăng kí mới.</li>
              </ul>
            </div>
          </div>

          <div className="mt-8 text-center">
            <button
              onClick={handleRegisterPartner}
              disabled={loading}
              className="inline-flex items-center justify-center px-8 py-3 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-all font-bold shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <Loader2 className="mr-2 w-5 h-5 animate-spin" />
                  <span>Đang đăng kí...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Đăng kí trở thành Partner</span>
                </div>
              )}
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
