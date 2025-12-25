// Universal browser API (Chrome, Firefox, Edge, Brave compatible)
const api = typeof browser !== "undefined" ? browser : chrome;

console.log('ReconX Extension: Background service worker started');

// Listen for extension installation
api.runtime.onInstalled.addListener((details) => {
    console.log('ReconX Extension installed:', details);

    // Set default settings
    api.storage.local.set({
        settings: {
            autoScan: false,
            scanInterval: 60000, // 1 minute
            apiEndpoint: 'http://localhost:3001/api' // ReconX backend
        }
    });
});

// Listen for tab updates
api.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && tab.url) {
        console.log('Tab updated:', tab.url);

        // Check if auto-scan is enabled
        api.storage.local.get(['settings'], (result) => {
            if (result.settings && result.settings.autoScan) {
                // Trigger auto-scan
                performAutoScan(tabId, tab.url);
            }
        });
    }
});

// Perform automatic CVE scan
async function performAutoScan(tabId, url) {
    try {
        // Send message to content script
        const response = await api.tabs.sendMessage(tabId, {
            action: 'detectTech'
        });

        console.log('Auto-scan detected:', response);

        // Store results
        api.storage.local.set({
            [`scan_${tabId}`]: {
                url,
                timestamp: Date.now(),
                technologies: response.technologies,
                potentialCVEs: response.potentialCVEs
            }
        });

        // Show notification if vulnerabilities found
        if (response.potentialCVEs && response.potentialCVEs.length > 0) {
            api.notifications.create({
                type: 'basic',
                iconUrl: 'icons/icon-128.png',
                title: 'ReconX Alert',
                message: `Found ${response.potentialCVEs.length} potential CVEs on ${new URL(url).hostname}`,
                priority: 2
            });
        }
    } catch (error) {
        console.error('Auto-scan error:', error);
    }
}

// Listen for messages from popup/content scripts
api.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'scanCVE') {
        // Forward to ReconX API
        fetch(`${request.apiEndpoint}/scan`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                target: request.target,
                cves: request.cves
            })
        })
            .then(res => res.json())
            .then(data => sendResponse({ success: true, data }))
            .catch(error => sendResponse({ success: false, error: error.message }));

        return true; // Keep channel open for async response
    }
});
