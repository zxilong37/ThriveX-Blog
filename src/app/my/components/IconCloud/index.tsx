'use client'

import { useEffect, useMemo, useState } from 'react';
import { Cloud, fetchSimpleIcons, type ICloud, renderSimpleIcon, type SimpleIcon } from 'react-icon-cloud';

export const cloudProps: Omit<ICloud, 'children'> = {
  containerProps: {
    style: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      width: '100%',
    },
  },
  options: {
    reverse: true,
    depth: 1,
    wheelZoom: false,
    imageScale: 2,
    activeCursor: 'default',
    tooltip: 'native',
    initial: [0.1, -0.1],
    clickToFront: 500,
    tooltipDelay: 0,
    outlineColour: '#0000',
    maxSpeed: 0.04,
    minSpeed: 0.02,
    // dragControl: false,
  },
};

export const renderCustomIcon = (icon: SimpleIcon, theme: string) => {
  // 为特定图标自定义颜色
  const bgHex = theme === 'light' ? '#f3f2ef' : '#080510';
  const fallbackHex = theme === 'light' ? '#6e6e73' : '#ffffff';

  const minContrastRatio = theme === 'dark' ? 2 : 1.2;

  return renderSimpleIcon({
    icon,
    bgHex,
    fallbackHex,
    minContrastRatio,
    size: 42,
    aProps: {
      href: undefined,
      target: undefined,
      rel: undefined,
      onClick: (e: any) => e.preventDefault(),
    },
  });
};

type IconData = Awaited<ReturnType<typeof fetchSimpleIcons>>;

const iconSlugAliases: Record<string, string | null> = {
  scss: 'sass',
  html: 'html5',
  fetch: null,
  vue: 'vuedotjs',
  vuex: null,
  zustand: null,
  'element-plus': 'element',
  motion: 'framer',
  pinia: null,
  'framer-motion': 'framer',
  echarts: 'apacheecharts',
  java: 'openjdk',
  mybatis: null,
  'mybatis-plus': null,
  nextjs: 'nextdotjs',
  visualstudiocode: null,
  trae: null,
  cursor: null,
  navicat: null,
  hbuilder: null,
  hbuilderx: null,
  windows: null,
};

const normalizeIconSlugs = (slugs: string[]) => {
  const normalized = slugs
    .map((slug) => slug.trim().toLowerCase())
    .filter(Boolean)
    .map((slug) => (Object.prototype.hasOwnProperty.call(iconSlugAliases, slug) ? iconSlugAliases[slug] : slug))
    .filter((slug): slug is string => Boolean(slug));

  return Array.from(new Set(normalized));
};

export default function IconCloud({ iconSlugs }: { iconSlugs: string[] }) {
  const [data, setData] = useState<IconData | null>(null);
  const [mounted, setMounted] = useState(false);
  const normalizedSlugs = useMemo(() => normalizeIconSlugs(iconSlugs), [iconSlugs]);

  useEffect(() => {
    setMounted(true);
    if (!normalizedSlugs.length) {
      setData(null);
      return;
    }

    fetchSimpleIcons({ slugs: normalizedSlugs }).then(setData);
  }, [normalizedSlugs]);

  const renderedIcons = useMemo(() => {
    if (!data) return null;

    return Object.values(data.simpleIcons).map((icon) => renderCustomIcon(icon, 'light'));
  }, [data]);

  if (!mounted) return null;

  return (
    <Cloud {...cloudProps}>
      <>{renderedIcons}</>
    </Cloud>
  );
}
