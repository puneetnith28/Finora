#!/bin/bash
set -e

echo "Starting Finora Platform in Development Mode..."

# Backend startup in background
echo "Starting FastAPI Backend on :8000..."
cd backend
if [ -d "../.venv" ]; then
    ../.venv/bin/uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload &
else
    uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload &
fi
BACKEND_PID=$!
cd ..

# Frontend startup
echo "Starting Next.js Frontend on :3000..."
npm run dev &
FRONTEND_PID=$!

trap "kill $BACKEND_PID $FRONTEND_PID" EXIT
wait
