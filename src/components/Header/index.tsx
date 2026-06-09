'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

import { Switch } from '@heroui/react';
import Show from '@/components/Show';
import SidebarNav from './components/SidebarNav';

import { IoIosArrowDown } from 'react-icons/io';
import { FaRegSun } from 'react-icons/fa';
import { BsFillMoonStarsFill, BsTextIndentLeft } from 'react-icons/bs';
import { FiLogIn, FiLogOut, FiPenTool, FiZap } from 'react-icons/fi';

import { Cate } from '@/types/app/cate';
import { getCateListAPI } from '@/api/cate';

import { useConfigStore } from '@/stores';

const authTokenKey = 'thrivex_blog_token';
const authUserKey = 'thrivex_blog_user';
const authChangedEvent = 'thrivex-auth-changed';
const isRouteMatch = (pathname: string, path: string) => pathname === path || pathname.startsWith(`${path}/`);
const isHotspotUrl = (url?: string) => {
  if (!url) return false;
  const normalized = url.trim().replace(/^https?:\/\/[^/]+/i, '').split(/[?#]/)[0].replace(/\/+$/, '');
  return normalized === '/hotspot';
};

export default function Header() {
  const pathname = usePathname();
  const { isDark, setIsDark, theme } = useConfigStore();

  const stableStylePaths = ['/my', '/wall', '/record', '/equipment', '/tags', '/resume', '/album', '/fishpond', '/friend', '/publish', '/reports', '/hotspot'];
  const usesStableHeader = stableStylePaths.some((path) => isRouteMatch(pathname, path));
  const [isScrolled, setIsScrolled] = useState(false);
  const [cateList, setCateList] = useState<Cate[]>([]);
  const [isOpenSidebarNav, setIsOpenSidebarNav] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authName, setAuthName] = useState('');
  const logoSrc = isDark ? theme?.dark_logo : usesStableHeader || isScrolled ? theme?.light_logo : theme?.dark_logo;

  useEffect(() => {
    const mediaQuery = matchMedia('(prefers-color-scheme: dark)');
    const handleThemeChange = (event: MediaQueryListEvent) => setIsDark(event.matches);
    const handleScroll = () => setIsScrolled(window.scrollY > 100);
    const syncAuth = () => {
      const token = localStorage.getItem(authTokenKey);
      const user = localStorage.getItem(authUserKey);
      setIsLoggedIn(!!token);

      if (!user) {
        setAuthName('');
        return;
      }

      try {
        setAuthName(JSON.parse(user)?.name ?? '');
      } catch {
        setAuthName('');
      }
    };
    const loadCateList = async () => {
      const { data } = await getCateListAPI();
      setCateList(data?.result ?? []);
    };

    mediaQuery.addEventListener('change', handleThemeChange);
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('storage', syncAuth);
    window.addEventListener(authChangedEvent, syncAuth);
    loadCateList();
    syncAuth();
    handleScroll();

    return () => {
      mediaQuery.removeEventListener('change', handleThemeChange);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('storage', syncAuth);
      window.removeEventListener(authChangedEvent, syncAuth);
    };
  }, [setIsDark]);

  useEffect(() => {
    document.querySelector('html')?.classList?.toggle('dark', isDark);
  }, [isDark]);

  const logout = () => {
    localStorage.removeItem(authTokenKey);
    localStorage.removeItem(authUserKey);
    setIsLoggedIn(false);
    setAuthName('');
    window.dispatchEvent(new Event(authChangedEvent));
  };

  const headerTone = usesStableHeader || isScrolled ? 'border-white/70 bg-white/85 text-[#222a31] backdrop-blur-xl dark:border-slate-800/80 dark:bg-[#141a22]/90 dark:text-white' : 'border-white/20 bg-black/18 text-white backdrop-blur-md';

  return (
    <>
      <div className="header fixed top-0 z-50 w-full px-3 pt-3">
        <div className={`relative mx-auto flex h-14 w-full max-w-[1360px] items-center rounded-[8px] border px-3 shadow-[0_18px_70px_rgba(23,30,38,0.12)] transition ${headerTone}`}>
          <button type="button" className="mr-1 grid size-10 place-items-center rounded-[6px] transition hover:bg-black/5 dark:hover:bg-white/10 lg:hidden" onClick={() => setIsOpenSidebarNav(true)} aria-label="打开导航">
            <BsTextIndentLeft className="text-[24px]" />
          </button>

          <Link href="/" className="mr-3 flex min-w-[128px] items-center gap-2 rounded-[6px] px-3 py-2 text-[15px]" aria-label="回到首页">
            {logoSrc ? <img src={logoSrc} alt="ThriveX Logo" className="h-8 max-w-32 object-contain transition-transform hover:scale-95" /> : <span className="inline-flex items-center font-semibold tracking-[0.3em]">THRIVE</span>}
          </Link>

          <ul className="hidden flex-1 items-center gap-1 lg:flex">
            <li className="group/one relative">
              <Link href="/" className={`flex items-center rounded-[6px] px-4 py-2 text-[14px] font-semibold transition group-hover/one:!text-primary ${pathname === '/' ? 'bg-white text-[#1d2a32] shadow-sm dark:bg-slate-800 dark:text-white' : 'hover:bg-white/55 dark:hover:bg-white/10'}`}>
                首页
              </Link>
            </li>

            <li className="group/one relative">
              <Link href="/hotspot" className={`flex items-center gap-1.5 rounded-[6px] px-4 py-2 text-[14px] font-black transition group-hover/one:!text-primary ${pathname === '/hotspot' ? 'bg-[#0f62d6] text-white shadow-[0_12px_28px_rgba(15,98,214,0.22)] dark:bg-sky-500 dark:text-[#102033]' : 'bg-[#e8f3ff] text-[#15518d] hover:bg-[#d9ebff] dark:bg-sky-500/14 dark:text-sky-100 dark:hover:bg-sky-500/22'}`}>
                <FiZap />
                实时热点
              </Link>
            </li>

            {cateList?.filter((one) => !isHotspotUrl(one.url))?.map((one) => (
              <li key={one.id} className="group/one relative">
                <Link href={one.type === 'cate' ? `/cate/${one.id}?name=${one.name}` : one.url} target={`${one.url.startsWith('http') ? '_blank' : '_self'}`} className="flex items-center rounded-[6px] px-4 py-2 text-[14px] font-semibold transition hover:bg-white/55 group-hover/one:!text-primary dark:hover:bg-white/10">
                  <span className="mr-1.5">{one.icon}</span>
                  {one.name}
                  <Show is={!!one.children?.length}>
                    <IoIosArrowDown className="ml-2 text-[13px]" />
                  </Show>
                </Link>

                <Show is={!!one.children?.length}>
                  <ul className="absolute top-[42px] hidden min-w-[170px] overflow-hidden rounded-[8px] border border-white/70 bg-white/95 p-1 shadow-[0_18px_44px_rgba(16,24,40,0.16)] backdrop-blur-xl group-hover/one:block dark:border-slate-800 dark:bg-[#151b24]/95">
                    {one.children?.map((two) => (
                      <li key={two.id} className="group/two relative">
                        <Link href={two.type === 'cate' ? `/cate/${two.id}?name=${two.name}` : two.url} target={`${two.url.startsWith('http') ? '_blank' : '_self'}`} className="inline-block w-full rounded-[6px] px-3 py-2 text-[14px] text-[#4c5662] transition hover:bg-[#edf4ff] hover:text-primary dark:text-slate-200 dark:hover:bg-slate-800">
                          {two.icon} {two.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </Show>
              </li>
            ))}
          </ul>

          <div className="ml-auto hidden items-center gap-2 lg:flex">
            <Link href="/publish" className={`inline-flex items-center gap-2 rounded-[6px] px-4 py-2 text-sm font-black transition ${pathname === '/publish' ? 'bg-[#17231d] text-white dark:bg-white dark:text-slate-950' : 'bg-[#edf6ef] text-[#173327] hover:bg-[#dbeee0] dark:bg-emerald-950/40 dark:text-emerald-100 dark:hover:bg-emerald-900/50'}`}>
              <FiPenTool /> 发布文章
            </Link>

            {isLoggedIn ? (
              <button type="button" onClick={logout} className="inline-flex items-center gap-2 rounded-[6px] px-3 py-2 text-sm font-semibold transition hover:bg-white/55 dark:hover:bg-white/10" title={authName || '退出登录'}>
                <FiLogOut /> 退出
              </button>
            ) : (
              <Link href="/publish" className="inline-flex items-center gap-2 rounded-[6px] px-3 py-2 text-sm font-semibold transition hover:bg-white/55 dark:hover:bg-white/10">
                <FiLogIn /> 登录
              </Link>
            )}

            <Switch aria-label="切换深色模式" size="sm" isSelected={isDark} onValueChange={() => setIsDark(!isDark)} thumbIcon={({ isSelected }) => (isSelected ? <BsFillMoonStarsFill className="text-gray-500" /> : <FaRegSun className="text-gray-500" />)} className={`${isDark ? '[&>.bg-default-200]:!bg-[#4e5969]' : '[&>.bg-default-200]:!bg-[#e1e1e1]'}`} />
          </div>

          <div className="ml-auto lg:hidden">
            <Switch aria-label="切换深色模式" size="sm" isSelected={isDark} onValueChange={() => setIsDark(!isDark)} thumbIcon={({ isSelected }) => (isSelected ? <BsFillMoonStarsFill className="text-gray-500" /> : <FaRegSun className="text-gray-500" />)} />
          </div>
        </div>
      </div>

      <SidebarNav list={cateList} open={isOpenSidebarNav} onClose={() => setIsOpenSidebarNav(false)} isLoggedIn={isLoggedIn} onLogout={logout} />
    </>
  );
}
