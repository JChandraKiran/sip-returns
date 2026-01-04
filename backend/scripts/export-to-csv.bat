@echo off
REM Export PostgreSQL data to CSV for Supabase import
setlocal

set DB_USER=dcauser
set DB_HOST=localhost
set DB_NAME=dca
set DB_PORT=5432
set PGPASSWORD=kiran@0205

set OUTPUT_DIR=supabase-csv
if not exist "%OUTPUT_DIR%" mkdir "%OUTPUT_DIR%"

echo Exporting data to CSV format...
echo.

echo Exporting prices table...
psql -U %DB_USER% -h %DB_HOST% -p %DB_PORT% -d %DB_NAME% -c "COPY prices TO STDOUT WITH CSV HEADER" > "%OUTPUT_DIR%\prices.csv"

echo Exporting daily_prices table...
psql -U %DB_USER% -h %DB_HOST% -p %DB_PORT% -d %DB_NAME% -c "COPY daily_prices TO STDOUT WITH CSV HEADER" > "%OUTPUT_DIR%\daily_prices.csv"

echo Exporting current_prices table...
psql -U %DB_USER% -h %DB_HOST% -p %DB_PORT% -d %DB_NAME% -c "COPY current_prices TO STDOUT WITH CSV HEADER" > "%OUTPUT_DIR%\current_prices.csv"

echo.
echo CSV files created in %OUTPUT_DIR%
echo.
echo Next steps:
echo 1. Go to Supabase dashboard
echo 2. Use Table Editor to import these CSV files
echo Or use psql to import CSV files directly

set PGPASSWORD=
