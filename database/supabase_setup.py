'''supabase_setup.py contains the setup for the Supabase client'''

from supabase import create_client
from dotenv import load_dotenv
import os

load_dotenv()

# Loading credentials
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

# Create a single persistent client
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
print("Connected to Supabase") 