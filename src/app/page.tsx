import Slide from '@/components/Slide';
import Typed from '@/components/Typed';
import Starry from '@/components/Starry';
import Container from '@/components/Container';
import ArticleLayout from '@/components/ArticleLayout';
import Sidebar from '@/components/Sidebar';

import { getWebConfigDataAPI } from '@/api/config';
import { Theme } from '@/types/app/config';

interface Props {
  searchParams: Promise<{ page: number }>;
}

export default async (props: Props) => {
  const searchParams = await props.searchParams;
  const page = searchParams.page ?? 1;
  const response = await getWebConfigDataAPI<{ value: Theme }>('theme');
  const data = response?.data?.value as Theme;

  return (
    <>
      {/* <Lantern data={['新', '春', '快', '乐']} /> */}

      <Slide src={data?.swiper_image} className="h-[220px] sm:h-[280px] md:h-[320px] lg:h-[340px]">
        {/* 星空背景组件 */}
        <Starry />
        {/* 打字机组件 */}
        <Typed className="absolute left-1/2 top-[54%] z-30 w-[86%] max-w-[860px] -translate-x-1/2 -translate-y-1/2 rounded-[8px] bg-black/24 px-4 py-3 text-center text-[22px] font-black leading-8 text-white shadow-[0_18px_55px_rgba(0,0,0,0.26)] ring-1 ring-white/10 backdrop-blur-[2px] xs:text-[26px] sm:top-[52%] sm:text-[34px] sm:leading-[46px] md:top-1/2 md:text-[42px] md:leading-[54px] custom_text_shadow"></Typed>
      </Slide>

      <Container>
        {/* 文章列表 */}
        <ArticleLayout page={page} />
        {/* 侧边栏 */}
        <Sidebar />
      </Container>
    </>
  );
};
