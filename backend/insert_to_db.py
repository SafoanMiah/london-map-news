import sys
import os
from time import sleep
from datetime import datetime
from load_id import load_existing_links, save_new_link
import uuid

sys.path.append(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..'))
from backend.fetch_news import extract_clean_news, get_links
from database.insert_to_db import insert_article
from inference_llm.article_analysis import analyze_article

rss_urls = [
    ("mylondon-london", "https://www.mylondon.news/?service=rss"),
    ("bbc-london", "https://feeds.bbci.co.uk/news/england/london/rss.xml"),
    #("google-london", "https://news.google.com/rss/topics/CAAqHAgKIhZDQklTQ2pvSWJHOWpZV3hmZGpJb0FBUAE/sections/CAQiTkNCSVNORG9JYkc5allXeGZkakpDRUd4dlkyRnNYM1l5WDNObFkzUnBiMjV5Q2hJSUwyMHZNRFJxY0d4NkNnb0lMMjB2TURScWNHd29BQSowCAAqLAgKIiZDQklTRmpvSWJHOWpZV3hmZGpKNkNnb0lMMjB2TURScWNHd29BQVABUAE?hl=en-GB&gl=GB&ceid=GB%3Aen"),
    #("google-tower_hamlets", "https://news.google.com/rss/topics/CAAqJQgKIh9DQkFTRVFvSUwyMHZNRzVzWnpRU0JXVnVMVWRDS0FBUAE?hl=en-GB&gl=GB&ceid=GB%3Aen")
]


def fetch_and_store_news():
    """Fetch news from RSS, clean it, and insert into the database."""
    existing_links = load_existing_links()  # Load links only from the latest month

    for site, url in rss_urls:

        # Get all links first
        new_links = get_links(url)

        # Filter out existing links
        unique_links = [link for link in new_links if link not in existing_links]

        if not unique_links:
            print(f"No new articles for {site}, skipping parsing.")
            continue

        # Now, fetch and process articles only for unique links
        articles = extract_clean_news((site, url), unique_links)

        for article in articles:
            
            # create a UUID for each article and convert it to string
            article_id = str(uuid.uuid4())
            
            # get context behind each now
            context = analyze_article(article["title"], article["description"])
                
            # inserting context
            context_article_data = {
                "id": article_id,
                "title": article["title"],
                "link": article["link"],
                "date": article["date"],
                "summary": context.get("summary", article["description"]),
                "thumbnail_url": article["thumbnail_url"],
                "location": context.get("location"),
                "sentiment": context.get("sentiment"),
                "topic": context.get("topic")
            }
            
            # inserting raw descriptions
            # foreign key: id
            article_data = {
                "id": article_id,
                "full_description": article["description"],
            }
            
            try:
                insert_article(
                    table="proc_news_articles",
                    **context_article_data # ** for kwargs, this unpacks the dict
                )
                print(f"Context: Inserted article {article_id}")
            except Exception as e:
                print(f"Error inserting context for article {article_id} : {e}")
                
                            
            try:
                insert_article(
                    table="full_news_articles",
                    **article_data
                )
                print(f"RAW: Inserted article {article_id}")
                save_new_link(article["link"])  # Save the link to avoid future duplicates

            except Exception as e:
                print(f"Error inserting article {article_id} : {e}")


# Run the function
fetch_and_store_news()
