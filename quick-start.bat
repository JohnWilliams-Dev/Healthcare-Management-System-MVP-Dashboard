@echo off
REM Healthcare Management System MVP UI - Quick Start Script for Windows

echo =========================================
echo Healthcare Management System MVP UI - Quick Start
echo =========================================
echo.

REM Check if node is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo X Node.js is not installed. Please install Node.js 18+ first.
    exit /b 1
)

for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
echo √ Node.js version: %NODE_VERSION%
echo.

REM Check if we're in the admin-ui directory
if not exist "package.json" (
    echo X Please run this script from the admin-ui directory
    exit /b 1
)

REM Install dependencies
echo Installing dependencies...
call npm install

if %ERRORLEVEL% NEQ 0 (
    echo X Failed to install dependencies
    exit /b 1
)

echo √ Dependencies installed successfully
echo.

REM Create .env file if it doesn't exist
if not exist ".env" (
    echo Creating .env file...
    copy .env.example .env
    echo √ .env file created
) else (
    echo √ .env file already exists
)

echo.
echo =========================================
echo Setup Complete!
echo =========================================
echo.
echo To start the development server, run:
echo   npm run dev
echo.
echo The application will be available at:
echo   http://localhost:3000
echo.
echo Make sure the Healthcare Management System backend is running on:
echo   http://localhost:3000
echo.
echo =========================================
pause
