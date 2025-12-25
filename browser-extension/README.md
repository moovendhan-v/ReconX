# ReconX Browser Extension 🔍

A powerful browser extension for detecting website technologies and scanning for CVE vulnerabilities in real-time.

![ReconX Extension](./icons/icon-128.png)

## Features

✅ **Technology Detection**: Automatically detects frameworks, CMS, servers, and libraries used on any website  
✅ **CVE Scanning**: Scans for 40+ known CVE vulnerabilities  
✅ **Real-Time Analysis**: Instant technology detection when you visit a website  
✅ **Beautiful UI**: Modern gradient design with intuitive interface  
✅ **Severity Classification**: Categorizes vulnerabilities as Critical, High, or Medium  
✅ **ReconX Integration**: Connects to your ReconX backend for comprehensive scanning  

## Supported Technologies

### Detected Technologies
- **Frameworks**: React, Next.js, Angular, Vue.js, jQuery
- **Servers**: Apache, Nginx, IIS
- **CMS**: WordPress, Joomla
- **Libraries**: Bootstrap, and more...

### Scanned CVEs (40+)

**Critical Vulnerabilities:**
- CVE-2025-55182 - Next.js React Server Components RCE
- CVE-2025-24813 - Apache Tomcat Deserialization RCE
- CVE-2024-24919 - Check Point VPN Gateway RCE
- CVE-2023-27524 - Apache Superset Authentication Bypass
- CVE-2021-40438 - Apache HTTP Server SSRF
- CVE-2017-7269 - IIS 6.0 WebDAV Buffer Overflow
- CVE-2015-1635 - IIS HTTP.sys RCE

**High Severity:**
- CVE-2021-24917 - WordPress Wordfence WAF Bypass
- CVE-2023-4568 - WooCommerce Payments RCE
- CVE-2023-5089 - WordPress Royal Elementor LFI
- CVE-2019-12616 - WordPress Simple Cart Path Traversal
- CVE-2015-7297 - Joomla SQL Injection

**Medium Severity:**
- CVE-2020-35489 - WordPress Contact Form 7 File Upload
- CVE-2018-11784 - Apache Tomcat Open Redirect

## Installation

### Chrome

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top-right corner)
3. Click "Load unpacked"
4. Select the `browser-extension` folder
5. The ReconX extension icon will appear in your toolbar

### Firefox

1. Open Firefox and navigate to `about:debugging#/runtime/this-firefox`
2. Click "Load Temporary Add-on"
3. Navigate to the `browser-extension` folder
4. Select the `manifest.json` file
5. The extension will be loaded temporarily

### Edge

1. Open Edge and navigate to `edge://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select the `browser-extension` folder

## Usage

### Basic Usage

1. **Visit any website**
2. **Click the ReconX extension icon** in your toolbar
3. **View detected technologies** automatically displayed
4. **Click "Scan for CVEs"** to check for vulnerabilities
5. **Review results** with color-coded severity ratings

### Features

#### Technology Detection
- Automatically runs when you visit a page
- Shows detected frameworks, CMS, servers, libraries
- Color-coded technology badges

#### CVE Scanning
- Click "Scan for CVEs" button
- Scans for all relevant CVEs based on detected technologies
- Shows vulnerability status (Vulnerable/Safe)
- Displays CVSS scores

#### Results Dashboard
- **Critical** count (red) - Immediate attention required
- **High** count (orange) - High priority fixes needed
- **Medium** count (yellow) - Should be addressed

## Configuration

### Backend Integration

The extension can connect to your ReconX backend for deep scanning:

1. Open `scripts/background.js`
2. Update the API endpoint:

```javascript
settings: {
  apiEndpoint: 'http://localhost:3000/api' // Your ReconX backend URL
}
```

### Auto-Scan Settings

Enable automatic scanning on page load:

```javascript
settings: {
  autoScan: true,
  scanInterval: 60000 // Scan every 60 seconds
}
```

## File Structure

```
browser-extension/
├── manifest.json           # Extension configuration
├── icons/                  # Extension icons
│   ├── icon-16.png
│   ├── icon-48.png
│   └── icon-128.png
├── popup/                  # Popup UI
│   └── popup.html
├── styles/                 # CSS styles
│   └── popup.css
└── scripts/                # JavaScript files
    ├── background.js       # Background service worker
    ├── content.js          # Content script (tech detection)
    └── popup.js            # Popup logic and CVE scanning
```

## How It Works

### Technology Detection

The content script (`content.js`) runs on every page and detects technologies by:

1. **DOM inspection** - Checking for framework-specific elements
2. **Global variables** - Detecting framework objects (window.React, window.Vue, etc.)
3. **Meta tags** - Reading generator meta tags
4. **Script sources** - Analyzing loaded script URLs

### CVE Mapping

Each detected technology is mapped to known CVEs:

```javascript
'WordPress': {
  detect: () => document.querySelector('link[href*="wp-content"]'),
  cves: ['CVE-2021-24917', 'CVE-2023-4568', ...]
}
```

### Scanning Process

1. **Detect technologies** on current page
2. **Map to CVEs** from database
3. **Send to backend** (optional) for deep scanning
4. **Display results** with severity ratings

## API Integration

### ReconX Backend

The extension can integrate with your ReconX backend:

```javascript
// Example API call
fetch('http://localhost:3000/api/scan', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    target: 'https://example.com',
    cves: ['CVE-2025-55182', 'CVE-2024-24919']
  })
})
```

### Response Format

```json
{
  "success": true,
  "results": [
    {
      "cveId": "CVE-2025-55182",
      "vulnerable": true,
      "severity": "CRITICAL",
      "cvss": 9.8,
      "description": "Next.js React Server Components RCE"
    }
  ]
}
```

## Development

### Prerequisites

- Node.js (for development)
- Chrome/Firefox/Edge browser
- ReconX backend (optional)

### Local Development

```bash
# Navigate to extension directory
cd browser-extension

# Make changes to source files
# Reload extension in browser to see changes
```

### Testing

1. Load extension in developer mode
2. Visit test websites
3. Check console for logs
4. Test technology detection
5. Test CVE scanning

## Screenshots

### Popup Interface

*Technology detection and CVE scanning interface with modern gradient design*

### Scan Results

*Real-time CVE vulnerability results with severity classifications*

## Security Considerations

⚠️ **For Authorized Testing Only**

This extension is designed for:
- Security research
- Authorized penetration testing
- Website auditing with permission

**Do not use for:**
- Unauthorized scanning
- Malicious purposes
- Violating terms of service

## Troubleshooting

### Extension Not Loading

- Check manifest.json syntax
- Verify file permissions
- Check browser console for errors

### Technology Detection Not Working

- Ensure content script has permissions
- Check browser console for errors
- Verify website allows content scripts

### CVE Scanning Fails

- Check backend API endpoint
- Verify network connectivity
- Check CORS settings

## Roadmap

- [ ] Add more technology signatures
- [ ] Integrate live CVE database
- [ ] Export scan results to PDF
- [ ] Add custom CVE checks
- [ ] Multi-tab scanning
- [ ] Scheduled auto-scans

## Contributing

1. Fork the repository
2. Create feature branch
3. Make changes
4. Test thoroughly
5. Submit pull request

## License

MIT License - See LICENSE file

## Author

**Moovendhan V**  
Website: https://www.cybertechmind.com

## Support

For issues and questions:
- GitHub Issues
- Contact through website

## Changelog

### v1.0.0
- Initial release
- Technology detection
- 40+ CVE scanning
- Modern UI design
- ReconX backend integration

---

**Made with ❤️ by CyberTechMind**
