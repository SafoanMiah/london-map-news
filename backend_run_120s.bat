@echo off
:loop
python "backend/insert_to_db.py"
python "backend/fetch_latest_news.py" 14
timeout /t 120 /nobreak >nul
goto loop