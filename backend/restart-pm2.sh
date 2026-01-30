#!/bin/bash

# Script to restart PM2 process and clear logs
echo "🔄 Restarting PM2 process..."

# Stop all PM2 processes
pm2 stop all

# Clear PM2 logs
pm2 flush

# Start the application
pm2 start server.js --name "crm-backend"

# Show status
pm2 status

echo "✅ PM2 restart complete!"
echo "📝 To view logs: pm2 logs crm-backend"
echo "📊 To view status: pm2 status"