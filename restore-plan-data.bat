@echo off
chcp 65001 >nul
echo ==============================
echo   Little Plan 数据恢复工具
echo ==============================
echo.

set "OLD=%APPDATA%\great-plan\plan-data.json"
set "NEW_DIR=%APPDATA%\little-plan"
set "NEW=%NEW_DIR%\plan-data.json"

if not exist "%OLD%" (
    echo [错误] 找不到旧版数据文件：
    echo   %OLD%
    echo.
    echo 可能数据已经在新版本中，或从未安装过旧版本。
    pause
    exit /b 1
)

if not exist "%NEW_DIR%" (
    mkdir "%NEW_DIR%"
)

if exist "%NEW%" (
    echo [提示] 新版本已有数据文件，将备份后再恢复。
    copy "%NEW%" "%NEW_DIR%\plan-data.backup.json" >nul
    echo   已备份至：%NEW_DIR%\plan-data.backup.json
    echo.
)

copy "%OLD%" "%NEW%" >nul
echo [成功] 数据已恢复！
echo   从：%OLD%
echo   至：%NEW%
echo.
echo 请重新启动 Little Plan 即可看到之前的数据。
pause
