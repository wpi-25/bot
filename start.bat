@echo off
title Co25 Bot
:loop
call ts-node index
if %ErrorLevel% NEQ 1 goto loop
echo BOT CRASHED
timeout /t -1