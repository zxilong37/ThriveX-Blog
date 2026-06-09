interface SectionHeaderProps {
  icon: string;
  title: string;
  accent?: string;
}

export default function SectionHeader({ icon, title, accent = '#1f6f78' }: SectionHeaderProps) {
  return (
    <div className="mb-4 flex items-center gap-3 border-b border-gray-100 pb-3 dark:border-neutral-700">
      <span className="grid size-8 shrink-0 place-items-center rounded-[6px] border border-gray-100 bg-gray-50 text-sm shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] dark:border-neutral-700 dark:bg-[#2a2a2a]" style={{ color: accent }}>
        {icon}
      </span>
      <h3 className="text-[16px] font-black tracking-[0.08em] text-slate-800 dark:text-slate-100">{title}</h3>
    </div>
  );
}
