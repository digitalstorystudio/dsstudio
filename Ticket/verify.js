// Security Guard - Authentication Check
if (sessionStorage.getItem('isVerifierLoggedIn') !== 'true') {
    alert('🔒 Access Denied. Please log in to access the verification system.');
    window.location.href = 'login.html';
}

// Configuration
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
    DEBOUNCE_DELAY: 2000
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

// Utility Functions
const utils = {
    validateTicketId(ticketId) {
        const ticketRegex = /^EVENT-[A-Z0-9]{5,15}$/i;
        return ticketRegex.test(ticketId.trim());
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
            </div>
        `;
        
        const container = document.getElementById('toastContainer');
        container.appendChild(toast);
        
        // Animate in
        setTimeout(() => toast.classList.add('show'), 100);
        
        // Auto remove
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
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
        element.style.transform = 'scale(1.2)';
        element.style.color = '#3498db';
        setTimeout(() => {
            element.style.transform = 'scale(1)';
            element.style.color = '';
        }, 300);
    }
};

// API Functions
const api = {
    async verifyTicket(ticketId, attempt = 1) {
        try {
            const verifyUrl = `${CONFIG.SCRIPT_URL}?id=${encodeURIComponent(ticketId)}&timestamp=${Date.now()}`;
            
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
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const result = await response.json();
            return result;
            
        } catch (error) {
            console.error(`Verification attempt ${attempt} failed:`, error);
            
            if (attempt < CONFIG.RETRY_ATTEMPTS && error.name !== 'AbortError') {
                utils.showToast(`Retry ${attempt}/${CONFIG.RETRY_ATTEMPTS}...`, 'warning', 2000);
                await new Promise(resolve => setTimeout(resolve, CONFIG.RETRY_DELAY * attempt));
                return this.verifyTicket(ticketId, attempt + 1);
            }
            
            throw error;
        }
    }
};

// Camera Management
const cameraManager = {
    async initializeCameras() {
        try {
            availableCameras = await Html5Qrcode.getCameras();
            console.log('📷 Available cameras:', availableCameras.length);
            
            if (availableCameras.length === 0) {
                throw new Error('No cameras found');
            }
            
            if (availableCameras.length > 1) {
                elements.switchCameraBtn.classList.remove('hidden');
            }
            
            return true;
        } catch (error) {
            console.error('Camera initialization error:', error);
            this.showCameraError('No cameras detected or permission denied');
            return false;
        }
    },

    async startScanner() {
        try {
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
            console.error('Scanner start error:', error);
            this.showCameraError(`Failed to start camera: ${error.message}`);
            return false;
        }
    },

    async stopScanner() {
        try {
            if (html5QrcodeScanner && isScannerActive) {
                await html5QrcodeScanner.stop();
                html5QrcodeScanner.clear();
                html5QrcodeScanner = null;
            }
            
            isScannerActive = false;
            this.updateScannerUI(false);
            
        } catch (error) {
            console.error('Scanner stop error:', error);
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
        
        // Prevent duplicate scans
        if (lastScannedTicket === decodedText && now - lastScanTime < CONFIG.DEBOUNCE_DELAY) {
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
        // Only log significant errors, ignore common scan failures
        if (!errorMessage.includes('NotFoundException') && 
            !errorMessage.includes('No MultiFormat Readers')) {
            console.warn('QR Scan error:', errorMessage);
        }
    }
};

// Main Verification Function
async function verifyTicketId(ticketId) {
    const trimmedId = ticketId.trim().toUpperCase();
    
    // Input validation
    if (!trimmedId) {
        handleVerificationResponse({
            status: 'error',
            message: 'Please enter a valid ticket ID'
        });
        return;
    }
    
    if (!utils.validateTicketId(trimmedId)) {
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
        const result = await api.verifyTicket(trimmedId);
        handleVerificationResponse(result);
        
        // Clear manual input on successful scan
        if (elements.manualIdInput.value.trim() === trimmedId) {
            elements.manualIdInput.value = '';
        }
        
    } catch (error) {
        console.error('Verification error:', error);
        
        let errorMessage = 'Verification failed. Please check your connection.';
        if (error.name === 'AbortError') {
            errorMessage = 'Verification timed out. Please try again.';
        } else if (error.message.includes('HTTP')) {
            errorMessage = 'Server error. Please try again later.';
        }
        
        handleVerificationResponse({
            status: 'error',
            message: errorMessage
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
            elements.resultDetails.innerHTML = `
                <div class="result-info">
                    <div class="info-row error-note">
                        <span class="info-label">🔴 Status:</span>
                        <span class="info-value">SYSTEM ERROR</span>
                    </div>
                </div>
            `;
            
            utils.showToast('❌ System error during verification', 'error');
            utils.updateStats('rejected');
            break;
    }
    
    elements.resultTimestamp.textContent = `Verified at: ${timestamp}`;
    
    // Scroll to result
    elements.resultDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// Event Listeners
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
        // Stop scanner
        await cameraManager.stopScanner();
        
        // Clear session
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
elements.fabMain.addEventListener('click', () => {
    const menu = document.querySelector('.fab-menu');
    menu.classList.toggle('hidden');
});

// Global Functions for FAB actions
window.clearResults = function() {
    elements.resultDiv.classList.add('hidden');
    elements.manualIdInput.value = '';
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
    utils.updateStats('verified'); // This will update all counters
    sessionStats.verified = 0; // Reset back to 0
    elements.verifiedCount.textContent = '0';
    utils.showToast('🔄 Stats refreshed', 'info');
};

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Alt + S to focus manual input
    if (e.altKey && e.key === 's') {
        e.preventDefault();
        elements.manualIdInput.focus();
    }
    
    // Alt + C to toggle camera
    if (e.altKey && e.key === 'c') {
        e.preventDefault();
        elements.toggleCameraBtn.click();
    }
    
    // Escape to clear results
    if (e.key === 'Escape') {
        window.clearResults();
    }
});

// Initialize on page load
document.addEventListener('DOMContentLoaded', async () => {
    // Initialize cameras
    await cameraManager.initializeCameras();
    
    // Focus manual input
    elements.manualIdInput.focus();
    
    // Auto-start camera if available
    if (availableCameras.length > 0) {
        setTimeout(() => {
            cameraManager.startScanner();
        }, 1000);
    }
    
    console.log('🔍 Verification system initialized');
});

// Performance monitoring
if ('performance' in window) {
    window.addEventListener('load', () => {
        const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
        console.log(`🚀 Verification system loaded in ${loadTime}ms`);
    });
}