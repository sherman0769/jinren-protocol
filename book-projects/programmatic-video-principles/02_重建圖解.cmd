@echo off
chcp 65001 >nul
setlocal
cd /d "%~dp0"
where py >nul 2>nul
if errorlevel 1 (set "PYTHON=python") else (set "PYTHON=py -3")
%PYTHON% examples\build_examples.py
if errorlevel 1 goto fail
echo 圖解已重建，請開 START_HERE.html。這個腳本不安裝套件、不呼叫 API。
pause
exit /b 0
:fail
echo 重建失敗。請檢查 Python 是否已安裝，並保存錯誤訊息。
pause
exit /b 1
