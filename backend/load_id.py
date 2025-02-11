import os
from datetime import datetime

ID_STORAGE_DIR = "id_storage"

def get_latest_link_file():
    """Returns the latest monthly link file name."""
    current_month = datetime.now().strftime("%m-%Y")
    return os.path.join(ID_STORAGE_DIR, f"{current_month}.txt")

def load_existing_links():
    """Loads existing links from the latest monthly file."""
    file_path = get_latest_link_file()
    
    if not os.path.exists(file_path):
        return set()

    with open(file_path, "r") as file:
        return set(file.read().splitlines())
    
def save_new_link(article_link):
    """Saves a new article link to the latest monthly file."""
    file_path = get_latest_link_file()

    os.makedirs(ID_STORAGE_DIR, exist_ok=True)

    with open(file_path, "a") as file:
        file.write(article_link + "\n")