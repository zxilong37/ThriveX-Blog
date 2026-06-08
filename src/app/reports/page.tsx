import ReportsClient from './ReportsClient';

export const metadata = {
  title: '工作报表',
};

export default function ReportsPage() {
  return (
    <main className="min-h-screen bg-[#eef1f4] px-3 pb-12 pt-24 text-[#1f2933] dark:bg-[#0f1318] dark:text-slate-100 sm:px-5">
      <ReportsClient />
    </main>
  );
}
