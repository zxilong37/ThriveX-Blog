import localFont from 'next/font/local';
import { Metadata } from 'next';

import HeroUIProvider from '@/components/HeroUIProvider';
import NProgress from '@/components/NProgress';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import Tools from '@/components/Tools';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import Confetti from '@/components/Confetti';
import RouteChangeHandler from '@/components/RouteChangeHandler';

import { getWebConfigDataAPI } from '@/api/config';
import { Web } from '@/types/app/config';

import '@/styles/index.scss';
import '@/styles/tailwind.scss';
import BaiduStatis from '@/components/BaiduStatis';
import FloatingBlock from '@/components/FloatingBlock';
import InjectData from '@/components/InjectData';

const LXGWWenKai = localFont({
  src: '../assets/font/LXGWWenKai-Regular.ttf',
  display: 'swap',
});

const defaultTitle = '郑州 GIS 开发工程师';
const defaultSubhead = '南京测绘院 · 测绘地理信息 · WebGIS';
const defaultDescription = '记录测绘地理信息、WebGIS、空间数据治理和工程实践的个人博客。';
const defaultKeywords = 'GIS,WebGIS,测绘,空间数据,南京测绘院,郑州 GIS 开发工程师';

export async function generateMetadata(): Promise<Metadata> {
  const response = await getWebConfigDataAPI<{ value: Web }>('web');
  const data = response?.data?.value as Web;

  const title = data?.title ?? defaultTitle;
  const subhead = data?.subhead ?? defaultSubhead;
  const description = data?.description ?? defaultDescription;

  return {
    title: {
      default: `${title} - ${subhead}`,
      template: `%s | ${title}`,
    },
    description,
    keywords: data?.keyword ?? defaultKeywords,
    authors: [{ name: title }],
    creator: title,
    publisher: title,
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    metadataBase: new URL(data?.url ?? 'https://github.com/zxilong37'),
    alternates: {
      canonical: '/',
    },
    openGraph: {
      type: 'website',
      locale: 'zh_CN',
      url: data?.url ?? 'https://github.com/zxilong37',
      title: `${title} - ${subhead}`,
      description,
      siteName: title,
      images: [
        {
          url: data?.favicon ?? '/favicon.ico',
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} - ${subhead}`,
      description,
      images: [data?.favicon ?? '/favicon.ico'],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    icons: {
      icon: '/favicon.ico',
      shortcut: '/favicon.ico',
      apple: '/favicon.ico',
    },
  };
}

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const response = await getWebConfigDataAPI<{ value: Web }>('web');
  const data = response?.data?.value as Web;

  return (
    <html lang="zh-CN" className={LXGWWenKai.className} suppressHydrationWarning>
      <head>
        {data?.favicon && (
          <>
            <link rel="icon" type="image/x-icon" href={data.favicon} />
            <link rel="shortcut icon" type="image/x-icon" href={data.favicon} />
            <link rel="apple-touch-icon" href={data.favicon} />
          </>
        )}
        <BaiduStatis />
      </head>

      <body id="root" className="dark:!bg-black-a">
        <RouteChangeHandler />
        <InjectData />
        {/* <Confetti /> */}

        <NProgress />
        <Header />

        <HeroUIProvider>
          <div className="min-h-[calc(100vh-300px)]">{children}</div>
        </HeroUIProvider>

        <Footer />
        {/* <Tools /> */}

        <FloatingBlock />
      </body>
    </html>
  );
}
