@echo off
title Emodev Whitelist Bot
color 0a

echo [INFO]  - Whitelist botu baslatiliyor...

node -v >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] - Node.js yuklu degil. Lutfen node.js'i https://nodejs.org/ adresinden yukleyin.
    echo [INFO]  - Node.js yuklemeden once bu bot calismaz.
    echo [INFO]  - Botun duzgun calisabilmesi icin Node.js'i yukleyin ve tekrar deneyin.
    pause
    exit /b
)

if %errorlevel% neq 0 (
    echo [ERROR] - Modul yukleme hatasi. Lutfen npm install komutunu manuel olarak calistirin.
    echo [INFO] - Hata ayiklama icin npm install komutunu calistirin.
    pause
    exit /b
)

echo [INFO] - Bot baslatiliyor...
node index.js
if %errorlevel% neq 0 (
    echo [ERROR] - Bot baslatilamadi. Hata kodu: %errorlevel%
    echo [INFO] - Hata ayiklama icin 'index.js' dosyasini kontrol edin.
    pause
    exit /b
)

echo [INFO] - Bot basariyla calisiyor.
pause