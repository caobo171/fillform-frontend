'use client';

import { motion } from 'framer-motion';

import {
  HeadingH2,
  TextBody,
  TextBodyHighLight,
  TextBodyLarge,
} from '@/app/(outside)/_components/Typography';
import { motionAnimation } from '@/app/(outside)/constants';
import { Container } from '@/components/layout/container/container';

const feedbacks = [
  {
    name: 'Bảo Uyên',
    image: '/static/anh_5.png',
    description: 'HR tại tập đoàn FVG',
    content:
      '...đến nay là gần nửa năm em duy trì thói quen nghe và chép chính tả. Lúc đầu vào thì em khá là bỡ ngỡ, tốc độ chép cũng rất chậm, mỗi ngày tầm 2 bài thôi và sai nhiều nữa. Lúc đầu có hơi nản, nhưng động viên bản thân cố gắng quyết tâm từng ngày không bỏ. Sau một thời gian thì em bất ngờ về bản thân và cảm thấy tự tin lên rất nhiều. Em đã có thể đẩy nhanh tốc độ chép bài, nghe được nhiều âm nối, âm câm. Nhiều từ em có thể nghe phiên âm và tự viết ra rồi tra mà vẫn đúng ạ. Quá trình tự học tiếng Anh này thực sự hiệu quả và giúp em tiến bộ rõ rệt. Em cảm thấy vui vì mình đã luôn cố gắng và duy trì suốt thời gian qua không từ bỏ. Đặc biệt, chương trình hoàn toàn miễn phí nên rất phù hợp cho mọi người. Cám ơn admin đã tạo ra một trang web rất thú vị và tuyệt vời!',
  },
  {
    name: 'Trần Thu Hiền',
    image: '/static/ThuHienTran.jpg',
    description: 'Điều phối giáo viên nước ngoài Trung Tâm Anh Ngữ Sydney',
    content:
      'Mình thật sự tập trung và chăm chỉ nghe chép trên trang web của WELE chỉ trong thời gian ngắn mà mình thấy được rất nhiều thứ. Mỗi bài nghe ít nhiều mình học được ít nhất 2 từ vựng mới, vừa học được nghĩa cả cách đọc và cách áp dụng trong công việc. Cũng từ đó khi làm việc với người nước ngoài mình tự tin hơn rất nhiều (vì trước đó mình chưa hiểu hết về văn hóa của họ - cái mà WELE giúp mình có được). Chưa kể website miễn phí này rất hữu ích khi có dạng nghe với gợi ý và không gợi ý. Mình được học nghe một cách chủ động đúng nghĩa, tiết kiệm được rất nhiều thời gian. Đến giờ, việc nghe chép chính tả với WELE là một việc không thể thiếu trong to-do list của mình mỗi ngày! Cảm ơn admin và đội ngũ WELE đã tạo ra một môi trường tự học tiếng Anh siêu hữu ích cho cộng đồng.',
  },
  {
    name: 'Trần Thị Quỳnh Trang',
    image: '/static/anh_2.webp',
    description: 'Bác sĩ Bệnh Viện Long Khánh, Đồng Nai',
    content:
      'WELE đã tạo cảm hứng cho mình trong việc tự học tiếng Anh, đặc biệt là luyện nghe, rất nhiều. Nghe trước đây là một kỹ năng mình rất ngại học, vì sợ sai, sợ không nghe được gì, và sợ từ đó làm mình cảm thấy chán tiếng Anh. Nhờ có WELE mà mình từng bước có thể nghe được, hiểu được. WELE còn đăng những bài nghe chất lượng, cung cấp kiến thức về mọi mặt miễn phí. Lời dẫn của các ad cũng rất hay, dẫn dắt làm mình nghe dễ hơn. Các ad tạo động lực cho mình nhiều hơn. Mình rất vui khi giới thiệu WELE cho nhiều người bạn học tiếng anh. Học ngoại ngữ là không thể thiếu WELE.',
  },
];

const feedbacks2 = [
  {
    name: 'Nguyễn Văn Cao',
    image: '/static/anh4.jpg',
    description: 'Full-stack engineer tại True Platform, CTO của WELE',
    content:
      'Học tiếng Anh tại WELE là một trải nghiệm đánh dấu bước ngoặt trong quá trình tự học tiếng Anh của mình. Mình biết đến chương trình lần đầu khi anh Hiếu giới thiệu về WELE tại Gala Đường lên đỉnh Olympia năm thứ 15. Tham gia WELE từ năm lớp 10, đặc biệt với phương pháp nghe chép chính tả, giúp mình nhanh chóng nâng cao khả năng tiếng Anh và tiếp cận với các nguồn kiến thức về lập trình trên thế giới.',
  },
  {
    name: 'Phan Anh Luân',
    image: '/static/anh_1.webp',
    description: 'Học bổng nghiên cứu sinh tiến sĩ',
    content:
      'Bản thân mình trước đây cũng đã biết lợi ích của phương pháp luyện nghe chép chính tả, tuy nhiên vấn đề cốt lõi của mình (chắc cũng của nhiều bạn sinh viên và người tự học tiếng Anh khác) là dễ nản lòng và bỏ cuộc giữa chừng. Và mình nhận ra WELE thật sự được tạo ra để khắc phục hạn chế đó: Đôi khi chúng ta dễ dàng bỏ cuộc vì cảm thấy cô độc trên hành trình. Đối với mình, WELE đã đóng vai trò như một bạn đồng hành, một người hỗ trợ và một cái neo tinh thần.',
  },
  {
    name: 'Đỗ Thị Thanh Thảo',
    image: '/static/Thanh_Thao.jpg',
    description: 'Thư ký Chủ tịch Filmore Development',
    content:
      'Mình biết đến WELE từ những ngày đầu luyện chép chính tả trên word, nộp bài qua email. Bây giờ WELE được nâng cấp chức năng vượt trội so với trước đây, và rất thuận tiện để tự học tiếng Anh, luyện nghe IELTS, TOEIC mọi lúc, mọi nơi và trên mọi thiết bị. Thông qua việc luyện nghe trên Wele, khả năng nghe của mình được cải thiện rất nhiều. WELE luôn là người bạn đồng hành cùng mình trên hành trình chinh phục tiếng Anh.',
  },
  {
    name: 'Nguyễn Xuân Tuyển',
    image: '/static/anh_3.webp',
    description: 'Project Manager tại TECCON',
    content:
      'Đến thời điểm này, mình đã học theo phương pháp của WELE cũng được một thời gian khá dài. Những gì WELE mang lại cho mình thật khó đong đếm. Qua WELE mình không chỉ học được văn phong, từ mới, ngữ pháp, kiến thức mà còn rèn luyện được bản tính nhẫn  nại, kiên trì từng chút từng chút một. Bản thân mình rất mong cộng đồng WELE lớn mạnh, phát triển hơn nữa, sáng tạo hơn nữa để trở thành một trong những sân chơi lớn cho người học tiếng anh, đặc biệt là các bạn tự học tiếng Anh như mình.',
  },
];

function TestimonialItem(props: {
  name: string;
  image: string;
  description: string;
  content: string;
}) {
  const { image, name, description, content } = props;

  return (
    <motion.div
      {...motionAnimation.showUp}
      className="rounded-3xl shadow-light bg-white p-6"
    >
      <div className="flex items-start gap-x-4 mb-6">
        <div className="w-14 h-14 rounded-full overflow-hidden bg-gray-50">
          <img className="w-full h-auto" src={image} alt="avatar" />
        </div>

        <div className="flex flex-col gap-1 flex-1">
          <TextBodyHighLight>{name}</TextBodyHighLight>

          <TextBody className="text-gray-500">{`${description}`}</TextBody>
        </div>
      </div>

      <TextBody className="text-justify">“{content}”</TextBody>
    </motion.div>
  );
}

export function Testimonial() {
  return (
    <section className="py-[120px] bg-grid-gradient bg-contain bg-opacity-50">
      <Container>
        <motion.div {...motionAnimation.showUp}>
          <HeadingH2 className="text-center mb-4">
            WELE được các thành viên đánh giá rất cao
          </HeadingH2>
        </motion.div>

        <motion.div {...motionAnimation.showUp}>
          <TextBodyLarge className="text-center mb-20">
            Đây là một vài phản hồi của các bạn khi sử dụng công cụ của chương
            trình
          </TextBodyLarge>
        </motion.div>

        <div className="relative">
          <div
            className="absolute z-1 rounded-3xl bg-mesh-gradient bg-cover bg-center w-full top-20"
            style={{ height: 'calc(100% - 120px)' }}
          />

          <div className="flex flex-col lg:flex-row gap-8 relative z-2 px-6 md:px-28">
            <div className="flex flex-col gap-y-8 lg:w-1/2">
              {feedbacks.map((testimonial, index) => (
                <TestimonialItem
                  key={index}
                  name={testimonial.name}
                  image={testimonial.image}
                  description={testimonial.description}
                  content={testimonial.content}
                />
              ))}
            </div>

            <div className="flex flex-col gap-y-8 lg:w-1/2">
              {feedbacks2.map((testimonial, index) => (
                <TestimonialItem
                  key={index}
                  name={testimonial.name}
                  image={testimonial.image}
                  description={testimonial.description}
                  content={testimonial.content}
                />
              ))}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
