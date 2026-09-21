@echo off
setlocal EnableExtensions

title Project Lahm - Stop Services

echo =====================================================================
echo                     PROJECT LAHM - STOPPING SERVICES
echo =====================================================================
echo.
echo Stopping services running on ports:
echo   - 3000 (Backend API Server)
echo   - 8081 (Customer Frontend)
echo   - 8082 (Delivery Frontend)
echo   - 8083 (Merchant Frontend)
echo.

for %%P in (3000 8081 8082 8083) do (
    echo Checking port %%P...
    for /f "tokens=5" %%A in ('netstat -aon ^| findstr /c:":%%P "') do (
        if not "%%A"=="0" (
            echo   Terminating process PID %%A on port %%P...
            taskkill /F /PID %%A >nul 2>&1
        )
    )
)

echo.
echo =====================================================================
echo  All services on ports 3000, 8081, 8082, 8083 have been stopped.
echo =====================================================================
echo.
pause
