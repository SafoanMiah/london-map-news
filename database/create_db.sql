-- Put this into the SQL editor in Supabase
-- Make sure to fill in and rename .env.example to .env
--RAW TABLE
CREATE TABLE
    IF NOT EXISTS public.full_news_articles (
        id UUID REFERENCES public.proc_news_articles (id) ON DELETE CASCADE,
        full_description TEXT,
    );

--LLM PARSED
CREATE TABLE
    IF NOT EXISTS public.proc_news_articles (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4 (),
        title TEXT NOT NULL,
        link TEXT NOT NULL,
        publication_date TIMESTAMP,
        summary TEXT,
        thumbnail_url TEXT,
        location TEXT,
        sentiment FLOAT,
        topic TEXT,
        created_at TIMESTAMP DEFAULT NOW ()
    );