import { useEffect, useState } from 'react';

interface TopicCount {
    [topic: string]: number;
}

interface BoroughStatsProps {
    selectedBorough: string | null;
    newsData: any[];
}

export const BoroughStats = ({ selectedBorough, newsData }: BoroughStatsProps) => {
    const [avgSentiment, setAvgSentiment] = useState<number | null>(null);
    const [topicCounts, setTopicCounts] = useState<TopicCount>({});
    const [isUpdating, setIsUpdating] = useState(false);

    useEffect(() => {
        if (!newsData.length) return;

        setIsUpdating(true);

        const timer = setTimeout(() => {
            const articles = selectedBorough
                ? newsData.filter(article => article.location === selectedBorough)
                : newsData;

            if (articles.length === 0) {
                setAvgSentiment(null);
                setTopicCounts({});
                setIsUpdating(false);
                return;
            }

            const sentiment = articles.reduce((sum, article) => sum + article.sentiment, 0) / articles.length;
            setAvgSentiment(Number(sentiment.toFixed(3)));

            const topics: TopicCount = {};
            articles.forEach(article => {
                topics[article.topic] = (topics[article.topic] || 0) + 1;
            });
            setTopicCounts(topics);
            setIsUpdating(false);
        }, 500);

        return () => clearTimeout(timer);
    }, [selectedBorough, newsData]);

    if (!newsData.length) {
        return (
            <div className="glass-panel p-4 rounded-lg animate-pulse">
                <h3 className="font-medium text-primary mb-3">Loading...</h3>
            </div>
        );
    }

    return (
        <div className="glass-panel p-4 rounded-lg">
            <h3 className="font-medium text-primary mb-3">
                {selectedBorough || 'Overall'} Statistics
            </h3>

            <div className={`space-y-4 transition-opacity duration-500 ${isUpdating ? 'opacity-0' : 'opacity-100'}`}>
                <div>
                    {avgSentiment !== null ? (
                        <p className={`text-lg font-medium ${avgSentiment > 0 ? 'text-primary' :
                            avgSentiment < 0 ? 'text-destructive' :
                                'text-yellow-300'
                            }`}>
                            {avgSentiment.toFixed(3)}
                        </p>
                    ) : (
                        <p className="text-lg font-medium text-muted">NaN</p>
                    )}
                </div>

                <div>
                    {Object.keys(topicCounts).length > 0 ? (
                        <div className="space-y-1">
                            {Object.entries(topicCounts)
                                .sort(([, a], [, b]) => b - a)
                                .map(([topic, count]) => (
                                    <div key={topic} className="flex justify-between items-center">
                                        <span className="text-sm">{topic}</span>
                                        <span className="text-sm text-muted-foreground">{count}</span>
                                    </div>
                                ))
                            }
                        </div>
                    ) : (
                        <p className="text-sm text-muted">No topics available</p>
                    )}
                </div>
            </div>
        </div>
    );
}; 