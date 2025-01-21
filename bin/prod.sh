#!/bin/bash

# Check if NODE_ENV is production
if [ "$NODE_ENV" = "production" ]; then
    echo "🚀 Running in production mode - executing Prisma commands"
    pnpm prisma generate
    pnpm prisma migrate deploy
    
    echo "🎯 Deploying trigger.dev jobs"
    npx trigger.dev@latest deploy
else
    echo "⚠️ Not in production mode - skipping Prisma commands"
    exit 0
fi
