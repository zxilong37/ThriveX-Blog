'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getRandomArticleListAPI } from '@/api/article';
import { useConfigStore } from '@/stores';
import { Article } from '@/types/app/article';
import { getRandom } from '@/utils';

const RandomArticle = () => {
  const { theme } = useConfigStore();
  const covers = theme.covers ?? [];
  const [list, setList] = useState<Article[]>([]);

  const getRandomArticleList = async () => {
    const { data } = await getRandomArticleListAPI();
    setList(data ?? []);
  };

  useEffect(() => {
    getRandomArticleList();
  }, []);

  const item = list?.[0];
  if (!item) return null;

  return (
    <Link href={`/article/${item.id}`} target="_blank" className="group flex min-h-[96px] items-center gap-3 rounded-[8px] border border-gray-100 bg-white p-3 shadow-[0_10px_28px_rgba(15,23,42,0.06)] transition hover:-translate-y-0.5 hover:border-gray-200 hover:shadow-[0_18px_46px_rgba(15,23,42,0.12)] dark:border-neutral-700 dark:bg-[#1f1f1f] dark:hover:border-neutral-600">
      <div
        className="h-[72px] w-[92px] shrink-0 rounded-[7px] bg-gray-100 bg-cover bg-center dark:bg-[#2a2a2a]"
        style={{ backgroundImage: item.cover || covers.length ? `url(${item.cover || covers[getRandom(0, covers.length - 1)]})` : undefined }}
      />
      <div className="min-w-0 flex-1">
        <div className="mb-1 text-[12px] font-black tracking-[0.16em] text-[#d89b38]">随机推荐</div>
        <h3 className="text-[15px] font-black leading-6 text-slate-800 line-clamp-2 group-hover:text-[#1f6f78] dark:text-slate-100 dark:group-hover:text-[#d9f2ed]">{item.title}</h3>
      </div>
    </Link>
  );
};

export default RandomArticle;
