@echo off
setlocal

echo Construction et verification de l'export local...
call npm.cmd run build
if errorlevel 1 (
  echo.
  echo La construction a echoue. Corrigez l'erreur ci-dessus avant d'ouvrir l'application.
  exit /b 1
)

echo.
echo Lancement de l'aperçu local sur http://localhost:4173
echo Gardez cette fenetre ouverte pendant les tests.
echo.
call npm.cmd run preview
