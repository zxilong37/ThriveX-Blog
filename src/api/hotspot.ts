import { Request } from '@/utils';
import { HotspotItem, HotspotListPayload, HotspotSource, HotspotSourcePayload, HotspotSummary } from '@/types/app/hotspot';

type HotspotQuery = {
  source?: string;
  platform?: string;
  limit?: number;
  page?: number;
  size?: number;
};

export const getHotspotAPI = async (query?: HotspotQuery) => {
  return await Request<HotspotItem[] | HotspotListPayload>('GET', '/hotspot', { params: { page: 1, size: 200, ...(query ?? {}) } }, false);
};

export const getHotspotSourcesAPI = async () => {
  return await Request<HotspotSource[] | HotspotSourcePayload>('GET', '/hotspot/sources', undefined, false);
};

export const getHotspotSummaryAPI = async () => {
  return await Request<HotspotSummary>('GET', '/hotspot/summary', undefined, false);
};
