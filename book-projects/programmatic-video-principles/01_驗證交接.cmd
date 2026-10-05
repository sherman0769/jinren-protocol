@echo off
chcp 65001 >nul
setlocal
cd /d "%~dp0"
where py >nul 2>nul
if errorlevel 1 (set "PYTHON=python") else (set "PYTHON=py -3")
%PYTHON% scripts\validate_package.py
if errorlevel 1 goto fail
%PYTHON% -m unittest discover -s tests -v
if errorlevel 1 goto fail
echo 驗證完成。這不代表全書已寫完或 Windows 影片渲染已驗收。
pause
exit /b 0
:fail
echo 驗證未通過。請保留上方錯誤交給 Codex，不要把失敗當成成功。
pause
exit /b 1
