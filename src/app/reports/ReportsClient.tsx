'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { FiCalendar, FiCheckCircle, FiClock, FiDownload, FiFileText, FiLogIn, FiPlus, FiSave, FiUser } from 'react-icons/fi';
import { exportWorkReportAPI, getWorkReportAPI, getWorkReportDownloadUrl, getWorkReportSchedulesAPI, listWorkReportExportsAPI, saveWorkReportAPI, updateWorkReportSchedulesAPI } from '@/api/workReport';
import { WorkReport, WorkReportExport, WorkReportSchedule, WorkReportType } from '@/types/app/workReport';

type ReportTab = WorkReportType | 'exports' | 'schedule';

interface LocalUser {
  id?: number;
  name?: string;
  username?: string;
  email?: string;
  info?: string;
}

const authTokenKey = 'thrivex_blog_token';
const authUserKey = 'thrivex_blog_user';

const reportTabs: { key: ReportTab; label: string }[] = [
  { key: 'daily', label: '日报' },
  { key: 'weekly', label: '周报' },
  { key: 'monthly', label: '月报' },
  { key: 'exports', label: '导出记录' },
  { key: 'schedule', label: '定时设置' },
];

const reportTypeLabel: Record<WorkReportType, string> = {
  daily: '日报',
  weekly: '周报',
  monthly: '月报',
};

const emptyReport = (type: WorkReportType, period: string): WorkReport => ({
  type,
  period,
  title: '',
  summary: '',
  details: '',
  nextPlan: '',
  attachmentNote: '',
  status: 'draft',
  draftVersion: 1,
});

const today = () => new Date().toISOString().slice(0, 10);

const month = () => new Date().toISOString().slice(0, 7);

const week = () => {
  const date = new Date();
  const day = date.getDay() || 7;
  date.setDate(date.getDate() + 4 - day);
  const yearStart = new Date(date.getFullYear(), 0, 1);
  const weekNo = Math.ceil(((date.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${date.getFullYear()}-W${String(weekNo).padStart(2, '0')}`;
};

const defaultPeriod = (type: WorkReportType) => {
  if (type === 'daily') return today();
  if (type === 'weekly') return week();
  return month();
};

const normalizeLines = (value?: string) => {
  if (!value) return [];
  return value
    .split('\n')
    .map((item) => item.trim())
    .filter(Boolean);
};

export default function ReportsClient() {
  const [activeTab, setActiveTab] = useState<ReportTab>('daily');
  const [user, setUser] = useState<LocalUser | null>(null);
  const [token, setToken] = useState('');
  const [userOpen, setUserOpen] = useState(false);
  const [periods, setPeriods] = useState<Record<WorkReportType, string>>({
    daily: today(),
    weekly: week(),
    monthly: month(),
  });
  const [report, setReport] = useState<WorkReport>(emptyReport('daily', today()));
  const [exports, setExports] = useState<WorkReportExport[]>([]);
  const [schedules, setSchedules] = useState<WorkReportSchedule[]>([]);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  const reportType = (['daily', 'weekly', 'monthly'].includes(activeTab) ? activeTab : 'daily') as WorkReportType;
  const draftKey = useMemo(() => `work-report:${user?.id ?? 'guest'}:${reportType}:${periods[reportType]}`, [user?.id, reportType, periods]);
  const isEditor = ['daily', 'weekly', 'monthly'].includes(activeTab);

  useEffect(() => {
    const storedToken = localStorage.getItem(authTokenKey) ?? '';
    const storedUser = localStorage.getItem(authUserKey);
    setToken(storedToken);
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        setUser(null);
      }
    }
  }, []);

  useEffect(() => {
    if (!token || !isEditor) return;
    loadReport(reportType, periods[reportType]);
  }, [token, activeTab, periods.daily, periods.weekly, periods.monthly]);

  useEffect(() => {
    if (!token) return;
    if (activeTab === 'exports') loadExports();
    if (activeTab === 'schedule') loadSchedules();
  }, [activeTab, token]);

  useEffect(() => {
    if (!isEditor || !token) return;
    localStorage.setItem(draftKey, JSON.stringify({ ...report, localSavedAt: Date.now() }));
  }, [report, draftKey, isEditor, token]);

  const loadReport = async (type: WorkReportType, period: string) => {
    setMessage('');
    const localDraft = localStorage.getItem(`work-report:${user?.id ?? 'guest'}:${type}:${period}`);
    const response = await getWorkReportAPI(type, period);
    const remote = response.code === 200 && response.data ? response.data : emptyReport(type, period);
    if (localDraft) {
      try {
        setReport({ ...remote, ...JSON.parse(localDraft), type, period });
        return;
      } catch {
        setReport(remote);
        return;
      }
    }
    setReport(remote);
  };

  const loadExports = async () => {
    const response = await listWorkReportExportsAPI();
    if (response.code === 200) setExports(response.data?.result ?? []);
  };

  const loadSchedules = async () => {
    const response = await getWorkReportSchedulesAPI();
    if (response.code === 200) setSchedules(response.data ?? []);
  };

  const updateReport = (patch: Partial<WorkReport>) => {
    setReport((current) => ({ ...current, ...patch, type: reportType, period: periods[reportType], draftVersion: (current.draftVersion ?? 1) + 1 }));
  };

  const saveReport = async () => {
    setBusy(true);
    const payload = { ...report, type: reportType, period: periods[reportType] };
    const response = await saveWorkReportAPI(payload);
    setBusy(false);
    if (response.code !== 200) {
      setMessage(response.message || '保存失败');
      return null;
    }
    setReport(response.data);
    localStorage.setItem(draftKey, JSON.stringify(response.data));
    setMessage('已保存到数据库，本地草稿同步完成');
    return response.data;
  };

  const exportReport = async () => {
    const saved = report.id ? report : await saveReport();
    if (!saved?.id) return;
    setBusy(true);
    const response = await exportWorkReportAPI(saved.id);
    setBusy(false);
    if (response.code !== 200) {
      setMessage(response.message || '导出失败');
      return;
    }
    setMessage('Word 已生成，正在下载');
    await loadExports();
    const downloadToken = localStorage.getItem(authTokenKey);
    const file = await fetch(getWorkReportDownloadUrl(response.data.id), {
      headers: { Authorization: downloadToken ? `Bearer ${downloadToken}` : '' },
    });
    const blob = await file.blob();
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = response.data.fileName;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const downloadExport = async (item: WorkReportExport) => {
    const downloadToken = localStorage.getItem(authTokenKey);
    const file = await fetch(getWorkReportDownloadUrl(item.id), {
      headers: { Authorization: downloadToken ? `Bearer ${downloadToken}` : '' },
    });
    const blob = await file.blob();
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = item.fileName;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const saveSchedules = async () => {
    setBusy(true);
    const response = await updateWorkReportSchedulesAPI(schedules);
    setBusy(false);
    if (response.code === 200) {
      setSchedules(response.data);
      setMessage('定时设置已保存');
    } else {
      setMessage(response.message || '定时设置保存失败');
    }
  };

  const addLine = (field: 'details' | 'nextPlan') => updateReport({ [field]: `${report[field] ? `${report[field]}\n` : ''}` } as Partial<WorkReport>);

  if (!token) {
    return (
      <section className="mx-auto flex min-h-[62vh] max-w-[760px] items-center justify-center">
        <div className="w-full rounded-[8px] border border-slate-200 bg-white p-8 shadow-[0_24px_90px_rgba(15,23,42,0.12)] dark:border-slate-800 dark:bg-[#171d24]">
          <div className="mb-5 inline-flex size-12 items-center justify-center rounded-[8px] bg-[#1f6f78] text-white">
            <FiLogIn size={22} />
          </div>
          <h1 className="text-2xl font-black">需要先登录后编写工作报表</h1>
          <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">报表会按登录用户隔离存储，并支持本地草稿、数据库保存、Word 导出和定时归档。</p>
          <Link href="/publish" className="mt-7 inline-flex items-center gap-2 rounded-[6px] bg-[#17231d] px-5 py-3 text-sm font-bold text-white">
            <FiLogIn /> 去登录
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-[1500px]">
      <div className="mb-4 flex flex-col gap-3 rounded-[8px] border border-slate-200 bg-white px-4 py-3 shadow-[0_18px_70px_rgba(15,23,42,0.08)] dark:border-slate-800 dark:bg-[#171d24] xl:flex-row xl:items-center">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <div className="grid size-11 shrink-0 place-items-center rounded-[8px] bg-[#1f6f78] text-white">
            <FiFileText size={22} />
          </div>
          <div className="min-w-0">
            <h1 className="truncate text-xl font-black">工作报表</h1>
            <p className="truncate text-sm text-slate-500 dark:text-slate-400">日报、周报、月报统一存储与 Word 导出</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {reportTabs.map((tab) => (
            <button key={tab.key} type="button" onClick={() => setActiveTab(tab.key)} className={`rounded-[6px] px-4 py-2 text-sm font-bold transition ${activeTab === tab.key ? 'bg-[#17231d] text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700'}`}>
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative ml-auto">
          <button type="button" onClick={() => setUserOpen((open) => !open)} className="inline-flex items-center gap-2 rounded-[6px] border border-slate-200 bg-white px-3 py-2 text-sm font-bold dark:border-slate-700 dark:bg-[#11161c]">
            <FiUser /> {user?.name || user?.username || '当前用户'}
          </button>
          {userOpen && (
            <div className="absolute right-0 top-12 z-20 w-72 rounded-[8px] border border-slate-200 bg-white p-4 text-sm shadow-[0_22px_70px_rgba(15,23,42,0.18)] dark:border-slate-800 dark:bg-[#11161c]">
              <p className="font-black">{user?.name || user?.username}</p>
              <p className="mt-1 text-slate-500">{user?.email || '未设置邮箱'}</p>
              <p className="mt-3 leading-6 text-slate-600 dark:text-slate-300">{user?.info || '登录用户私有报表空间'}</p>
            </div>
          )}
        </div>
      </div>

      {message && <div className="mb-4 rounded-[6px] border border-[#b9ded4] bg-[#e8f6f1] px-4 py-3 text-sm font-bold text-[#145246] dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-100">{message}</div>}

      {isEditor && (
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1.02fr)_minmax(420px,0.98fr)]">
          <section className="rounded-[8px] border border-slate-200 bg-white p-4 shadow-[0_18px_70px_rgba(15,23,42,0.08)] dark:border-slate-800 dark:bg-[#171d24]">
            <div className="mb-4 flex flex-wrap items-center gap-3">
              <label className="flex items-center gap-2 rounded-[6px] bg-slate-100 px-3 py-2 text-sm font-bold dark:bg-slate-800">
                <FiCalendar />
                <input type={reportType === 'daily' ? 'date' : reportType === 'monthly' ? 'month' : 'week'} value={periods[reportType]} onChange={(e) => setPeriods((current) => ({ ...current, [reportType]: e.target.value || defaultPeriod(reportType) }))} className="bg-transparent outline-none" />
              </label>
              <select value={report.status ?? 'draft'} onChange={(e) => updateReport({ status: e.target.value as 'draft' | 'final' })} className="rounded-[6px] border border-slate-200 bg-white px-3 py-2 text-sm font-bold outline-none dark:border-slate-700 dark:bg-[#11161c]">
                <option value="draft">草稿</option>
                <option value="final">定稿</option>
              </select>
              <button type="button" disabled={busy} onClick={saveReport} className="ml-auto inline-flex items-center gap-2 rounded-[6px] bg-[#17231d] px-4 py-2 text-sm font-bold text-white disabled:opacity-60">
                <FiSave /> 保存
              </button>
              <button type="button" disabled={busy} onClick={exportReport} className="inline-flex items-center gap-2 rounded-[6px] bg-[#1f6f78] px-4 py-2 text-sm font-bold text-white disabled:opacity-60">
                <FiDownload /> 导出 Word
              </button>
            </div>

            <div className="space-y-4">
              <Field label="标题">
                <input value={report.title ?? ''} onChange={(e) => updateReport({ title: e.target.value })} placeholder={`${reportTypeLabel[reportType]}标题可留空，导出时自动生成`} className="w-full rounded-[6px] border border-slate-200 bg-slate-50 px-3 py-3 outline-none focus:border-[#1f6f78] dark:border-slate-700 dark:bg-[#11161c]" />
              </Field>
              <Field label="工作概述">
                <textarea value={report.summary ?? ''} onChange={(e) => updateReport({ summary: e.target.value })} rows={5} className="w-full resize-none rounded-[6px] border border-slate-200 bg-slate-50 px-3 py-3 leading-7 outline-none focus:border-[#1f6f78] dark:border-slate-700 dark:bg-[#11161c]" />
              </Field>
              <Field label="重点工作详情" action={<button type="button" onClick={() => addLine('details')} className="inline-flex items-center gap-1 text-xs font-bold text-[#1f6f78]"><FiPlus /> 添加条目</button>}>
                <textarea value={report.details ?? ''} onChange={(e) => updateReport({ details: e.target.value })} rows={8} placeholder="每行一个重点事项" className="w-full resize-none rounded-[6px] border border-slate-200 bg-slate-50 px-3 py-3 leading-7 outline-none focus:border-[#1f6f78] dark:border-slate-700 dark:bg-[#11161c]" />
              </Field>
              <Field label="下阶段计划" action={<button type="button" onClick={() => addLine('nextPlan')} className="inline-flex items-center gap-1 text-xs font-bold text-[#1f6f78]"><FiPlus /> 添加条目</button>}>
                <textarea value={report.nextPlan ?? ''} onChange={(e) => updateReport({ nextPlan: e.target.value })} rows={6} placeholder="每行一个计划事项" className="w-full resize-none rounded-[6px] border border-slate-200 bg-slate-50 px-3 py-3 leading-7 outline-none focus:border-[#1f6f78] dark:border-slate-700 dark:bg-[#11161c]" />
              </Field>
              <Field label="附件说明">
                <textarea value={report.attachmentNote ?? ''} onChange={(e) => updateReport({ attachmentNote: e.target.value })} rows={3} className="w-full resize-none rounded-[6px] border border-slate-200 bg-slate-50 px-3 py-3 leading-7 outline-none focus:border-[#1f6f78] dark:border-slate-700 dark:bg-[#11161c]" />
              </Field>
            </div>
          </section>

          <aside className="rounded-[8px] border border-slate-200 bg-[#fbfcfd] p-5 shadow-[0_18px_70px_rgba(15,23,42,0.08)] dark:border-slate-800 dark:bg-[#151a20]">
            <div className="mb-5 flex items-center justify-between border-b border-slate-200 pb-4 dark:border-slate-800">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-[#1f6f78]">Preview</p>
                <h2 className="mt-1 text-lg font-black">Word 内容预览</h2>
              </div>
              <span className="rounded-[6px] bg-slate-100 px-3 py-1 text-xs font-bold dark:bg-slate-800">{report.status === 'final' ? '定稿' : '草稿'}</span>
            </div>
            <article className="min-h-[720px] rounded-[6px] bg-white px-8 py-9 shadow-inner dark:bg-[#10151b]">
              <h3 className="text-center text-2xl font-black">{report.title || `${reportTypeLabel[reportType]}（${periods[reportType]}）`}</h3>
              <PreviewSection title="一、工作概述" lines={normalizeLines(report.summary)} />
              <PreviewSection title="二、重点工作详情" lines={normalizeLines(report.details)} ordered />
              <PreviewSection title="三、下阶段工作计划" lines={normalizeLines(report.nextPlan)} ordered />
              <PreviewSection title="四、附件" lines={normalizeLines(report.attachmentNote)} />
            </article>
          </aside>
        </div>
      )}

      {activeTab === 'exports' && (
        <section className="rounded-[8px] border border-slate-200 bg-white p-4 shadow-[0_18px_70px_rgba(15,23,42,0.08)] dark:border-slate-800 dark:bg-[#171d24]">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-black">导出记录</h2>
            <button type="button" onClick={loadExports} className="rounded-[6px] bg-slate-100 px-3 py-2 text-sm font-bold dark:bg-slate-800">刷新</button>
          </div>
          <div className="overflow-hidden rounded-[8px] border border-slate-200 dark:border-slate-800">
            {exports.map((item) => (
              <div key={item.id} className="grid gap-3 border-b border-slate-200 px-4 py-3 text-sm last:border-b-0 dark:border-slate-800 md:grid-cols-[1fr_120px_160px_120px] md:items-center">
                <span className="font-bold">{item.fileName}</span>
                <span>{reportTypeLabel[item.type]}</span>
                <span className="text-slate-500">{item.exportTime}</span>
                <button type="button" onClick={() => downloadExport(item)} className="inline-flex items-center gap-2 font-bold text-[#1f6f78]">
                  <FiDownload /> 下载
                </button>
              </div>
            ))}
            {!exports.length && <div className="px-4 py-10 text-center text-slate-500">暂无导出记录</div>}
          </div>
        </section>
      )}

      {activeTab === 'schedule' && (
        <section className="rounded-[8px] border border-slate-200 bg-white p-4 shadow-[0_18px_70px_rgba(15,23,42,0.08)] dark:border-slate-800 dark:bg-[#171d24]">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-black">定时导出设置</h2>
            <button type="button" disabled={busy} onClick={saveSchedules} className="inline-flex items-center gap-2 rounded-[6px] bg-[#17231d] px-4 py-2 text-sm font-bold text-white disabled:opacity-60">
              <FiCheckCircle /> 保存设置
            </button>
          </div>
          <div className="grid gap-3 lg:grid-cols-3">
            {schedules.map((item, index) => (
              <div key={item.type} className="rounded-[8px] border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-[#11161c]">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="font-black">{reportTypeLabel[item.type]}</h3>
                  <label className="inline-flex items-center gap-2 text-sm font-bold">
                    <input type="checkbox" checked={item.enabled} onChange={(e) => setSchedules((current) => current.map((row, rowIndex) => (rowIndex === index ? { ...row, enabled: e.target.checked } : row)))} />
                    启用
                  </label>
                </div>
                <label className="mb-3 flex items-center gap-2 text-sm font-bold">
                  <FiClock />
                  <input type="time" value={item.exportTime} onChange={(e) => setSchedules((current) => current.map((row, rowIndex) => (rowIndex === index ? { ...row, exportTime: e.target.value } : row)))} className="w-full rounded-[6px] border border-slate-200 bg-white px-3 py-2 dark:border-slate-700 dark:bg-[#171d24]" />
                </label>
                {item.type === 'weekly' && (
                  <select value={item.weeklyDay} onChange={(e) => setSchedules((current) => current.map((row, rowIndex) => (rowIndex === index ? { ...row, weeklyDay: Number(e.target.value) } : row)))} className="w-full rounded-[6px] border border-slate-200 bg-white px-3 py-2 text-sm font-bold dark:border-slate-700 dark:bg-[#171d24]">
                    <option value={1}>周一</option>
                    <option value={2}>周二</option>
                    <option value={3}>周三</option>
                    <option value={4}>周四</option>
                    <option value={5}>周五</option>
                    <option value={6}>周六</option>
                    <option value={7}>周日</option>
                  </select>
                )}
                {item.type === 'monthly' && <p className="text-sm text-slate-500">默认每月最后一天执行。</p>}
                <p className="mt-4 text-xs text-slate-500">最近导出周期：{item.lastExportPeriod || '暂无'}</p>
              </div>
            ))}
          </div>
        </section>
      )}
    </section>
  );
}

function Field({ label, action, children }: { label: string; action?: ReactNode; children: ReactNode }) {
  return (
    <label className="block">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm font-black">{label}</span>
        {action}
      </div>
      {children}
    </label>
  );
}

function PreviewSection({ title, lines, ordered }: { title: string; lines: string[]; ordered?: boolean }) {
  return (
    <section className="mt-8">
      <h4 className="mb-3 text-lg font-black">{title}</h4>
      {lines.length ? (
        <div className="space-y-2 text-[15px] leading-8 text-slate-700 dark:text-slate-300">
          {lines.map((line, index) => (
            <p key={`${line}-${index}`}>{ordered ? `${index + 1}. ` : ''}{line}</p>
          ))}
        </div>
      ) : (
        <p className="text-[15px] leading-8 text-slate-400">保存或导出时将保留该章节空白版式。</p>
      )}
    </section>
  );
}
