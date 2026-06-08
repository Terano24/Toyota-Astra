@echo off
REM Cleanup script for React Firebase project

echo Starting cleanup process...

REM Remove node_modules
if exist node_modules (
    echo Removing node_modules directory...
    rmdir /s /q node_modules
    echo node_modules removed.
) else (
    echo node_modules directory not found.
)

REM Remove build directory
if exist build (
    echo Removing build directory...
    rmdir /s /q build
    echo build directory removed.
) else (
    echo build directory not found.
)

REM Clean npm cache
echo Cleaning npm cache...
npm cache clean --force

REM Remove common cache and temporary directories
for %%d in (
    ".cache"
    ".next"
    ".svelte-kit"
    "coverage"
    ".nyc_output"
) do (
    if exist "%%~d" (
        echo Removing %%~d directory...
        rmdir /s /q "%%~d"
    )
)

echo.
echo Cleanup complete!
echo To reinstall dependencies, run: npm install
echo To create a production build, run: npm run build

pause
