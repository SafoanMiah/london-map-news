@echo off
:loop
python "%~dp0fetch_latest_news.py" 14
timeout /t 120 /nobreak >nul
goto loop 