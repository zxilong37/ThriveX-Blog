import Author from './Author';
import Study from './Study';
import { getWebConfigDataAPI } from '@/api/config';
import { Theme } from '@/types/app/config';

export default async () => {
  const themeResponse = await getWebConfigDataAPI<{ value: Theme }>('theme');
  const theme = themeResponse?.data?.value as Theme;
  const sidebar = theme?.right_sidebar ?? [];
  const infoSidebar = sidebar.filter((item) => ['author', 'study'].includes(item));

  return (
    <>
      <div className={`hidden lg:grid ${infoSidebar.length ? 'lg:w-[29%] xl:w-[24%]' : 'w-0'} sticky top-[84px] grid-cols-2 gap-4 self-start rounded-[8px] transition-width`}>
        {infoSidebar.includes('author') && <Author />}
        {infoSidebar.includes('study') && <Study />}
      </div>
    </>
  );
};
