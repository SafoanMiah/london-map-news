import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { useToast } from "@/hooks/use-toast";

interface Borough {
  type: string;
  properties: {
    LAD13CD: string;
    LAD13CDO: string;
    LAD13NM: string;
    LAD13NMW: null;
  };
  geometry: {
    type: string;
    coordinates: number[][][];
  };
}

interface GeoJSONData {
  type: string;
  features: Borough[];
}

interface NewsMarker {
  id: string;
  title: string;
  link: string;
  summary: string;
  thumbnail_url: string;
  location: string;
  sentiment: number;
  topic: string;
}

const getSentimentClass = (sentiment: number | null | undefined) => {
  if (typeof sentiment !== 'number') return 'bg-warning/20 text-warning';
  if (sentiment > 0) return 'bg-primary/20 text-primary';
  if (sentiment < 0) return 'bg-destructive/20 text-destructive';
  return 'bg-yellow-300/20 text-yellow-200';
};

export const LondonMap = () => {
  const mapRef = useRef<SVGSVGElement>(null);
  const { toast } = useToast();
  const [selectedBorough, setSelectedBorough] = useState<string | null>(null);
  const [newsMarkers, setNewsMarkers] = useState<NewsMarker[]>([]);
  const [selectedArticles, setSelectedArticles] = useState<NewsMarker[]>([]);

  // Fetch news markers
  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await fetch('/public/news_14days.json');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setNewsMarkers(data);
      } catch (error) {
        console.error('Error fetching news:', error);
        toast({
          title: "Error loading news data",
          description: "Please try again later",
          variant: "destructive"
        });
      }
    };
    fetchNews();
  }, []);

  useEffect(() => {
    if (!mapRef.current) return;

    const svg = d3.select(mapRef.current);
    const width = window.innerWidth - 480;
    const height = window.innerHeight;

    svg.selectAll("*").remove();

    const projection = d3.geoMercator()
      .center([-0.085, 51.509865])
      .scale(80000)
      .translate([width / 2, height / 2 - (height * 0.05)]);

    const path = d3.geoPath().projection(projection);

    d3.json<GeoJSONData>('./london-boroughs_1179.geojson').then((data) => {
      if (!data) return;

      // Calculate max articles for opacity scaling
      const getArticleCount = (boroughName: string) =>
        newsMarkers.filter(m => m.location === boroughName).length;

      const maxArticles = Math.max(...data.features.map(d =>
        getArticleCount(d.properties.LAD13NM)
      ));

      // Create borough paths
      svg.selectAll("path")
        .data(data.features)
        .enter()
        .append("path")
        .attr("d", path as any)
        .attr("class", d => {
          const articleCount = getArticleCount(d.properties.LAD13NM);
          const isSelected = selectedBorough === d.properties.LAD13NM;
          const sentiment = newsMarkers.find(m => m.location === d.properties.LAD13NM)?.sentiment;
          const sentimentClass = getSentimentClass(sentiment);

          return `
            borough 
            ${articleCount > 0 ? sentimentClass : 'fill-muted hover:fill-muted'}
            ${isSelected ? 'stroke-primary stroke-2' : 'stroke-muted/50 stroke-[0.5]'}
            transition-colors duration-200
            cursor-pointer
          `;
        })
        .style("fill-opacity", d => {
          const articleCount = getArticleCount(d.properties.LAD13NM);
          return articleCount ? 0.2 + (articleCount / maxArticles * 0.6) : 0.1;
        })
        .on("click", (_, d) => {
          const boroughArticles = newsMarkers.filter(m => m.location === d.properties.LAD13NM);
          setSelectedBorough(d.properties.LAD13NM);
          setSelectedArticles(boroughArticles);
        });

      // Add borough labels
      svg.selectAll("text")
        .data(data.features)
        .enter()
        .append("text")
        .attr("class", d => {
          const hasNews = getArticleCount(d.properties.LAD13NM) > 0;
          return `text-[8px] ${hasNews ? 'fill-foreground' : 'fill-foreground/50'} pointer-events-none font-medium`;
        })
        .attr("transform", d => {
          const centroid = path.centroid(d as any);
          return `translate(${centroid[0]},${centroid[1]})`;
        })
        .attr("text-anchor", "middle")
        .text(d => d.properties.LAD13NM);

      // // Add article count badges for boroughs with news, number of articles
      // svg.selectAll("circle")
      //   .data(data.features.filter(d => getArticleCount(d.properties.LAD13NM) > 0))
      //   .enter()
      //   .append("circle")
      //   .attr("class", "fill-primary stroke-background stroke-2")
      //   .attr("r", 8)
      //   .attr("transform", d => {
      //     const centroid = path.centroid(d as any);
      //     return `translate(${centroid[0] + 20},${centroid[1] - 10})`;
      //   });

      // svg.selectAll("text.count")
      //   .data(data.features.filter(d => getArticleCount(d.properties.LAD13NM) > 0))
      //   .enter()
      //   .append("text")
      //   .attr("class", "text-[8px] fill-background font-bold pointer-events-none")
      //   .attr("text-anchor", "middle")
      //   .attr("dominant-baseline", "middle")
      //   .attr("transform", d => {
      //     const centroid = path.centroid(d as any);
      //     return `translate(${centroid[0] + 20},${centroid[1] - 10})`;
      //   })
      //   .text(d => getArticleCount(d.properties.LAD13NM));
    });
  }, [newsMarkers, selectedBorough]);

  return (
    <div className="w-full h-full relative">
      <svg
        ref={mapRef}
        className="w-full h-full"
        viewBox={`0 0 ${window.innerWidth - 480} ${window.innerHeight}`}
        preserveAspectRatio="xMidYMid meet"
      />
      <div
        className={`
          absolute bottom-4 right-4 
          transition-all duration-300 ease-in-out
          ${selectedBorough
            ? 'opacity-100 translate-y-0'
            : 'opacity-0 translate-y-4 pointer-events-none'
          }
        `}
      >
        <div className="glass-panel p-4 rounded-lg w-96 max-h-[70vh] overflow-y-auto">
          <div className="sticky -top-4 -mx-4 px-4 pt-3 pb-3 mb-3 z-10 bg-background border-b border-border">
            <button
              onClick={() => {
                setSelectedArticles([]);
                setSelectedBorough(null);
              }}
              className="absolute top-2 right-2 text-muted-foreground hover:text-primary 
                       transition-colors duration-200"
            >
              ×
            </button>
            <h3 className="font-medium text-primary">{selectedBorough}</h3>
            {selectedArticles.length > 1 && (
              <p className="text-xs text-muted-foreground mt-1">
                {selectedArticles.length} articles found
              </p>
            )}
          </div>
          {selectedArticles.length > 0 ? (
            <div className="space-y-6">
              {selectedArticles.map((article, index) => (
                <div
                  key={article.id}
                  className="transition-all duration-300 ease-in-out"
                  style={{
                    animationDelay: `${index * 100}ms`,
                    opacity: 0,
                    animation: 'fadeSlideIn 0.3s forwards'
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
                    <a
                      href={article.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline 
                               transition-colors duration-200"
                    >
                      Read more →
                    </a>
                    <span className={`sentiment-badge ${getSentimentClass(article.sentiment)}`}>
                      {article.topic}
                    </span>
                  </div>
                  {index < selectedArticles.length - 1 && (
                    <div className="border-t border-border mt-6" />
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-sm animate-fadeIn">
              No articles available for {selectedBorough} yet.
            </p>
          )}
        </div>
      </div>
      <style>{`
        @keyframes fadeSlideIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};
