'use client';

import { useEffect, useRef, useState } from 'react';
import { useConfigStore } from '@/stores';
import { motion, useMotionValue, useTransform, animate, useInView } from 'framer-motion';
import SectionHeader from '../SectionHeader';

const AnimatedNumber = ({ value, suffix, onComplete }: { value: number; suffix: string; onComplete?: () => void }) => {
  const ref = useRef(null);
  const isInView = useInView(ref);
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => Math.round(latest));

  useEffect(() => {
    if (isInView) {
      const animation = animate(count, value, {
        duration: 2,
        ease: 'easeOut',
        onComplete: () => {
          onComplete?.();
        },
      });
      return animation.stop;
    }
  }, [count, isInView, onComplete, value]);

  return (
    <span ref={ref} className="inline-block">
      <motion.span>{rounded}</motion.span>
      {suffix}
    </span>
  );
};

export default () => {
  const { web } = useConfigStore();
  const [showDetailed, setShowDetailed] = useState(false);

  const calculateTimeDifference = (startTimestamp?: number | string) => {
    const timestamp = Number(startTimestamp);
    if (!Number.isFinite(timestamp) || timestamp <= 0) {
      return { years: 0, months: 0, days: 0, totalDays: 0 };
    }

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

    const totalDays = Math.floor((currentDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

    return { years, months, days, totalDays };
  };

  const timeDiff = calculateTimeDifference(web?.create_time);

  return (
    <div className="rounded-[8px] border border-gray-100 bg-white p-4 text-slate-900 shadow-[0_10px_28px_rgba(15,23,42,0.06)] transition-shadow hover:shadow-[0_18px_46px_rgba(15,23,42,0.12)] dark:border-neutral-700 dark:bg-[#1f1f1f] dark:text-slate-100">
      <SectionHeader icon="⏳" title="站点运行时间" accent="#8fa2ff" />

      <div className="rounded-[7px] border border-gray-100 bg-gray-50 px-3 py-3 text-center text-[15px] font-black tracking-[0.08em] text-slate-600 dark:border-neutral-700 dark:bg-[#2a2a2a] dark:text-slate-300">
        {!showDetailed ? (
          timeDiff.totalDays ? <AnimatedNumber value={timeDiff.totalDays} suffix="天" onComplete={() => setShowDetailed(true)} /> : <span>已上线</span>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
            <AnimatedNumber value={timeDiff.years} suffix="年" />
            <AnimatedNumber value={timeDiff.months} suffix="个月 " />
            <AnimatedNumber value={timeDiff.days} suffix="天" />
          </motion.div>
        )}
      </div>
    </div>
  );
};
