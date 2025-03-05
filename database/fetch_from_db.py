'''fetch_from_db.py contains functions to fetch news articles from the database'''

from database.supabase_setup import supabase

def fetch_articles(sample: int = None, date_after: str = None):
    
    """
    Fetches news articles from Supabase with optional filtering
    
    Args:
        sample (int, optional): The number of articles to fetch
        date_after (str, optional): ISO format date string to filter articles after
    
    Returns:
        list: A list of dictionaries containing the fetched articles
    """
    
    query = supabase.table("proc_news_articles").select("*").order('created_at', desc=True)
    
    if date_after:
        query = query.gte('created_at', date_after)
    
    if sample:
        query = query.limit(sample)
    
    response = query.execute()
    
    if response.data:
        return response.data
    else:
        print("No articles found")
        return []

# fetch a column from the database, primarily for id's
def fetch_column(column: str):
    response = supabase.table("proc_news_articles").select(column).execute()
    if response.data:
        return [item[column] for item in response.data]
    else:
        print(f"No {column} found")
        return []