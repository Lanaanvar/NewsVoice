import { NewsItem } from "@/lib/mock-data";
import { NewsCard } from "@/components/news/news-card";

interface NewsGridProps {
  newsItems: NewsItem[];
  onPlay?: (id: string) => void;
}

export function NewsGrid({ newsItems, onPlay }: NewsGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
      {newsItems.map((item) => (
        <NewsCard 
          key={item.id} 
          news={item} 
          onPlay={onPlay}
        />
      ))}
    </div>
  );
}