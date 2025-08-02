#!/bin/bash

echo "🚀 Starting Chrome with remote debugging..."

# Kill any existing Chrome processes (optional)
# pkill -f "Google Chrome"

# Start Chrome with remote debugging
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
    --remote-debugging-port=9222 \
    --user-data-dir="./chrome-debug" \
    --no-first-run \
    --no-default-browser-check \
    --disable-default-apps \
    --disable-popup-blocking \
    --disable-web-security \
    --disable-features=VizDisplayCompositor \
    --disable-background-timer-throttling \
    --disable-backgrounding-occluded-windows \
    --disable-renderer-backgrounding &

echo "✅ Chrome started with remote debugging on port 9222"
echo "🌐 You can now use the automation system!"
echo "📝 To verify, visit: http://localhost:9222/json" 