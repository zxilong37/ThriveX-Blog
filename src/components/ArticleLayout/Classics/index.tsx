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

interface ClassicsProps {
  data: Paginate<Article[]>;
}

const Classics = async ({ data }: ClassicsProps) => {
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
      {data?.result?.map((item, index) => (
        <article key={item.id} className="group relative flex h-auto min-h-[200px] overflow-hidden tw_container md:h-[210px] lg:h-[200px] xl:h-[220px]">
          {index % 2 === 0 && (
            <div
              className="relative z-10 hidden min-w-[44%] bg-cover bg-center bg-no-repeat transition-transform duration-700 group-hover:scale-105 sm:block"
              style={{
                clipPath: 'polygon(0 0, 100% 0, 90% 100%, 0 100%)',
                backgroundImage: item.cover || covers.length ? `url(${item.cover || covers[getRandom(0, covers.length - 1)]})` : undefined,
              }}
            />
          )}

          <div className="relative z-20 w-full px-5 py-5 sm:w-[65%] sm:px-8 lg:px-7 xl:px-9">
            <Link href={`/article/${item.id}`} className="flex h-full flex-col justify-between text-center sm:text-start">
              <div>
                <span className="mb-3 inline-flex items-center rounded-[6px] bg-white/15 px-2.5 py-1 text-[11px] font-black uppercase tracking-[0.14em] text-[#d9f2ed] ring-1 ring-white/15">
                  Field Note
                </span>
                <h3 className="relative my-2 w-full overflow-hidden text-xl font-black leading-tight text-white line-clamp-2 transition-colors group-hover:text-[#d9f2ed] md:text-[22px] xl:text-2xl">{item.title}</h3>
              </div>
              <p className="text-sm leading-7 text-[#d7e2de] line-clamp-3 sm:text-[15px]">{genArticleInfo(item)}</p>

              <div className={`flex flex-wrap ${index % 2 === 0 ? 'sm:justify-start' : 'sm:justify-end'} justify-center gap-3 pt-3 text-end`}>
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
              filter: 'blur(2.2rem) brightness(0.48) saturate(1.08)',
              transform: 'scale(1.12)',
              backgroundImage: item.cover || covers.length ? `url(${item.cover || covers[getRandom(0, covers.length - 1)]})` : undefined,
            }}
          />
          <div className="absolute inset-0 bg-[linear-gradient(105deg,rgba(9,21,24,0.72),rgba(21,52,46,0.54),rgba(8,12,15,0.68))]" />

          {index % 2 !== 0 && (
            <div
              className="relative z-10 hidden min-w-[44%] bg-cover bg-center bg-no-repeat transition-transform duration-700 group-hover:scale-105 sm:block"
              style={{
                clipPath: 'polygon(10% 0, 100% 0, 100% 100%, 0 100%)',
                backgroundImage: item.cover || covers.length ? `url(${item.cover || covers[getRandom(0, covers.length - 1)]})` : undefined,
              }}
            />
          )}
        </article>
      ))}

      <Show is={!data?.total}>
        <Empty info="暂无文章" />
      </Show>
    </div>
  );
};

export default Classics;
