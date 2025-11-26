#!/bin/bash

# Healthcare Management System MVP UI - Quick Start Script

echo "========================================="
echo "Healthcare Management System MVP UI - Quick Start"
echo "========================================="
echo ""

# Check if node is installed
if ! command -v node &> /dev/null
then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

echo "✓ Node.js version: $(node --version)"
echo ""

# Check if we're in the admin-ui directory
if [ ! -f "package.json" ]; then
    echo "❌ Please run this script from the admin-ui directory"
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo "✓ Dependencies installed successfully"
echo ""

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    echo "📝 Creating .env file..."
    cp .env.example .env
    echo "✓ .env file created"
else
    echo "✓ .env file already exists"
fi

echo ""
echo "========================================="
echo "✅ Setup Complete!"
echo "========================================="
echo ""
echo "To start the development server, run:"
echo "  npm run dev"
echo ""
echo "The application will be available at:"
echo "  http://localhost:3000"
echo ""
echo "Make sure the Healthcare Management System backend is running on:"
echo "  http://localhost:3000"
echo ""
echo "========================================="
