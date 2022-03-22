dir src\*.ts /b /s > .vscode\ts-files.txt
call tsc @.vscode\ts-files.txt -outFile main.js
del ".vscode\ts-files.txt" /q