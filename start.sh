#!/bin/sh
set -e

echo "🔄 Running database migrations..."
pnpm exec prisma migrate deploy

echo "✅ Migrations complete!"
echo "🚀 Starting NestJS application..."

# Check if main.js exists
if [ ! -f "dist/src/main.js" ]; then
    echo "❌ ERROR: dist/src/main.js not found!"
    ls -la dist/src/ || echo "dist/src/ directory does not exist"
    exit 1
fi

# Start the application
exec node dist/src/main.js
