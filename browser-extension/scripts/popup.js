// Universal browser API
// (Chrome, Firefox, Edge, Brave compatible)
const api = typeof browser !== "undefined" ? browser : chrome;

console.log('ReconX Orchestration Extension loaded');

// State
let currentTab;
let availableExploits = [];
let selectedExploits = new Set();
let currentBatchId = null;
let pollingInterval = null;
const BACKEND_URL = 'http://localhost:3001';

// DOM elements
const elements = {
    targetUrl: document.getElementById('targetUrl'),
    autoDetect: document.getElementById('autoDetect'),
    exploitList: document.getElementById('exploitList'),
    exploitCount: document.getElementById('exploitCount'),
    selectedCount: document.getElementById('selectedCount'),
    execCount: document.getElementById('execCount'),
    refreshExploitsBtn: document.getElementById('refreshExploitsBtn'),
    selectAllBtn: document.getElementById('selectAllBtn'),
    clearSelectionBtn: document.getElementById('clearSelectionBtn'),
    executeBtn: document.getElementById('executeBtn'),
    clearLogsBtn: document.getElementById('clearLogsBtn'),
    exportBtn: document.getElementById('exportBtn'),
    logsContainer: document.getElementById('logsContainer'),
    scanStatus: document.getElementById('scanStatus'),
    statsSection: document.getElementById('statsSection'),
    statTotal: document.getElementById('statTotal'),
    statSuccess: document.getElementById('statSuccess'),
    statFailed: document.getElementById('statFailed'),
    statDuration: document.getElementById('statDuration'),
    maxWorkers: document.getElementById('maxWorkers'),
    workerCount: document.getElementById('workerCount'),
    workersSlider: document.getElementById('workersSlider')
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

// Load exploits on startup
loadExploits();

// Fetch available exploits
async function loadExploits() {
    try {
        elements.exploitList.innerHTML = '<div class="loading">Loading exploits...</div>';

        const response = await fetch(`${BACKEND_URL}/exploits/list`);
        const data = await response.json();

        availableExploits = data.exploits;
        elements.exploitCount.textContent = data.total;

        displayExploits(availableExploits);
        addLog('success', `Loaded ${data.total} exploits from backend`);

    } catch (error) {
        elements.exploitList.innerHTML = '<div class="error">Failed to load exploits</div>';
        addLog('error', `Failed to connect to backend: ${error.message}`);
    }
}

// Display exploits
function displayExploits(exploits) {
    if (exploits.length === 0) {
        elements.exploitList.innerHTML = '<div class="no-exploits">No exploits found</div>';
        return;
    }

    elements.exploitList.innerHTML = exploits.map(exploit => `
    <div class="exploit-item" data-severity="${exploit.severity}">
      <input type="checkbox" class="exploit-checkbox" id="exp-${exploit.id}" value="${exploit.id}" />
      <label for="exp-${exploit.id}">
        <div class="exploit-header">
          <span class="exploit-name">${exploit.name}</span>
          <span class="severity-badge ${exploit.severity.toLowerCase()}">${exploit.severity}</span>
        </div>
        <div class="exploit-meta">
          <span class="cve-id">${exploit.cve}</span>
          <span class="category">${exploit.category}</span>
          <span class="cvss">CVSS: ${exploit.cvss}</span>
        </div>
        <div class="exploit-desc">${exploit.description}</div>
      </label>
    </div>
  `).join('');

    // Add checkbox listeners
    document.querySelectorAll('.exploit-checkbox').forEach(cb => {
        cb.addEventListener('change', updateSelection);
    });
}

// Update selection
function updateSelection() {
    selectedExploits.clear();
    document.querySelectorAll('.exploit-checkbox:checked').forEach(cb => {
        selectedExploits.add(cb.value);
    });

    elements.selectedCount.textContent = selectedExploits.size;
    elements.execCount.textContent = selectedExploits.size;
}

// Filter exploits
document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');

        const filter = e.target.dataset.filter;
        const filtered = filter === 'all'
            ? availableExploits
            : availableExploits.filter(exp => exp.severity === filter);

        displayExploits(filtered);
    });
});

// Select all / Clear selection
elements.selectAllBtn.addEventListener('click', () => {
    document.querySelectorAll('.exploit-checkbox').forEach(cb => cb.checked = true);
    updateSelection();
});

elements.clearSelectionBtn.addEventListener('click', () => {
    document.querySelectorAll('.exploit-checkbox').forEach(cb => cb.checked = false);
    updateSelection();
});

// Refresh exploits
elements.refreshExploitsBtn.addEventListener('click', loadExploits);

// Workers slider
elements.maxWorkers.addEventListener('input', (e) => {
    elements.workerCount.textContent = e.target.value;
});

// Toggle workers slider based on mode
document.querySelectorAll('input[name="mode"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
        elements.workersSlider.style.display = e.target.value === 'parallel' ? 'block' : 'none';
    });
});

// Execute batch
async function executeBatch() {
    if (selectedExploits.size === 0) {
        alert('Please select at least one exploit');
        return;
    }

    const targetUrl = elements.targetUrl.value.trim();

    if (!targetUrl) {
        alert('Please enter a target URL');
        return;
    }

    // Get execution mode
    const mode = document.querySelector('input[name="mode"]:checked').value;
    const maxWorkers = parseInt(elements.maxWorkers.value);

    // Build exploit params
    const exploits = Array.from(selectedExploits).map(id => {
        const exploit = availableExploits.find(e => e.id === id);
        const params = {};

        // Only add cmd param for react2shell
        if (id === 'react2shell') {
            params.cmd = 'whoami';  // Default command for react2shell
        }

        return { id, params };
    });

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
    addLog('info', '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    addLog('info', `🚀 Starting batch execution (${mode} mode)`);
    addLog('info', `Target: ${targetUrl}`);
    addLog('info', `Exploits: ${selectedExploits.size}`);
    addLog('info', '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    try {
        // Start batch execution
        const response = await fetch(`${BACKEND_URL}/exploits/execute-batch`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ target: targetUrl, exploits, mode, max_workers: maxWorkers })
        });

        const data = await response.json();
        currentBatchId = data.batch_id;

        addLog('info', `Batch started (ID: ${currentBatchId})`);

        // Start polling
        startPolling();

    } catch (error) {
        addLog('error', `Failed to start batch: ${error.message}`);
        resetExecuteButton();
    }
}

// Start polling for batch status
function startPolling() {
    if (pollingInterval) clearInterval(pollingInterval);

    let lastResultCount = 0;

    pollingInterval = setInterval(async () => {
        try {
            const response = await fetch(`${BACKEND_URL}/exploits/batch/${currentBatchId}/status`);
            const batch = await response.json();

            // Display new results
            if (batch.results && batch.results.length > lastResultCount) {
                const newResults = batch.results.slice(lastResultCount);
                newResults.forEach(result => {
                    const icon = result.success ? '✓' : '✗';
                    const type = result.success ? 'success' : 'error';
                    addLog(type, `[${result.exploit_id}] ${icon} ${result.success ? 'Vulnerable!' : 'Not vulnerable'} (${result.duration}s)`);
                });
                lastResultCount = batch.results.length;
            }

            // Update statistics
            updateStatistics(batch);

            // Check if completed
            if (batch.status === 'completed') {
                clearInterval(pollingInterval);
                pollingInterval = null;
                addLog('success', '✓ Batch execution completed!');
                resetExecuteButton();
                displayFinalResults(batch);
            }

        } catch (error) {
            console.error('Polling error:', error);
        }
    }, 500);
}

// Update statistics
function updateStatistics(batch) {
    elements.statsSection.style.display = 'block';

    const success = batch.results.filter(r => r.success).length;
    const failed = batch.total - success;
    const totalDuration = batch.results.reduce((sum, r) => sum + (r.duration || 0), 0);

    elements.statTotal.textContent = batch.total;
    elements.statSuccess.textContent = success;
    elements.statFailed.textContent = failed;
    elements.statDuration.textContent = `${totalDuration.toFixed(1)}s`;
}

// Display final results
function displayFinalResults(batch) {
    addLog('info', '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    addLog('info', '📊 Final Summary:');

    batch.results.forEach(result => {
        if (result.success && result.output) {
            addLog('info', `\n[${result.name}]`);
            addLog('success', result.output);
        }
    });
}

// Reset execute button
function resetExecuteButton() {
    elements.executeBtn.disabled = false;
    elements.executeBtn.innerHTML = `
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path d="M13 2L3 14h8l-1 8 10-12h-8l1-8z" stroke="currentColor" stroke-width="2" fill="currentColor"/>
    </svg>
    Execute Selected (<span id="execCount">${selectedExploits.size}</span>)
  `;
}

// Add log
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

// Parse ANSI codes
function parseAnsi(text) {
    const ansiColors = {
        '30': '#000000', '31': '#fc8181', '32': '#48bb78', '33': '#fbbf24',
        '34': '#60a5fa', '35': '#a78bfa', '36': '#22d3ee', '37': '#e2e8f0',
        '90': '#64748b', '91': '#f87171', '92': '#34d399', '93': '#fcd34d',
        '94': '#3b82f6', '95': '#c4b5fd', '96': '#22d3ee', '97': '#f1f5f9'
    };

    let html = escapeHtml(text);
    html = html.replace(/\[(\d+)m/g, (match, code) => {
        if (code === '0') return '</span>';
        if (code === '1') return '<span style="font-weight:bold">';
        if (ansiColors[code]) return `<span style="color:${ansiColors[code]}">`;
        return '';
    });
    html = html.replace(/\[\d+m/g, '');
    return html;
}

// Escape HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Clear logs
function clearLogs() {
    elements.logsContainer.innerHTML = `
    <div class="log-entry info">
      <span class="log-time">--:--:--</span>
      <span class="log-message">Logs cleared</span>
    </div>
  `;
    elements.statsSection.style.display = 'none';
}

// Export results
async function exportResults() {
    if (!currentBatchId) {
        alert('No results to export');
        return;
    }

    try {
        const response = await fetch(`${BACKEND_URL}/exploits/batch/${currentBatchId}/status`);
        const batch = await response.json();

        const blob = new Blob([JSON.stringify(batch, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `reconx-batch-${currentBatchId}.json`;
        a.click();
        URL.revokeObjectURL(url);

        addLog('success', 'Results exported successfully');
    } catch (error) {
        addLog('error', `Export failed: ${error.message}`);
    }
}

// Event listeners
elements.executeBtn.addEventListener('click', executeBatch);
elements.clearLogsBtn.addEventListener('click', clearLogs);
elements.exportBtn.addEventListener('click', exportResults);

// Spinner animation
const style = document.createElement('style');
style.textContent = `
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  .spinner { animation: spin 1s linear infinite; }
`;
document.head.appendChild(style);
