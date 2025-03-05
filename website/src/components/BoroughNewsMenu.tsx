interface NewsMarker {
    id: string;
    title: string;
    link: string;
    summary: string;
    thumbnail_url: string;
    location: string;
    sentiment: number;
    topic: string;
    date: string;
}

interface BoroughNewsMenuProps {
    selectedBorough: string | null;
    selectedArticles: NewsMarker[];
    onClose: () => void;
    selectedTopics: Set<string>;
}

const formatDateTime = (dateString: string) => {
    console.log("formatDateTime called with:", dateString);
    const date = new Date(dateString);
    const today = new Date();

    // Compare dates without time
    const isToday = date.toDateString() === today.toDateString();

    if (isToday) {
        // Show only time for today's articles
        return date.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    // show only date for older articles
    return date.toLocaleDateString();
};

const getSentimentClass = (sentiment: number | null | undefined) => {
    if (typeof sentiment !== 'number') return 'bg-warning/20 text-warning';
    if (sentiment > 0) return 'bg-primary/20 text-primary';
    if (sentiment < 0) return 'bg-destructive/20 text-destructive';
    return 'bg-yellow-300/20 text-yellow-200';
};

export const BoroughNewsMenu = ({ selectedBorough, selectedArticles, onClose, selectedTopics }: BoroughNewsMenuProps) => {
    const displayBorough = selectedBorough === "London" ? "Westminster" : selectedBorough;

    const filteredArticles = selectedArticles.filter(article => selectedTopics.has(article.topic));

    return (
        <div className={`
            absolute bottom-4 right-4 
            transition-all duration-300 ease-in-out
            ${selectedBorough
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 translate-y-4 pointer-events-none'
            }
        `}>
            <div className="glass-panel p-4 rounded-lg w-96 max-h-[70vh] overflow-y-auto custom-scrollbar">
                <div className="sticky -top-4 -mx-4 px-4 pt-3 pb-3 mb-3 z-10 bg-background border-b border-border">
                    <button
                        onClick={onClose}
                        className="absolute top-2 right-2 text-muted-foreground hover:text-primary 
                                transition-colors duration-200"
                    >
                        ×
                    </button>
                    <h3 className="font-medium text-primary">{displayBorough}</h3>
                    {filteredArticles.length > 1 && (
                        <p className="text-xs text-muted-foreground mt-1">
                            {filteredArticles.length} articles found
                        </p>
                    )}
                </div>
                {filteredArticles.length > 0 ? (
                    <div className="space-y-6">
                        {filteredArticles.map((article, index) => (
                            <div
                                key={article.id}
                                className="transition-all duration-300 ease-in-out"
                                style={{
                                    animationDelay: `${index * 100}ms`,
                                    opacity: 0,
                                    animation: 'fadeSlideIn 1s forwards'
                                }}
                            >
                                <img
                                    src={article.thumbnail_url}
                                    alt={article.title}
                                    className="w-full h-40 object-cover rounded-lg mb-3 
                                            transition-transform duration-200 hover:scale-[1.02]"
                                />
                                <h4 className="font-medium mb-2 text-lg hover:text-primary transition-colors">
                                    {article.title}
                                </h4>
                                <p className="text-sm text-muted-foreground mb-3">
                                    {article.summary}
                                </p>
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-2">
                                        <a
                                            href={article.link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-sm text-primary hover:underline transition-colors duration-200"
                                        >
                                            Read more →
                                        </a>
                                    </div>
                                    <span className={`sentiment-badge ${getSentimentClass(article.sentiment)}`}>
                                        {article.topic} • {formatDateTime(article.date)}
                                    </span>
                                </div>
                                {index < filteredArticles.length - 1 && (
                                    <div className="border-t border-border mt-6" />
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-muted-foreground text-sm animate-fadeIn">
                        No articles available for {displayBorough} yet.
                    </p>
                )}
            </div>
            <style  >{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 8px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background-color: #4CAF50; /* Green */
                    border-radius: 10px;
                    border: 2px solid transparent;
                }
            `}</style>
        </div>
    );
}; 