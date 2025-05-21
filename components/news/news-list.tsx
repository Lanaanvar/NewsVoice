import { NewsItem } from "@/lib/mock-data";
import { NewsCard } from "@/components/news/news-card";

interface NewsListProps {
  newsItems: NewsItem[];
  onPlay?: (id: string) => void;
}

export function NewsList({ newsItems, onPlay }: NewsListProps) {
  return (
    <div className="flex flex-col gap-3">
      {newsItems.map((item) => (
        <NewsCard 
          key={item.id} 
          news={item} 
          isCompact={true}
          onPlay={onPlay}
        />
      ))}
    </div>
  );
}