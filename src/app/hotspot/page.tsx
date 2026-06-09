import { Metadata } from 'next';
import HotspotClient from './HotspotClient';

export const metadata: Metadata = {
  title: '实时热点',
  description: '聚合展示各平台实时热点趋势',
};

export default function HotspotPage() {
  return <HotspotClient />;
}
