import { useEffect, useState } from 'react';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

interface NewsItem {
  id: string;
  title: string;
  link: string;
  summary: string;
  thumbnail_url: string;
  date: string;
  sentiment: number;
  topic: string;
  location: string;
}

const getSentimentClass = (sentiment: number | null | undefined) => {
  if (typeof sentiment !== 'number') return 'bg-warning/20 text-warning';
  if (sentiment > 0) return 'bg-primary/20 text-primary';
  if (sentiment < 0) return 'bg-destructive/20 text-destructive';
  return 'bg-yellow-300/20 text-yellow-200';
};

const formatDateTime = (dateString: string) => {
  const date = new Date(dateString);
  return {
    date: date.toLocaleDateString(),
    time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  };
};

export const NewsSidebar = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [news, setNews] = useState<NewsItem[]>([]);

  // Calculate default width based on screen size
  const getWidth = () => {
    const screenWidth = window.innerWidth;
    if (screenWidth >= 1920) { // 2K and above
      return 575;
    } else if (screenWidth >= 1440) { // Large desktop
      return 525;
    } else if (screenWidth >= 1024) { // Desktop
      return 475;
    } else if (screenWidth >= 768) { // Tablet
      return 475;
    } else { // Mobile
      return 425;
    }
  };

  // Initialize width with responsive default
  const [width] = useState(getWidth());

  const fetchLatestNews = async () => {
    try {
      const response = await fetch('/public/news_14days.json');

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const articles = await response.json();
      if (Array.isArray(articles) && articles.length > 0) {
        // Sort by date (newest first) and take top 5
        const latestArticles = articles
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
          .slice(0, 5);

        // Set news with the 5 latest articles
        setNews(latestArticles);
      } else {
        console.warn('No articles found in news_14days.json');
      }
      setIsLoading(false);
    } catch (error) {
      console.error('Error loading news:', error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLatestNews();
    // Fetch new articles every 2 minutes
    const interval = setInterval(fetchLatestNews, 120000);
    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return (
      <aside className="sidebar">
        <div className="flex flex-col h-full p-4">
          <h2 className="text-xl font-semibold mb-6 text-primary text-center">Latest News</h2>
          <div className="flex-1 space-y-4">
            <Skeleton count={5} height={200} />
          </div>
        </div>
      </aside>
    );
  }

  return (
    <aside
      className="sidebar"
      style={{ width: `${width}px` }}
    >
      <div className="flex flex-col h-full p-4 sm:p-6">
        <h2 className="text-xl sm:text-2xl font-semibold mb-6 text-primary text-center">
          Latest News
        </h2>
        <div className="flex-1 overflow-hidden">
          <div className="news-container">
            <div className="news-group">
              {news.map((item, index) => (
                <div key={`${item.id}-${index}-1`} className="news-card group">
                  <div className="relative overflow-hidden">
                    <img
                      src={item.thumbnail_url}
                      alt={item.title}
                      className="news-image"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/placeholder.svg';
                      }}
                    />
                    <div className="gradient-overlay" />
                  </div>
                  <div className="news-card-content">
                    <a
                      href={item.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block group"
                    >
                      <h3 className="news-title">{item.title}</h3>
                    </a>
                    <p className="news-summary mt-2">{item.summary}</p>
                    <div className="flex flex-wrap justify-between items-center gap-2 mt-3">
                      <span className="text-xs text-muted-foreground">
                        {formatDateTime(item.date).date} • {formatDateTime(item.date).time}
                      </span>
                      <div className="flex gap-2">
                        <span className={`sentiment-badge ${getSentimentClass(item.sentiment)}`}>
                          {item.location || 'Unknown Location'}
                        </span>
                        <span className={`sentiment-badge ${getSentimentClass(item.sentiment)}`}>
                          {item.topic || 'Other'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="news-group">
              {news.map((item, index) => (
                <div key={`${item.id}-${index}-2`} className="news-card group">
                  <div className="relative overflow-hidden">
                    <img
                      src={item.thumbnail_url}
                      alt={item.title}
                      className="news-image"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/placeholder.svg';
                      }}
                    />
                    <div className="gradient-overlay" />
                  </div>
                  <div className="news-card-content">
                    <a
                      href={item.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block group"
                    >
                      <h3 className="news-title">{item.title}</h3>
                    </a>
                    <p className="news-summary mt-2">{item.summary}</p>
                    <div className="flex flex-wrap justify-between items-center gap-2 mt-3">
                      <span className="text-xs text-muted-foreground">
                        {formatDateTime(item.date).date} • {formatDateTime(item.date).time}
                      </span>
                      <div className="flex gap-2">
                        <span className={`sentiment-badge ${getSentimentClass(item.sentiment)}`}>
                          {item.location || 'Unknown Location'}
                        </span>
                        <span className={`sentiment-badge ${getSentimentClass(item.sentiment)}`}>
                          {item.topic || 'Other'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <style>{`
        .news-container {
          animation: scroll 60s linear infinite;
        }
        .news-group {
          min-height: 100%;
        }
        @keyframes scroll {
          0% { transform: translateY(0); }
          100% { transform: translateY(-50%); }
        }
        .news-container:hover {
          animation-play-state: paused;
        }
      `}</style>
    </aside>
  );
};