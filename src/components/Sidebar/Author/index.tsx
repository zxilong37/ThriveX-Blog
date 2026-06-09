import Image from 'next/image';

import avatarBg from '@/assets/image/avatar_bg.jpg';
import CSDN from '@/assets/svg/socializing/CSDN.svg';
import Douyin from '@/assets/svg/socializing/Douyin.svg';
import GitHub from '@/assets/svg/socializing/GitHub.svg';
import Gitee from '@/assets/svg/socializing/Gitee.svg';
import Juejin from '@/assets/svg/socializing/Juejin.svg';
import QQ from '@/assets/svg/socializing/QQ.svg';
import Weixin from '@/assets/svg/socializing/Weixin.svg';

import { getAuthorDataAPI } from '@/api/user';
import { getWebConfigDataAPI } from '@/api/config';
import { Social, Theme } from '@/types/app/config';

const DEFAULT_AVATAR = 'https://q1.qlogo.cn/g?b=qq&nk=2069065992&s=640';

const Author = async () => {
  const { data: user } = await getAuthorDataAPI();
  const themeResponse = await getWebConfigDataAPI<{ value: Theme }>('theme');
  const theme = themeResponse?.data?.value as Theme;

  const socialList = theme?.social ?? [];
  const images: { [string: string]: string } = {
    CSDN,
    Douyin,
    GitHub,
    Gitee,
    Juejin,
    QQ,
    Weixin,
  };

  const getIcon = (name: string) => images[name];

  return (
    <div className="relative col-span-2 overflow-hidden rounded-[8px] border border-gray-100 bg-white shadow-[0_10px_28px_rgba(15,23,42,0.06)] transition-shadow hover:shadow-[0_18px_46px_rgba(15,23,42,0.12)] dark:border-neutral-700 dark:bg-[#1f1f1f] dark:shadow-[0_16px_40px_rgba(0,0,0,0.2)]">
      <div
        className="relative h-[112px] bg-cover bg-center"
        style={{
          backgroundImage: `url(${avatarBg.src})`,
        }}
      >
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.88))] dark:bg-[linear-gradient(180deg,rgba(31,31,31,0.1),rgba(31,31,31,0.92))]" />
      </div>

      <div className="relative -mt-12 flex justify-center">
        <div className="avatar relative z-10 grid size-[92px] place-items-center overflow-hidden rounded-full border border-gray-100 bg-white shadow-[0_14px_34px_rgba(15,23,42,0.16)] dark:border-neutral-700 dark:bg-[#1f1f1f]">
          <img src={user?.avatar || DEFAULT_AVATAR} alt={user?.name || '作者头像'} className="size-[82px] rounded-full object-cover transition-transform duration-500 hover:scale-105" />
        </div>
      </div>

      <div className="px-5 pb-5 pt-3 text-center">
        <h3 className="text-xl font-black text-slate-900 dark:text-slate-100">{user?.name}</h3>
        <p className="mx-auto mt-2 w-[90%] text-sm leading-7 text-slate-500 line-clamp-2 dark:text-slate-400">{user?.info}</p>
      </div>

      <div className="border-t border-gray-100 px-5 pb-5 pt-4 dark:border-neutral-700">
        <div className="mb-3 text-center text-[13px] font-black tracking-[0.16em] text-[#1f6f78] dark:text-[#5fd0c0]">社交账号</div>

        <div className="mx-auto flex w-[78%] justify-center gap-4">
          {socialList?.map((item: Social, index: number) => {
            const icon = getIcon(item?.name);
            if (!item?.url || !icon) return null;

            return (
              <a key={index} href={item.url} target="_blank" rel="noopener noreferrer" className="grid size-10 place-items-center rounded-[7px] border border-gray-100 bg-gray-50 transition hover:-translate-y-0.5 hover:border-gray-200 hover:bg-white hover:shadow-[0_10px_24px_rgba(15,23,42,0.08)] dark:border-neutral-700 dark:bg-[#2a2a2a] dark:hover:border-neutral-600 dark:hover:bg-[#303030]">
                <Image src={icon} alt={item.name} title={item.name} className="size-[21px]" />
              </a>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Author;
