// Universal browser API
// (Chrome, Firefox, Edge, Brave compatible)
const api = typeof browser !== "undefined" ? browser : chrome;

console.log('ReconX Dynamic CVE Extension loaded');

// State
let currentTab;
let availableCVEs = [];
let selectedCVE = null;
let cveInputs = {};
const BACKEND_URL = 'http://localhost:3001';

// DOM elements
const elements = {
    targetUrl: document.getElementById('targetUrl'),
    autoDetect: document.getElementById('autoDetect'),
    exploitList: document.getElementById('exploitList'),
    exploitCount: document.getElementById('exploitCount'),
    refreshExploitsBtn: document.getElementById('refreshExploitsBtn'),
    executeBtn: document.getElementById('executeBtn'),
    clearLogsBtn: document.getElementById('clearLogsBtn'),
    exportBtn: document.getElementById('exportBtn'),
    logsContainer: document.getElementById('logsContainer'),
    scanStatus: document.getElementById('scanStatus'),
    statsSection: document.getElementById('statsSection'),
    statTotal: document.getElementById('statTotal'),
    statSuccess: document.getElementById('statSuccess'),
    statFailed: document.getElementById('statFailed'),
    statDuration: document.getElementById('statDuration')
};

// Get current tab
api.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    currentTab = tabs[0];
    if (elements.autoDetect.checked && currentTab) {
        const url = new URL(currentTab.url);
        elements.targetUrl.value = `${url.protocol}//${url.hostname}`;
    }
});

// Auto-detect checkbox
elements.autoDetect.addEventListener('change', (e) => {
    if (e.target.checked && currentTab) {
        const url = new URL(currentTab.url);
        elements.targetUrl.value = `${url.protocol}//${url.hostname}`;
    }
});

// Load CVEs on startup
loadCVEs();

// Fetch available CVEs
async function loadCVEs() {
    try {
        elements.exploitList.innerHTML = '<div class="loading">Loading CVEs...</div>';

        const response = await fetch(`${BACKEND_URL}/cves/list`);
        const data = await response.json();

        availableCVEs = data.cves;
        elements.exploitCount.textContent = data.total;

        displayCVEs(availableCVEs);
        addLog('success', `Loaded ${data.total} CVEs from backend`);

    } catch (error) {
        elements.exploitList.innerHTML = '<div class="error">Failed to load CVEs</div>';
        addLog('error', `Failed to connect to backend: ${error.message}`);
    }
}

// Display CVEs
function displayCVEs(cves) {
    if (cves.length === 0) {
        elements.exploitList.innerHTML = '<div class="no-exploits">No CVEs found</div>';
        return;
    }

    elements.exploitList.innerHTML = cves.map(cve => `
    <div class="exploit-item cve-card" data-severity="${cve.severity}" data-cve-id="${cve.cve_id}">
      <div class="exploit-header">
        <span class="exploit-name">${cve.name}</span>
        <span class="severity-badge ${cve.severity.toLowerCase()}">${cve.severity}</span>
      </div>
      <div class="exploit-meta">
        <span class="cve-id">${cve.cve_id}</span>
        <span class="category">${cve.category}</span>
        <span class="cvss">CVSS: ${cve.cvss}</span>
      </div>
      ${cve.description ? `<div class="cve-description">${cve.description}</div>` : ''}
      
      <!-- Dynamic Inputs Container -->
      <div class="cve-inputs" id="inputs-${cve.cve_id}" style="display: none;">
        ${renderDynamicInputs(cve)}
      </div>
      
      <button class="btn btn-small execute-single" data-cve-id="${cve.cve_id}">
        Execute This CVE
      </button>
    </div>
  `).join('');

    // Add click listeners to execute buttons
    document.querySelectorAll('.execute-single').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const cveId = e.target.getAttribute('data-cve-id');
            showInputsForCVE(cveId);
        });
    });
}

// Render dynamic inputs based on CVE definition
function renderDynamicInputs(cve) {
    if (!cve.inputs || cve.inputs.length === 0) {
        return '<p class="info">No additional inputs required</p>';
    }

    return cve.inputs
        .filter(inp => inp.name !== 'target_url') // Skip target_url as it's in main config
        .map(input => {
            const inputId = `input-${cve.cve_id}-${input.name}`;
            const required = input.required ? '*' : '';

            let inputHTML = '';

            switch (input.type) {
                case 'TEXT':
                    inputHTML = `
                        <input 
                            type="text" 
                            id="${inputId}" 
                            placeholder="${input.default || ''}"
                            value="${input.default || ''}"
                        />
                    `;
                    break;

                case 'BOOLEAN':
                    inputHTML = `
                        <label class="checkbox-label">
                            <input 
                                type="checkbox" 
                                id="${inputId}"
                                ${input.default ? 'checked' : ''}
                            />
                            <span>Enable</span>
                        </label>
                    `;
                    break;

                case 'LIST':
                    inputHTML = `
                        <select id="${inputId}">
                            ${input.options.map(opt => `
                                <option value="${opt}" ${opt === input.default ? 'selected' : ''}>
                                    ${opt}
                                </option>
                            `).join('')}
                        </select>
                    `;
                    break;

                case 'AUTO_DISCOVER':
                    inputHTML = `
                        <button 
                            class="btn btn-tiny discover-btn" 
                            data-cve-id="${cve.cve_id}"
                            onclick="discoverParameters('${cve.cve_id}')"
                        >
                            Auto-Discover
                        </button>
                        <div id="discovered-${cve.cve_id}" class="discovered-params"></div>
                    `;
                    break;

                default:
                    inputHTML = `<input type="text" id="${inputId}" />`;
            }

            return `
                <div class="input-group">
                    <label for="${inputId}">
                        ${input.name}${required}
                        ${input.description ? `<span class="input-hint">${input.description}</span>` : ''}
                    </label>
                    ${inputHTML}
                </div>
            `;
        }).join('');
}

// Show inputs for selected CVE
function showInputsForCVE(cveId) {
    // Hide all other inputs
    document.querySelectorAll('.cve-inputs').forEach(el => {
        el.style.display = 'none';
    });

    // Show this CVE's inputs
    const inputsDiv = document.getElementById(`inputs-${cveId}`);
    if (inputsDiv) {
        inputsDiv.style.display = 'block';
        selectedCVE = cveId;
    }

    // Update execute button
    elements.executeBtn.style.display = 'block';
    elements.executeBtn.textContent = `Execute ${cveId}`;
}

// Auto-discover parameters
async function discoverParameters(cveId) {
    const target = elements.targetUrl.value.trim();
    if (!target) {
        alert('Please enter a target URL first');
        return;
    }

    addLog('info', `Discovering parameters for ${cveId}...`);

    try {
        const response = await fetch(
            `${BACKEND_URL}/cves/${cveId}/discover?target=${encodeURIComponent(target)}`,
            { method: 'POST' }
        );
        const data = await response.json();

        const discoveredDiv = document.getElementById(`discovered-${cveId}`);
        if (discoveredDiv && data.discovered) {
            const totalParams = Object.values(data.discovered).reduce((sum, arr) => sum + arr.length, 0);
            discoveredDiv.innerHTML = `
                <div class="discovered-results">
                    <strong>Found ${totalParams} parameters:</strong>
                    ${Object.entries(data.discovered).map(([loc, params]) => `
                        <div class="param-location">
                            <em>${loc}:</em> ${params.join(', ') || 'none'}
                        </div>
                    `).join('')}
                </div>
            `;
            addLog('success', `Discovered ${totalParams} parameters`);
        }
    } catch (error) {
        addLog('error', `Discovery failed: ${error.message}`);
    }
}

// Collect inputs for CVE
function collectCVEInputs(cveId) {
    const cve = availableCVEs.find(c => c.cve_id === cveId);
    if (!cve) return {};

    const inputs = {};

    cve.inputs.forEach(input => {
        if (input.name === 'target_url') return; // Skip, handled separately

        const inputId = `input-${cveId}-${input.name}`;
        const element = document.getElementById(inputId);

        if (element) {
            if (input.type === 'BOOLEAN') {
                inputs[input.name] = element.checked;
            } else {
                inputs[input.name] = element.value;
            }
        }
    });

    return inputs;
}

// Execute selected CVE
elements.executeBtn.addEventListener('click', async () => {
    if (!selectedCVE) {
        alert('Please select a CVE to execute');
        return;
    }

    const targetUrl = elements.targetUrl.value.trim();
    if (!targetUrl) {
        alert('Please enter a target URL');
        return;
    }

    // Collect inputs
    const inputs = collectCVEInputs(selectedCVE);

    // Update UI
    elements.executeBtn.disabled = true;
    elements.executeBtn.innerHTML = `
    <svg width="16" height="16" class="spinner" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="10" stroke="currentColor" fill="none" stroke-width="2" opacity="0.25"/>
      <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" fill="none" stroke-width="2"/>
    </svg>
    Executing...
  `;

    clearLogs();
    addLog('info', '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    addLog('info', `🎯 Executing: ${selectedCVE}`);
    addLog('info', `Target: ${targetUrl}`);
    addLog('info', '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    try {
        const response = await fetch(`${BACKEND_URL}/cves/${selectedCVE}/execute`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                target: targetUrl,
                inputs: inputs
            })
        });

        const result = await response.json();

        addLog('success', `✅ Execution complete!`);
        addLog('info', `Total vectors tested: ${result.total_vectors}`);
        addLog(result.vulnerable ? 'error' : 'success',
            `Vulnerable: ${result.vulnerable ? 'YES' : 'NO'}`);

        if (result.vulnerabilities_found > 0) {
            addLog('error', `⚠️ Found ${result.vulnerabilities_found} vulnerabilities!`);
            result.results.forEach((vuln, i) => {
                addLog('error', `\n[${i + 1}] ${vuln.vector.payload || 'N/A'}`);
                if (vuln.matched_pattern) {
                    addLog('error', `  Matched: ${vuln.matched_pattern}`);
                }
            });
        }

        // Update stats
        elements.statsSection.style.display = 'block';
        elements.statTotal.textContent = result.total_vectors;
        elements.statSuccess.textContent = result.vulnerabilities_found;
        elements.statFailed.textContent = result.total_vectors - result.vulnerabilities_found;

    } catch (error) {
        addLog('error', `Execution failed: ${error.message}`);
    } finally {
        elements.executeBtn.disabled = false;
        elements.executeBtn.textContent = `Execute ${selectedCVE}`;
    }
});

// Utility functions
function addLog(type, message) {
    const logEntry = document.createElement('div');
    logEntry.className = `log-entry ${type}`;

    const time = new Date().toLocaleTimeString();
    logEntry.innerHTML = `
        <span class="log-time">${time}</span>
        <span class="log-message">${message}</span>
    `;

    elements.logsContainer.appendChild(logEntry);
    elements.logsContainer.scrollTop = elements.logsContainer.scrollHeight;
}

function clearLogs() {
    elements.logsContainer.innerHTML = '';
}

// Refresh button
elements.refreshExploitsBtn.addEventListener('click', loadCVEs);

// Clear logs button
elements.clearLogsBtn.addEventListener('click', clearLogs);

// Export results
elements.exportBtn.addEventListener('click', () => {
    const logs = elements.logsContainer.innerText;
    const blob = new Blob([logs], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reconx-results-${Date.now()}.txt`;
    a.click();
});
