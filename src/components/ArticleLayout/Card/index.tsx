import Link from 'next/link';
import { getRandom } from '@/utils';
import { Article } from '@/types/app/article';
import dayjs from 'dayjs';

import { RiFireLine } from 'react-icons/ri';
import { IoTimeOutline } from 'react-icons/io5';
import { GoTag } from 'react-icons/go';
import Empty from '@/components/Empty';
import Show from '@/components/Show';

import { getWebConfigDataAPI } from '@/api/config';
import { Theme } from '@/types/app/config';

interface CardProps {
  data: Paginate<Article[]>;
}

const Card = async ({ data }: CardProps) => {
  const themeResponse = await getWebConfigDataAPI<{ value: Theme }>('theme');
  const theme = themeResponse?.data?.value as Theme;
  const covers = theme.covers ?? [];

  // 生成文章摘要，取前100个字
  const genArticleInfo = (data: Article) => {
    if (data.description?.trim()?.length) {
      return data.description;
    } else {
      return data.content.slice(0, 100);
    }
  };

  return (
    <div className="space-y-5">
      {data?.result?.map((item) => (
        <article key={item.id} className="group relative flex min-h-[200px] overflow-hidden tw_container md:h-[210px] lg:h-[200px] xl:h-[220px]">
          <div className="relative z-20 w-full px-5 py-5 sm:px-8 lg:px-7 xl:px-9">
            <Link href={`/article/${item.id}`} className="flex h-full flex-col justify-between text-center">
              <div>
                <span className="mb-3 inline-flex items-center rounded-[6px] bg-white/15 px-2.5 py-1 text-[11px] font-black uppercase tracking-[0.14em] text-[#d9f2ed] ring-1 ring-white/15">
                  Article
                </span>
                <h3 className="relative mx-auto my-2 max-w-[720px] overflow-hidden text_shadow text-xl font-black leading-tight text-white line-clamp-2 transition-colors group-hover:text-[#d9f2ed] md:text-[22px] xl:text-2xl">{item.title}</h3>
              </div>
              <p className="mx-auto max-w-[760px] text-center text-sm leading-7 text-[#d7e2de] line-clamp-3 sm:text-[15px]">{genArticleInfo(item)}</p>

              <div className="flex flex-wrap justify-center gap-3 pt-3 text-end">
                <div className="flex items-center rounded-full bg-white/10 px-3 py-1.5 text-xs text-white ring-1 ring-white/10">
                  <span className="pr-1">
                    <IoTimeOutline className="mr-[3px] mt-[-2px] rounded-full bg-[#1f6f78] p-1 text-[22px] text-white align-middle" />
                  </span>
                  <span>{dayjs(+item.createTime!).format('YYYY-MM-DD')}</span>
                </div>

                <div className="flex items-center rounded-full bg-white/10 px-3 py-1.5 text-xs text-white ring-1 ring-white/10">
                  <span className="pr-1">
                    <RiFireLine className="mr-[3px] mt-[-2px] rounded-full bg-[#c05a3f] p-1 text-[22px] text-white align-middle" />
                  </span>
                  <span>{item.view}</span>
                </div>

                <div className="flex items-center rounded-full bg-white/10 px-3 py-1.5 text-xs text-white ring-1 ring-white/10">
                  <span className="pr-1">
                    <GoTag className="mr-[3px] mt-[-2px] rounded-full bg-[#d89b38] p-1 text-[22px] text-white align-middle" />
                  </span>
                  <span>{item.cateList[0]?.name}</span>
                </div>
              </div>
            </Link>
          </div>

          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              filter: 'blur(2rem) brightness(0.52) saturate(1.08)',
              transform: 'scale(1.12)',
              backgroundImage: item.cover || covers.length ? `url(${item.cover || covers[getRandom(0, covers.length - 1)]})` : undefined,
            }}
          />
          <div className="absolute inset-0 bg-[linear-gradient(110deg,rgba(10,24,26,0.72),rgba(33,64,48,0.5),rgba(7,11,14,0.72))]" />
        </article>
      ))}

      <Show is={!data?.total}>
        <Empty info="暂无文章" />
      </Show>
    </div>
  );
};

export default Card;
