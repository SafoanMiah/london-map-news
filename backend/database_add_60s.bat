@echo off
:loop
python "%~dp0insert_to_db.py"
timeout /t 60 /nobreak >nul
goto loop