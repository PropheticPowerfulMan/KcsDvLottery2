@echo off
setlocal

echo Building and verifying the local static export...
call npm.cmd run build
if errorlevel 1 (
  echo.
  echo Build failed. Fix the error above before opening the app.
  exit /b 1
)

echo.
echo Starting local preview at http://localhost:4173
echo Keep this window open while testing.
echo.
call npm.cmd run preview
