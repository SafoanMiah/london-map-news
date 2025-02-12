@echo off
:loop
python "insert_to_db.py"
python "fetch_latest_news.py" 14
timeout /t 120 /nobreak >nul
goto loop 