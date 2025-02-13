# AI-Powered London News Map

## Overview
An intelligent news aggregation and visualization platform that helps London residents navigate local news through AI-powered analysis and geospatial mapping. The system processes news from multiple sources, analyzes content using LLMs, and presents information through an intuitive map interface.

## System Architecture

### 1. Data Collection Pipeline
- **RSS Feed Integration**
  - BBC London News (primary source)
  - MyLondon News (local focus)
  - Automated 30-minute refresh cycles
  - XML parsing and standardization
  - Deduplication via link tracking

### 2. Processing Pipeline
**Stage 1: Content Extraction**
- Custom HTML parsing per source
- Thumbnail extraction
- Publication date normalization
- Link validation

**Stage 2: AI Analysis (Groq API - Mixtral-8x7b)**
- Location Detection (33 London Boroughs)
- Sentiment Analysis (-1 to 1 scale)
- Topic Classification:
  - Environment
  - Urbanization
  - Economy
  - Society
  - Other
- Summary Generation (50-word limit)

**Stage 3: Data Storage**
PostgreSQL Database Structure:
1. `proc_news_articles` (Processed Data)
   - UUID Primary Key
   - Title, Link, Publication Date
   - AI-Generated Summary
   - Location (Borough)
   - Sentiment Score
   - Topic Category
   - Thumbnail URL

2. `full_news_articles` (Raw Data)
   - UUID (Foreign Key)
   - Full Description
   - Original Content

### 3. Frontend Architecture
**React + Vite + ShadcN UI**
- Interactive London Borough Map (D3.js)
- Real-time News Updates
- Filtering Capabilities:
  - Borough-based
  - Topic-based
  - Sentiment-based
  - Date range
- Mobile-responsive design

## Technical Implementation

### Backend (FastAPI)
- Rate-limited API endpoints
- Async processing
- Error handling with retries
- Caching layer
- Borough validation
- Sentiment normalization

### Database Optimization
- UUID-based indexing
- Foreign key constraints
- Timestamp-based partitioning
- Query optimization
- Regular cleanup of old entries

### Frontend Features
- SSR for SEO optimization
- Progressive loading
- Local storage caching
- Responsive image loading
- Error boundary implementation

## Performance Considerations
1. **API Rate Limiting**
   - Groq API: 100 requests/minute
   - RSS Feeds: 30-minute intervals
   - Frontend requests: 60/minute/IP

2. **Database Optimization**
   - Indexed queries
   - Connection pooling
   - Regular vacuum
   - Monthly archiving

3. **Frontend Performance**
   - Code splitting
   - Image lazy loading
   - Service worker caching
   - Memory leak prevention

## Deployment
- Backend: Railway
- Frontend: Vercel
- Database: Supabase
- LLM API: Groq
- Monitoring: Grafana

## Future Enhancements
1. Additional News Sources
2. Historical Data Analysis
3. User Customization
4. Mobile App Development
5. Advanced NLP Features

## Setup Requirements
- Node.js ≥ 18
- Python ≥ 3.9
- PostgreSQL ≥ 14
- Environment Variables:
  - `GROQ_API_KEY`
  - `SUPABASE_URL`
  - `SUPABASE_KEY`
  - `RSS_REFRESH_INTERVAL`

## License
MIT License