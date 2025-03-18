import { RawPodcastSource } from '@/store/types';

const FAKE_DATA = {
  IMAGE_URL:
    'https://cungdecor.vn/wp-content/uploads/2019/04/kien-truc-noi-that-la-gi-xu-huong-thiet-ke-kien-truc-noi-that-hien-nay-02.jpg',
};

const IMAGE_URL = 'https://d2inr1ykkgbz5g.cloudfront.net/';
const DOMAIN = 'https://app.wele-learn.com';
const APP_HOST = 'app.wele-learn.com';

const LANDING_DOMAIN = 'https://wele-learn.com';
const LANDING_HOST = 'wele-learn.com';

export const OnboardingStorageKey = 'last-onboarding';

export const ROLES = {
  Member: 0,
  Admin: 1,
  ContentCreator: 2,
  Teacher: 3,
};

export const KeyMetric = {
  TotalMonthTime: 'month_time',
  TotalMonthListens: 'month_listens',
  TotalMonthActiveUsers: 'month_active_users',
  TotalMonthSubmits: 'month_submits',
  TotalPodcasts: 'podcasts',
};

const CERTIFICATIONS = [
  { id: 1, label: 'Submitted 10 podcasts', image: '' },
  { id: 2, label: 'Submitted 25 podcasts', image: '' },
  { id: 3, label: 'Submitted 50 podcasts', image: '' },
  { id: 4, label: 'Submitted 100 podcasts', image: '' },
];

export const BADGES = [
  {
    value: 'submitted_1',
    type: 'submitted',
    name: 'Nhập môn',
    description: 'Bài nộp đầu tiên',
    image: '/static/label1.png',
  },
  {
    value: 'submitted_10',
    type: 'submitted',
    name: 'Liên tục ghi điểm',
    description: '10 bài nộp',
    image: '/static/label2.png',
  },
  {
    value: 'submitted_20',
    type: 'submitted',
    name: 'Không thể ngăn cản',
    description: '20 bài nộp',
    image: '/static/label3.png',
  },
  {
    value: 'submitted_50',
    type: 'submitted',
    name: 'Vang danh bốn bể',
    description: '50 bài nộp',
    image: '/static/label1.png',
  },
  {
    value: 'submitted_100',
    type: 'submitted',
    name: 'Huyền thoại sống',
    description: '100 bài nộp',
    image: '/static/label1.png',
  },
  {
    value: 'consistent_listening_5',
    type: 'listening',
    name: 'Chăm chỉ luyện tập',
    description: '5 ngày nghe liên tiếp',
    image: '/static/label2.png',
  },
  {
    value: 'consistent_listening_10',
    type: 'listening',
    name: 'Mài sắt nên kim',
    description: '10 ngày nghe liên tiếp',
    image: '/static/label3.png',
  },
  {
    value: 'consistent_listening_15',
    type: 'listening',
    name: 'Trui rèn mỗi ngày',
    description: '15 ngày nghe liên tiếp',
    image: '/static/label2.png',
  },
  {
    value: 'consistent_listening_20',
    type: 'listening',
    name: 'Ý chí vững vàng',
    description: '20 ngày nghe liên tiếp',
    image: '/static/label3.png',
  },
  {
    value: 'consistent_listening_30',
    type: 'listening',
    name: 'Kiên định bất khuất',
    description: '30 ngày nghe liên tiếp',
    image: '/static/label1.png',
  },
  {
    value: 'consistent_listening_40',
    type: 'listening',
    name: 'Trâu bò đời thật',
    description: '40 ngày nghe liên tiếp',
    image: '/static/label2.png',
  },
  {
    value: 'consistent_listening_60',
    type: 'listening',
    name: 'Huyền thoại lỳ đòn',
    description: '60 ngày nghe liên tiếp',
    image: '/static/label3.png',
  },
  {
    value: 'long_listening_60',
    type: 'time_listening',
    name: 'Tập trung cao độ',
    description: '60 phút',
    image: '/static/label1.png',
  },
  {
    value: 'long_listening_120',
    type: 'time_listening',
    name: 'Tập trung cao độ',
    description: '120 phút',
    image: '/static/label2.png',
  },
  {
    value: 'week_1',
    type: 'billboard_week',
    name: 'Hạng nhất tuần',
    description: 'Điểm số cao nhất tuần',
    image: '/static/label1.png',
  },
  {
    value: 'week_2',
    type: 'billboard_week',
    name: 'Hạng nhì tuần',
    description: 'Điểm số cao nhì tuần',
    image: '/static/label2.png',
  },
  {
    value: 'week_3',
    type: 'billboard_week',
    name: 'Hạng ba tuần',
    description: 'Top 3 cao điểm nhất tuần',
    image: '/static/label3.png',
  },
  {
    value: 'month_1',
    type: 'billboard_month',
    name: 'Hạng nhất tháng',
    description: 'Điểm số cao nhất tháng',
    image: '/static/label1.png',
  },
  {
    value: 'month_2',
    type: 'billboard_month',
    name: 'Hạng nhì tháng',
    description: 'Điểm số cao nhì tháng',
    image: '/static/label2.png',
  },
  {
    value: 'month_3',
    type: 'billboard_month',
    name: 'Hạng ba tháng',
    description: 'Top 3 cao điểm nhất tháng',
    image: '/static/label3.png',
  },
];

const CHALLENGE = {
  ACTIVE: 1,
  UNACTIVE: 2,
  DURING: 5,
  FINISHED: 6,
  COMING: 7,
};

const Constants = {
  FAKE_DATA,
  IMAGE_URL,
  DOMAIN,
  APP_HOST,
  LANDING_DOMAIN,
  LANDING_HOST,
  ROLES,
  CERTIFICATIONS,
  BADGES,
  CHALLENGE,
};

export const ChallengeType = [
  { key: 0, name: 'Limit Podcast' },
  { key: 1, name: 'Unlimit Podcast' },
  { key: 2, name: 'Limit Time' },
  { key: 3, name: 'UnLimit Time' },
  { key: 4, name: 'Team' },
];

export const ChallengeStatus = [
  { key: CHALLENGE.ACTIVE, name: 'Active' },
  { key: CHALLENGE.UNACTIVE, name: 'Unactive' },
  { key: CHALLENGE.DURING, name: 'During' },
  { key: CHALLENGE.FINISHED, name: 'Finished' },
];

export const TeamStatus = {
  PUBLIC: 1,
  PRIVATE: 2,
};

export const FILLER_TEXT = '_____';

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

export const PostCastSubmitType = {
  DOING: 1,
  SUBMITTED: 2,
  RESUBMITTING: 3,
};

export const ORDERS = [
  { id: 1, label: 'Mới nhất', value: 'newest' },
  { id: 1, label: 'Cũ nhất', value: 'oldest' },
  { id: 3, label: 'Nghe nhiều nhất', value: 'mostview' },
];

export const OtherSource: RawPodcastSource = {
  id: 0,
  name: 'Others',
  website: 'https://wele-learn.com',
  description: 'Others',
  last_update: 0,
  data: '',
  since: 0,
  views: 0,
  position: 0,
};

export const PodcastSource = [
  {
    source_key: 3,
    source_name: '6 Minutes English',
    source_link:
      'https://www.bbc.co.uk/learningenglish/english/features/6-minute-english',
  },
  {
    source_key: 1,
    source_name: 'English at work',
    source_link: 'https://www.wele-learn.com/',
  },
  {
    source_key: 2,
    source_name: 'Spotlight English',
    source_link: 'https://spotlightenglish.com/',
  },
  {
    source_key: 4,
    source_name: 'Transcripting IELTS',
    source_link: 'https://www.wele-learn.com/',
  },
  {
    source_key: 9,
    source_name: 'TOEIC',
    source_link: 'https://www.wele-learn.com/',
  },
  {
    source_key: 14,
    source_name: 'IELTS Mock Tests',
    source_link: 'https://www.wele-learn.com/',
  },
  {
    source_key: 8,
    source_name: 'TED',
    source_link: 'https://www.wele-learn.com/',
  },
  {
    source_key: 11,
    source_name: 'Real English',
    source_link: 'https://www.wele-learn.com/',
  },
  {
    source_key: 10,
    source_name: 'Novels',
    source_link: 'https://www.wele-learn.com/',
  },
  {
    source_key: 12,
    source_name: 'Tiếng Đức',
    source_link: 'https://www.wele-learn.com/',
  },
  {
    source_key: 15,
    source_name: 'The Survivor',
    source_link: 'https://www.wele-learn.com/',
  },
  {
    source_key: 17,
    source_name: 'Librivox',
    source_link: 'https://www.wele-learn.com/',
  },
  {
    source_key: 0,
    source_name: 'Others',
    source_link: 'https://wele-learn.com ',
  },
];

export const DownloadSource = [
  { source_key: 0, source_name: 'Media Fire' },
  { source_key: 1, source_name: 'Dropbox' },
];

export default Constants;

export const USER_ACTION_CODES = {
  ACTION_LISTENING: 1,
  ACTION_WRITTING: 2,
  ACTION_SUBMITTING: 3,
};

export const USER_ACTION_METATYPE = {
  METATYPE_LISTENING: '',
  METATYPE_SUBMIT: 'submit',
  METATYPE_MILESTONE: 'milestone',
  METATYPE_CERTIFICATE: 'certificate',
  METATYPE_SYSTEM: 'system',
  METATYPE_SHARE_SOCIAL: 'share_social',
  METATYPE_REVIEW: 'review',
};

export const USER_ACTION_STATUS = {
  STATUS_STARTED: 0,
  STATUS_FINISHED: 1,
};

export const exportActionContent = (action: number) => {
  if (action === USER_ACTION_CODES.ACTION_LISTENING) {
    return 'has listened to';
  }
  if (action === USER_ACTION_CODES.ACTION_WRITTING) {
    return 'has written to';
  }
  return '';
};

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

export const Pricing = {
  periods: {
    annually: {
      name: '1 năm',
      id: 'annually',
    },
    life_time: {
      name: 'Trọn đời',
      id: 'life_time',
    },
  },
  options: {
    free: {
      name: 'Free',
      id: 'free',
      price: {
        annually: 0,
        life_time: 0,
      },
      features: [
        'Nghe chép miễn phí trên nền tảng web',
        'Cập nhật bài nghe hàng tuần',
        'Tham gia cộng đồng học tiếng anh với hơn 10,000 thành viên',
      ],
      highlight: false,
    },
    premium: {
      name: 'Premium',
      id: 'premium',
      price: {
        annually: 220,
        life_time: 999,
      },
      features: [
        'Tất cả tính năng của bản Free',
        'Cho phép đăng bài nghe lên trên hệ thống Fillform',
        'Cho phép tạo danh sách bài nghe riêng phù hợp với nhu cầu sử dụng',
        'Tự động nhắc nhở luyện tập với những từ nghe sai',
        'Hỗ trợ mobile app',
        'Tham gia nhóm hỗ trợ riêng cho thành viên trả phí',
        'Miễn phí cập nhật tất cả các tính năng trả phí trong tương lai',
      ],
      highlight: true,
    },
    groupon: {
      name: 'Groupon',
      id: 'groupon',
      price: {
        annually: 1000,
        life_time: 5000,
      },
      features: [
        '5 tài khoản Premium đầy đủ tính năng',
        '1 tài khoản giáo viên với chức năng tạo lớp và giao bài',
        'Thích hợp với lớp học nhỏ hoặc gia đình',
      ],
      highlight: false,
    },
  },
};

export const GENERATE_TYPE = {
  DEFAULT: 'default',
  ADMIN_CUSTOM: 'admin_custom',
};

export const HIGH_LIGHT_HINT_TYPE = {
  WRONG: 'wrong',
  CORRECT: 'correct',
};

export const SUBSCRIPTION_TYPE = {
  FREE: 'free',
  NORMAL: 'normal',
  PREMIUM: 'premium',
};

export const PODCAST_STATUS = {
  INACTIVE: 0,
  ACTIVE: 1,
  PENDING_REVIEW: 2,
  DECLINED: 3,
};
