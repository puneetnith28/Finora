#!/bin/bash
set -e

echo "Starting Finora Platform in Production Mode via Docker Compose..."
docker compose up --build -d
echo "Finora services started successfully:"
echo " - Frontend: http://localhost:3000"
echo " - Backend API: http://localhost:8000"
echo " - API Documentation: http://localhost:8000/docs"
echo " - Health Probe: http://localhost:8000/health"
