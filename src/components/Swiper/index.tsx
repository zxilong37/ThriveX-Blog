'use client';

import { Button } from '@heroui/react';
import { useEffect, useRef, useState } from 'react';
import { BiChevronLeft, BiChevronRight } from 'react-icons/bi';
import { Swiper as SwiperType } from '@/types/app/swiper';

export default ({ data, className }: { data: SwiperType[]; className?: string }) => {
  const slides = data?.filter((item) => item?.image?.trim()) ?? [];
  const [current, setCurrent] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const handlePrev = () => {
    setCurrent((current) => (current === 0 ? slides.length - 1 : current - 1));
  };

  const handleNext = () => {
    setCurrent((current) => (current >= slides.length - 1 ? 0 : current + 1));
  };

  useEffect(() => {
    if (!slides.length || slides.length === 1 || isHovered) return;

    intervalRef.current = setInterval(() => {
      setCurrent((current) => (current >= slides.length - 1 ? 0 : current + 1));
    }, 4000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isHovered, slides.length]);

  if (!slides.length) return null;

  return (
    <div
      className={`group relative h-[180px] w-full overflow-hidden rounded-[8px] border border-white/75 bg-white/70 shadow-[0_18px_60px_rgba(28,42,36,0.08)] backdrop-blur-xl after:absolute after:bottom-0 after:left-0 after:h-[68%] after:w-full after:bg-[linear-gradient(to_top,rgba(8,17,19,0.82),transparent)] after:content-[''] dark:border-white/10 dark:bg-[#111a1f]/80 sm:h-[220px] lg:h-[260px] ${className ?? ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {slides.length > 1 && (
        <button type="button" onClick={handlePrev} aria-label="上一张轮播图" className="absolute left-3.5 top-1/2 z-20 flex size-11 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white/16 opacity-0 ring-1 ring-white/25 backdrop-blur-md transition-[transform,opacity,background-color] hover:scale-105 hover:bg-white/24 group-hover:opacity-100">
          <BiChevronLeft className="text-4xl text-gray-100" />
        </button>
      )}

      {slides.map((item, index) => (
        <div key={item.id ?? index} className={`absolute left-0 top-0 h-full w-full ${index === current ? 'opacity-100' : 'opacity-0'} transition-opacity duration-700`}>
          <img src={item.image} alt={item.title || '轮播图'} className="h-full w-full object-cover transition-transform duration-[1800ms] group-hover:scale-[1.03]" width={1694} height={700} />

          <div className="animation_bottom absolute bottom-5 left-5 z-10 flex max-w-[78%] flex-col gap-2 sm:left-6">
            <span className="w-fit rounded-[6px] bg-white/15 px-2.5 py-1 text-[11px] font-black uppercase tracking-[0.16em] text-white/80 ring-1 ring-white/15">Featured</span>
            <h2 className="text_shadow text-xl font-black leading-tight text-white line-clamp-2 lg:text-[26px]">{item.title}</h2>
            {item.url && (
              <Button color="primary" variant="shadow" endContent={<BiChevronRight className="text-2xl" />} className="mt-2 !h-10 !w-32 !rounded-[6px] !bg-[#1f6f78] font-black transition-transform hover:translate-x-1" onPress={() => window.open(item.url, '_blank')}>
                立即查看
              </Button>
            )}
          </div>
        </div>
      ))}

      {slides.length > 1 && (
        <button type="button" onClick={handleNext} aria-label="下一张轮播图" className="absolute right-3.5 top-1/2 z-20 flex size-11 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white/16 opacity-0 ring-1 ring-white/25 backdrop-blur-md transition-[transform,opacity,background-color] hover:scale-105 hover:bg-white/24 group-hover:opacity-100">
          <BiChevronRight className="text-4xl text-gray-100" />
        </button>
      )}

      {slides.length > 1 && (
        <div className="absolute bottom-5 right-8 z-20 flex items-center gap-2">
          {slides.map((_, index) => (
            <button key={index} type="button" onClick={() => setCurrent(index)} aria-label={`切换到第 ${index + 1} 张轮播图`} className={`h-1 cursor-pointer rounded-full transition-[width,background-color,box-shadow] hover:w-8 hover:bg-white ${index === current ? 'w-8 bg-[#d89b38] shadow-[0_0_14px_rgba(216,155,56,0.8)]' : 'w-6 bg-[#fff7]'}`} />
          ))}
        </div>
      )}
    </div>
  );
};
