import json
import time
import sys
from datetime import datetime, timedelta
from pathlib import Path
from os.path import dirname, abspath

root_dir = dirname(dirname(abspath(__file__)))
sys.path.append(root_dir)
from database.fetch_from_db import fetch_articles

def get_news_by_days(days: int):
    """Fetch news articles from the last N days"""
    try:
        # Calculate the date threshold
        cutoff_date = datetime.now() - timedelta(days=days)
        
        # Fetch articles after the cutoff date
        articles = fetch_articles(date_after=cutoff_date.isoformat())
        
        # Format for frontend
        news_data = [{
            'id': article['id'],
            'title': article['title'],
            'link': article['link'],
            'summary': article['summary'],
            'thumbnail_url': article['thumbnail_url'],
            'date': article['created_at'],
            'sentiment': article['sentiment'],
            'topic': article['topic'],
            'location': article['location']
        } for article in articles]

        # Save to a different JSON file
        output_path = Path(root_dir) / 'app' / 'public' / f'news_{days}days.json'
        output_path.parent.mkdir(parents=True, exist_ok=True)
        
        with output_path.open('w', encoding='utf-8') as f:
            json.dump(news_data, f, ensure_ascii=False, indent=2)
            
        print(f"Saved {len(news_data)} articles from last {days} days")
        return news_data
    except Exception as e:
        print(f"Error fetching {days}-day news: {e}")
        return []

if __name__ == "__main__":
    get_news_by_days(days=14)