import type { RightSidebar } from '@/types/app/config';
import HotArticle from '@/components/Sidebar/HotArticle';
import RandomArticle from '@/components/Sidebar/RandomArticle';
import Comment from '@/components/Sidebar/Comment';

interface HighlightsProps {
  sidebar: RightSidebar[];
}

export default function Highlights({ sidebar }: HighlightsProps) {
  const hasHighlights = sidebar.some((item) => ['hotArticle', 'randomArticle', 'newComments'].includes(item));

  if (!hasHighlights) return null;

  return (
    <div className="article-highlight-grid mb-4 grid gap-3 md:grid-cols-3">
      {sidebar.includes('hotArticle') && <HotArticle />}
      {sidebar.includes('randomArticle') && <RandomArticle />}
      {sidebar.includes('newComments') && <Comment />}
    </div>
  );
}
