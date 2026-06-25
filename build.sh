#!/bin/bash
set -e

echo "=== Building React frontend ==="
cd frontend
npm install
npm run build
echo "=== Frontend built successfully ==="

cd ..

echo "=== Installing Python dependencies ==="
cd backend
pip install -r requirements.txt
echo "=== Backend ready ==="

echo "=== Build complete! Starting server... ==="
