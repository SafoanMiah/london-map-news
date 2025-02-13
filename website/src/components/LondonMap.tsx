import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { useToast } from "@/hooks/use-toast";
import { BoroughStats } from './BoroughStats';
import { BoroughNewsMenu } from './BoroughNewsMenu';
import PaymentPopup from './PaymentPopup';
import { config } from '@/config/config';

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
  date: string;
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

export const LondonMap = () => {
  const mapRef = useRef<SVGSVGElement>(null);
  const { toast } = useToast();
  const [selectedBorough, setSelectedBorough] = useState<string | null>(null);
  const [newsMarkers, setNewsMarkers] = useState<NewsMarker[]>([]);
  const [selectedArticles, setSelectedArticles] = useState<NewsMarker[]>([]);
  const [selectedTopics, setSelectedTopics] = useState<Set<string>>(new Set());
  const [showPaymentPopup, setShowPaymentPopup] = useState(config.showPaymentPopup);

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

        // Initialize selectedTopics with all topics
        const allTopics = new Set(data.map((article: NewsMarker) => article.topic));
        setSelectedTopics(allTopics as Set<string>);
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

    d3.json<GeoJSONData>('./public/london-boroughs.geojson').then((data) => {
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
          // map text size to screen size
          const textSize = window.innerWidth < 768 ? '10px' : '13px';
          return `text-[${textSize}] ${hasNews ? 'fill-foreground' : 'fill-foreground/50'} pointer-events-none font-medium`;
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

  const toggleTopic = (topic: string) => {
    setSelectedTopics(prev => {
      const newTopics = new Set<string>();
      if (topic === 'ALL') {
        // Select all topics
        newsMarkers.forEach(article => newTopics.add(article.topic));
      } else {
        // Select only the clicked topic
        newTopics.add(topic);
      }
      return newTopics;
    });
  };

  // Reset topic selection when borough changes
  useEffect(() => {
    if (selectedBorough) {
      const allTopics = new Set(newsMarkers.map(article => article.topic));
      setSelectedTopics(allTopics);
    }
  }, [selectedBorough]);

  return (
    <div className="w-full h-full relative">
      <div className="absolute top-4 right-4 w-72">
        <BoroughStats
          selectedBorough={selectedBorough}
          newsData={newsMarkers}
          onToggleTopic={toggleTopic}
          selectedTopics={selectedTopics}
        />
      </div>
      <svg
        ref={mapRef}
        className="w-full h-full transform translate-x-[-65px]"
        viewBox={`0 0 ${window.innerWidth - 480} ${window.innerHeight}`}
        preserveAspectRatio="xMidYMid meet"
      />
      <BoroughNewsMenu
        selectedBorough={selectedBorough}
        selectedArticles={selectedArticles}
        onClose={() => {
          setSelectedArticles([]);
          setSelectedBorough(null);
        }}
        selectedTopics={selectedTopics}
      />
      {showPaymentPopup && <PaymentPopup onClose={() => setShowPaymentPopup(false)} />}
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

export default LondonMap;