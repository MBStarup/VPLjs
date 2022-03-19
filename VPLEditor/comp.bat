dir src\*.ts /b /s > ts-files.txt
tsc @ts-files.txt -outFile main.js
del ts-files.txt