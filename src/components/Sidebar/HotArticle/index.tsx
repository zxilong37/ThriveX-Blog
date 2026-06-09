import Link from 'next/link';
import { getWebConfigDataAPI } from '@/api/config';
import { getArticleListAPI } from '@/api/article';
import { Theme } from '@/types/app/config';
import { Article } from '@/types/app/article';

const HotArticle = async () => {
  const themeResponse = await getWebConfigDataAPI<{ value: Theme }>('theme');
  const theme = themeResponse?.data?.value as Theme;
  const { data: article } = await getArticleListAPI();
  const ids = theme.reco_article.map((item) => Number(item)) ?? [];
  const item = article?.result.find((articleItem: Article) => ids.includes(articleItem.id as number));

  if (!item) return null;

  return (
    <Link href={`/article/${item.id}`} target="_blank" className="group flex min-h-[96px] items-center gap-3 rounded-[8px] border border-gray-100 bg-white p-3 shadow-[0_10px_28px_rgba(15,23,42,0.06)] transition hover:-translate-y-0.5 hover:border-gray-200 hover:shadow-[0_18px_46px_rgba(15,23,42,0.12)] dark:border-neutral-700 dark:bg-[#1f1f1f] dark:hover:border-neutral-600">
      <div className="h-[72px] w-[92px] shrink-0 overflow-hidden rounded-[7px] bg-gray-100 dark:bg-[#2a2a2a]">
        {item.cover ? <img src={item.cover} alt={item.title} className="size-full object-cover transition duration-500 group-hover:scale-105" /> : null}
      </div>
      <div className="min-w-0 flex-1">
        <div className="mb-1 text-[12px] font-black tracking-[0.16em] text-[#c05a3f]">作者推荐</div>
        <h3 className="text-[15px] font-black leading-6 text-slate-800 line-clamp-2 group-hover:text-[#1f6f78] dark:text-slate-100 dark:group-hover:text-[#d9f2ed]">{item.title}</h3>
      </div>
    </Link>
  );
};

export default HotArticle;
