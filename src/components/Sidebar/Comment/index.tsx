'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getCommentPagingAPI } from '@/api/comment';
import RandomAvatar from '@/components/RandomAvatar';
import { Comment } from '@/types/app/comment';

const NewComments = () => {
  const [list, setList] = useState<Comment[]>([]);

  const getCommentPaging = async () => {
    const { data } = await getCommentPagingAPI();
    setList(data?.result ?? []);
  };

  useEffect(() => {
    getCommentPaging();
  }, []);

  const item = list[0];
  if (!item) return null;

  return (
    <Link href={`/article/${item.articleId}`} target="_blank" className="group flex min-h-[96px] items-center gap-3 rounded-[8px] border border-gray-100 bg-white p-3 shadow-[0_10px_28px_rgba(15,23,42,0.06)] transition hover:-translate-y-0.5 hover:border-gray-200 hover:shadow-[0_18px_46px_rgba(15,23,42,0.12)] dark:border-neutral-700 dark:bg-[#1f1f1f] dark:hover:border-neutral-600">
      <div className="size-[64px] shrink-0 overflow-hidden rounded-[7px] border border-gray-100 bg-gray-50 dark:border-neutral-700 dark:bg-[#2a2a2a]">
        {item.avatar ? <img src={item.avatar} className="size-full object-cover transition duration-500 group-hover:scale-105" alt="评论头像" /> : <RandomAvatar className="size-full transition duration-500 group-hover:scale-105" />}
      </div>
      <div className="min-w-0 flex-1">
        <div className="mb-1 text-[12px] font-black tracking-[0.16em] text-[#1f6f78] dark:text-[#5fd0c0]">最新评论</div>
        <h3 className="text-[15px] font-black leading-6 text-slate-800 line-clamp-2 group-hover:text-[#1f6f78] dark:text-slate-100 dark:group-hover:text-[#d9f2ed]">{item.content}</h3>
      </div>
    </Link>
  );
};

export default NewComments;
