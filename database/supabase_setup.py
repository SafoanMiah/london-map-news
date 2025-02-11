from supabase import create_client
from dotenv import load_dotenv
import os

load_dotenv()

# Loading credentials
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

# Create Supabase client and say connected when called from other files
def create_supabase_client():
    try:
        client = create_client(SUPABASE_URL, SUPABASE_KEY)
        print("Connected to Supabase")
        return client
    except Exception as e:
        print(f"Error connecting to Supabase: {e}")
        return None

supabase = create_supabase_client() 