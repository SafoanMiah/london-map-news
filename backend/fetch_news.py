'''fetch_news.py contains functions to fetch news articles from RSS feeds'''

import requests
import feedparser
from backend.filter_pipeline import rss_feed_pipeline

def extract_clean_news(url_tuple, allowed_links):
    """
    Extracts news articles from an RSS feed, but only for the allowed links (non-duplicates).
    """
    
    site, url = url_tuple
    response = requests.get(url)
    
    if response.status_code == 200:
        feed = feedparser.parse(response.content)
        processed_entries = rss_feed_pipeline(feed, site)

        items = []
        
        for entry in processed_entries:
            if entry.link not in allowed_links:
                continue  # skip parsing non-unique links

            items.append({
                "title": entry.title,
                "link": entry.link,
                "date": entry.published,
                "description": entry.summary,
                "thumbnail_url": getattr(entry, "thumbnail_url", None)
            })
    else:
        print(f"Failed to fetch feed from {url}, status code: {response.status_code}")
        return []
    
    return items 


def get_links(url):
    """
    Fetches only article links from an RSS feed. 
    Uses to check for duplicates.
    """
    response = requests.get(url)
    
    if response.status_code == 200:
        feed = feedparser.parse(response.content)
        return [entry.link for entry in feed.entries if hasattr(entry, "link")]
    
    print(f"Failed to fetch feed from {url}, status code: {response.status_code}")
    return []