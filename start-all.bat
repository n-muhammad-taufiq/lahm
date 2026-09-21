@echo off
setlocal EnableExtensions

:: Set title for launcher console
title Project Lahm - Services Launcher

:: Resolve directories using the script's home location (%~dp0)
set "ROOT_DIR=%~dp0"
set "BACKEND_DIR=%ROOT_DIR%backend"
set "FRONTEND_DIR=%ROOT_DIR%frontend"
set "CUSTOMER_DIR=%FRONTEND_DIR%\apps\customer"
set "DELIVERY_DIR=%FRONTEND_DIR%\apps\delivery"
set "MERCHANT_DIR=%FRONTEND_DIR%\apps\merchant"

:: Configured ports
set BACKEND_PORT=3000
set CUSTOMER_PORT=8081
set DELIVERY_PORT=8082
set MERCHANT_PORT=8083

:: Parse optional target and extra flags
set "TARGET=%~1"
set "EXTRA_FLAGS="

if "%TARGET%"=="-c" (
    set "EXTRA_FLAGS=-c"
    set "TARGET=all"
)
if "%TARGET%"=="--clear" (
    set "EXTRA_FLAGS=--clear"
    set "TARGET=all"
)
if "%TARGET%"=="" set "TARGET=all"

if "%~2"=="-c" set "EXTRA_FLAGS=-c"
if "%~2"=="--clear" set "EXTRA_FLAGS=--clear"

echo =====================================================================
echo                     PROJECT LAHM - SERVICE LAUNCHER
echo =====================================================================
echo.
echo  Root Directory: %ROOT_DIR%
if defined EXTRA_FLAGS echo  Flags passed to Expo: %EXTRA_FLAGS%
echo.

if /i "%TARGET%"=="backend" goto :launch_backend_only
if /i "%TARGET%"=="frontend" goto :launch_frontends_only
if /i "%TARGET%"=="frontends" goto :launch_frontends_only
if /i "%TARGET%"=="customer" goto :launch_customer_only
if /i "%TARGET%"=="delivery" goto :launch_delivery_only
if /i "%TARGET%"=="merchant" goto :launch_merchant_only
if /i "%TARGET%"=="all" goto :launch_all

echo [ERROR] Unknown option "%TARGET%".
echo Valid options: all, backend, frontend, customer, delivery, merchant
echo You can also pass -c or --clear to clear Expo cache.
goto :end

:launch_all
echo  Launching all 4 services in dedicated windows:
echo    [1/4] Backend API Server   --^> http://localhost:%BACKEND_PORT% (NestJS Dev)
echo    [2/4] Customer App         --^> http://localhost:%CUSTOMER_PORT% (Expo)
echo    [3/4] Delivery App         --^> http://localhost:%DELIVERY_PORT% (Expo)
echo    [4/4] Merchant App         --^> http://localhost:%MERCHANT_PORT% (Expo)
echo =====================================================================
echo.

call :start_backend
timeout /t 2 /nobreak >nul

call :start_customer
timeout /t 1 /nobreak >nul

call :start_delivery
timeout /t 1 /nobreak >nul

call :start_merchant
goto :finish

:launch_backend_only
echo  Launching Backend API Server only...
echo    Backend API Server --^> http://localhost:%BACKEND_PORT% (NestJS Dev)
echo =====================================================================
echo.
call :start_backend
goto :finish

:launch_frontends_only
echo  Launching all 3 frontend apps...
echo    [1/3] Customer App --^> http://localhost:%CUSTOMER_PORT% (Expo)
echo    [2/3] Delivery App --^> http://localhost:%DELIVERY_PORT% (Expo)
echo    [3/3] Merchant App --^> http://localhost:%MERCHANT_PORT% (Expo)
echo =====================================================================
echo.
call :start_customer
timeout /t 1 /nobreak >nul
call :start_delivery
timeout /t 1 /nobreak >nul
call :start_merchant
goto :finish

:launch_customer_only
echo  Launching Customer App only (Port %CUSTOMER_PORT%)...
echo =====================================================================
echo.
call :start_customer
goto :finish

:launch_delivery_only
echo  Launching Delivery App only (Port %DELIVERY_PORT%)...
echo =====================================================================
echo.
call :start_delivery
goto :finish

:launch_merchant_only
echo  Launching Merchant App only (Port %MERCHANT_PORT%)...
echo =====================================================================
echo.
call :start_merchant
goto :finish

:: -----------------------------------------------------------------------
:: Helper Subroutines
:: -----------------------------------------------------------------------
:start_backend
echo [*] Starting Backend API Server on port %BACKEND_PORT%...
start "Lahm - Backend API [Port %BACKEND_PORT%]" /D "%BACKEND_DIR%" cmd /k "title Lahm Backend API [Port %BACKEND_PORT%] && echo Starting Backend Server (NestJS dev mode)... && npm run start:dev"
exit /b 0

:start_customer
echo [*] Starting Customer App on port %CUSTOMER_PORT%...
start "Lahm - Customer App [Port %CUSTOMER_PORT%]" /D "%CUSTOMER_DIR%" cmd /k "title Lahm Customer App [Port %CUSTOMER_PORT%] && echo Starting Customer Frontend (Expo)... && npx expo start --port %CUSTOMER_PORT% %EXTRA_FLAGS%"
exit /b 0

:start_delivery
echo [*] Starting Delivery App on port %DELIVERY_PORT%...
start "Lahm - Delivery App [Port %DELIVERY_PORT%]" /D "%DELIVERY_DIR%" cmd /k "title Lahm Delivery App [Port %DELIVERY_PORT%] && echo Starting Delivery Frontend (Expo)... && npx expo start --port %DELIVERY_PORT% %EXTRA_FLAGS%"
exit /b 0

:start_merchant
echo [*] Starting Merchant App on port %MERCHANT_PORT%...
start "Lahm - Merchant App [Port %MERCHANT_PORT%]" /D "%MERCHANT_DIR%" cmd /k "title Lahm Merchant App [Port %MERCHANT_PORT%] && echo Starting Merchant Frontend (Expo)... && npx expo start --port %MERCHANT_PORT% %EXTRA_FLAGS%"
exit /b 0

:finish
echo.
echo =====================================================================
echo  Services have been launched in separate terminal windows!
echo =====================================================================
echo.
echo  - Backend API:    http://localhost:%BACKEND_PORT%
echo  - Customer App:   http://localhost:%CUSTOMER_PORT%
echo  - Delivery App:   http://localhost:%DELIVERY_PORT%
echo  - Merchant App:   http://localhost:%MERCHANT_PORT%
echo.
echo  Commands available in this directory:
echo    - start-all.bat            (starts all 4 services)
echo    - start-all.bat -c         (starts all with Metro bundler cache cleared)
echo    - start-all.bat backend    (starts only backend)
echo    - start-all.bat frontend   (starts all 3 frontends)
echo    - stop-all.bat             (kills processes on ports 3000, 8081-8083)
echo.
echo You can safely close this launcher window now.
echo.

:end
pause
