'use client';

import { ReactNode } from 'react';
import Ripple from '@/components/Ripple';
import { cn } from '@/lib/utils';
import { getRandom } from '@/utils';
import { useConfigStore } from '@/stores';

interface Props {
  src?: string;
  isRipple?: boolean;
  children?: ReactNode;
  className?: string;
}

export default ({ src, isRipple = true, children, className }: Props) => {
  const theme = useConfigStore((state) => state.theme);
  const covers = theme.covers ?? [];

  const sty = {
    backgroundImage: src || covers.length ? `url(${src || covers[getRandom(0, covers.length - 1)]})` : undefined,
  };

  return (
    <>
      <div className={cn("relative h-[320px] overflow-hidden bg-cover bg-center sm:h-[420px] md:h-[520px] after:absolute after:bottom-0 after:left-0 after:h-[24%] after:w-full after:bg-[linear-gradient(to_top,#eaf6ff,rgba(234,246,255,0.66),transparent)] after:content-[''] dark:after:bg-[linear-gradient(to_top,#082f49,rgba(8,47,73,0.7),transparent)]", className)} style={sty}>
        <div className="absolute inset-0 bg-[linear-gradient(105deg,rgba(4,10,14,0.86)_0%,rgba(8,20,24,0.62)_42%,rgba(5,10,13,0.5)_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_42%,rgba(0,0,0,0.08),rgba(0,0,0,0.48)_78%)]" />
        <div className="absolute inset-x-0 top-0 h-32 bg-[linear-gradient(to_bottom,rgba(4,10,14,0.72),transparent)]" />
        <div className="absolute bottom-10 left-1/2 z-10 w-[min(92%,1180px)] -translate-x-1/2 sm:bottom-16">
          <div className="mb-5 inline-flex items-center gap-2 rounded-[6px] border border-white/25 bg-white/10 px-3 py-1.5 text-xs font-black uppercase tracking-[0.18em] text-white/90 backdrop-blur-md">
            <span className="size-1.5 rounded-full bg-[#d89b38]" />
            Spatial Notes
          </div>
        </div>
        <div className="absolute inset-0 z-20">{children}</div>
      </div>

      {isRipple && <Ripple />}
    </>
  );
};
