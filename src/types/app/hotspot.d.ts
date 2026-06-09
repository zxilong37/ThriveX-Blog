export interface HotspotItem {
  id?: number | string;
  title: string;
  url?: string;
  mobileUrl?: string;
  source?: string;
  sourceName?: string;
  platform?: string;
  platformName?: string;
  rank?: number;
  rankNo?: number;
  hot?: number | string;
  hotValue?: number | string;
  score?: number | string;
  trend?: 'up' | 'down' | 'flat' | string;
  summary?: string;
  desc?: string;
  tag?: string;
  author?: string;
  image?: string;
  cover?: string;
  publishTime?: string;
  updateTime?: string;
  fetchedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface HotspotSource {
  id?: number | string;
  key?: string;
  code?: string;
  name?: string;
  title?: string;
  platform?: string;
  platformName?: string;
  url?: string;
  icon?: string;
  color?: string;
  enabled?: boolean;
  itemCount?: number;
  total?: number;
  sort?: number;
  updateTime?: string;
  updatedAt?: string;
}

export interface HotspotSummarySource {
  source?: string;
  sourceName?: string;
  platform?: string;
  platformName?: string;
  name?: string;
  count: number;
  latestFetchedAt?: string;
  topItems?: HotspotItem[];
}

export interface HotspotSummary {
  total?: number;
  totalItems?: number;
  totalPlatforms?: number;
  sourceCount?: number;
  activeSourceCount?: number;
  topSource?: string;
  latestTitle?: string;
  refreshTime?: string;
  updateTime?: string;
  updatedAt?: string;
  generatedAt?: string;
  lastFetchedAt?: string;
  sources?: HotspotSummarySource[];
  platforms?: HotspotSummarySource[];
}

export interface HotspotListPayload {
  result?: HotspotItem[];
  filter?: HotspotItem[];
  list?: HotspotItem[];
  items?: HotspotItem[];
  records?: HotspotItem[];
  total?: number;
  refreshTime?: string;
  updateTime?: string;
  updatedAt?: string;
}

export interface HotspotSourcePayload {
  result?: HotspotSource[];
  filter?: HotspotSource[];
  list?: HotspotSource[];
  items?: HotspotSource[];
}
