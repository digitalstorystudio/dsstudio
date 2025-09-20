// Security Guard - Check if user is logged in
if (sessionStorage.getItem('isGeneratorLoggedIn') !== 'true') {
    alert('You must be logged in to access the ticket generator.');
    window.location.href = 'generator_login.html';
}

// Configuration
const CONFIG = {
    SCRIPT_URL: "https://script.google.com/macros/s/AKfycbxgcC0w3kjgG8sBR-sqyQUxKj2hiCK0mWgF2NeB2OUhSYh_usgGbVnV4t8QLP5H0JvC/exec",
    QR_SIZE: 128,
    DOWNLOAD_DELAY: 100 // Reduced from 200ms
};

// Cache DOM elements
const elements = {
    form: document.getElementById('ticketForm'),
    submitBtn: document.getElementById('submitBtn'),
    loadingDiv: document.getElementById('loading'),
    ticketResultDiv: document.getElementById('ticketResult'),
    downloadBtn: document.getElementById('downloadBtn'),
    generateAnotherBtn: document.getElementById('generateAnotherBtn')
};

// Utility functions
const utils = {
    generateUniqueId: () => 'EVENT-' + Date.now().toString(36).substr(2, 5) + Math.random().toString(36).substr(2, 5).toUpperCase(),
    
    toggleLoadingState: (isLoading) => {
        elements.submitBtn.disabled = isLoading;
        elements.loadingDiv.classList.toggle('hidden', !isLoading);
        elements.ticketResultDiv.classList.toggle('hidden', isLoading);
    },

    showError: (message) => {
        alert(`Error: ${message}`);
        console.error('Application Error:', message);
    }
};

// API functions
const api = {
    async createTicket(formData) {
        try {
            const response = await fetch(CONFIG.SCRIPT_URL, {
                method: 'POST',
                mode: 'cors',
                headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            if (result.status !== 'success') {
                throw new Error(result.message || 'Unknown error occurred');
            }
            
            return result;
        } catch (error) {
            throw new Error(`Failed to create ticket: ${error.message}`);
        }
    }
};

// QR Code generation with optimization
const qrManager = {
    async generateQRCode(text, container) {
        container.innerHTML = '';
        
        return new Promise((resolve, reject) => {
            try {
                new QRCode(container, {
                    text: text,
                    width: CONFIG.QR_SIZE,
                    height: CONFIG.QR_SIZE,
                    correctLevel: QRCode.CorrectLevel.M,
                    colorDark: "#000000",
                    colorLight: "#ffffff"
                });
                
                // Wait for QR code to render
                setTimeout(resolve, CONFIG.DOWNLOAD_DELAY);
            } catch (error) {
                reject(error);
            }
        });
    }
};

// Download manager with improved error handling
const downloadManager = {
    async downloadTicket() {
        const ticketElement = document.getElementById('ticketToDownload');
        const downloadButton = elements.downloadBtn;
        
        // Prevent multiple downloads
        if (downloadButton.disabled) return;
        
        downloadButton.disabled = true;
        downloadButton.textContent = 'Preparing Download...';

        try {
            // Use dom-to-image for better performance (if available)
            if (window.domtoimage) {
                const blob = await domtoimage.toBlob(ticketElement);
                const url = URL.createObjectURL(blob);
                this.triggerDownload(url, `ticket-${document.getElementById('ticketId').textContent}.png`);
                URL.revokeObjectURL(url);
            } else {
                // Fallback to html2canvas
                const canvas = await html2canvas(ticketElement, {
                    scale: 2, // Better quality
                    useCORS: true,
                    allowTaint: true
                });
                
                const url = canvas.toDataURL('image/png');
                this.triggerDownload(url, `ticket-${document.getElementById('ticketId').textContent}.png`);
            }
        } catch (error) {
            utils.showError('Failed to download ticket. Please try again.');
        } finally {
            downloadButton.disabled = false;
            downloadButton.textContent = 'Download Ticket';
        }
    },

    triggerDownload(url, filename) {
        const link = document.createElement('a');
        link.download = filename;
        link.href = url;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
};

// Main ticket display function
async function displayTicket(data) {
    try {
        // Update ticket information
        document.getElementById('ticketName').textContent = data.name;
        document.getElementById('ticketPassType').textContent = data.ticketType;
        document.getElementById('ticketId').textContent = data.ticketId;

        // Generate QR code
        const qrContainer = document.getElementById('qrcode');
        await qrManager.generateQRCode(data.ticketId, qrContainer);

        // Show ticket result
        elements.ticketResultDiv.classList.remove('hidden');
        elements.form.classList.add('hidden');
    } catch (error) {
        utils.showError('Failed to display ticket');
    }
}

// Form submission handler
elements.form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    utils.toggleLoadingState(true);

    const formData = {
        action: 'createTicket',
        ticketId: utils.generateUniqueId(),
        name: document.getElementById('name').value.trim(),
        age: document.getElementById('age').value,
        phone: document.getElementById('phone').value.trim(),
        ticketType: document.getElementById('ticketType').value,
    };

    try {
        await api.createTicket(formData);
        await displayTicket(formData);
    } catch (error) {
        utils.showError(error.message);
    } finally {
        utils.toggleLoadingState(false);
    }
});

// Event listeners
elements.downloadBtn.addEventListener('click', () => downloadManager.downloadTicket());

elements.generateAnotherBtn.addEventListener('click', () => {
    elements.ticketResultDiv.classList.add('hidden');
    elements.form.classList.remove('hidden');
    elements.form.reset();
});

// Logout functionality
document.getElementById('logoutBtn')?.addEventListener('click', () => {
    sessionStorage.removeItem('isGeneratorLoggedIn');
    alert('You have been logged out.');
    window.location.href = 'generator_login.html';
});

// Add input validation
document.getElementById('phone').addEventListener('input', (e) => {
    e.target.value = e.target.value.replace(/[^0-9]/g, '');
});

document.getElementById('age').addEventListener('input', (e) => {
    const value = parseInt(e.target.value);
    if (value < 1 || value > 120) {
        e.target.setCustomValidity('Please enter a valid age (1-120)');
    } else {
        e.target.setCustomValidity('');
    }
});

// Performance monitoring (optional)
if ('performance' in window) {
    window.addEventListener('load', () => {
        const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
        console.log(`Page loaded in ${loadTime}ms`);
    });
}