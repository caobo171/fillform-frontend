const FAKE_DATA = {
  IMAGE_URL:
    'https://cungdecor.vn/wp-content/uploads/2019/04/kien-truc-noi-that-la-gi-xu-huong-thiet-ke-kien-truc-noi-that-hien-nay-02.jpg',
};
const IMAGE_URL = "https://fillformposts.s3.ap-southeast-1.amazonaws.com/";

export const SOCKET_URL = process.env.NODE_ENV !== 'production' ? 'http://localhost:4001' : 'https://app.fillform.info';

export const API_URL = process.env.NODE_ENV !== 'production' ? 'http://localhost:4001' : 'https://app.fillform.info';

export const AFFILIATE_URL = process.env.NODE_ENV !== 'production' ? 'http://localhost:4000' : 'https://app.fillform.info';

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
  AGENT: 'Agent'
}



export const REFER_PERCENT = 15;
export const MIN_DRAW_CREDIT = 100000;
