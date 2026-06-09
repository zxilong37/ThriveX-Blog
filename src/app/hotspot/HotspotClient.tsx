'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { FiActivity, FiArrowUpRight, FiClock, FiCompass, FiDatabase, FiRefreshCw, FiTrendingUp, FiZap } from 'react-icons/fi';
import Container from '@/components/Container';
import Show from '@/components/Show';
import { getHotspotAPI, getHotspotSourcesAPI, getHotspotSummaryAPI } from '@/api/hotspot';
import type { HotspotItem, HotspotListPayload, HotspotSource, HotspotSourcePayload, HotspotSummary } from '@/types/app/hotspot';

type LoadState = 'idle' | 'loading' | 'ready' | 'error';

const allSourceKey = 'all';

const sourcePalette = ['#2563eb', '#0891b2', '#0f766e', '#7c3aed', '#db7c18', '#dc2626', '#4f46e5'];

const listFromPayload = (payload?: HotspotItem[] | HotspotListPayload): HotspotItem[] => {
  if (Array.isArray(payload)) return payload;
  return payload?.result ?? payload?.filter ?? payload?.list ?? payload?.items ?? payload?.records ?? [];
};

const sourcesFromPayload = (payload?: HotspotSource[] | HotspotSourcePayload): HotspotSource[] => {
  if (Array.isArray(payload)) return payload;
  return payload?.result ?? payload?.filter ?? payload?.list ?? payload?.items ?? [];
};

const itemSourceKey = (item: HotspotItem) => item.source ?? item.platform ?? item.sourceName ?? item.platformName ?? 'unknown';

const itemSourceName = (item: HotspotItem) => item.sourceName ?? item.platformName ?? item.source ?? item.platform ?? '未标记';

const sourceKey = (source: HotspotSource) => source.key ?? source.code ?? source.platform ?? source.name ?? source.platformName ?? 'unknown';

const sourceName = (source: HotspotSource) => source.title ?? source.name ?? source.platformName ?? source.platform ?? source.key ?? '未命名';

const formatDateTime = (value?: string) => {
  if (!value) return '';
  const timestamp = /^\d+$/.test(value) ? Number(value) : value;
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const compactNumber = (value?: number | string) => {
  if (value === undefined || value === null || value === '') return '热度追踪';
  const numberValue = Number(value);
  if (Number.isNaN(numberValue)) return String(value);
  if (numberValue >= 10000) return `${(numberValue / 10000).toFixed(numberValue >= 100000 ? 0 : 1)}w`;
  return numberValue.toLocaleString('zh-CN');
};

const getRefreshTime = (summary?: HotspotSummary, listPayload?: HotspotItem[] | HotspotListPayload) => {
  const payloadTime = Array.isArray(listPayload) ? undefined : listPayload?.refreshTime ?? listPayload?.updateTime ?? listPayload?.updatedAt;
  return summary?.lastFetchedAt ?? summary?.refreshTime ?? summary?.updateTime ?? summary?.updatedAt ?? summary?.generatedAt ?? payloadTime ?? '';
};

export default function HotspotClient() {
  const [items, setItems] = useState<HotspotItem[]>([]);
  const [sources, setSources] = useState<HotspotSource[]>([]);
  const [summary, setSummary] = useState<HotspotSummary>();
  const [selectedSource, setSelectedSource] = useState(allSourceKey);
  const [status, setStatus] = useState<LoadState>('idle');
  const [refreshTime, setRefreshTime] = useState('');
  const [message, setMessage] = useState('');

  const loadHotspot = async () => {
    setStatus('loading');
    setMessage('');

    try {
      const [hotspotResponse, sourcesResponse, summaryResponse] = await Promise.all([getHotspotAPI(), getHotspotSourcesAPI(), getHotspotSummaryAPI()]);
      const nextItems = hotspotResponse.code === 200 ? listFromPayload(hotspotResponse.data) : [];
      const nextSources = sourcesResponse.code === 200 ? sourcesFromPayload(sourcesResponse.data) : [];
      const nextSummary = summaryResponse.code === 200 ? summaryResponse.data : undefined;

      if (hotspotResponse.code !== 200) {
        setItems([]);
        setSources(nextSources);
        setSummary(nextSummary);
        setRefreshTime(new Date().toISOString());
        setStatus('error');
        setMessage(hotspotResponse.message || '热点数据加载失败，请稍后再试');
        return;
      }

      setItems(nextItems);
      setSources(nextSources);
      setSummary(nextSummary);
      setRefreshTime(getRefreshTime(nextSummary, hotspotResponse.data) || new Date().toISOString());
      setStatus('ready');

      if (sourcesResponse.code !== 200 || summaryResponse.code !== 200) {
        setMessage(sourcesResponse.message || summaryResponse.message || '热点统计数据暂未完整返回');
      }
    } catch {
      setStatus('error');
      setMessage('热点数据加载失败，请稍后再试');
    }
  };

  useEffect(() => {
    loadHotspot();
  }, []);

  const fallbackSources = useMemo(() => {
    const map = new Map<string, HotspotSource>();
    items.forEach((item) => {
      const key = itemSourceKey(item);
      if (!map.has(key)) {
        map.set(key, {
          key,
          name: itemSourceName(item),
        });
      }
    });
    return Array.from(map.values());
  }, [items]);

  const sourceItemCount = (source: HotspotSource) => {
    const key = sourceKey(source);
    return source.itemCount ?? source.total ?? items.filter((item) => itemSourceKey(item) === key || itemSourceName(item) === key || itemSourceName(item) === sourceName(source)).length;
  };

  const visibleSources = (sources.length ? sources : fallbackSources).filter((source) => source.enabled !== false && sourceItemCount(source) > 0);

  const filteredItems = useMemo(() => {
    if (selectedSource === allSourceKey) return items;
    return items.filter((item) => itemSourceKey(item) === selectedSource || itemSourceName(item) === selectedSource);
  }, [items, selectedSource]);

  const summarySourceCount = summary?.totalPlatforms ?? summary?.sourceCount ?? summary?.activeSourceCount ?? 0;
  const sourceCount = summarySourceCount > 0 ? summarySourceCount : visibleSources.length;
  const totalCount = summary?.totalItems ?? summary?.total ?? items.length;
  const topPlatform = summary?.platforms?.[0];
  const topSource = summary?.topSource ?? topPlatform?.platformName ?? topPlatform?.name ?? (visibleSources[0] ? sourceName(visibleSources[0]) : '全平台');
  const latestTitle = summary?.latestTitle ?? topPlatform?.topItems?.[0]?.title ?? items[0]?.title ?? '等待后端推送';
  const isLoading = status === 'loading';
  const isInitialLoading = isLoading && !items.length;
  const isEmpty = status === 'ready' && !filteredItems.length;

  return (
    <main className="relative min-h-screen overflow-hidden bg-[linear-gradient(180deg,#eaf6ff_0%,#d8edff_42%,#f6fbff_100%)] pb-16 pt-24 text-[#183044] dark:bg-[linear-gradient(180deg,#0a3655_0%,#123f63_48%,#17212d_100%)] dark:text-slate-100">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(37,99,235,0.16)_0%,transparent_22%,transparent_58%,rgba(14,165,233,0.16)_100%)] dark:bg-[linear-gradient(120deg,rgba(59,130,246,0.14)_0%,transparent_26%,transparent_58%,rgba(6,182,212,0.12)_100%)]" />
        <div className="absolute inset-x-0 top-0 h-44 bg-[linear-gradient(180deg,rgba(255,255,255,0.72),transparent)] dark:bg-[linear-gradient(180deg,rgba(14,42,68,0.86),transparent)]" />
        <div className="absolute inset-x-0 bottom-0 h-56 bg-[linear-gradient(0deg,rgba(246,251,255,0.9),transparent)] dark:bg-[linear-gradient(0deg,rgba(23,33,45,0.88),transparent)]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(37,99,235,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(14,165,233,0.07)_1px,transparent_1px)] bg-[size:46px_46px] [mask-image:linear-gradient(to_bottom,rgba(0,0,0,0.8),transparent_82%)] dark:bg-[linear-gradient(rgba(186,230,253,0.09)_1px,transparent_1px),linear-gradient(90deg,rgba(125,211,252,0.08)_1px,transparent_1px)]" />
      </div>

      <Container>
        <section className="relative z-10 w-full">
          <div className="mb-6">
            <div className="grid gap-5 py-3 md:py-5 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-end">
              <div>
                <div className="mb-4 inline-flex items-center gap-2 rounded-[6px] bg-blue-600 px-3 py-2 text-xs font-black uppercase tracking-[0.16em] text-white shadow-[0_10px_28px_rgba(37,99,235,0.28)]">
                  <FiZap />
                  Live Radar
                </div>
                <h1 className="max-w-3xl text-3xl font-black leading-tight text-[#102f4a] dark:text-white sm:text-4xl md:text-5xl">实时热点</h1>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600 dark:text-slate-300 sm:text-base">
                  从站点后端统一读取平台热点，快速扫过正在升温的话题、来源和更新时间。
                </p>
              </div>

              <div className="rounded-[8px] border border-blue-100 bg-[#f8fbff] p-4 dark:border-slate-700 dark:bg-[#262626]">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold text-slate-500 dark:text-slate-400">刷新时间</p>
                    <p className="mt-1 text-lg font-black text-[#123047] dark:text-white">{formatDateTime(refreshTime) || '等待同步'}</p>
                  </div>
                  <button type="button" onClick={loadHotspot} disabled={isLoading} className="inline-flex size-11 shrink-0 items-center justify-center rounded-[6px] bg-[#1f6fff] text-white shadow-[0_12px_30px_rgba(31,111,255,0.24)] transition hover:-translate-y-0.5 hover:bg-[#1559cf] disabled:cursor-not-allowed disabled:opacity-60" aria-label="刷新实时热点">
                    <FiRefreshCw className={isLoading ? 'animate-spin' : ''} />
                  </button>
                </div>
                <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-500 dark:text-slate-300">{latestTitle}</p>
              </div>
            </div>
          </div>

          <div className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard icon={<FiTrendingUp />} label="热点总数" value={totalCount.toString()} hint="后端聚合条目" />
            <MetricCard icon={<FiDatabase />} label="平台来源" value={sourceCount.toString()} hint="可筛选数据源" />
            <MetricCard icon={<FiActivity />} label="当前视图" value={filteredItems.length.toString()} hint={selectedSource === allSourceKey ? '全平台' : selectedSource} />
            <MetricCard icon={<FiCompass />} label="热度焦点" value={topSource} hint="今日关注最高来源" />
          </div>

          <div className="mb-5 rounded-[8px] border border-white/70 bg-white/76 p-3 shadow-[0_20px_70px_rgba(25,91,150,0.12)] backdrop-blur-xl dark:border-slate-700/70 dark:bg-[#1f1f1f]/86">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex min-w-0 items-center gap-2 px-1 text-sm font-black text-[#15334b] dark:text-white">
                <FiCompass className="text-blue-600 dark:text-sky-300" />
                平台筛选
              </div>
              <div className="flex gap-2 overflow-x-auto pb-1 lg:flex-wrap lg:justify-end lg:overflow-visible lg:pb-0">
                <SourceButton active={selectedSource === allSourceKey} label="全部平台" count={items.length} onClick={() => setSelectedSource(allSourceKey)} />
                {visibleSources.map((source, index) => {
                  const key = sourceKey(source);
                  const count = sourceItemCount(source);
                  return <SourceButton key={`${key}-${index}`} active={selectedSource === key} label={sourceName(source)} count={count} color={source.color ?? sourcePalette[index % sourcePalette.length]} onClick={() => setSelectedSource(key)} />;
                })}
              </div>
            </div>
          </div>

          <Show is={!!message}>
            <div className="mb-5 rounded-[8px] border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-bold text-amber-800 dark:border-amber-900/70 dark:bg-amber-950/35 dark:text-amber-100">{message}</div>
          </Show>

          <Show is={isInitialLoading}>
            <HotspotSkeleton />
          </Show>

          <Show is={status === 'error'}>
            <EmptyState title="热点雷达暂时失联" description="后端热点接口没有返回可用数据，稍后刷新即可继续查看。" action={loadHotspot} />
          </Show>

          <Show is={isEmpty}>
            <EmptyState title={selectedSource === allSourceKey ? '后端暂未抓取到热点' : '这个平台暂时没有热点'} description={selectedSource === allSourceKey ? '热点接口已连通，等待后端完成下一次平台聚合后会自动展示。' : '换一个平台看看，或者等待后端完成下一次聚合。'} action={loadHotspot} />
          </Show>

          <Show is={!isInitialLoading && status !== 'error' && !isEmpty}>
            <div className="grid gap-3 lg:grid-cols-2">
              {filteredItems.map((item, index) => (
                <HotspotCard key={`${item.id ?? item.title}-${index}`} item={item} index={index} />
              ))}
            </div>
          </Show>
        </section>
      </Container>
    </main>
  );
}

function MetricCard({ icon, label, value, hint }: { icon: ReactNode; label: string; value: string; hint: string }) {
  return (
    <div className="rounded-[8px] border border-white/70 bg-white/78 p-4 shadow-[0_18px_60px_rgba(25,91,150,0.1)] backdrop-blur-xl dark:border-slate-700/70 dark:bg-[#1f1f1f]/86">
      <div className="mb-4 flex items-center justify-between">
        <span className="grid size-10 place-items-center rounded-[6px] bg-[#e5f2ff] text-blue-600 dark:bg-sky-500/14 dark:text-sky-300">{icon}</span>
        <span className="text-xs font-bold text-slate-500 dark:text-slate-400">{label}</span>
      </div>
      <p className="truncate text-2xl font-black text-[#102f4a] dark:text-white">{value}</p>
      <p className="mt-1 truncate text-sm text-slate-500 dark:text-slate-400">{hint}</p>
    </div>
  );
}

function SourceButton({ active, label, count, color, onClick }: { active: boolean; label: string; count: number; color?: string; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className={`inline-flex shrink-0 items-center gap-2 rounded-[6px] px-3 py-2 text-sm font-bold transition ${active ? 'bg-[#113c72] text-white shadow-[0_12px_30px_rgba(17,60,114,0.22)] dark:bg-sky-500 dark:text-[#102033]' : 'bg-[#eff6ff] text-[#244158] hover:bg-[#ddecff] dark:bg-[#2b2b2b] dark:text-slate-200 dark:hover:bg-[#333]'}`}>
      <span className="size-2 rounded-full" style={{ backgroundColor: color ?? (active ? '#ffffff' : '#2563eb') }} />
      {label}
      <span className={`rounded-[5px] px-1.5 py-0.5 text-xs ${active ? 'bg-white/18 text-white dark:bg-white/28 dark:text-[#102033]' : 'bg-white text-slate-500 dark:bg-[#1f1f1f] dark:text-slate-300'}`}>{count}</span>
    </button>
  );
}

function HotspotCard({ item, index }: { item: HotspotItem; index: number }) {
  const rank = item.rankNo ?? item.rank ?? index + 1;
  const source = itemSourceName(item);
  const time = formatDateTime(item.fetchedAt ?? item.updatedAt ?? item.updateTime ?? item.publishTime ?? item.createdAt);
  const text = item.summary ?? item.desc ?? '';
  const heat = compactNumber(item.hotValue ?? item.hot ?? item.score);
  const href = item.url ?? item.mobileUrl;
  const trendTone = item.trend === 'down' ? 'text-cyan-700 dark:text-cyan-300' : item.trend === 'flat' ? 'text-slate-500 dark:text-slate-400' : 'text-rose-600 dark:text-rose-300';

  return (
    <article className="group overflow-hidden rounded-[8px] border border-white/75 bg-white shadow-[0_20px_70px_rgba(25,91,150,0.12)] transition hover:-translate-y-1 hover:shadow-[0_28px_90px_rgba(25,91,150,0.2)] dark:border-slate-700/70 dark:bg-[#1f1f1f]">
      <div className="flex min-h-full flex-col p-4 sm:p-5">
        <div className="mb-4 flex items-start gap-3">
          <div className={`grid size-11 shrink-0 place-items-center rounded-[6px] font-black ${rank <= 3 ? 'bg-[#fff1df] text-[#d85d10] dark:bg-[#4a321d] dark:text-orange-200' : 'bg-[#e8f3ff] text-blue-700 dark:bg-[#2a3440] dark:text-sky-200'}`}>{rank}</div>
          <div className="min-w-0 flex-1">
            <div className="mb-2 flex flex-wrap items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400">
              <span className="rounded-[5px] bg-[#eef6ff] px-2 py-1 text-[#1d5d93] dark:bg-[#2b2b2b] dark:text-sky-200">{source}</span>
              <span className="inline-flex items-center gap-1">
                <FiClock />
                {time || '刚刚更新'}
              </span>
              <span className={`inline-flex items-center gap-1 ${trendTone}`}>
                <FiTrendingUp />
                {heat}
              </span>
            </div>
            <h2 className="text-lg font-black leading-7 text-[#142f46] transition group-hover:text-blue-600 dark:text-white dark:group-hover:text-sky-300">{item.title}</h2>
          </div>
        </div>

        <p className="min-h-[48px] flex-1 text-sm leading-6 text-slate-600 dark:text-slate-300">{text || '后端暂未提供摘要，点击可查看原始热点详情。'}</p>

        <div className="mt-5 flex items-center justify-between gap-3 border-t border-slate-100 pt-4 dark:border-slate-700">
          <span className="truncate text-xs font-bold text-slate-400">{item.tag || item.author || '实时聚合'}</span>
          {href ? (
            <Link href={href} target="_blank" rel="noreferrer" className="inline-flex shrink-0 items-center gap-2 rounded-[6px] bg-[#0f62d6] px-3 py-2 text-sm font-bold text-white transition hover:bg-[#0a4faf]">
              查看
              <FiArrowUpRight />
            </Link>
          ) : (
            <span className="inline-flex shrink-0 items-center gap-2 rounded-[6px] bg-slate-100 px-3 py-2 text-sm font-bold text-slate-500 dark:bg-[#2b2b2b] dark:text-slate-300">无链接</span>
          )}
        </div>
      </div>
    </article>
  );
}

function HotspotSkeleton() {
  return (
    <div className="grid gap-3 lg:grid-cols-2">
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className="rounded-[8px] border border-white/75 bg-white p-5 shadow-[0_20px_70px_rgba(25,91,150,0.1)] dark:border-slate-700/70 dark:bg-[#1f1f1f]">
          <div className="mb-4 flex gap-3">
            <div className="size-11 animate-pulse rounded-[6px] bg-slate-200 dark:bg-[#333]" />
            <div className="flex-1 space-y-3">
              <div className="h-3 w-40 animate-pulse rounded bg-slate-200 dark:bg-[#333]" />
              <div className="h-5 w-full animate-pulse rounded bg-slate-200 dark:bg-[#333]" />
            </div>
          </div>
          <div className="space-y-2">
            <div className="h-3 animate-pulse rounded bg-slate-200 dark:bg-[#333]" />
            <div className="h-3 w-3/4 animate-pulse rounded bg-slate-200 dark:bg-[#333]" />
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyState({ title, description, action }: { title: string; description: string; action: () => void }) {
  return (
    <div className="rounded-[8px] border border-dashed border-blue-200 bg-white/78 px-5 py-12 text-center shadow-[0_20px_70px_rgba(25,91,150,0.1)] backdrop-blur-xl dark:border-slate-700 dark:bg-[#1f1f1f]/86">
      <div className="mx-auto mb-4 grid size-14 place-items-center rounded-[8px] bg-[#e5f2ff] text-2xl text-blue-600 dark:bg-sky-500/14 dark:text-sky-300">
        <FiZap />
      </div>
      <h2 className="text-xl font-black text-[#142f46] dark:text-white">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-7 text-slate-500 dark:text-slate-300">{description}</p>
      <button type="button" onClick={action} className="mt-6 inline-flex items-center gap-2 rounded-[6px] bg-[#0f62d6] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#0a4faf]">
        <FiRefreshCw />
        重新刷新
      </button>
    </div>
  );
}
