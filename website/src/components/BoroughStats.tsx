import { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface TopicCount {
    [topic: string]: number;
}

interface TopicSentiment {
    [topic: string]: number;
}

interface BoroughStatsProps {
    selectedBorough: string | null;
    newsData: any[];
    onToggleTopic: (topic: string) => void;
    selectedTopics: Set<string>;
}


const rickRoll = true;

export const BoroughStats = ({ selectedBorough, newsData, onToggleTopic, selectedTopics }: BoroughStatsProps) => {
    const [avgSentiment, setAvgSentiment] = useState<number | null>(null);
    const [topicCounts, setTopicCounts] = useState<TopicCount>({});
    const [topicSentiments, setTopicSentiments] = useState<TopicSentiment>({});
    const [isUpdating, setIsUpdating] = useState(false);
    const [allTopics, setAllTopics] = useState<Set<string>>(new Set());
    const [viewMode, setViewMode] = useState<'chart' | 'list'>('list');
    const [showPayment, setShowPayment] = useState(false);

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
                setTopicSentiments({});
                setIsUpdating(false);
                return;
            }

            const sentiment = articles.reduce((sum, article) => sum + article.sentiment, 0) / articles.length;
            setAvgSentiment(Number(sentiment.toFixed(2)));

            const topics: TopicCount = {};
            const sentiments: TopicSentiment = {};
            const newTopics = new Set<string>();

            articles.forEach(article => {
                topics[article.topic] = (topics[article.topic] || 0) + 1;
                sentiments[article.topic] = (sentiments[article.topic] || 0) + article.sentiment;
                newTopics.add(article.topic);
            });

            // Calculate average sentiment for each topic
            for (const topic in sentiments) {
                sentiments[topic] /= topics[topic];
            }

            setTopicCounts(topics);
            setTopicSentiments(sentiments);
            setAllTopics(newTopics);
            setIsUpdating(false);
        }, 500);

        return () => clearTimeout(timer);
    }, [selectedBorough, newsData]);

    useEffect(() => {
        if (rickRoll && !showPayment) {
            const handleGlobalClick = (e: MouseEvent) => {
                setShowPayment(true);
            };
            window.addEventListener("click", handleGlobalClick, true);
            return () => window.removeEventListener("click", handleGlobalClick, true);
        }
    }, [showPayment]);

    const handleTopicClick = (topic: string, event: React.MouseEvent) => {
        event.stopPropagation(); // Prevent event bubbling
        if (selectedTopics.size === 1 && selectedTopics.has(topic)) {
            onToggleTopic('ALL');
        } else {
            onToggleTopic(topic);
        }
    };

    const getSentimentClass = (sentiment: number) => {
        if (sentiment > 0) return 'bg-primary/10 text-primary';
        if (sentiment < 0) return 'bg-destructive/10 text-destructive';
        return 'bg-yellow-300/10 text-yellow-300';
    };

    // Format data for pie chart
    const getPieData = () => {
        return Object.entries(topicCounts).map(([topic, count]) => ({
            name: topic,
            value: count,
            sentiment: topicSentiments[topic]
        }));
    };

    // Generate colors based on sentiment
    const getTopicColor = (sentiment: number) => {
        if (sentiment > 0) return '#0ea5e9';  // primary color
        if (sentiment < 0) return '#ef4444';  // destructive color
        return '#eab308';  // yellow/neutral color
    };

    if (!newsData.length) {
        return (
            <div className="glass-panel p-4 rounded-lg animate-pulse">
                <h3 className="font-medium text-primary mb-3">Loading...</h3>
            </div>
        );
    }

    const pieData = getPieData();

    return (
        <>
            <div className="glass-panel p-4 rounded-lg flex flex-col h-full relative z-50">
                <div className="flex justify-between items-center mb-3">
                    <h3 className="font-medium text-primary">
                        {selectedBorough || 'Average Sentiment'}
                    </h3>
                    {avgSentiment !== null ? (
                        <p className={`text-lg font-medium pr-1 ${avgSentiment > 0 ? 'text-primary' :
                            avgSentiment < 0 ? 'text-destructive' :
                                'text-yellow-300'}`}>
                            {avgSentiment.toFixed(2)}
                        </p>
                    ) : (
                        <p className="text-lg font-medium text-muted text-yellow-600 pr-1">NaN</p>
                    )}
                </div>

                <div className={`flex-grow transition-opacity duration-400 ${isUpdating ? 'opacity-0' : 'opacity-100'}`}>
                    {Object.keys(topicCounts).length > 0 ? (
                        <div className="h-full flex flex-col">
                            {viewMode === 'chart' ? (
                                <div className="flex-grow flex items-center justify-center">
                                    <div className="h-[150px] w-full">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                                                <Pie
                                                    data={pieData}
                                                    cx="50%"
                                                    cy="50%"
                                                    innerRadius={50}
                                                    outerRadius={70}
                                                    paddingAngle={2}
                                                    dataKey="value"
                                                    onClick={(data, event) => handleTopicClick(data.name, event)}
                                                >
                                                    {pieData.map((entry, index) => (
                                                        <Cell
                                                            key={`cell-${index}`}
                                                            fill={getTopicColor(entry.sentiment)}
                                                            style={{ cursor: 'pointer' }}
                                                        />
                                                    ))}
                                                </Pie>
                                                <Tooltip
                                                    content={({ payload }) => {
                                                        if (payload && payload[0]) {
                                                            const data = payload[0].payload;
                                                            return (
                                                                <div className="glass-panel p-2 rounded">
                                                                    <p className="text-sm">{data.name}</p>
                                                                    <p className="text-sm">Count: {data.value}</p>
                                                                    <p className="text-sm">Sentiment: {data.sentiment.toFixed(2)}</p>
                                                                </div>
                                                            );
                                                        }
                                                        return null;
                                                    }}
                                                />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex-grow overflow-auto space-y-1">
                                    {pieData.map(({ name: topic, value: count, sentiment }) => (
                                        <button
                                            key={topic}
                                            onClick={(e) => handleTopicClick(topic, e)}
                                            className={`relative z-10 block w-full text-sm px-3 py-2 rounded transition-colors duration-200 hover:opacity-80 ${getSentimentClass(sentiment)}`}
                                        >
                                            <div className="flex justify-between items-center w-full">
                                                <span className="text-left">{topic}</span>
                                                <span>{count}</span>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}

                            <div className="mt-4 pt-3 border-t border-primary/10">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setViewMode(viewMode === 'chart' ? 'list' : 'chart');
                                    }}
                                    className="relative z-10 w-full text-sm py-1 rounded bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                                >
                                    Show {viewMode === 'chart' ? 'List' : 'Chart'} View
                                </button>
                            </div>
                        </div>
                    ) : (
                        <p className="text-sm text-muted text-yellow-600">No topics available</p>
                    )}
                </div>
            </div>
            {rickRoll && showPayment && (
                <div className="fixed inset-0 flex items-center justify-center z-[1000] bg-black bg-opacity-80">
                    <div className="bg-background p-6 rounded-lg text-center shadow-lg">
                        <p className="text-2xl font-bold mb-4 text-foreground">PAY $1 TO CONTINUE</p>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                window.location.href = "https://www.youtube.com/watch?v=dQw4w9WgXcQ";
                            }}
                            className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-2 px-4 rounded transition-colors"
                        >
                            Subscribe Now
                        </button>
                    </div>
                </div>
            )}
        </>
    );
};