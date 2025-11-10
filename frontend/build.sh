#!/bin/bash
# Production build script for W3JDev United

echo "🏗️  Building W3JDev United for production..."

# Clean previous build
echo "🧹 Cleaning previous build..."
rm -rf dist

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build
echo "🔨 Building application..."
npm run build

# Check build success
if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    echo "📁 Output: ./dist"
    echo "📊 Build size:"
    du -sh dist
else
    echo "❌ Build failed!"
    exit 1
fi
