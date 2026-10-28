@echo off
cd /d "%~dp0"
echo Mo http://localhost:8123 trong trinh duyet. Nhan Ctrl+C de dung.
python -m http.server 8123 --bind 127.0.0.1
pause
