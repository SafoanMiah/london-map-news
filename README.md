# London News Sentiment Analysis

## Project Overview
This application fetches news from RSS feeds, analyzes sentiment and topics using Groq API, and visualizes the results on an interactive map.

## Setup Instructions

### Prerequisites
- Python 3.12+
- Node.js 16+
- npm
- Supabase account (free)
- Groq API key (free)

### Environment Setup
1. Clone the repository
2. Create `.env` files:

For the backend copy from `.env.example`:
```js
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key
GROQ_API_KEY=your_groq_api_key
GROQ_API_URL=https://api.groq.com/openai/v1/chat/completions
```

### Database Setup
The project uses Supabase for data storage. Two tables are needed:
- `proc_news_articles`: Stores processed articles with sentiment, topic, and location
- `full_news_articles`: Stores the original article content
- Copy SQL code from `create_db` and run on supabase

### Installing Requirements

1. Install Python dependencies:
```bash
pip install -r requirements.txt
```

2. Install Node.js dependencies:
```bash
cd website
npm install
```

### Running the Application

1. Start the backend services:
```bat
backend_run_120s.bat
```

2. Run the frontend:
```bash
cd website
npm run dev
```

The application should now be available at `http://localhost:8080`

## Features
- Sentiment analysis by borough
- Topic classification
- Interactive map visualization
- Latest news feed
- Borough specific news filtering

## Notes
- The application fetches from BBC London and MyLondon RSS feeds
- The sentiment analysis uses Mixtral-8x7b via Groq API
- The frontend is built with React/TypeScript and D3.js