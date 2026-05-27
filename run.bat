@echo off
rem Build the executable jar
call gradlew clean bootJar
if %errorlevel% neq 0 (
    echo Build failed – aborting.
    exit /b %errorlevel%
)

rem Find the generated jar (assumes single jar in build/libs)
for %%F in (build\libs\*.jar) do set JAR=%%F

if "%JAR%"=="" (
    echo No jar found – aborting.
    exit /b 1
)

rem Run the application
java -jar "%JAR%"
