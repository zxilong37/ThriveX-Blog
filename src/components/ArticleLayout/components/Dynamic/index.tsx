'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { HiOutlineSpeakerphone } from 'react-icons/hi';
import { RiTimerFlashLine } from 'react-icons/ri';
import { FiChevronRight } from 'react-icons/fi';
import { getRecordPagingAPI } from '@/api/record';
import { Record } from '@/types/app/record';
import { extractText } from '@/utils';
import { useConfigStore } from '@/stores';

export default function Dynamic({ className = '' }: { className?: string }) {
  const { web } = useConfigStore();
  const [list, setList] = useState<Record[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFading, setIsFading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [runTime, setRunTime] = useState('');

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const fadeTimerRef = useRef<NodeJS.Timeout | null>(null);

  const getRecordList = async () => {
    try {
      const { data } = await getRecordPagingAPI({ pagination: { page: 1, size: 8 } });
      setList(data?.result ?? []);
    } catch (error) {
      console.error('Failed to fetch records:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getRecordList();
  }, []);

  useEffect(() => {
    if (list.length <= 1) return;

    timerRef.current = setInterval(() => {
      setIsFading(true);

      fadeTimerRef.current = setTimeout(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % list.length);
        setIsFading(false);
      }, 400);
    }, 4500);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (fadeTimerRef.current) clearTimeout(fadeTimerRef.current);
    };
  }, [list.length]);

  const calculateRunTime = (startTimestamp?: number | string) => {
    const timestamp = Number(startTimestamp);
    if (!Number.isFinite(timestamp) || timestamp <= 0) return '';

    const startDate = new Date(timestamp);
    const currentDate = new Date();

    let years = currentDate.getFullYear() - startDate.getFullYear();
    let months = currentDate.getMonth() - startDate.getMonth();
    let days = currentDate.getDate() - startDate.getDate();

    if (days < 0) {
      const lastMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0);
      days += lastMonth.getDate();
      months--;
    }

    if (months < 0) {
      months += 12;
      years--;
    }

    const parts = [];
    if (years > 0) parts.push(`${years}年`);
    if (months > 0) parts.push(`${months}个月`);
    parts.push(`${Math.max(days, 0)}天`);

    return parts.join('');
  };

  useEffect(() => {
    const updateRunTime = () => {
      setRunTime(calculateRunTime(web?.create_time));
    };

    updateRunTime();
    const runtimeTimer = setInterval(updateRunTime, 1000);

    return () => clearInterval(runtimeTimer);
  }, [web?.create_time]);

  if (isLoading) {
    return (
      <div className={`mb-2 flex w-full items-center rounded-[8px] border border-blue-100 bg-white px-4 py-3.5 dark:border-sky-200/20 dark:bg-[#0b4a73] ${className}`}>
        <div className="mr-4 h-5 w-24 animate-pulse rounded bg-slate-200 dark:bg-sky-900/70" />
        <div className="h-5 flex-1 animate-pulse rounded bg-slate-200 dark:bg-sky-900/70" />
      </div>
    );
  }

  if (list.length === 0) return null;

  const currentContent = extractText(list[currentIndex]?.content || '');

  return (
    <div
      className={`
        group mb-2 flex w-full flex-col gap-2 rounded-[8px] border border-blue-100 bg-white px-4 py-3
        shadow-[0_10px_28px_rgba(37,99,235,0.08)] hover:shadow-[0_18px_46px_rgba(37,99,235,0.14)]
        dark:border-sky-200/20 dark:bg-[#0b4a73] dark:shadow-[0_16px_40px_rgba(8,47,73,0.28)]
        sm:flex-row sm:items-center sm:justify-between
        ${className}
      `}
    >
      <div className="flex min-w-0 flex-1 items-center">
        <div className="mr-3 flex shrink-0 items-center lg:mr-5">
          <span className="relative mr-2.5 flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-blue-500" />
          </span>

          <HiOutlineSpeakerphone className="mr-1.5 text-lg text-blue-500 dark:text-sky-200" />
          <span className="whitespace-nowrap text-sm font-medium text-slate-700 dark:text-sky-50">最新动态</span>

          <div className="mx-3 hidden h-3.5 w-px bg-slate-300 dark:bg-sky-200/30 sm:block" />
        </div>

        <Link href="/record" className="flex min-w-0 flex-1 cursor-pointer items-center justify-between overflow-hidden" title={currentContent}>
          <div className="relative h-[20px] flex-1 overflow-hidden">
            <span
              className={`
                absolute left-0 top-0 w-full line-clamp-1 text-sm text-slate-600 dark:text-sky-100/80
                transition-opacity duration-300 ease-in-out group-hover:text-blue-600 dark:group-hover:text-white
                ${isFading ? 'opacity-0' : 'opacity-100'}
              `}
            >
              {currentContent}
            </span>
          </div>

          <FiChevronRight className="ml-2 shrink-0 text-slate-400 duration-200 group-hover:translate-x-0.5 group-hover:text-blue-500 dark:text-sky-100/60" />
        </Link>
      </div>

      {runTime && (
        <div className="runtime-display flex shrink-0 items-center justify-end gap-1.5 text-[13px] font-black text-[#1d4ed8] dark:text-sky-50">
          <RiTimerFlashLine className="text-[16px] text-blue-500 dark:text-sky-200" />
          <span className="runtime-label whitespace-nowrap">站点运行时间</span>
          <span id="runtimeValue" className="runtime-value whitespace-nowrap">
            {runTime}
          </span>
        </div>
      )}
    </div>
  );
}
