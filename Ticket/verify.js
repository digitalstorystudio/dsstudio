// Security Guard - Enhanced session check
if (sessionStorage.getItem('isVerifierLoggedIn') !== 'true') {
    alert('You must be logged in to access the verification page.');
    window.location.href = 'login.html';
}

// Configuration with better error handling
const CONFIG = {
    SCRIPT_URL: "https://script.google.com/macros/s/AKfycbxgcC0w3kjgG8sBR-sqyQUxKj2hiCK0mWgF2NeB2OUhSYh_usgGbVnV4t8QLP5H0JvC/exec",
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY: 1000,
    SCAN_CONFIG: {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        rememberLastUsedCamera: true
    }
};

// Cache DOM elements
const elements = {
    resultDiv: document.getElementById('verificationResult'),
    manualVerifyForm: document.getElementById('verifyForm'),
    manualIdInput: document.getElementById('manualId'),
    logoutBtn: document.getElementById('logoutBtn')
};

// Utility functions
const utils = {
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

    validateTicketId(ticketId) {
        // Basic validation for ticket ID format
        const ticketRegex = /^EVENT-[A-Z0-9]{5,10}$/i;
        return ticketRegex.test(ticketId.trim());
    },

    showNotification(message, type = 'info') {
        // Create a simple notification system
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 5px;
            color: white;
            font-weight: bold;
            z-index: 1000;
            animation: slideIn 0.3s ease-out;
        `;
        
        // Set background color based on type
        const colors = {
            success: '#28a745',
            error: '#dc3545',
            warning: '#ffc107',
            info: '#17a2b8'
        };
        notification.style.backgroundColor = colors[type] || colors.info;
        
        document.body.appendChild(notification);
        
        // Auto remove after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease-out';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
};

// Enhanced API functions with retry logic
const api = {
    async verifyTicketWithRetry(ticketId, attempt = 1) {
        try {
            const verifyUrl = `${CONFIG.SCRIPT_URL}?id=${encodeURIComponent(ticketId)}&timestamp=${Date.now()}`;
            
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
            
            const response = await fetch(verifyUrl, {
                signal: controller.signal,
                cache: 'no-cache'
            });
            
            clearTimeout(timeoutId);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const result = await response.json();
            return result;
            
        } catch (error) {
            console.error(`Verification attempt ${attempt} failed:`, error);
            
            if (attempt < CONFIG.RETRY_ATTEMPTS && !error.name === 'AbortError') {
                utils.showNotification(`Retry attempt ${attempt}/${CONFIG.RETRY_ATTEMPTS}`, 'warning');
                await new Promise(resolve => setTimeout(resolve, CONFIG.RETRY_DELAY * attempt));
                return this.verifyTicketWithRetry(ticketId, attempt + 1);
            }
            
            throw error;
        }
    }
};

// Enhanced verification handler
async function verifyTicketId(ticketId) {
    const trimmedId = ticketId.trim();
    
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
            message: 'Invalid ticket ID format. Expected format: EVENT-XXXXX' 
        });
        return;
    }
    
    // Show loading state
    elements.resultDiv.className = 'verification-result';
    elements.resultDiv.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: center; gap: 10px;">
            <div style="width: 20px; height: 20px; border: 2px solid #f3f3f3; border-top: 2px solid #3498db; border-radius: 50%; animation: spin 1s linear infinite;"></div>
            <span>Verifying ticket...</span>
        </div>
    `;
    elements.resultDiv.classList.add('result-warning');
    elements.resultDiv.classList.remove('hidden');
    
    try {
        const result = await api.verifyTicketWithRetry(trimmedId);
        handleVerificationResponse(result);
        
        // Clear input on successful verification
        if (result.status === 'success') {
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
    }
}

// Enhanced response handler with better UX
function handleVerificationResponse(result) {
    elements.resultDiv.classList.remove('hidden');
    
    const name = result.data?.name || 'Unknown';
    const type = result.data?.type || 'Unknown';
    const timestamp = new Date().toLocaleTimeString();
    
    // Create result content with better formatting
    const createResultHTML = (icon, message, details = '') => {
        return `
            <div style="margin-bottom: 10px;">
                <span style="font-size: 1.2em;">${icon}</span>
                <strong style="margin-left: 5px;">${message}</strong>
            </div>
            ${details}
            <div style="font-size: 0.8em; color: #666; margin-top: 10px;">
                Verified at: ${timestamp}
            </div>
        `;
    };
    
    switch (result.status) {
        case 'success':
            elements.resultDiv.className = 'verification-result result-success';
            elements.resultDiv.innerHTML = createResultHTML(
                '✅',
                'Valid Ticket!',
                `<div style="margin-top: 10px;">
                    <div><strong>Name:</strong> ${name}</div>
                    <div><strong>Pass Type:</strong> ${type}</div>
                </div>`
            );
            utils.showNotification(`✅ Valid ticket for ${name}`, 'success');
            break;
            
        case 'already_verified':
            elements.resultDiv.className = 'verification-result result-warning';
            elements.resultDiv.innerHTML = createResultHTML(
                '⚠️',
                'Already Used!',
                `<div style="margin-top: 10px;">
                    <div><strong>Name:</strong> ${name}</div>
                    <div><strong>Pass Type:</strong> ${type}</div>
                    <div style="color: #856404; font-weight: bold; margin-top: 5px;">
                        This ticket has already been verified.
                    </div>
                </div>`
            );
            utils.showNotification(`⚠️ Ticket already used by ${name}`, 'warning');
            break;
            
        case 'not_found':
            elements.resultDiv.className = 'verification-result result-error';
            elements.resultDiv.innerHTML = createResultHTML(
                '❌',
                'Invalid Ticket!',
                `<div style="margin-top: 10px; color: #721c24;">
                    This ticket ID was not found in our system.
                </div>`
            );
            utils.showNotification('❌ Invalid ticket ID', 'error');
            break;
            
        default:
            elements.resultDiv.className = 'verification-result result-error';
            elements.resultDiv.innerHTML = createResultHTML(
                '❌',
                'Verification Error',
                `<div style="margin-top: 10px; color: #721c24;">
                    ${result.message || 'An unknown error occurred'}
                </div>`
            );
            utils.showNotification('❌ Verification failed', 'error');
            break;
    }
    
    // Add animation
    elements.resultDiv.style.animation = 'none';
    setTimeout(() => {
        elements.resultDiv.style.animation = 'fadeIn 0.3s ease-out';
    }, 10);
}

// Enhanced QR Scanner with better error handling
let html5QrcodeScanner;

function initializeScanner() {
    try {
        // Check if camera is available
        Html5Qrcode.getCameras().then(cameras => {
            if (cameras && cameras.length) {
                html5QrcodeScanner = new Html5QrcodeScanner(
                    "qr-reader", 
                    CONFIG.SCAN_CONFIG,
                    false // verbose logging
                );
                
                html5QrcodeScanner.render(onScanSuccess, onScanError);
            } else {
                document.getElementById('qr-reader').innerHTML = `
                    <div style="padding: 20px; text-align: center; color: #856404; background: #fff3cd; border-radius: 5px;">
                        📷 No camera detected. Please use manual verification.
                    </div>
                `;
            }
        }).catch(error => {
            console.error("Camera access error:", error);
            document.getElementById('qr-reader').innerHTML = `
                <div style="padding: 20px; text-align: center; color: #721c24; background: #f8d7da; border-radius: 5px;">
                    📷 Camera access denied. Please enable camera permissions or use manual verification.
                </div>
            `;
        });
    } catch (error) {
        console.error("Scanner initialization error:", error);
    }
}

function onScanSuccess(decodedText, decodedResult) {
    // Debounce scan success to prevent multiple rapid scans
    if (window.lastScanTime && Date.now() - window.lastScanTime < 2000) {
        return;
    }
    window.lastScanTime = Date.now();
    
    // Pause scanner temporarily
    html5QrcodeScanner.pause(true);
    
    verifyTicketId(decodedText).finally(() => {
        // Resume scanner after 3 seconds
        setTimeout(() => {
            if (html5QrcodeScanner) {
                html5QrcodeScanner.resume();
            }
        }, 3000);
    });
}

function onScanError(errorMessage) {
    // Only log error, don't show to user (too noisy)
    if (errorMessage !== "QR code parse error, error = NotFoundException: No MultiFormat Readers were able to detect the code.") {
        console.warn("QR Scan error:", errorMessage);
    }
}

// Event listeners with enhanced validation
elements.manualVerifyForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const ticketId = elements.manualIdInput.value.trim();
    
    if (ticketId) {
        verifyTicketId(ticketId);
    } else {
        utils.showNotification('Please enter a ticket ID', 'warning');
        elements.manualIdInput.focus();
    }
});

// Real-time validation for manual input
elements.manualIdInput.addEventListener('input', utils.debounce((e) => {
    const value = e.target.value.trim();
    if (value && !utils.validateTicketId(value)) {
        e.target.style.borderColor = '#dc3545';
        e.target.title = 'Invalid format. Expected: EVENT-XXXXX';
    } else {
        e.target.style.borderColor = '';
        e.target.title = '';
    }
}, 300));

// Enhanced logout with confirmation
elements.logoutBtn.addEventListener('click', () => {
    if (confirm('Are you sure you want to logout?')) {
        // Clean up scanner
        if (html5QrcodeScanner) {
            html5QrcodeScanner.clear();
        }
        
        sessionStorage.removeItem('isVerifierLoggedIn');
        utils.showNotification('Logged out successfully', 'info');
        
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1000);
    }
});

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Alt + V for quick focus on manual input
    if (e.altKey && e.key === 'v') {
        e.preventDefault();
        elements.manualIdInput.focus();
    }
    
    // Escape to clear result
    if (e.key === 'Escape') {
        elements.resultDiv.classList.add('hidden');
    }
});

// Initialize scanner when page loads
document.addEventListener('DOMContentLoaded', () => {
    initializeScanner();
    
    // Add helpful tooltip
    elements.manualIdInput.placeholder = 'e.g., EVENT-ABC123DE (Alt+V to focus)';
});

// Auto-refresh session (optional)
setInterval(() => {
    if (sessionStorage.getItem('isVerifierLoggedIn') !== 'true') {
        window.location.href = 'login.html';
    }
}, 30000); // Check every 30 seconds

// Performance monitoring
if ('performance' in window) {
    window.addEventListener('load', () => {
        const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
        console.log(`Verification page loaded in ${loadTime}ms`);
    });
}