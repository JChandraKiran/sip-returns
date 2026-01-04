@echo off
REM Export Data from Local PostgreSQL for Supabase Migration (Windows)
REM This script exports all necessary tables from your local PostgreSQL database

setlocal EnableDelayedExpansion

echo Starting PostgreSQL Data Export...
echo.

REM Database credentials
set DB_USER=dcauser
set DB_HOST=localhost
set DB_NAME=dca
set DB_PORT=5432

REM Output directory
set OUTPUT_DIR=supabase-export
if not exist "%OUTPUT_DIR%" mkdir "%OUTPUT_DIR%"

echo Output directory: %OUTPUT_DIR%
echo.

REM Set PGPASSWORD to avoid password prompt (use your actual password)
set PGPASSWORD=kiran@0205

REM Export all tables together
echo Exporting all tables (prices, daily_prices, current_prices)...
pg_dump -U %DB_USER% -h %DB_HOST% -p %DB_PORT% -d %DB_NAME% --data-only --column-inserts -t prices -t daily_prices -t current_prices > "%OUTPUT_DIR%\all-data.sql"

if %ERRORLEVEL% EQU 0 (
    echo All data exported to: %OUTPUT_DIR%\all-data.sql
    echo.
) else (
    echo ERROR: Failed to export data
    goto :error
)

REM Export individual tables
echo Exporting individual tables...

echo   - Exporting prices table...
pg_dump -U %DB_USER% -h %DB_HOST% -p %DB_PORT% -d %DB_NAME% --data-only --column-inserts -t prices > "%OUTPUT_DIR%\prices-data.sql"

echo   - Exporting daily_prices table...
pg_dump -U %DB_USER% -h %DB_HOST% -p %DB_PORT% -d %DB_NAME% --data-only --column-inserts -t daily_prices > "%OUTPUT_DIR%\daily_prices-data.sql"

echo   - Exporting current_prices table...
pg_dump -U %DB_USER% -h %DB_HOST% -p %DB_PORT% -d %DB_NAME% --data-only --column-inserts -t current_prices > "%OUTPUT_DIR%\current_prices-data.sql"

echo Individual tables exported
echo.

REM Get file sizes
echo Export Statistics:
echo -------------------
for %%F in ("%OUTPUT_DIR%\*.sql") do (
    echo %%~nF: %%~zF bytes
)
echo.

REM Count records
echo Record Counts:
echo -------------------
psql -U %DB_USER% -h %DB_HOST% -p %DB_PORT% -d %DB_NAME% -c "SELECT 'prices' as table_name, COUNT(*) as record_count FROM prices UNION ALL SELECT 'daily_prices', COUNT(*) FROM daily_prices UNION ALL SELECT 'current_prices', COUNT(*) FROM current_prices;"
echo.

echo Export completed successfully!
echo.
echo Next Steps:
echo 1. Create a Supabase project at https://supabase.com
echo 2. Run the schema: backend/supabase-schema.sql in Supabase SQL Editor
echo 3. Import the data using one of these methods:
echo    - Method A: Use Supabase SQL Editor (for small datasets)
echo    - Method B: Use psql CLI (recommended for large datasets):
echo      psql "postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres" ^< %OUTPUT_DIR%\all-data.sql
echo.
echo See SUPABASE_MIGRATION_GUIDE.md for detailed instructions

REM Clear password from environment
set PGPASSWORD=

goto :end

:error
echo.
echo Export failed! Please check:
echo 1. PostgreSQL is running
echo 2. Database credentials are correct
echo 3. pg_dump is installed and in PATH
set PGPASSWORD=
exit /b 1

:end
endlocal
