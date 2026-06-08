import Link from 'next/link';
import Image from 'next/image';
import { getWebConfigDataAPI } from '@/api/config';
import { getAuthorDataAPI } from '@/api/user';
import { Web } from '@/types/app/config';
import ICPBeian from './components/ICPBeian';

import animals from './images/animals.webp';

const DEFAULT_AVATAR = 'https://q1.qlogo.cn/g?b=qq&nk=2069065992&s=640';

export default async () => {
  const { data: user } = await getAuthorDataAPI();
  const webResponse = await getWebConfigDataAPI<{ value: Web }>('web');
  const web = webResponse?.data?.value as Web;

  return (
    <>
      <div className='sticky bottom-0 z-30 flex w-full translate-y-[25px] justify-center bg-cover bg-center after:absolute after:bottom-[25px] after:left-0 after:h-[60%] after:w-full after:bg-[linear-gradient(to_top,#fff,transparent)] after:content-[""] dark:after:bg-[linear-gradient(to_top,#10151b,transparent)]'>
        <div className="mx-auto flex justify-center lg:w-[950px] xl:w-[1200px]">
          <Image src={animals} alt="" width={660.34} height={79.99} className="relative z-40 hidden md:block" priority={false} />
        </div>
      </div>

      <footer className="border-t border-slate-200 bg-white px-4 pb-8 pt-9 text-[#1f2933] dark:border-slate-800 dark:bg-[#10151b] dark:text-slate-100 sm:px-8">
        <div className="mx-auto max-w-[1280px]">
          <div className="flex flex-col items-center gap-5 border-b border-slate-200 pb-6 text-center dark:border-slate-800 md:flex-row md:text-left">
            <img src={user?.avatar || DEFAULT_AVATAR} alt={user?.name || '作者头像'} className="size-20 shrink-0 rounded-full object-cover shadow-[0_18px_45px_rgba(15,23,42,0.16)]" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-black text-[#1f6f78]">{web?.title || '郑州 GIS 开发工程师'}</p>
              <p className="mt-2 line-clamp-3 text-sm leading-7 text-slate-600 dark:text-slate-300">{web?.footer || '专注测绘地理信息与 WebGIS 工程实践，记录空间数据、地图服务、系统集成与项目交付经验。'}</p>
            </div>
          </div>

          <div className="flex flex-col items-center justify-between gap-4 py-5 text-sm text-slate-500 dark:text-slate-400 lg:flex-row">
            <ICPBeian icp={web?.icp} />

            <Link href="https://github.com/zxilong37/ThriveX-Admin" target="_blank" className="group relative inline-flex max-w-full items-center gap-3 rounded-[8px] border border-slate-200 bg-slate-50 px-4 py-2.5 text-[#24303a] transition hover:border-[#1f6f78] hover:text-[#1f6f78] dark:border-slate-800 dark:bg-[#151b24] dark:text-slate-200">
              <span className="grid size-8 shrink-0 place-items-center rounded-[6px] bg-[#17231d] text-[11px] font-black text-white">TX</span>
              <span className="min-w-0 truncate">基于开源项目 ThriveX 构建</span>
              <span className="pointer-events-none absolute bottom-full right-0 mb-2 hidden rounded-[6px] border border-slate-200 bg-white px-3 py-2 text-xs text-slate-600 shadow-[0_14px_45px_rgba(15,23,42,0.14)] group-hover:block dark:border-slate-700 dark:bg-[#11161c] dark:text-slate-300 sm:whitespace-nowrap">免费、开源、年轻、高颜值的现代化博客管理系统</span>
            </Link>
          </div>
        </div>
      </footer>
    </>
  );
};
