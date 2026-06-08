@echo off
echo Setting up CORS for Firebase Storage...
echo.

echo Step 1: Authenticating with Google Cloud...
gcloud auth login

echo.
echo Step 2: Setting project...
gcloud config set project astra-c196c

echo.
echo Step 3: Applying CORS configuration...
gcloud storage buckets update gs://astra-c196c.appspot.com --cors-file=cors.json

echo.
echo CORS setup complete!
pause
