#!/bin/bash

echo "========================================"
echo "   Hello Madurai - Development Server"
echo "========================================"
echo

echo "Checking Node.js version..."
node --version
echo

echo "Installing dependencies..."
npm install
echo

echo "Starting development server..."
echo
echo "Frontend will be available at:"
echo "- English: http://localhost:3000/en"
echo "- Tamil: http://localhost:3000/ta"
echo "- Admin Panel: http://localhost:3000/admin"
echo
echo "Press Ctrl+C to stop the server"
echo

npm run dev
