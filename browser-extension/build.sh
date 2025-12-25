#!/bin/bash
# Build script for cross-browser extension packaging

echo "🔨 Building ReconX Extension for All Browsers"
echo "=============================================="

# Create dist directory
mkdir -p dist

# Clean previous builds
rm -f dist/*.zip

# Build for Chrome/Edge/Brave (uses service_worker)
echo ""
echo "📦 Building for Chrome/Edge/Brave..."
zip -r dist/reconx-chrome-edge-brave.zip . \
  -x "dist/*" \
  -x "node_modules/*" \
  -x ".git/*" \
  -x "package.json" \
  -x "build.sh" \
  -x ".DS_Store" \
  -x "extension_icon*"

# Build for Firefox (needs background.scripts instead of service_worker)
echo ""
echo "🦊 Building for Firefox..."

# Create temporary directory for Firefox build
mkdir -p dist/firefox-temp

# Copy all files
cp -r popup scripts styles icons manifest.json README.md dist/firefox-temp/

# Modify manifest.json for Firefox compatibility
cat > dist/firefox-temp/manifest.json << 'EOF'
{
  "manifest_version": 3,
  "name": "ReconX CVE Scanner",
  "version": "1.0.0",
  "description": "Detect website technologies and scan for CVE vulnerabilities in real-time",
  "permissions": [
    "activeTab",
    "tabs",
    "storage",
    "webRequest"
  ],
  "host_permissions": [
    "http://*/*",
    "https://*/*"
  ],
  "background": {
    "scripts": ["scripts/background.js"]
  },
  "content_scripts": [
    {
      "matches": ["<all_urls>"],
      "js": ["scripts/content.js"],
      "run_at": "document_end"
    }
  ],
  "action": {
    "default_popup": "popup/popup.html",
    "default_icon": {
      "16": "icons/icon-16.png",
      "48": "icons/icon-48.png",
      "128": "icons/icon-128.png"
    }
  },
  "icons": {
    "16": "icons/icon-16.png",
    "48": "icons/icon-48.png",
    "128": "icons/icon-128.png"
  }
}
EOF

# Zip Firefox version
cd dist/firefox-temp
zip -r ../reconx-firefox.zip .
cd ../..

# Clean up temp directory
rm -rf dist/firefox-temp

echo ""
echo "✅ Build Complete!"
echo ""
echo "📦 Packages created:"
echo "  - dist/reconx-chrome-edge-brave.zip (Chrome, Edge, Brave, Opera)"
echo "  - dist/reconx-firefox.zip (Firefox - with background.scripts)"
echo ""
echo "📤 Upload Instructions:"
echo ""
echo "Chrome Web Store:"
echo "  https://chrome.google.com/webstore/devconsole"
echo ""
echo "Firefox Add-ons:"
echo "  https://addons.mozilla.org/developers/"
echo ""
echo "Edge Add-ons:"
echo "  https://partner.microsoft.com/dashboard/microsoftedge"
echo ""
echo "🎉 Done! Your extension is cross-browser compatible!"
