const FAKE_DATA = {
  IMAGE_URL:
    'https://cungdecor.vn/wp-content/uploads/2019/04/kien-truc-noi-that-la-gi-xu-huong-thiet-ke-kien-truc-noi-that-hien-nay-02.jpg',
};
const IMAGE_URL = "https://survifyposts.s3.ap-southeast-1.amazonaws.com/";

export const SOCKET_URL = process.env.NODE_ENV !== 'production' ? 'http://localhost:4001' : 'https://app.survify.info';

export const API_URL = process.env.NODE_ENV !== 'production' ? 'http://localhost:4001' : 'https://app.survify.info';

export const AFFILIATE_URL = process.env.NODE_ENV !== 'production' ? 'http://localhost:4000' : 'https://app.survify.info';

export const POSTHOG_KEY = process.env.NODE_ENV !== 'production' ? 'phc_2CSfwxsr7KuXj0jJ4YvMmsCzV2MWRaUaTEp14WfY9CD' : 'phc_2CSfwxsr7KuXj0jJ4YvMmsCzV2MWRaUaTEp14WfY9CD';
export const POSTHOG_HOST = process.env.NODE_ENV !== 'production' ? 'https://us.i.posthog.com' : 'https://us.i.posthog.com';

export const FIREBASE_CONFIG =
  process.env.NODE_ENV !== 'production'
    ? {
      apiKey: 'AIzaSyCZMt4QsJtfaWQtGlaa6sNY1dmBZGZUFtA',
      authDomain: 'wele-test.firebaseapp.com',
      projectId: 'wele-test',
      storageBucket: 'wele-test.appspot.com',
      messagingSenderId: '436382744824',
      appId: '1:436382744824:web:d1820293ad45c868fbfb0d',
      measurementId: 'G-GDR240L6VS',
    }
    : {
      apiKey: 'AIzaSyA4qy9h2VN5IhpsukW9bqwGDdq4Q0GjcP4',
      authDomain: 'wele-data.firebaseapp.com',
      projectId: 'wele-data',
      storageBucket: 'wele-data.appspot.com',
      messagingSenderId: '841968592154',
      appId: '1:841968592154:web:9412fd3726ace7faa238a3',
      measurementId: 'G-VMGG5CX1ZK',
    };

export const ROLES = {
  Member: 0,
  Admin: 1,
  ContentCreator: 2,
  Teacher: 3,
};

const Constants = {
  FAKE_DATA,
  IMAGE_URL,
  ROLES
};




export enum QUESTION_TYPE {
  SHORT_ANSWER = 0,
  PARAGRAPH = 1,
  MULTIPLE_CHOICE = 2,
  DROPDOWN = 3,
  CHECKBOX = 4,
  LINEAR_SCALE = 5,
  TITLE_BLOCK = 6,
  MULTIPLE_CHOICE_GRID = 7,
  CHECKBOX_GRID = 7,
  SECTION_BLOCK = 8,
  DATE = 9,
  TIME = 10,
  IMAGE_BLOCK = 11,
  VIDEO_BLOCK = 12,
  FILE = 13,
  RATING = 18,
}




export const ORDER_STATUS = {
  RUNNING: 'Đang chạy',
  PAUSE: 'Tạm dừng',
  FAILED: 'Thất bại',
  CANCELED: 'Đã hủy',
  SUCCESS: 'Hoàn thành',
  ERROR: 'ERROR',
};


export const LAYOUT_TYPES = {
  Admin: 'admin',
  Profile: 'profile',
  Home: 'home',
  WeleClass: 'weleclass',
};

export const MediaQuery = {
  is2Xl: `(min-width: 1536px)`,
  isXl: `(min-width: 1280px)`,
  isSemiLg: `(min-width: 1200px)`,
  isLg: `(min-width: 1024px)`,
  isSemiMd: `(min-width: 960px)`,
  isMd: `(min-width: 768px)`,
  isSm: `(min-width: 640px)`,
  isSemiXs: `(min-width: 540px)`,
  isXs: `(min-width: 468px)`,
};

export const Code = {
  Error: -1,
  SUCCESS: 1,
  INVALID_PASSWORD: 2,
  INACTIVATE_AUTH: 3,
  NOTFOUND: 4,
  INVALID_AUTH: 5,
  INVALID_INPUT: 6,
};


export default Constants;



export const OPTIONS_DATA = [
  "other (bỏ qua-không điền)",
  "name",
  "email",
  "phone",
  "custom (nội dung tùy chỉnh)"
];

export const OPTIONS_DELAY_ENUM = {
  NO_DELAY: 0,
  SHORT_DELAY: 1,
  STANDARD_DELAY: 2,
  LONG_DELAY: 3,
  SPECIFIC_DELAY: 4
}

export const OPTIONS_DELAY = {
  [OPTIONS_DELAY_ENUM.NO_DELAY]: {
    name: "Không cần điền rải",
    price: 350,
    description: "Gửi liên tiếp không giãn cách"
  },
  [OPTIONS_DELAY_ENUM.SHORT_DELAY]: {
    name: "Điền giãn cách ngắn",
    price: 400,
    description: "Gửi với giãn cách 1-5 phút"
  },
  [OPTIONS_DELAY_ENUM.STANDARD_DELAY]: {
    name: "Điền giãn cách tiêu chuẩn",
    price: 450,
    description: "Gửi với giãn cách 1-10 phút"
  },
  [OPTIONS_DELAY_ENUM.LONG_DELAY]: {
    name: "Điền giãn cách dài",
    price: 500,
    description: "Gửi với giãn cách 1-20 phút"
  },
  [OPTIONS_DELAY_ENUM.SPECIFIC_DELAY]: {
    name: "Điền giãn cách xác định chính xác thời gian",
    price: 600,
    description: "Gửi với giãn cách phù hợp với thời gian đã chọn"
  }

}


export const BANK_INFO = {
  current: 'OCB',
  providers: {
    OCB: {
      name: "OCB - Ngân hàng Phương Đông",
      number: "SEPFFR148620"
    },
    VTB: {
      name: "VTB - Viettin Bank",
      number: "107868958175"
    }
  }
}


export const ORDER_TYPE = {
  AUTOFILL: 'Điền theo tỉ lệ',
  PREFILL: 'Data có trước',
  AGENT: 'Agent',
  DATA_MODEL: 'Data model'
}



export const REFER_PERCENT = 15;
export const MIN_DRAW_CREDIT = 100000;
export const AI_PRICE = 1650;

export const MODEL_PRICE = 250;

export const MODERATE_VARIABLE_PRICE = 80000;
export const MEDIATOR_VARIABLE_PRICE = 80000;
export const DEPENDENT_VARIABLE_PRICE = 20000;
export const INDEPENDENT_VARIABLE_PRICE = 30000;

export const READ_RESULT_PRICE = 50000;

export const PULSES_TOKEN = 'My5wdWxzZXN1cnZleXM';


export const AI_CASES = [
  {
    id: 'phan_tich_quyet_dinh_nhan_viec',
    numRequest: 400,
    demographicGoal: `
    - Giới tính của Anh/Chị/Bạn? gần 60% nữ
    - Độ tuổi của Anh/Chị/Bạn?
      18-22 tuổi: 55.6%
      23-25 tuổi: 35,7%
      26-28 tuổi: 8,7%
    - Trình độ học vấn của Anh/Chị/Bạn là gì?
      Đại học: gần 80%, còn lại chia ra
    - Anh/Chị/Bạn đang là?
      Sinh viên: 29.3%
      Vừa tốt nghiệp: 40.1%
      Đã đi làm dưới 2 năm: 20.2%
      Đã đi làm từ 2 năm trở lên: 10.4%
    - Anh/Chị/Bạn đã từng ứng tuyển vào bao nhiêu công ty?
      1 - 2 công ty: 40%
      3 - 5 công ty: 35%
      Hơn 5 công ty: 25%
    - Công ty gần nhất Anh/Chị/Bạn ứng tuyển là khi nào?
      Trong vòng 12 tháng qua: 60%
      Từ 1 đến dưới 3 năm trước: 35%
      Hơn 3 năm trước: 5%
`,
    spssGoal: `
      Thang đo Likert từ 1-5
      Dùng phân tích hồi quy, không sử dụng SEM
      Giả thuyết H1: Thông tin tuyển dụng có tác động tích cực đến quyết định nhận việc của Gen Z tại TP. Hồ Chí Minh. ⇒ CHẤP NHẬN
      Giả thuyết H2: Công nghệ tuyển dụng có tác động tích cực đến quyết định nhận việc của Gen Z tại TP. Hồ Chí Minh. ⇒ CÓ THỂ BÁC BỎ
      Giả thuyết H3: Tương tác với nhà tuyển dụng có tác động tích cực đến quyết định nhận việc của Gen Z tại Thành phố Hồ Chí Minh. ⇒ CHẤP NHẬN
      Giả thuyết H4: Thái độ của nhà tuyển dụng có tác động tích cực đến quyết định nhận việc của Gen Z tại Thành phố Hồ Chí Minh. ⇒ CHẤP NHẬN
      Giả thuyết H5: Nhận thức công bằng trong tuyển dụng có tác động tích cực đến quyết định nhận việc của Gen Z tại Thành phố Hồ Chí Minh. ⇒ CHẤP NHẬN
      Giả thuyết H6: Tốc độ của quy trình tuyển dụng có tác động tích cực đến quyết định nhận việc của Gen Z tại Thành phố Hồ Chí Minh. ⇒ CHẤP NHẬN
    `,
    image: 'phan_tich_quyet_dinh_nhan_viec.png',
    result_report_url: 'phan_tich_quyet_dinh_nhan_viec.pdf',
    result_data_url: 'phan_tich_quyet_dinh_nhan_viec.csv'

  },
  {
    id: 'phan_tich_quyet_dinh_mua_hang_genz',
    numRequest: 203,
    demographicGoal: `Ngẫu nhiên sao cho hướng đến GenZ, sinh viên trên địa bàn Đà Nẵng, hầu hết sử dụng tiktok shop để mua hàng với nhiều lí do khác nhau.`,
    spssGoal: `
    Mô hình hồi quy, 5 biến độc lập, 1 biến phụ thuộc, thang đo likert 5
    phân tích và đánh giá cách TikTok Shop ảnh hưởng đến hành vi và mô hình tiêu dùng của thế hệ Gen Z tại Đà Nẵng, từ đó đề xuất giải pháp cho doanh nghiệp trong việc tiếp cận nhóm khách hàng này hiệu quả hơn. 
    Chấp nhận tất cả các giả thuyết sau
    Sự lan truyền nội dung tác động tích cực đến Quyết định mua hàng trên Tiktok Shop 
    Thái độ xã hội/ tâm lý đám đông tác động tích cực đến Quyết định mua hàng trên Tiktok Shop 
    Trào lưu tiêu dùng tức thời tác động tích cực đến Quyết định mua hàng trên Tiktok Shop 
    Tiện ích mua hàng tác động tích cực đến Quyết định mua hàng trên Tiktok Shop 
    Âm thanh, hình ảnh hấp dẫn tác động tích cực đến Quyết định mua hàng trên Tiktok Shop
    `,
    image: 'phan_tich_quyet_dinh_mua_hang_genz.png',
    result_report_url: 'phan_tich_quyet_dinh_mua_hang_genz.pdf',
    result_data_url: 'phan_tich_quyet_dinh_mua_hang_genz.csv'

  },
  {
    id: 'phan_tich_su_hai_long_kh',
    numRequest: 173,
    demographicGoal: `Ngẫu nhiên sao cho hợp lý`,
    spssGoal: `
    Giả thiết TC (Khả năng tiếp cận), NC (Tính nhanh chóng), AT (An toàn), TN (Tiện nghi, thoải mái), CX (Tính chính xác), và có quan hệ cùng chiều với sự hài lòng của khách hàng.
    Chấp nhận/ bác bỏ giả thuyết nào: ngẫu nhiện 
    Có loại bỏ biến quan sát nào không: ngẫu nhiên
    Thang đo dự thảo chất lượng dịch vụ trên tuyến buýt số 10 được xây dựng bởi các nhân tố tác động đến sự hài lòng khách hàng được xác định gồm 5 nhân tố với 25 biến quan sát.
    Thành phần Khả năng tiếp cận gồm 6 biến quan sát được mã hóa là: TC1 – TC6
    Thành phần Tính nhanh chóng gồm 4 biến quan sát được mã hóa là: NC1 – NC4
    Thành phần An toàn gồm 4 biến quan sát được mã hóa là: AT1 – AT4
    Thành phần Tính chính xác gồm 3 biến quan sát được mã hóa là: CX1 – CX3
    Thành phần Tiện nghi, thoải mái gồm 5 biến quan sát được mã hóa là: TN1 – TN5
    Thành phần Sự hài lòng gồm 3 biến quan sát được mã hóa là: SHL1 – SHL3

    `,
    image: 'phan_tich_su_hai_long_kh.png',
    result_report_url: 'phan_tich_su_hai_long_kh.pdf',
    result_data_url: 'phan_tich_su_hai_long_kh.csv'

  },

];
