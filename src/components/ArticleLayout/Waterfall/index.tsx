'use client';

import Link from 'next/link';
import { useConfigStore } from '@/stores';
import { Article } from '@/types/app/article';
import { getRandom } from '@/utils';
import Masonry from 'react-masonry-css';

interface WaterfallProps {
  data: Paginate<Article[]>;
}

const breakpointColumnsObj = {
  default: 4,
  1024: 3,
  700: 2,
};

export default ({ data }: WaterfallProps) => {
  const { theme } = useConfigStore();
  const covers = theme.covers ?? [];

  return (
    <>
      <Masonry breakpointCols={breakpointColumnsObj} className="masonry-grid article-waterfall mb-10" columnClassName="masonry-grid_column">
        {data.result.map((item) => (
          <article key={item.id} className="group mt-4 h-[340px] cursor-pointer overflow-hidden rounded-[8px] border border-gray-100 bg-white shadow-[0_10px_28px_rgba(15,23,42,0.06)] transition-[border-color,transform,box-shadow] duration-300 hover:-translate-y-1 hover:border-gray-200 hover:shadow-[0_18px_46px_rgba(15,23,42,0.12)] dark:border-neutral-700 dark:bg-[#1f1f1f] dark:shadow-[0_16px_40px_rgba(0,0,0,0.2)] dark:hover:border-neutral-600">
            <Link href={`/article/${item.id}`} className="flex h-full flex-col">
              <div className="relative h-[150px] shrink-0 overflow-hidden bg-gray-100 dark:bg-[#2a2a2a]">
                <div
                  className="relative z-10 h-full scale-100 bg-cover bg-center bg-no-repeat transition-transform duration-700 group-hover:scale-[1.04]"
                  style={{
                    backgroundImage: item.cover || covers.length ? `url(${item.cover || covers[getRandom(0, covers.length - 1)]})` : undefined,
                    filter: 'brightness(1.08) saturate(1.04) contrast(0.98)',
                  }}
                />
                <div className="absolute inset-0 z-20 bg-[linear-gradient(180deg,rgba(255,255,255,0)_0%,rgba(255,255,255,0.02)_55%,rgba(255,255,255,0.12)_100%)] dark:bg-[linear-gradient(180deg,rgba(31,31,31,0)_0%,rgba(31,31,31,0.04)_55%,rgba(31,31,31,0.22)_100%)]" />
              </div>

              <div className="flex flex-1 flex-col justify-between px-5 py-4">
                <div>
                  <h1 className="mb-2.5 text-[18px] font-black leading-7 text-slate-900 line-clamp-2 transition-colors group-hover:text-[#1f6f78] dark:text-slate-100 dark:group-hover:text-[#d9f2ed]">{item.title}</h1>
                  <div className="text-[14px] leading-7 text-slate-500 line-clamp-3 dark:text-slate-400">{item.description}</div>
                </div>
              </div>
            </Link>
          </article>
        ))}
      </Masonry>
    </>
  );
};
