#!/bin/bash
# TurboClaw build script - builds the app and bundles picoclaw binary
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$SCRIPT_DIR"
PICOCLAW_BIN="$(dirname "$PROJECT_DIR")/picoclaw"
APP_BUNDLE="$PROJECT_DIR/build/bin/TurboClaw.app"
MACOS_DIR="$APP_BUNDLE/Contents/MacOS"

# Check picoclaw binary exists
if [ ! -f "$PICOCLAW_BIN" ]; then
    echo "❌ picoclaw binary not found at: $PICOCLAW_BIN"
    echo "Please place the picoclaw binary at: $PICOCLAW_BIN"
    exit 1
fi

echo "🔨 Building TurboClaw..."
wails build "$@"

# Copy picoclaw into app bundle
echo "📦 Bundling picoclaw binary..."
cp "$PICOCLAW_BIN" "$MACOS_DIR/picoclaw"
chmod +x "$MACOS_DIR/picoclaw"
codesign -s - -f "$MACOS_DIR/picoclaw"

echo "✅ Build complete! picoclaw bundled into app."
echo "   App: $APP_BUNDLE"
echo "   Contents:"
ls -lh "$MACOS_DIR/"
