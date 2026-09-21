@echo off
setlocal EnableExtensions

title Project Lahm - Setup Windows Autostart

set "STARTUP_DIR=%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup"
set "OLD_SHORTCUT=%STARTUP_DIR%\start-all.lnk"
set "NEW_SHORTCUT=%STARTUP_DIR%\Antigravity-Project-Lahm.lnk"
set "APP_EXE=%LOCALAPPDATA%\Programs\Antigravity IDE\Antigravity IDE.exe"
set "PROJECT_DIR=%~dp0"
if "%PROJECT_DIR:~-1%"=="\" set "PROJECT_DIR=%PROJECT_DIR:~0,-1%"

echo =====================================================================
echo          PROJECT LAHM - AUTOSTART CONFIGURATION
echo =====================================================================
echo.

:: 1. Remove old start-all.lnk (external CMD launcher) if present
if exist "%OLD_SHORTCUT%" (
    echo [*] Removing previous start-all.lnk from Startup folder...
    del /f /q "%OLD_SHORTCUT%"
)

:: 2. Verify Antigravity executable exists
if not exist "%APP_EXE%" (
    echo [ERROR] Antigravity IDE executable not found at:
    echo         "%APP_EXE%"
    pause
    exit /b 1
)

:: 3. Create shortcut in Windows Startup folder
echo [*] Creating Antigravity startup shortcut...
powershell -NoProfile -ExecutionPolicy Bypass -Command "$ws = New-Object -ComObject WScript.Shell; $s = $ws.CreateShortcut('%NEW_SHORTCUT%'); $s.TargetPath = '%APP_EXE%'; $s.Arguments = '\"%PROJECT_DIR%\"'; $s.WorkingDirectory = '%PROJECT_DIR%'; $s.IconLocation = '%APP_EXE%,0'; $s.Save();"

if exist "%NEW_SHORTCUT%" (
    echo [SUCCESS] Windows startup shortcut successfully created!
    echo.
    echo Shortcut Location: "%NEW_SHORTCUT%"
    echo Opens Folder:      "%PROJECT_DIR%"
) else (
    echo [ERROR] Could not create shortcut in "%STARTUP_DIR%".
)

echo.
echo =====================================================================
echo  How it works on Windows boot:
echo    1. Windows starts and launches Antigravity IDE automatically.
echo    2. Antigravity opens the Project Lahm workspace.
echo    3. Antigravity's integrated terminal automatically runs 4 tabs:
echo         - Tab 1: Backend API Server (NestJS, Port 3000)
echo         - Tab 2: Customer App (Expo, Port 8081)
echo         - Tab 3: Delivery App (Expo, Port 8082)
echo         - Tab 4: Merchant App (Expo, Port 8083)
echo =====================================================================
echo.
pause
