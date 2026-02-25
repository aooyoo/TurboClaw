#!/bin/bash
# TurboClaw build script - builds the app and bundles picoclaw binary for multiple architectures
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$SCRIPT_DIR"
VERSION="1.0.0"

build_for_arch() {
    local ARCH=$1
    local PICOCLAW_BIN=$2
    
    echo "========================================"
    echo "🚀 Starting build for macOS $ARCH..."
    echo "========================================"

    if [ ! -f "$PICOCLAW_BIN" ]; then
        echo "❌ picoclaw binary not found at: $PICOCLAW_BIN"
        echo "Please place the correct picoclaw binary there."
        exit 1
    fi

    echo "🔨 Building TurboClaw ($ARCH)..."
    wails build -platform "darwin/$ARCH"

    APP_BUNDLE="$PROJECT_DIR/build/bin/TurboClaw.app"
    MACOS_DIR="$APP_BUNDLE/Contents/MacOS"

    # Copy picoclaw into app bundle
    echo "📦 Bundling picoclaw binary ($ARCH)..."
    cp "$PICOCLAW_BIN" "$MACOS_DIR/picoclaw"
    chmod +x "$MACOS_DIR/picoclaw"

    # Ad-hoc sign the entire app bundle (for distribution without Apple Developer ID)
    echo "🔏 Signing app bundle (ad-hoc)..."
    codesign --force --deep -s - "$APP_BUNDLE"

    echo "✅ Build complete for $ARCH!"
    
    # Package as zip for distribution
    ZIP_NAME="TurboClaw_${VERSION}_${ARCH}.zip"
    ZIP_PATH="$PROJECT_DIR/build/bin/$ZIP_NAME"
    echo "📦 Packaging for distribution..."
    cd "$PROJECT_DIR/build/bin"
    rm -f "$ZIP_NAME"
    ditto -c -k --sequesterRsrc --keepParent "TurboClaw.app" "$ZIP_NAME"
    
    cd "$PROJECT_DIR"
    echo "✅ Distribution package: $ZIP_PATH"
    echo ""
}

build_windows() {
    local ARCH=$1
    local PICOCLAW_BIN=$2
    
    echo "========================================"
    echo "🚀 Starting build for Windows $ARCH..."
    echo "========================================"

    if [ ! -f "$PICOCLAW_BIN" ]; then
        echo "❌ picoclaw binary not found at: $PICOCLAW_BIN"
        echo "Please place the correct picoclaw binary there."
        exit 1
    fi

    echo "🔨 Building TurboClaw (Windows $ARCH)..."
    wails build -platform "windows/$ARCH"

    APP_EXE="$PROJECT_DIR/build/bin/TurboClaw.exe"

    if [ ! -f "$APP_EXE" ]; then
        echo "❌ Build failed or TurboClaw.exe not found."
        exit 1
    fi

    # Create a staging directory
    STAGE_DIR="$PROJECT_DIR/build/bin/TurboClaw-Windows-$ARCH"
    rm -rf "$STAGE_DIR"
    mkdir -p "$STAGE_DIR"

    # Copy binary and engine
    echo "📦 Bundling picoclaw binary (Windows $ARCH)..."
    cp "$APP_EXE" "$STAGE_DIR/TurboClaw.exe"
    cp "$PICOCLAW_BIN" "$STAGE_DIR/picoclaw.exe"

    echo "✅ Build complete for Windows $ARCH!"
    
    # Package as zip for distribution
    ZIP_NAME="TurboClaw_${VERSION}_windows_${ARCH}.zip"
    ZIP_PATH="$PROJECT_DIR/build/bin/$ZIP_NAME"
    echo "📦 Packaging for distribution..."
    cd "$PROJECT_DIR/build/bin"
    rm -f "$ZIP_NAME"
    zip -r "$ZIP_NAME" "TurboClaw-Windows-$ARCH"
    
    cd "$PROJECT_DIR"
    echo "✅ Distribution package: $ZIP_PATH"
    echo ""
}

# The expected paths to the core picoclaw engine binaries
PICOCLAW_ARM64="$(dirname "$PROJECT_DIR")/picoclaw-darwin-arm64"
PICOCLAW_AMD64="$(dirname "$PROJECT_DIR")/picoclaw-darwin-amd64"
PICOCLAW_WIN_AMD64="$(dirname "$PROJECT_DIR")/picoclaw.exe"

# Clean previous builds
echo "🧹 Cleaning previous builds..."
rm -rf "$PROJECT_DIR/build/bin/TurboClaw.app"
rm -rf "$PROJECT_DIR/build/bin/TurboClaw.exe"
rm -rf "$PROJECT_DIR/build/bin/TurboClaw-Windows-"*

# Build both architectures
build_for_arch "arm64" "$PICOCLAW_ARM64"
build_for_arch "amd64" "$PICOCLAW_AMD64"
build_windows "amd64" "$PICOCLAW_WIN_AMD64"

echo "🎉 All builds finished successfully! You can find the packages in build/bin/"
