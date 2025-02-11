from datetime import datetime
from bs4 import BeautifulSoup
import requests



# CLEANING FUNCTIONSs
def clean_all_dates(date_str):
    try:
        date = datetime.strptime(date_str, "%a, %d %b %Y %H:%M:%S %z")
    except ValueError:
        date = datetime.strptime(date_str, "%a, %d %b %Y %H:%M:%S GMT")
    
    return date.astimezone().strftime("%Y-%m-%d %H:%M:%S")

def clean_google_description(string):
    # <a ...> Major gym chain to finally open after 'flooding' delays </a> ...
    # Extract the text between the <a> and </a> tags
    # First > to next <
    
    start = string.find("target=\"_blank\">") + 1
    end = string.find("</a", start)
    description = string[start:end]
    return description

def clean_thumbnail(entry, site):
    if "mylondon" in site:
        url = entry.media_content[0]['url'] if 'media_content' in entry else None
        if url: return url

    elif "bbc" in site:
        url = entry.get('media_thumbnail', [{}])[0].get('url', None)
        if url: return url
    
    # no google thumbnail

    else: return f"{site}_no_thumbnail"
    
# FILTERING FUNCTIONS

def parse_description(html_content, site):
    soup = BeautifulSoup(html_content, 'html.parser')
    
    if "mylondon" in site:
        article_body = soup.find('div', class_='article-body')
        paragraphs = article_body.find_all('p')
        return '\n'.join([p.get_text() for p in paragraphs]) if paragraphs else "No description available"
    
    elif "bbc" in site:
        text_blocks = soup.find_all(attrs={"data-component": "text-block"})
        return ' '.join([block.get_text(strip=True) for block in text_blocks]) if text_blocks else "No description available"

    return None


def rss_feed_pipeline(data, site):
    for entry in data.entries:
        entry.title = entry.title.title()
        entry.link = entry.link
        entry.published = clean_all_dates(entry.published)
        entry.thumbnail_url = clean_thumbnail(entry, site)

        # Fetch article content
        try:
            article_response = requests.get(entry.link)
            entry.summary = parse_description(article_response.content, site)
        except:
            entry.summary = None

    return data.entries