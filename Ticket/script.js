// Security Guard - Authentication Check
if (sessionStorage.getItem('isVerifierLoggedIn') !== 'true') {
    alert('🔒 Access Denied. Please log in to access the verification system.');
    window.location.href = 'login.html';
}

// Configuration with DEBUGGING enabled
const CONFIG = {
    SCRIPT_URL: "https://script.google.com/macros/s/AKfycbxgcC0w3kjgG8sBR-sqyQUxKj2hiCK0mWgF2NeB2OUhSYh_usgGbVnV4t8QLP5H0JvC/exec",
    QR_CONFIG: {
        fps: 10,
        qrbox: { width: 280, height: 280 },
        aspectRatio: 1.0,
        disableFlip: false,
        rememberLastUsedCamera: true
    },
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY: 1000,
    DEBOUNCE_DELAY: 2000,
    DEBUG_MODE: true // Enable detailed logging
};

// DOM Elements Cache
const elements = {
    resultDiv: document.getElementById('verificationResult'),
    manualVerifyForm: document.getElementById('verifyForm'),
    manualIdInput: document.getElementById('manualId'),
    logoutBtn: document.getElementById('logoutBtn'),
    toggleCameraBtn: document.getElementById('toggleCamera'),
    switchCameraBtn: document.getElementById('switchCamera'),
    scannerStatus: document.getElementById('scannerStatus'),
    qrReader: document.getElementById('qr-reader'),
    cameraIcon: document.getElementById('cameraIcon'),
    cameraText: document.getElementById('cameraText'),
    fabMain: document.getElementById('fabMain'),
    // Result elements
    resultIcon: document.getElementById('resultIcon'),
    resultTitle: document.getElementById('resultTitle'),
    resultMessage: document.getElementById('resultMessage'),
    resultDetails: document.getElementById('resultDetails'),
    resultTimestamp: document.getElementById('resultTimestamp'),
    // Stats elements
    verifiedCount: document.getElementById('verifiedCount'),
    rejectedCount: document.getElementById('rejectedCount'),
    duplicateCount: document.getElementById('duplicateCount'),
    totalCount: document.getElementById('totalCount')
};

// Global Variables
let html5QrcodeScanner = null;
let isScannerActive = false;
let availableCameras = [];
let currentCameraIndex = 0;
let lastScannedTicket = null;
let lastScanTime = 0;
let sessionStats = {
    verified: 0,
    rejected: 0,
    duplicates: 0,
    total: 0
};

// Enhanced Utility Functions with Debugging
const utils = {
    debugLog(message, data = null) {
        if (CONFIG.DEBUG_MODE) {
            console.log(`🔍 [DEBUG] ${message}`, data || '');
        }
    },

    validateTicketId(ticketId) {
        const ticketRegex = /^EVENT-[A-Z0-9]{5,15}$/i;
        const isValid = ticketRegex.test(ticketId.trim());
        this.debugLog(`Ticket ID validation: ${ticketId} -> ${isValid}`);
        return isValid;
    },

    formatTimestamp() {
        return new Date().toLocaleString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true
        });
    },

    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    showToast(message, type = 'info', duration = 3000) {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        
        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        };
        
        toast.innerHTML = `
            <div class="toast-content">
                <span class="toast-icon">${icons[type]}</span>
                <span class="toast-message">${message}</span>
                <button class="toast-close" onclick="this.parentElement.parentElement.remove()">×</button>
            </div>
        `;
        
        // Add styles if not exist
        if (!document.querySelector('#toast-styles')) {
            const style = document.createElement('style');
            style.id = 'toast-styles';
            style.textContent = `
                .toast {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    z-index: 10000;
                    background: white;
                    border-radius: 8px;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                    border-left: 4px solid;
                    padding: 16px;
                    max-width: 350px;
                    animation: slideIn 0.3s ease-out;
                }
                .toast-success { border-left-color: #27ae60; }
                .toast-error { border-left-color: #e74c3c; }
                .toast-warning { border-left-color: #f39c12; }
                .toast-info { border-left-color: #3498db; }
                .toast-content {
                    display: flex;
                    align-items: flex-start;
                    gap: 10px;
                }
                .toast-message { flex: 1; font-weight: 500; }
                .toast-close {
                    background: none;
                    border: none;
                    font-size: 18px;
                    cursor: pointer;
                    color: #7f8c8d;
                    padding: 0;
                    width: 20px;
                    height: 20px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
            `;
            document.head.appendChild(style);
        }
        
        document.body.appendChild(toast);
        
        // Auto remove
        setTimeout(() => {
            if (toast.parentNode) {
                toast.style.animation = 'slideIn 0.3s ease-out reverse';
                setTimeout(() => {
                    if (toast.parentNode) {
                        toast.parentNode.removeChild(toast);
                    }
                }, 300);
            }
        }, duration);
    },

    updateStats(type) {
        sessionStats[type]++;
        sessionStats.total++;
        
        elements.verifiedCount.textContent = sessionStats.verified;
        elements.rejectedCount.textContent = sessionStats.rejected;
        elements.duplicateCount.textContent = sessionStats.duplicates;
        elements.totalCount.textContent = sessionStats.total;
        
        // Add animation
        const element = elements[type + 'Count'];
        if (element) {
            element.style.transform = 'scale(1.2)';
            element.style.color = '#3498db';
            setTimeout(() => {
                element.style.transform = 'scale(1)';
                element.style.color = '';
            }, 300);
        }
    }
};

// Enhanced API Functions with Better Error Handling
const api = {
    async verifyTicket(ticketId, attempt = 1) {
        try {
            utils.debugLog(`Starting verification attempt ${attempt} for ticket: ${ticketId}`);
            
            // Build URL with proper encoding
            const baseUrl = CONFIG.SCRIPT_URL;
            const params = new URLSearchParams({
                id: ticketId.trim().toUpperCase(),
                timestamp: Date.now(),
                action: 'verify'
            });
            
            const verifyUrl = `${baseUrl}?${params.toString()}`;
            utils.debugLog('Request URL:', verifyUrl);
            
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 15000);
            
            const response = await fetch(verifyUrl, {
                method: 'GET',
                signal: controller.signal,
                cache: 'no-cache',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            });
            
            clearTimeout(timeoutId);
            utils.debugLog('Response status:', response.status);
            utils.debugLog('Response headers:', Object.fromEntries(response.headers.entries()));
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const responseText = await response.text();
            utils.debugLog('Raw response text:', responseText);
            
            let result;
            try {
                result = JSON.parse(responseText);
                utils.debugLog('Parsed response:', result);
            } catch (parseError) {
                utils.debugLog('JSON parse error:', parseError);
                throw new Error(`Invalid JSON response: ${responseText.substring(0, 100)}...`);
            }
            
            return result;
            
        } catch (error) {
            utils.debugLog(`Verification attempt ${attempt} failed:`, error);
            
            if (attempt < CONFIG.RETRY_ATTEMPTS && error.name !== 'AbortError') {
                utils.showToast(`Retry ${attempt}/${CONFIG.RETRY_ATTEMPTS}...`, 'warning', 2000);
                await new Promise(resolve => setTimeout(resolve, CONFIG.RETRY_DELAY * attempt));
                return this.verifyTicket(ticketId, attempt + 1);
            }
            
            throw error;
        }
    },

    // NEW: Test API connection
    async testConnection() {
        try {
            utils.debugLog('Testing API connection...');
            
            const testUrl = `${CONFIG.SCRIPT_URL}?test=true&timestamp=${Date.now()}`;
            
            const response = await fetch(testUrl, {
                method: 'GET',
                cache: 'no-cache'
            });
            
            utils.debugLog('Test response status:', response.status);
            
            if (!response.ok) {
                throw new Error(`Test failed: HTTP ${response.status}`);
            }
            
            const responseText = await response.text();
            utils.debugLog('Test response text:', responseText);
            
            try {
                const result = JSON.parse(responseText);
                return {
                    success: true,
                    result: result
                };
            } catch (parseError) {
                return {
                    success: false,
                    error: 'Invalid JSON response',
                    responseText: responseText
                };
            }
            
        } catch (error) {
            utils.debugLog('Connection test failed:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
};

// Camera Management (Unchanged but with debug logs)
const cameraManager = {
    async initializeCameras() {
        try {
            utils.debugLog('Initializing cameras...');
            availableCameras = await Html5Qrcode.getCameras();
            utils.debugLog('Available cameras:', availableCameras.length);
            
            if (availableCameras.length === 0) {
                throw new Error('No cameras found');
            }
            
            if (availableCameras.length > 1) {
                elements.switchCameraBtn.classList.remove('hidden');
            }
            
            return true;
        } catch (error) {
            utils.debugLog('Camera initialization error:', error);
            this.showCameraError('No cameras detected or permission denied');
            return false;
        }
    },

    async startScanner() {
        try {
            utils.debugLog('Starting scanner...');
            if (isScannerActive) {
                await this.stopScanner();
            }
            
            if (availableCameras.length === 0) {
                const initialized = await this.initializeCameras();
                if (!initialized) return false;
            }
            
            const cameraId = availableCameras[currentCameraIndex]?.id;
            if (!cameraId) {
                throw new Error('Camera not available');
            }
            
            html5QrcodeScanner = new Html5Qrcode("qr-reader");
            
            await html5QrcodeScanner.start(
                cameraId,
                CONFIG.QR_CONFIG,
                this.onScanSuccess.bind(this),
                this.onScanError.bind(this)
            );
            
            isScannerActive = true;
            this.updateScannerUI(true);
            utils.showToast('📷 Camera started successfully', 'success');
            
            return true;
        } catch (error) {
            utils.debugLog('Scanner start error:', error);
            this.showCameraError(`Failed to start camera: ${error.message}`);
            return false;
        }
    },

    async stopScanner() {
        try {
            utils.debugLog('Stopping scanner...');
            if (html5QrcodeScanner && isScannerActive) {
                await html5QrcodeScanner.stop();
                html5QrcodeScanner.clear();
                html5QrcodeScanner = null;
            }
            
            isScannerActive = false;
            this.updateScannerUI(false);
            
        } catch (error) {
            utils.debugLog('Scanner stop error:', error);
        }
    },

    async switchCamera() {
        if (availableCameras.length <= 1) return;
        
        currentCameraIndex = (currentCameraIndex + 1) % availableCameras.length;
        
        if (isScannerActive) {
            await this.stopScanner();
            setTimeout(() => this.startScanner(), 500);
        }
        
        utils.showToast(`📹 Switched to camera ${currentCameraIndex + 1}`, 'info');
    },

    updateScannerUI(isActive) {
        if (isActive) {
            elements.cameraIcon.textContent = '⏹️';
            elements.cameraText.textContent = 'Stop Camera';
            elements.toggleCameraBtn.classList.add('active');
            elements.scannerStatus.innerHTML = `
                <div class="scanning-indicator">
                    <div class="scan-line"></div>
                    <p>🔍 Scanning for QR codes...</p>
                    <p class="scan-hint">Position the QR code within the frame</p>
                </div>
            `;
        } else {
            elements.cameraIcon.textContent = '📹';
            elements.cameraText.textContent = 'Start Camera';
            elements.toggleCameraBtn.classList.remove('active');
            elements.scannerStatus.innerHTML = '<p>Click "Start Camera" to begin scanning</p>';
        }
    },

    showCameraError(message) {
        elements.scannerStatus.innerHTML = `
            <div class="camera-error">
                <div class="error-icon">📷❌</div>
                <p>${message}</p>
                <p class="error-hint">Please check camera permissions or use manual verification</p>
            </div>
        `;
    },

    onScanSuccess(decodedText, decodedResult) {
        const now = Date.now();
        utils.debugLog('QR code scanned:', decodedText);
        
        // Prevent duplicate scans
        if (lastScannedTicket === decodedText && now - lastScanTime < CONFIG.DEBOUNCE_DELAY) {
            utils.debugLog('Duplicate scan ignored');
            return;
        }
        
        lastScannedTicket = decodedText;
        lastScanTime = now;
        
        // Temporarily pause scanner
        if (html5QrcodeScanner && isScannerActive) {
            html5QrcodeScanner.pause(true);
        }
        
        // Verify the ticket
        verifyTicketId(decodedText).finally(() => {
            // Resume scanner after verification
            setTimeout(() => {
                if (html5QrcodeScanner && isScannerActive) {
                    html5QrcodeScanner.resume();
                }
            }, 3000);
        });
    },

    onScanError(errorMessage) {
        // Only log significant errors
        if (!errorMessage.includes('NotFoundException') && 
            !errorMessage.includes('No MultiFormat Readers')) {
            utils.debugLog('QR Scan error:', errorMessage);
        }
    }
};

// Main Verification Function with Enhanced Error Handling
async function verifyTicketId(ticketId) {
    const trimmedId = ticketId.trim().toUpperCase();
    
    utils.debugLog('=== Starting Verification Process ===');
    utils.debugLog('Ticket ID:', trimmedId);
    
    // Input validation
    if (!trimmedId) {
        utils.debugLog('Validation failed: Empty ticket ID');
        handleVerificationResponse({
            status: 'error',
            message: 'Please enter a valid ticket ID'
        });
        return;
    }
    
    if (!utils.validateTicketId(trimmedId)) {
        utils.debugLog('Validation failed: Invalid format');
        handleVerificationResponse({
            status: 'error',
            message: 'Invalid ticket ID format. Expected: EVENT-XXXXX'
        });
        utils.updateStats('rejected');
        return;
    }
    
    // Show loading state
    showLoadingState();
    
    try {
        utils.debugLog('Calling API verification...');
        const result = await api.verifyTicket(trimmedId);
        utils.debugLog('API verification result:', result);
        
        handleVerificationResponse(result);
        
        // Clear manual input on successful scan
        if (elements.manualIdInput.value.trim() === trimmedId) {
            elements.manualIdInput.value = '';
        }
        
    } catch (error) {
        utils.debugLog('Verification error details:', {
            message: error.message,
            stack: error.stack,
            name: error.name
        });
        
        let errorMessage = 'Verification failed. Please check your connection.';
        let debugInfo = '';
        
        if (error.name === 'AbortError') {
            errorMessage = 'Verification timed out. Please try again.';
            debugInfo = 'Request timeout after 15 seconds';
        } else if (error.message.includes('HTTP')) {
            errorMessage = 'Server error. Please contact support.';
            debugInfo = error.message;
        } else if (error.message.includes('Invalid JSON')) {
            errorMessage = 'Server response error. Please contact support.';
            debugInfo = 'Server returned invalid JSON response';
        } else if (error.message.includes('Failed to fetch')) {
            errorMessage = 'Network error. Check your internet connection.';
            debugInfo = 'Network connectivity issue';
        } else {
            debugInfo = error.message;
        }
        
        handleVerificationResponse({
            status: 'error',
            message: errorMessage,
            debug: CONFIG.DEBUG_MODE ? debugInfo : undefined
        });
        
        utils.updateStats('rejected');
    }
}

function showLoadingState() {
    elements.resultDiv.classList.remove('hidden');
    elements.resultDiv.className = 'verification-result loading';
    
    elements.resultIcon.innerHTML = '<div class="loading-spinner"></div>';
    elements.resultTitle.textContent = 'Verifying...';
    elements.resultMessage.textContent = 'Please wait while we verify the ticket';
    elements.resultDetails.innerHTML = '';
    elements.resultTimestamp.textContent = '';
}

function handleVerificationResponse(result) {
    utils.debugLog('Handling verification response:', result);
    
    elements.resultDiv.classList.remove('hidden', 'loading');
    
    const name = result.data?.name || 'Unknown';
    const type = result.data?.type || 'Unknown';
    const timestamp = utils.formatTimestamp();
    
    // Create result details HTML
    const createDetailsHTML = (name, type, additionalInfo = '') => {
        return `
            <div class="result-info">
                <div class="info-row">
                    <span class="info-label">👤 Name:</span>
                    <span class="info-value">${name}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">🎫 Pass Type:</span>
                    <span class="info-value">${type}</span>
                </div>
                ${additionalInfo}
                ${result.debug && CONFIG.DEBUG_MODE ? `
                    <div class="info-row debug-info">
                        <span class="info-label">🔍 Debug:</span>
                        <span class="info-value">${result.debug}</span>
                    </div>
                ` : ''}
            </div>
        `;
    };
    
    switch (result.status) {
        case 'success':
            elements.resultDiv.className = 'verification-result success';
            elements.resultIcon.innerHTML = '✅';
            elements.resultTitle.textContent = 'Valid Ticket!';
            elements.resultMessage.textContent = 'Entry approved - ticket is authentic';
            elements.resultDetails.innerHTML = createDetailsHTML(name, type, `
                <div class="info-row success-note">
                    <span class="info-label">🟢 Status:</span>
                    <span class="info-value">APPROVED FOR ENTRY</span>
                </div>
            `);
            
            utils.showToast(`✅ Entry approved for ${name}`, 'success');
            utils.updateStats('verified');
            break;
            
        case 'already_verified':
            elements.resultDiv.className = 'verification-result warning';
            elements.resultIcon.innerHTML = '⚠️';
            elements.resultTitle.textContent = 'Already Used!';
            elements.resultMessage.textContent = 'This ticket has been previously verified';
            elements.resultDetails.innerHTML = createDetailsHTML(name, type, `
                <div class="info-row warning-note">
                    <span class="info-label">🟡 Status:</span>
                    <span class="info-value">DUPLICATE ENTRY ATTEMPT</span>
                </div>
                <div class="info-row">
                    <span class="info-label">⚠️ Action:</span>
                    <span class="info-value">Entry should be denied</span>
                </div>
            `);
            
            utils.showToast(`⚠️ Duplicate ticket detected for ${name}`, 'warning');
            utils.updateStats('duplicates');
            break;
            
        case 'not_found':
            elements.resultDiv.className = 'verification-result error';
            elements.resultIcon.innerHTML = '❌';
            elements.resultTitle.textContent = 'Invalid Ticket!';
            elements.resultMessage.textContent = 'Ticket not found in our system';
            elements.resultDetails.innerHTML = `
                <div class="result-info">
                    <div class="info-row error-note">
                        <span class="info-label">🔴 Status:</span>
                        <span class="info-value">ENTRY DENIED</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">❌ Reason:</span>
                        <span class="info-value">Ticket ID not found</span>
                    </div>
                </div>
            `;
            
            utils.showToast('❌ Invalid ticket - entry denied', 'error');
            utils.updateStats('rejected');
            break;
            
        default:
            elements.resultDiv.className = 'verification-result error';
            elements.resultIcon.innerHTML = '❌';
            elements.resultTitle.textContent = 'Verification Error';
            elements.resultMessage.textContent = result.message || 'An unknown error occurred';
            elements.resultDetails.innerHTML = createDetailsHTML('N/A', 'N/A', `
                <div class="info-row error-note">
                    <span class="info-label">🔴 Status:</span>
                    <span class="info-value">SYSTEM ERROR</span>
                </div>
            `);
            
            utils.showToast('❌ System error during verification', 'error');
            utils.updateStats('rejected');
            break;
    }
    
    elements.resultTimestamp.textContent = `Verified at: ${timestamp}`;
    
    // Scroll to result
    elements.resultDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// Event Listeners (keeping all existing functionality)
elements.toggleCameraBtn.addEventListener('click', async () => {
    if (isScannerActive) {
        await cameraManager.stopScanner();
    } else {
        await cameraManager.startScanner();
    }
});

elements.switchCameraBtn.addEventListener('click', () => {
    cameraManager.switchCamera();
});

elements.manualVerifyForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const ticketId = elements.manualIdInput.value.trim();
    
    if (ticketId) {
        verifyTicketId(ticketId);
    } else {
        utils.showToast('Please enter a ticket ID', 'warning');
        elements.manualIdInput.focus();
    }
});

elements.logoutBtn.addEventListener('click', async () => {
    if (confirm('🚪 Are you sure you want to logout?')) {
        await cameraManager.stopScanner();
        sessionStorage.removeItem('isVerifierLoggedIn');
        utils.showToast('👋 Logged out successfully', 'info');
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1000);
    }
});

// Manual input validation
elements.manualIdInput.addEventListener('input', utils.debounce((e) => {
    const value = e.target.value.trim().toUpperCase();
    e.target.value = value;
    
    if (value && !utils.validateTicketId(value)) {
        e.target.style.borderColor = '#dc3545';
        e.target.title = 'Invalid format. Expected: EVENT-XXXXX';
    } else {
        e.target.style.borderColor = '';
        e.target.title = '';
    }
}, 300));

// FAB Menu
if (elements.fabMain) {
    elements.fabMain.addEventListener('click', () => {
        const menu = document.querySelector('.fab-menu');
        if (menu) {
            menu.classList.toggle('hidden');
        }
    });
}

// Global Functions for FAB actions
window.clearResults = function() {
    if (elements.resultDiv) {
        elements.resultDiv.classList.add('hidden');
    }
    if (elements.manualIdInput) {
        elements.manualIdInput.value = '';
    }
    utils.showToast('🗑️ Results cleared', 'info');
};

window.exportStats = function() {
    const statsData = {
        timestamp: utils.formatTimestamp(),
        stats: sessionStats,
        session_duration: 'Current session'
    };
    
    const dataStr = JSON.stringify(statsData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `verification-stats-${Date.now()}.json`;
    link.click();
    
    URL.revokeObjectURL(url);
    utils.showToast('📊 Stats exported successfully', 'success');
};

window.refreshStats = function() {
    sessionStats = { verified: 0, rejected: 0, duplicates: 0, total: 0 };
    if (elements.verifiedCount) elements.verifiedCount.textContent = '0';
    if (elements.rejectedCount) elements.rejectedCount.textContent = '0';
    if (elements.duplicateCount) elements.duplicateCount.textContent = '0';
    if (elements.totalCount) elements.totalCount.textContent = '0';
    utils.showToast('🔄 Stats refreshed', 'info');
};

// NEW: Debug functions
window.testConnection = async function() {
    utils.showToast('🔍 Testing API connection...', 'info');
    const result = await api.testConnection();
    
    if (result.success) {
        utils.showToast('✅ API connection successful!', 'success');
        console.log('API Test Result:', result.result);
    } else {
        utils.showToast(`❌ API connection failed: ${result.error}`, 'error');
        console.error('API Test Failed:', result);
    }
};

window.debugMode = function(enable = true) {
    CONFIG.DEBUG_MODE = enable;
    utils.showToast(`🔍 Debug mode ${enable ? 'enabled' : 'disabled'}`, 'info');
};

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Alt + S to focus manual input
    if (e.altKey && e.key === 's') {
        e.preventDefault();
        if (elements.manualIdInput) {
            elements.manualIdInput.focus();
        }
    }
    
    // Alt + C to toggle camera
    if (e.altKey && e.key === 'c') {
        e.preventDefault();
        if (elements.toggleCameraBtn) {
            elements.toggleCameraBtn.click();
        }
    }
    
    // Alt + T to test connection
    if (e.altKey && e.key === 't') {
        e.preventDefault();
        window.testConnection();
    }
    
    // Escape to clear results
    if (e.key === 'Escape') {
        window.clearResults();
    }
});

// Initialize on page load
document.addEventListener('DOMContentLoaded', async () => {
    utils.debugLog('=== Verification System Initializing ===');
    
    // Test API connection first
    const connectionTest = await api.testConnection();
    if (!connectionTest.success) {
        utils.showToast('⚠️ API connection issue detected. Check console for details.', 'warning', 5000);
        console.error('API Connection Test Failed:', connectionTest);
    }
    
    // Initialize cameras
    await cameraManager.initializeCameras();
    
    // Focus manual input
    if (elements.manualIdInput) {
        elements.manualIdInput.focus();
    }
    
    // Auto-start camera if available
    if (availableCameras.length > 0) {
        setTimeout(() => {
            cameraManager.startScanner();
        }, 1000);
    }
    
    utils.debugLog('Verification system initialized');
    console.log('🔍 Debug mode enabled. Use Alt+T to test API connection.');
});

// Performance monitoring
if ('performance' in window) {
    window.addEventListener('load', () => {
        const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
        utils.debugLog(`Verification system loaded in ${loadTime}ms`);
    });
}