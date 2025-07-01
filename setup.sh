#!/bin/bash

# StashDog MCP Server Setup Script

set -e

echo "🚀 Setting up StashDog MCP Server..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ Node.js and npm are installed"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build the project
echo "🔨 Building the project..."
npm run build

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating environment configuration..."
    cp .env.example .env
    echo "⚠️  Please edit .env file with your StashDog API configuration"
else
    echo "✅ Environment file already exists"
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "1. Edit .env file with your StashDog API URL and credentials"
echo "2. Ensure your StashDog backend is running"
echo "3. The MCP server can be started with: npm start"
echo ""
echo "For development: npm run dev"
echo "For building: npm run build"
echo ""
echo "📖 Check README.md for detailed usage instructions"