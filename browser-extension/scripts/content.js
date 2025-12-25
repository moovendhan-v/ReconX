// Universal browser API (Chrome, Firefox, Edge, Brave compatible)
const api = typeof browser !== "undefined" ? browser : chrome;

console.log('ReconX Extension: Content script loaded');

// Technology detection patterns
const techSignatures = {
    frameworks: {
        'React': {
            detect: () => {
                return !!(window.React || document.querySelector('[data-reactroot]') ||
                    document.querySelector('[data-react-checksum]'));
            },
            cves: ['CVE-2025-55182'] // Next.js RSC RCE
        },
        'Next.js': {
            detect: () => {
                return !!(window.__NEXT_DATA__ || document.getElementById('__next'));
            },
            cves: ['CVE-2025-55182']
        },
        'Angular': {
            detect: () => {
                return !!(window.ng || document.querySelector('[ng-version]'));
            },
            cves: []
        },
        'Vue.js': {
            detect: () => {
                return !!(window.Vue || document.querySelector('[data-v-]'));
            },
            cves: []
        },
        'jQuery': {
            detect: () => {
                return !!(window.jQuery || window.$);
            },
            cves: []
        }
    },
    servers: {
        'Apache': {
            detect: () => {
                const server = document.querySelector('meta[name="generator"]');
                return server && server.content.includes('Apache');
            },
            cves: ['CVE-2021-40438', 'CVE-2018-11784']
        },
        'Nginx': {
            detect: () => {
                return document.cookie.includes('nginx');
            },
            cves: []
        },
        'IIS': {
            detect: () => {
                return document.querySelector('meta[name="generator"][content*="IIS"]') !== null;
            },
            cves: ['CVE-2017-7269', 'CVE-2015-1635']
        }
    },
    cms: {
        'WordPress': {
            detect: () => {
                return !!(document.querySelector('link[href*="wp-content"]') ||
                    document.querySelector('script[src*="wp-includes"]'));
            },
            cves: ['CVE-2021-24917', 'CVE-2023-4568', 'CVE-2020-35489', 'CVE-2023-5089', 'CVE-2019-12616']
        },
        'Joomla': {
            detect: () => {
                return !!(window.Joomla || document.querySelector('meta[name="generator"][content*="Joomla"]'));
            },
            cves: ['CVE-2015-7297']
        }
    },
    libraries: {
        'Bootstrap': {
            detect: () => {
                return document.querySelector('link[href*="bootstrap"]') !== null;
            },
            cves: []
        }
    }
};

// Detect all technologies on the current page
function detectTechnologies() {
    const detected = {
        technologies: [],
        potentialCVEs: []
    };

    // Check all categories
    for (const [category, techs] of Object.entries(techSignatures)) {
        for (const [name, config] of Object.entries(techs)) {
            try {
                if (config.detect()) {
                    detected.technologies.push({
                        name,
                        category,
                        cves: config.cves
                    });
                    detected.potentialCVEs.push(...config.cves);
                }
            } catch (e) {
                console.error(`Error detecting ${name}:`, e);
            }
        }
    }

    // Deduplicate CVEs
    detected.potentialCVEs = [...new Set(detected.potentialCVEs)];

    return detected;
}

// Listen for messages from popup
api.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'detectTech') {
        const result = detectTechnologies();
        sendResponse(result);
    }

    if (request.action === 'getPageInfo') {
        sendResponse({
            url: window.location.href,
            protocol: window.location.protocol,
            hostname: window.location.hostname,
            title: document.title
        });
    }

    return true; // Keep message channel open
});

// Auto-detect on page load
window.addEventListener('load', () => {
    const detected = detectTechnologies();
    console.log('Technologies detected:', detected);

    // Store in chrome storage
    api.storage.local.set({
        lastScan: {
            url: window.location.href,
            timestamp: Date.now(),
            technologies: detected.technologies,
            potentialCVEs: detected.potentialCVEs
        }
    });
});
