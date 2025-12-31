@echo off
REM Start Testing Script for Windows
REM Run this to begin backend testing

echo.
echo 🎯 Event Organizer Backend - Start Testing
echo ==========================================
echo.

REM Check if .env exists
if not exist .env (
    echo ⚠️  .env file not found!
    echo 📝 Creating from .env.example...
    copy .env.example .env
    echo ✅ .env created. Please edit it with your credentials:
    echo    - MONGO_URI
    echo    - JWT_SECRET
    echo    - EMAIL_USER ^& EMAIL_PASS
    echo.
    echo Then run this script again.
    pause
    exit /b 1
)

REM Check environment
echo 🔍 Validating environment configuration...
node check-env.js

echo.
echo 📚 Next Steps:
echo ----------------------------------------
echo 1. Ensure MongoDB is running:
echo    mongod
echo.
echo 2. Start the backend server:
echo    npm run start:dev
echo.
echo 3. Open test-api.http in VS Code
echo    (Install REST Client extension if needed)
echo.
echo 4. Follow QUICK_START.md for guided testing
echo.
echo 5. Or follow TESTING_CHECKLIST.md for comprehensive testing
echo.
echo 🚀 Ready to test!
echo.
pause
