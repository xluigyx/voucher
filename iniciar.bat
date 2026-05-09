@echo off
echo ==================================================
echo Iniciando el Servidor de Guardado Local
echo ==================================================
echo.
echo Este servidor tomara las imagenes generadas y las 
echo guardara silenciosamente en la carpeta "prueba"
echo sin mostrar la ventana de descargas.
echo.

start http://localhost:8000
python server.py

if %errorlevel% neq 0 (
    echo ERROR: No se pudo iniciar el servidor. Asegurate de tener Python instalado.
    pause
)
