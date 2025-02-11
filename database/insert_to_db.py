from database.supabase_setup import supabase

def insert_article(table, **kwargs): # **kwargs** allows for flexible insertion of data
    """
    Inserts a news article into Supabase using the provided keyword arguments.
    """
    response = supabase.table(table).insert(kwargs).execute()
    return response

# Example usage
if __name__ == "__main__":
    insert_article(
        "London News",
        "https://example.com/london_news",
        "2000-01-01 00:00:00",
        "This is an example news description.",
        "https://example.com/london_news.jpg"
    )