#!/bin/bash

echo "🚀 Starting MyPadiFood Phase 1..."

# Start backend
cd backend
pnpm run dev &
BACKEND_PID=$!

# Start frontend
cd ../frontend
pnpm run dev &
FRONTEND_PID=$!

echo "✅ Backend: http://localhost:5000"
echo "✅ Frontend: http://localhost:3000"
echo "✅ Admin: http://localhost:3000/admin/login"
echo ""
echo "Press Ctrl+C to stop all servers"

trap "kill $BACKEND_PID $FRONTEND_PID; exit" INT

wait