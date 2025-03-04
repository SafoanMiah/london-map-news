'''article_analysis.py contains functions to analyze news articles using the Groq API'''

import os
import requests
import dotenv
import time

dotenv.load_dotenv()
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"

LONDON_BOROUGHS = [
    'Tower Hamlets', 'Barking and Dagenham', 'Barnet', 'Bexley', 'Brent', 'Bromley', 'Camden',
    'Croydon', 'Ealing', 'Enfield', 'Greenwich', 'Hackney',
    'Hammersmith and Fulham', 'Haringey', 'Harrow', 'Havering', 'Hillingdon',
    'Hounslow', 'Islington', 'Kensington and Chelsea', 'Kingston upon Thames',
    'Lambeth', 'Lewisham', 'Merton', 'Newham', 'Redbridge',
    'Richmond upon Thames', 'Southwark', 'Sutton',
    'Waltham Forest', 'Wandsworth', 'Westminster'
]

def analyze_article(title, description):
    """Analyze article using Groq API"""
    # Handle None description
    if description is None:
        description = "No description available"

    prompt = f"""Analyze this news article and extract key information. Follow these rules exactly:

    1. Location must be one of these London boroughs exactly: {', '.join(LONDON_BOROUGHS)}
    2. Sentiment must be a number between -1 and 1 (e.g. -0.8, 0.5), attempt to not give it a 0 sentiment if possible
    3. Topic must be exactly one of: Environment, Urbanization, Economy, Society, Other, attempt to not give it a Other topic if possible
    4. Summary must be around 50 words
    
<<<<<<< HEAD
    If no specific borough is mentioned, choose the most likely borough based on context, you MUST put it somehwere.
    At the very least make sure to put the ones from Tower Hamlets in place properly, as its most important for this.
=======
    You must analyze the databases title and description to find specific borough, you can also look at your own summary.
>>>>>>> fd870e5283774203894138fd279c5212d9c68416

    Article Title: {title}
    Article Description: {description}

    Format your response exactly like this, with just the values:
    Location: [borough name]
    Sentiment: [number]
    Topic: [single topic]
    Summary: [brief summary]"""

    headers = {
        "Authorization": f"Bearer {GROQ_API_KEY}",
        "Content-Type": "application/json"
    }

    payload = {
        "model": "mixtral-8x7b-32768",
        "messages": [
            {"role": "system", "content": "You are a precise news analyzer. Always respond in the exact format requested with clean, parseable values."},
            {"role": "user", "content": prompt}
        ],
        "temperature": 0.1,
        "max_tokens": 1000
    }

    # Try to analyze article
    try:
        response = requests.post(GROQ_API_URL, headers=headers, json=payload)
        response.raise_for_status()
        result = response.json()
        
        
        ai_response = result['choices'][0]['message']['content'].strip()
        lines = [line.strip() for line in ai_response.split('\n') if line.strip()]
        
        # Parse response
        location = next(line.split(': ', 1)[1] for line in lines if line.startswith('Location:'))
        sentiment_str = next(line.split(': ', 1)[1] for line in lines if line.startswith('Sentiment:'))
        try:
            sentiment = float(sentiment_str.split()[0])
        except ValueError:
            sentiment = 0
        
        # Parse topic
        topic = next(line.split(': ', 1)[1] for line in lines if line.startswith('Topic:'))
        
        # Parse summary
        summary = next(line.split(': ', 1)[1] for line in lines if line.startswith('Summary:'))

        # Ensure location is a valid borough
        if location not in LONDON_BOROUGHS:
            location = 'Westminster'

        return {
            "location": location,
            "sentiment": max(-1, min(1, sentiment)),
            "topic": topic if topic in ["Environment", "Urbanization", "Economy", "Society", "Other"] else "Other",
            "summary": summary
        }

    except Exception as e:
        # print(f"Error analyzing article: {e}")
        # Handle rate limiting by adding a delay
        if "429" in str(e):
            print("Rate limited, waiting 10 seconds...")
            time.sleep(10)
        
        # Safe fallback values incase of error
        safe_description = description if description else "No description available"
        safe_summary = safe_description[:200] + "..." if len(safe_description) > 200 else safe_description
        
        return {
            "location": "Westminster",
            "sentiment": 0,
            "topic": "Other", 
            "summary": safe_summary
        }