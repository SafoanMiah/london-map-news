'''This file contains functions to get average sentiment and topic counts for given boroughs from news data'''

import json

def get_average_sentiment(boroughs, news_json_path):
    """
    Calculate average sentiment for given boroughs from news data
    """
    with open(news_json_path) as f:
        news_data = json.load(f)
        
    borough_sentiments = {}
    
    for borough in boroughs:
        borough_articles = [article for article in news_data if article['location'] == borough]
        if borough_articles:
            avg_sentiment = sum(article['sentiment'] for article in borough_articles) / len(borough_articles)
            borough_sentiments[borough] = round(avg_sentiment, 3)
        else:
            borough_sentiments[borough] = None
            
    return borough_sentiments

def get_topic_counts(boroughs, news_json_path):
    """
    Get topic counts for given boroughs from news data
    """
    with open(news_json_path) as f:
        news_data = json.load(f)
        
    borough_topics = {}
    
    for borough in boroughs:
        borough_articles = [article for article in news_data if article['location'] == borough]
        topic_count = {}
        
        for article in borough_articles:
            topic = article['topic']
            topic_count[topic] = topic_count.get(topic, 0) + 1
            
        borough_topics[borough] = topic_count if topic_count else None
        
    return borough_topics
