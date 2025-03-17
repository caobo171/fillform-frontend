import Head from 'next/head';

function Meta({
  title = 'WELE - Nghe chép chính tả',
  keywords = 'Nghe chép chính tả, tự học tiếng anh, học tiếng anh miễn phí',
  url = '',
  image = '',
  description = 'WELE là chương trình luyện nghe Tiếng Anh miễn phí và sử dụng phương pháp nghe chép chính tả.',
}: {
  title: string;
  keywords?: string;
  description?: string;
  url?: string;
  image?: string;
}) {
  return (
    <Head>
      <meta charSet="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta name="theme-color" content="#000000" />
      <link rel="canonical" href={url} />
      <meta name="author" content="Wele" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta
        name="robots"
        content="max-snippet:-1, max-image-preview:large, max-video-preview:-1"
      />
      <meta property="og:locale" content="vi_VN" />
      <meta property="og:type" content="website" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url || 'https://wele-learn.com/'} />
      <meta property="og:site_name" content="WELE" />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta
        property="og:image"
        content={image || 'https://wele-learn.com/static/logo.png'}
      />
      <meta
        property="og:image:secure_url"
        content={image || 'https://wele-learn.com/static/logo.png'}
      />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:image" content={image || 'https://wele-learn.com/'} />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta name="keywords" content={keywords || 'e-learning, english, free'} />
      <meta name="description" content={description} />
      <meta charSet="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta name="keywords" content={keywords} />
      <meta name="description" content={description} />
      <meta charSet="utf-8" />
      <link rel="icon" href="/favicon.ico" />
      <title>{title}</title>
    </Head>
  );
}

export default Meta;
