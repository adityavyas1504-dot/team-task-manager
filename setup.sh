#!/bin/bash
echo "=== Team Task Manager Setup ==="

echo ""
echo "Installing backend dependencies..."
cd backend
npm install
cd ..

echo ""
echo "Installing frontend dependencies..."
cd frontend
npm install
cd ..

echo ""
echo "=== Setup complete! ==="
echo ""
echo "Next steps:"
echo "  1. Copy backend/.env.example to backend/.env and fill in your values"
echo "  2. Copy frontend/.env.example to frontend/.env and set REACT_APP_API_URL"
echo "  3. Start backend:  cd backend && npm run dev"
echo "  4. Start frontend: cd frontend && npm start"
echo ""
echo "Or run both together from root: npm run dev (needs concurrently installed)"
