dir src\*.ts /b /s > .vscode\ts-files.txt
call tsc -target es6 @.vscode\ts-files.txt -outFile main.js
del ".vscode\ts-files.txt" /q