// Universal browser API (Chrome, Firefox, Edge, Brave compatible)
const api = typeof browser !== "undefined" ? browser : chrome;

console.log('React2Shell Extension: Popup script loaded');

// State
let currentTab;
let executionId = null;
let pollingInterval = null;
let executionLogs = [];

// DOM elements
const elements = {
    targetUrl: document.getElementById('targetUrl'),
    command: document.getElementById('command'),
    autoDetect: document.getElementById('autoDetect'),
    exploitBtn: document.getElementById('exploitBtn'),
    clearLogsBtn: document.getElementById('clearLogsBtn'),
    exportLogsBtn: document.getElementById('exportLogsBtn'),
    backendUrl: document.getElementById('backendUrl'),
    connectionStatus: document.getElementById('connectionStatus'),
    logsContainer: document.getElementById('logsContainer'),
    resultsSection: document.getElementById('resultsSection'),
    resultStatus: document.getElementById('resultStatus'),
    resultOutput: document.getElementById('resultOutput'),
    scanStatus: document.getElementById('scanStatus')
};

// Get current tab
api.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    currentTab = tabs[0];
    if (elements.autoDetect.checked && currentTab) {
        const url = new URL(currentTab.url);
        elements.targetUrl.value = `${url.protocol}//${url.hostname}`;
    }
});

// Auto-detect checkbox handler
elements.autoDetect.addEventListener('change', (e) => {
    if (e.target.checked && currentTab) {
        const url = new URL(currentTab.url);
        elements.targetUrl.value = `${url.protocol}//${url.hostname}`;
    }
});

// Check backend health
async function checkBackendHealth() {
    const backendUrl = elements.backendUrl.value.trim();

    try {
        const response = await fetch(`${backendUrl}/health`);
        const data = await response.json();

        if (data.status === 'ok') {
            updateConnectionStatus(true);
            addLog('success', '✓ Connected to ReconX backend');
            return true;
        }
    } catch (error) {
        updateConnectionStatus(false);
        addLog('error', `✗ Connection failed: ${error.message}`);
        return false;
    }
}

// Execute exploit
async function executeExploit() {
    const targetUrl = elements.targetUrl.value.trim();
    const command = elements.command.value.trim();
    const backendUrl = elements.backendUrl.value.trim();

    // Validation
    if (!targetUrl || !command) {
        addLog('error', 'Target URL and command are required');
        alert('Please provide both target URL and command');
        return;
    }

    // Clear previous results
    elements.resultsSection.style.display = 'none';
    clearLogs();

    // Update UI
    elements.exploitBtn.disabled = true;
    elements.exploitBtn.innerHTML = `
    <svg width="16" height="16" class="spinner" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="10" stroke="currentColor" fill="none" stroke-width="2" opacity="0.25"/>
      <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" fill="none" stroke-width="2"/>
    </svg>
    Executing...
  `;
    updateStatus('exploiting', 'Executing exploit...');

    try {
        // Start exploit execution
        const response = await fetch(`${backendUrl}/execute-react2shell`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                cveId: 'CVE-2025-55182',
                targetUrl: targetUrl,
                command: command
            })
        });

        const data = await response.json();
        executionId = data.execution_id;

        addLog('info', `Execution started (ID: ${executionId})`);

        // Start polling for logs
        startPolling(backendUrl);

    } catch (error) {
        addLog('error', `Failed to start exploit: ${error.message}`);
        updateStatus('error', 'Execution failed');
        resetButton();
    }
}

// Start polling for logs
function startPolling(backendUrl) {
    if (pollingInterval) {
        clearInterval(pollingInterval);
    }

    pollingInterval = setInterval(async () => {
        try {
            const response = await fetch(`${backendUrl}/execution/${executionId}/logs`);
            const data = await response.json();

            // Display new logs
            if (data.logs && data.logs.length > executionLogs.length) {
                const newLogs = data.logs.slice(executionLogs.length);
                newLogs.forEach(log => {
                    addLog(log.level, log.message);
                });
                executionLogs = data.logs;
            }

            // Check if completed
            if (data.status === 'completed' || data.status === 'error' || data.status === 'timeout') {
                clearInterval(pollingInterval);
                pollingInterval = null;

                if (data.result) {
                    displayResults(data.result);
                }

                updateStatus('complete', 'Execution complete');
                resetButton();
            }

        } catch (error) {
            console.error('Polling error:', error);
        }
    }, 500); // Poll every 500ms
}

// Display results
function displayResults(data) {
    elements.resultsSection.style.display = 'block';

    const status = data.success ? 'Exploit Successful ✓' : 'Exploit Failed ✗';
    const statusClass = data.success ? 'success' : 'error';

    elements.resultStatus.textContent = status;
    elements.resultStatus.className = `result-status ${statusClass}`;
    elements.resultOutput.innerHTML = parseAnsi(data.output || 'No output');
}

// Reset button
function resetButton() {
    elements.exploitBtn.disabled = false;
    elements.exploitBtn.innerHTML = `
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path d="M13 2L3 14h8l-1 8 10-12h-8l1-8z" stroke="currentColor" stroke-width="2" fill="currentColor"/>
    </svg>
    Execute Exploit
  `;
}

// Add log entry
function addLog(type, message) {
    const timestamp = new Date().toLocaleTimeString();

    const logDiv = document.createElement('div');
    logDiv.className = `log-entry ${type}`;
    logDiv.innerHTML = `
    <span class="log-time">${timestamp}</span>
    <span class="log-message">${parseAnsi(message)}</span>
  `;

    elements.logsContainer.appendChild(logDiv);
    elements.logsContainer.scrollTop = elements.logsContainer.scrollHeight;
}

// Parse ANSI escape codes to HTML
function parseAnsi(text) {
    const ansiColors = {
        '30': '#000000', '31': '#fc8181', '32': '#48bb78', '33': '#fbbf24',
        '34': '#60a5fa', '35': '#a78bfa', '36': '#22d3ee', '37': '#e2e8f0',
        '90': '#64748b', '91': '#f87171', '92': '#34d399', '93': '#fcd34d',
        '94': '#3b82f6', '95': '#c4b5fd', '96': '#22d3ee', '97': '#f1f5f9'
    };

    let html = escapeHtml(text);

    // Replace ANSI codes with HTML
    html = html.replace(/\[(\d+)m/g, (match, code) => {
        if (code === '0') return '</span>'; // Reset
        if (code === '1') return '<span style="font-weight:bold">'; // Bold
        if (ansiColors[code]) return `<span style="color:${ansiColors[code]}">`;
        return '';
    });

    // Clean up remaining codes
    html = html.replace(/\[\d+m/g, '');

    return html;
}

// Clear logs
function clearLogs() {
    executionLogs = [];
    elements.logsContainer.innerHTML = `
    <div class="log-entry info">
      <span class="log-time">--:--:--</span>
      <span class="log-message">Logs cleared</span>
    </div>
  `;
    if (pollingInterval) {
        clearInterval(pollingInterval);
        pollingInterval = null;
    }
}

// Export logs
function exportLogs() {
    if (executionLogs.length === 0) {
        alert('No logs to export');
        return;
    }

    const data = {
        timestamp: new Date().toISOString(),
        executionId: executionId,
        target: elements.targetUrl.value,
        command: elements.command.value,
        logs: executionLogs
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `react2shell-logs-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
}

// Update connection status
function updateConnectionStatus(connected) {
    const dot = elements.connectionStatus.querySelector('.connection-dot');
    const text = elements.connectionStatus.querySelector('.connection-text');

    if (connected) {
        dot.className = 'connection-dot online';
        text.textContent = 'Connected to backend';
    } else {
        dot.className = 'connection-dot offline';
        text.textContent = 'Disconnected from backend';
    }
}

// Update status
function updateStatus(state, text) {
    const statusDot = elements.scanStatus.querySelector('.status-dot');
    const statusText = elements.scanStatus.querySelector('.status-text');

    statusText.textContent = text;

    const colors = {
        ready: '#48bb78',
        exploiting: '#f6ad55',
        complete: '#48bb78',
        error: '#fc8181'
    };

    statusDot.style.background = colors[state] || '#48bb78';
}

// Escape HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Event listeners
elements.exploitBtn.addEventListener('click', executeExploit);
elements.clearLogsBtn.addEventListener('click', clearLogs);
elements.exportLogsBtn.addEventListener('click', exportLogs);

// Add spinner animation
const style = document.createElement('style');
style.textContent = `
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  .spinner {
    animation: spin 1s linear infinite;
  }
`;
document.head.appendChild(style);

// Auto-check backend health on load
setTimeout(() => {
    checkBackendHealth();
}, 500);
