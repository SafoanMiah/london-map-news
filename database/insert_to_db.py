from database.supabase_setup import supabase

def insert_article(table, **kwargs): # **kwargs** allows for flexible insertion of data
    """
    Inserts a news article into Supabase using the provided keyword arguments.
    """
    response = supabase.table(table).insert(kwargs).execute()
    return response