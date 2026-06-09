import IconCloud from '@/app/my/components/IconCloud';
import { getPageConfigDataByNameAPI } from '@/api/config';
import { MyData } from '@/types/app/my';
import SectionHeader from '../SectionHeader';

export default async () => {
  const { data } = await getPageConfigDataByNameAPI('my');
  const { technology_stack } = data?.value as MyData;

  return (
    <div className="col-span-2 overflow-hidden rounded-[8px] border border-gray-100 bg-white p-4 shadow-[0_10px_28px_rgba(15,23,42,0.06)] transition-shadow hover:shadow-[0_18px_46px_rgba(15,23,42,0.12)] dark:border-neutral-700 dark:bg-[#1f1f1f]">
      <SectionHeader icon="◈" title="学无止境" accent="#1f6f78" />

      <div className="relative mx-auto flex h-[200px] w-full items-center justify-center overflow-hidden rounded-[7px] border border-gray-100 bg-[radial-gradient(circle_at_50%_35%,rgba(31,111,120,0.09),rgba(248,250,252,0.88)_42%,rgba(255,255,255,0.96)_100%)] dark:border-neutral-700 dark:bg-[radial-gradient(circle_at_50%_35%,rgba(95,208,192,0.13),rgba(255,255,255,0.03)_42%,rgba(255,255,255,0.01)_100%)]">
        <div className="w-[92%] scale-[0.86]">
          <IconCloud iconSlugs={technology_stack ?? []} />
        </div>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-[linear-gradient(to_top,#fff,rgba(255,255,255,0))] dark:bg-[linear-gradient(to_top,#1f1f1f,rgba(31,31,31,0))]" />
      </div>
    </div>
  );
};
