@echo off
setlocal EnableDelayedExpansion

:: --- DEFAULT SETTINGS ---
set "STARTING_PORT=80"
set "DEFAULT_INDEX=index.html"

:: --- SELF-ELEVATE TO ADMIN ---
>nul 2>&1 "%SYSTEMROOT%\system32\cacls.exe" "%SYSTEMROOT%\system32\config\system"
if '%errorlevel%' NEQ '0' (
    goto UACPrompt
) else ( goto gotAdmin )
:UACPrompt
    echo Set UAC = CreateObject^("Shell.Application"^) > "%temp%\getadmin.vbs"
    echo UAC.ShellExecute "%~s0", "", "", "runas", 1 >> "%temp%\getadmin.vbs"
    "%temp%\getadmin.vbs"
    exit /B
:gotAdmin
    if exist "%temp%\getadmin.vbs" ( del "%temp%\getadmin.vbs" )
    pushd "%~dp0"

:: --- GENERATE CORE SERVER ENGINE ---
echo import http.server, socketserver, os, socket, sys > core_server.py
echo class MyHandler^(http.server.SimpleHTTPRequestHandler^): >> core_server.py
echo     def do_GET^(self^): >> core_server.py
echo         index_page = sys.argv[4] >> core_server.py
echo         if self.path == f'/{index_page}': >> core_server.py
echo             self.send_response^(301^) >> core_server.py
echo             self.send_header^('Location', '/'^) >> core_server.py
echo             self.end_headers^(^) >> core_server.py
echo             return >> core_server.py
echo         if self.path == '/': >> core_server.py
echo             self.path = f'/{index_page}' >> core_server.py
echo             return super^(^).do_GET^(^) >> core_server.py
echo         for ext in ['.html', '.png', '.js']: >> core_server.py
echo             if self.path.endswith^(ext^): >> core_server.py
echo                 self.send_response^(301^) >> core_server.py
echo                 self.send_header^('Location', self.path[:-len^(ext^)]^) >> core_server.py
echo                 self.end_headers^(^) >> core_server.py
echo                 return >> core_server.py
echo         f = self.translate_path^(self.path^) >> core_server.py
echo         if not os.path.exists^(f^): >> core_server.py
echo             for ext in ['.html', '.png', '.js']: >> core_server.py
echo                 if os.path.exists^(f + ext^): >> core_server.py
echo                     self.path += ext >> core_server.py
echo                     break >> core_server.py
echo         return super^(^).do_GET^(^) >> core_server.py
echo if __name__ == '__main__': >> core_server.py
echo     domain = sys.argv[1] >> core_server.py
echo     bind_host = sys.argv[2] >> core_server.py
echo     port = int^(sys.argv[3]^) >> core_server.py
echo     print^("\n=================================================="^) >> core_server.py
echo     print^(f"  BCSdevloper™ ENGINE RUNNING: {domain}"^) >> core_server.py
echo     print^("=================================================="^) >> core_server.py
echo     if port == 80: >> core_server.py
echo         print^(f"PC Domain: http://{domain}"^) >> core_server.py
echo     else: >> core_server.py
echo         print^(f"PC Domain: http://{domain}:{port}"^) >> core_server.py
echo     if bind_host == "0.0.0.0": >> core_server.py
echo         s = socket.socket^(socket.AF_INET, socket.SOCK_DGRAM^) >> core_server.py
echo         try: >> core_server.py
echo             s.connect^(^("8.8.8.8", 80^)^) >> core_server.py
echo             ip = s.getsockname^(^)[0] >> core_server.py
echo         except Exception: >> core_server.py
echo             ip = "UNKNOWN" >> core_server.py
echo         finally: >> core_server.py
echo             s.close^(^) >> core_server.py
echo         if port == 80: >> core_server.py
echo             print^(f"Wi-Fi Devices type this: http://{ip}"^) >> core_server.py
echo         else: >> core_server.py
echo             print^(f"Wi-Fi Devices type this: http://{ip}:{port}"^) >> core_server.py
echo     socketserver.TCPServer^(^(bind_host, port^), MyHandler^).serve_forever^(^) >> core_server.py

:main_menu
cls
echo ==================================================
echo           SMART SERVER MANAGER (MULTI-MODE)
echo ==================================================
echo.
echo Please select your mode first:
echo [1] General Mode (Internal PC Only - High Security)
echo [2] Advanced Mode (Live on Wi-Fi - Access from Phones/Scanners)
echo [3] Settings (Manage Domains, Ports, and Defaults)
echo [4] Exit
echo.
set /p mainchoice="Choose an option (1-4): "

if "%mainchoice%"=="1" (
    set "BIND_HOST=127.0.0.1"
    goto start_servers
)
if "%mainchoice%"=="2" (
    set "BIND_HOST=0.0.0.0"
    goto start_servers
)
if "%mainchoice%"=="3" goto settings_menu
if "%mainchoice%"=="4" exit
goto main_menu

:settings_menu
cls
echo ==================================================
echo           SERVER CONFIGURATION
echo ==================================================
echo.
echo Current Starting Port: %STARTING_PORT%
echo Current Default Page:  %DEFAULT_INDEX%
echo.
echo [1] Create a New Custom Domain
echo [2] Delete Custom Domains (Supports Multiple)
echo [3] Change Starting Port
echo [4] Change Default Index Page
echo [5] Back to Main Menu
echo.
set /p setchoice="Choose an option (1-5): "

if "%setchoice%"=="1" goto create_new
if "%setchoice%"=="2" goto delete_domain
if "%setchoice%"=="3" goto change_port
if "%setchoice%"=="4" goto change_index
if "%setchoice%"=="5" goto main_menu
goto settings_menu

:change_port
echo.
set /p STARTING_PORT="Enter new starting port (e.g., 80, 8000, 3000): "
echo Port updated!
pause
goto settings_menu

:change_index
echo.
set /p DEFAULT_INDEX="Enter new default page (e.g., index.html, main.html): "
echo Default page updated!
pause
goto settings_menu

:create_new
echo.
set /p domain="Enter your new domain (e.g., barodashop1.com): "
powershell -Command "$l = '127.0.0.1 %domain%'; if (-not (Select-String -Path C:\Windows\System32\drivers\etc\hosts -Pattern $l -Quiet)) { Add-Content -Path C:\Windows\System32\drivers\etc\hosts -Value \"`n$l\" }"
echo.
echo Domain %domain% added successfully!
pause
goto settings_menu

:start_servers
echo.
echo ==================================================
echo           SELECT DOMAINS TO START
echo ==================================================
set count=0
for /f "tokens=2" %%a in ('findstr "127.0.0.1" C:\Windows\System32\drivers\etc\hosts ^| findstr /i /v "localhost host.docker.internal"') do (
    set /a count+=1
    set "domain_!count!=%%a"
    echo [!count!] %%a
)
if %count%==0 (
    echo No custom domains found! Please go to Settings to add one.
    pause
    goto main_menu
)
echo.
echo You can select multiple by separating with spaces (e.g., 1 2)
set /p select_idx="Select the numbers of the domains to START: "

echo.
echo Launching Servers...
set /a CURRENT_PORT=%STARTING_PORT%
for %%I in (%select_idx%) do (
    set current_domain=!domain_%%I!
    if not "!current_domain!"=="" (
        echo Starting !current_domain! on Port !CURRENT_PORT!...
        start "Server - !current_domain!" cmd /k python core_server.py "!current_domain!" "!BIND_HOST!" "!CURRENT_PORT!" "!DEFAULT_INDEX!"
        :: Auto-increment port for the next server
        set /a CURRENT_PORT+=1 
    )
)
echo.
echo All selected servers have been launched in separate windows.
pause
goto main_menu

:delete_domain
echo.
echo ==================================================
echo           DELETE CUSTOM DOMAINS
echo ==================================================
set count=0
for /f "tokens=2" %%a in ('findstr "127.0.0.1" C:\Windows\System32\drivers\etc\hosts ^| findstr /i /v "localhost host.docker.internal"') do (
    set /a count+=1
    set "domain_!count!=%%a"
    echo [!count!] %%a
)
if %count%==0 (
    echo No custom domains found!
    pause
    goto settings_menu
)
echo.
echo You can select multiple by separating with spaces (e.g., 1 2)
set /p del_idx="Select the numbers of the domains to DELETE: "

echo.
for %%I in (%del_idx%) do (
    set del_domain=!domain_%%I!
    if not "!del_domain!"=="" (
        echo Deleting !del_domain! from hosts file...
        powershell -Command "$lines = Get-Content -Path 'C:\Windows\System32\drivers\etc\hosts'; $lines | Where-Object { $_ -notmatch '\b!del_domain!\b' } | Set-Content -Path 'C:\Windows\System32\drivers\etc\hosts'"
    )
)
echo.
echo Selected domains deleted successfully!
pause
goto settings_menu