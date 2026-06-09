import Dynamic from './components/Dynamic';
import Swiper from '../Swiper';
import Classics from './Classics';
import Waterfall from './Waterfall';
import Card from './Card';
import Pagination from '../Pagination';
import Highlights from './components/Highlights';

import { getArticlePagingAPI } from '@/api/article';
import { getWebConfigDataAPI } from '@/api/config';
import { Theme } from '@/types/app/config';
import { getSwiperListAPI } from '@/api/swiper';

export default async ({ page }: { page: number }) => {
  const { data: swiper } = await getSwiperListAPI();
  const themeResponse = await getWebConfigDataAPI<{ value: Theme }>('theme');
  const theme = themeResponse?.data?.value as Theme;
  const sidebar = theme?.right_sidebar ?? [];
  const infoSidebar = sidebar.filter((item) => ['author', 'study'].includes(item));
  const { data } = await getArticlePagingAPI({
    page,
    size: theme.is_article_layout === 'waterfall' ? 28 : 8,
  });

  data.result = data?.result?.filter((item) => item.config.status !== 'no_home') ?? [];

  return (
    <div className={`mx-auto w-full md:w-[92%] ${infoSidebar.length ? 'lg:w-[68%] xl:w-[73%]' : 'w-full'} transition-width`}>
      {!!swiper?.length && <Swiper data={swiper} />}
      <Highlights sidebar={sidebar} />
      <Dynamic className="my-4" />

      {theme.is_article_layout === 'classics' && <Classics data={data} />}
      {theme.is_article_layout === 'card' && <Card data={data} />}
      {theme.is_article_layout === 'waterfall' && <Waterfall data={data} />}

      {!!data.total && <Pagination total={data?.pages} page={page} className="mt-5 flex justify-center" />}
    </div>
  );
};
