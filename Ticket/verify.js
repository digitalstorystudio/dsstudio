// --- Enhanced Security Guard with Modern UI ---
// Yeh check karta hai ki user logged in hai ya nahi
if (sessionStorage.getItem('isVerifierLoggedIn') !== 'true') {
    alert('🔒 You must be logged in to access the verification page.');
    window.location.href = 'login.html';
}

// Replace with your Google Apps Script Web App URL
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzkC9MrZAcfvJ39iq0cBZX9Udi31WFWj4X8W3dQaHRm-oJQAS83or9TAw3CUI5OAt7A/exec";

const resultDiv = document.getElementById('verificationResult');
const manualVerifyForm = document.getElementById('verifyForm');
const manualIdInput = document.getElementById('manualId');
let lastScannedCode = '';
let scanCooldown = false;

async function verifyTicketId(ticketId) {
    // Prevent duplicate scans
    if (ticketId === lastScannedCode && scanCooldown) {
        return;
    }
    
    lastScannedCode = ticketId;
    scanCooldown = true;
    
    // Clear previous results
    resultDiv.className = 'verification-result';
    resultDiv.innerHTML = '<span class="spinner"></span>🔍 Verifying ticket...';
    resultDiv.classList.add('result-warning');
    resultDiv.classList.remove('hidden');

    try {
        const verifyUrl = `${SCRIPT_URL}?id=${encodeURIComponent(ticketId)}`;
        const response = await fetch(verifyUrl);
        
        if (!response.ok) {
            throw new Error(`Server error: ${response.status}`);
        }
        
        const result = await response.json();
        handleVerificationResponse(result, ticketId);
        
    } catch (error) {
        console.error('Verification error:', error);
        handleVerificationResponse({ 
            status: 'error', 
            message: 'Verification failed. Please check your connection and try again.' 
        }, ticketId);
    }
    
    // Reset cooldown after 2 seconds
    setTimeout(() => {
        scanCooldown = false;
    }, 2000);
}

function handleVerificationResponse(result, ticketId) {
    resultDiv.classList.remove('hidden');
    
    // Get ticket data
    const name = result.data ? result.data.name : 'Unknown';
    const type = result.data ? result.data.type : 'Unknown';
    const timestamp = new Date().toLocaleTimeString();
    
    // Sound effects (if supported)
    playSound(result.status);
    
    switch (result.status) {
        case 'success':
            resultDiv.className = 'verification-result result-success';
            resultDiv.innerHTML = `
                <div style="font-size: 1.2em; margin-bottom: 12px;">✅ VALID TICKET</div>
                <div><strong>🎫 ID:</strong> ${ticketId}</div>
                <div><strong>👤 Name:</strong> ${name}</div>
                <div><strong>🎟️ Pass:</strong> ${type}</div>
                <div style="font-size: 0.9em; color: #065f46; margin-top: 8px;">⏰ Verified at ${timestamp}</div>
            `;
            break;
            
        case 'already_verified':
            resultDiv.className = 'verification-result result-warning';
            resultDiv.innerHTML = `
                <div style="font-size: 1.2em; margin-bottom: 12px;">⚠️ ALREADY USED</div>
                <div><strong>🎫 ID:</strong> ${ticketId}</div>
                <div><strong>👤 Name:</strong> ${name}</div>
                <div><strong>🎟️ Pass:</strong> ${type}</div>
                <div style="font-size: 0.9em; color: #92400e; margin-top: 8px;">This ticket has already been verified</div>
            `;
            break;
            
        case 'not_found':
            resultDiv.className = 'verification-result result-error';
            resultDiv.innerHTML = `
                <div style="font-size: 1.2em; margin-bottom: 12px;">❌ INVALID TICKET</div>
                <div><strong>🎫 ID:</strong> ${ticketId}</div>
                <div style="color: #991b1b; margin-top: 8px;">This ticket does not exist in our system</div>
            `;
            break;
            
        default:
            resultDiv.className = 'verification-result result-error';
            resultDiv.innerHTML = `
                <div style="font-size: 1.2em; margin-bottom: 12px;">❌ ERROR</div>
                <div>${result.message || 'An unknown error occurred'}</div>
            `;
            break;
    }
    
    // Add auto-clear for results
    setTimeout(() => {
        if (!resultDiv.classList.contains('hidden')) {
            resultDiv.style.opacity = '0.6';
        }
    }, 10000); // Fade after 10 seconds
}

function playSound(status) {
    try {
        // Create audio context for sound feedback
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        // Different sounds for different statuses
        switch (status) {
            case 'success':
                oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
                oscillator.frequency.setValueAtTime(1000, audioContext.currentTime + 0.1);
                break;
            case 'already_verified':
                oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
                oscillator.frequency.setValueAtTime(300, audioContext.currentTime + 0.1);
                break;
            case 'not_found':
            case 'error':
                oscillator.frequency.setValueAtTime(200, audioContext.currentTime);
                break;
        }
        
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.2);
    } catch (error) {
        // Sound not supported, ignore
    }
}

function onScanSuccess(decodedText, decodedResult) {
    // Update input field with scanned code
    manualIdInput.value = decodedText.toUpperCase();
    
    // Auto-verify scanned code
    verifyTicketId(decodedText);
    
    // Visual feedback for successful scan
    const qrReader = document.getElementById('qr-reader');
    qrReader.style.borderColor = 'var(--success-color)';
    qrReader.style.boxShadow = '0 0 10px rgba(16, 185, 129, 0.3)';
    
    setTimeout(() => {
        qrReader.style.borderColor = '';
        qrReader.style.boxShadow = '';
    }, 1000);
}

function onScanError(errorMessage) {
    // Optional: handle scan error silently
    // Don't log every scan attempt to avoid console spam
}

// Initialize QR Scanner with enhanced settings
const html5QrcodeScanner = new Html5QrcodeScanner(
    "qr-reader", 
    { 
        fps: 10, 
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
        disableFlip: false,
        supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA]
    }
);

html5QrcodeScanner.render(onScanSuccess, onScanError);

// Enhanced manual verification form
manualVerifyForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const ticketId = manualIdInput.value.trim().toUpperCase();
    const submitBtn = e.target.querySelector('button[type="submit"]');
    
    if (!ticketId) {
        showError('❌ Please enter a ticket ID');
        manualIdInput.focus();
        return;
    }
    
    // Validate ticket ID format (basic check)
    if (!ticketId.startsWith('EVENT-') || ticketId.length < 10) {
        showError('❌ Invalid ticket ID format. Should start with "EVENT-"');
        manualIdInput.focus();
        return;
    }
    
    verifyTicketId(ticketId);
});

function showError(message) {
    resultDiv.className = 'verification-result result-error';
    resultDiv.textContent = message;
    resultDiv.classList.remove('hidden');
    
    setTimeout(() => {
        resultDiv.classList.add('hidden');
    }, 4000);
}

// Enhanced logout functionality
document.getElementById('logoutBtn').addEventListener('click', () => {
    if (confirm('🚪 Are you sure you want to logout from the verification system?')) {
        // Stop QR scanner
        html5QrcodeScanner.clear();
        
        // Smooth transition
        document.body.style.opacity = '0';
        document.body.style.transform = 'scale(0.95)';
        
        setTimeout(() => {
            sessionStorage.removeItem('isVerifierLoggedIn');
            alert('👋 You have been logged out successfully!');
            window.location.href = 'login.html';
        }, 300);
    }
});

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // Enter to verify manually
    if (e.key === 'Enter' && document.activeElement === manualIdInput) {
        e.preventDefault();
        manualVerifyForm.dispatchEvent(new Event('submit'));
    }
    
    // Escape to clear results
    if (e.key === 'Escape') {
        resultDiv.classList.add('hidden');
        manualIdInput.focus();
    }
    
    // F5 to refresh scanner
    if (e.key === 'F5') {
        e.preventDefault();
        location.reload();
    }
});

// Enhanced input handling
manualIdInput.addEventListener('input', function(e) {
    // Auto uppercase and format
    let value = e.target.value.toUpperCase().replace(/[^A-Z0-9-]/g, '');
    e.target.value = value;
    
    // Clear previous results when typing
    if (!resultDiv.classList.contains('hidden')) {
        resultDiv.style.opacity = '0.5';
    }
});

manualIdInput.addEventListener('focus', function() {
    this.style.borderColor = 'var(--primary-color)';
    resultDiv.style.opacity = '1';
});

manualIdInput.addEventListener('blur', function() {
    this.style.borderColor = '';
});

// Add paste support with formatting
manualIdInput.addEventListener('paste', function(e) {
    setTimeout(() => {
        const value = e.target.value.toUpperCase().trim().replace(/[^A-Z0-9-]/g, '');
        e.target.value = value;
        
        // Auto-verify if it looks like a valid ticket ID
        if (value.startsWith('EVENT-') && value.length >= 10) {
            setTimeout(() => {
                manualVerifyForm.dispatchEvent(new Event('submit'));
            }, 500);
        }
    }, 10);
});

// Statistics tracking (optional)
let verificationStats = {
    total: 0,
    valid: 0,
    invalid: 0,
    duplicate: 0
};

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    // Add ARIA labels for accessibility
    document.getElementById('qr-reader').setAttribute('aria-label', 'QR Code Scanner for ticket verification');
    
    // Focus on manual input
    manualIdInput.focus();
    
    // Add helpful tooltips
    manualIdInput.title = 'Enter ticket ID or scan QR code above';
    
    console.log('✅ Ticket Verification System loaded successfully!');
    
    // Show system status
    const statusMessage = document.createElement('div');
    statusMessage.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: rgba(99, 102, 241, 0.9);
        color: white;
        padding: 8px 16px;
        border-radius: 20px;
        font-size: 12px;
        font-weight: 600;
        opacity: 0;
        transition: opacity 0.3s ease;
    `;
    statusMessage.textContent = '🟢 System Online';
    document.body.appendChild(statusMessage);
    
    setTimeout(() => {
        statusMessage.style.opacity = '1';
    }, 1000);
    
    setTimeout(() => {
        statusMessage.style.opacity = '0';
        setTimeout(() => statusMessage.remove(), 300);
    }, 4000);
});