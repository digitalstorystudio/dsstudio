// FIXED Security Guard - Authentication Check
console.log('🔒 Checking authentication...');

// Check if user is logged in
const isLoggedIn = sessionStorage.getItem('isGeneratorLoggedIn');
const loginTime = sessionStorage.getItem('generatorLoginTime');

console.log('Login status:', isLoggedIn);
console.log('Login time:', loginTime);

if (isLoggedIn !== 'true') {
    console.log('❌ Not logged in - redirecting to login page');
    alert('🔒 Access Denied!\n\nYou must log in to access the ticket generator.\n\nClick OK to go to the login page.');
    window.location.href = 'generator_login.html';
    throw new Error('Authentication required'); // Stop script execution
}

// Check session expiry (8 hours)
if (loginTime) {
    const timeSinceLogin = Date.now() - parseInt(loginTime);
    const eightHours = 8 * 60 * 60 * 1000;
    
    if (timeSinceLogin > eightHours) {
        console.log('⏰ Session expired - redirecting to login page');
        sessionStorage.removeItem('isGeneratorLoggedIn');
        sessionStorage.removeItem('generatorLoginTime');
        sessionStorage.removeItem('generatorUser');
        alert('⏰ Session Expired!\n\nYour session has expired. Please log in again.');
        window.location.href = 'generator_login.html';
        throw new Error('Session expired'); // Stop script execution
    }
}

console.log('✅ Authentication successful - loading ticket generator');

// Configuration
const CONFIG = {
    SCRIPT_URL: "https://script.google.com/macros/s/AKfycbxgcC0w3kjgG8sBR-sqyQUxKj2hiCK0mWgF2NeB2OUhSYh_usgGbVnV4t8QLP5H0JvC/exec",
    QR_CONFIG: {
        width: 150,
        height: 150,
        colorDark: "#2c3e50",
        colorLight: "#ffffff",
        correctLevel: QRCode.CorrectLevel.M
    }
};

// DOM Elements Cache
const elements = {
    form: document.getElementById('ticketForm'),
    submitBtn: document.getElementById('submitBtn'),
    loadingDiv: document.getElementById('loading'),
    ticketResultDiv: document.getElementById('ticketResult'),
    downloadBtn: document.getElementById('downloadBtn'),
    generateAnotherBtn: document.getElementById('generateAnotherBtn'),
    logoutBtn: document.getElementById('logoutBtn'),
    nameInput: document.getElementById('name'),
    ageInput: document.getElementById('age'),
    phoneInput: document.getElementById('phone'),
    ticketTypeSelect: document.getElementById('ticketType')
};

// Utility Functions
const utils = {
    generateTicketId() {
        const timestamp = Date.now().toString(36).toUpperCase();
        const random = Math.random().toString(36).substr(2, 4).toUpperCase();
        return `EVENT-${timestamp}${random}`;
    },

    validatePhone(phone) {
        const phoneRegex = /^[6-9]\d{9}$/;
        return phoneRegex.test(phone);
    },

    sanitizeInput(input) {
        return input.trim().replace(/[<>\"'&]/g, '');
    },

    showNotification(message, type = 'success') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-icon">${type === 'success' ? '✅' : type === 'error' ? '❌' : '⚠️'}</span>
                <span class="notification-message">${message}</span>
                <button class="notification-close" onclick="this.parentElement.parentElement.remove()">×</button>
            </div>
        `;
        
        // Add styles if not exist
        if (!document.querySelector('#notification-styles')) {
            const style = document.createElement('style');
            style.id = 'notification-styles';
            style.textContent = `
                .notification {
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
                .notification-success { border-left-color: #27ae60; }
                .notification-error { border-left-color: #e74c3c; }
                .notification-warning { border-left-color: #f39c12; }
                .notification-content {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }
                .notification-message { flex: 1; font-weight: 500; }
                .notification-close {
                    background: none;
                    border: none;
                    font-size: 18px;
                    cursor: pointer;
                    color: #7f8c8d;
                }
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
            `;
            document.head.appendChild(style);
        }
        
        document.body.appendChild(notification);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.animation = 'slideIn 0.3s ease-out reverse';
                setTimeout(() => notification.remove(), 300);
            }
        }, 5000);
    },

    toggleLoadingState(isLoading) {
        elements.submitBtn.disabled = isLoading;
        elements.loadingDiv.classList.toggle('hidden', !isLoading);
        
        if (isLoading) {
            elements.submitBtn.innerHTML = `
                <div class="btn-loading">
                    <div class="btn-spinner"></div>
                    <span>Generating...</span>
                </div>
            `;
        } else {
            elements.submitBtn.innerHTML = `
                <span class="btn-icon">🎟️</span>
                Generate Ticket
            `;
        }
    }
};

// API Functions
const api = {
    async createTicket(formData) {
        try {
            console.log('📡 Sending ticket data to server...');
            
            const response = await fetch(CONFIG.SCRIPT_URL, {
                method: 'POST',
                mode: 'cors',
                headers: {
                    'Content-Type': 'text/plain;charset=utf-8',
                },
                body: JSON.stringify(formData),
            });

            console.log('📡 Server response status:', response.status);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: Server error occurred`);
            }

            const result = await response.json();
            console.log('📡 Server response:', result);
            
            if (result.status !== 'success') {
                throw new Error(result.message || 'Failed to create ticket');
            }
            
            return result;
        } catch (error) {
            console.error('API Error:', error);
            throw new Error(`Ticket creation failed: ${error.message}`);
        }
    }
};

// QR Code Management - COPYABLE & DRAGGABLE
const qrManager = {
    async generateQRCode(text, container) {
        return new Promise((resolve, reject) => {
            try {
                console.log('🔳 Generating copyable QR code for:', text);
                
                // COMPLETELY clear container and reset
                container.innerHTML = '';
                container.style.cssText = `
                    width: 150px !important;
                    height: 150px !important;
                    margin: 0 auto !important;
                    display: flex !important;
                    align-items: center !important;
                    justify-content: center !important;
                    background: #ffffff !important;
                    border: 2px solid #2c3e50 !important;
                    border-radius: 8px !important;
                    padding: 10px !important;
                    box-sizing: border-box !important;
                    cursor: grab !important;
                    position: relative !important;
                `;
                
                // Add helpful tooltip
                container.title = "Right-click to copy QR code • Drag to move • Double-click to download";
                
                // Create QR code with specific settings to avoid duplicates
                const qrCodeInstance = new QRCode(container, {
                    text: text,
                    width: 130,
                    height: 130,
                    colorDark: "#000000",
                    colorLight: "#ffffff",
                    correctLevel: QRCode.CorrectLevel.M,
                    drawer: 'canvas' // Force canvas only to avoid img+canvas duplication
                });
                
                // Wait for QR code generation and setup copy/drag functionality
                setTimeout(() => {
                    // Remove any duplicate elements - keep only ONE QR element
                    const allImages = container.querySelectorAll('img');
                    const allCanvas = container.querySelectorAll('canvas');
                    
                    console.log('Found images:', allImages.length, 'Found canvas:', allCanvas.length);
                    
                    let qrElement = null;
                    
                    // Strategy: Keep only the canvas OR the first image, remove everything else
                    if (allCanvas.length > 0) {
                        // Keep only the first canvas, remove all images and other canvas
                        for (let i = 1; i < allCanvas.length; i++) {
                            allCanvas[i].remove();
                        }
                        for (let i = 0; i < allImages.length; i++) {
                            allImages[i].remove();
                        }
                        
                        // Style the remaining canvas
                        qrElement = allCanvas[0];
                        
                    } else if (allImages.length > 0) {
                        // Keep only the first image, remove others
                        for (let i = 1; i < allImages.length; i++) {
                            allImages[i].remove();
                        }
                        
                        // Style the remaining image
                        qrElement = allImages[0];
                    }
                    
                    if (qrElement) {
                        // Style the QR element
                        qrElement.style.cssText = `
                            display: block !important;
                            max-width: 130px !important;
                            max-height: 130px !important;
                            width: 130px !important;
                            height: 130px !important;
                            margin: 0 auto !important;
                            cursor: grab !important;
                            user-select: none !important;
                            -webkit-user-drag: element !important;
                            -webkit-user-select: none !important;
                        `;
                        
                        // Make QR code draggable and copyable
                        this.setupCopyDragFunctionality(qrElement, container, text);
                        
                        console.log('✅ Copyable QR code generated successfully');
                        resolve();
                        
                    } else {
                        console.warn('No QR elements found - using fallback');
                        // Fallback: create single text-based QR
                        const fallbackDiv = document.createElement('div');
                        fallbackDiv.style.cssText = `
                            width: 130px !important; 
                            height: 130px !important; 
                            border: 2px solid #000 !important; 
                            display: flex !important; 
                            align-items: center !important; 
                            justify-content: center !important; 
                            background: #f8f9fa !important; 
                            font-size: 9px !important; 
                            text-align: center !important; 
                            word-break: break-all !important;
                            padding: 8px !important;
                            box-sizing: border-box !important;
                            font-family: monospace !important;
                            margin: 0 auto !important;
                            cursor: grab !important;
                            user-select: text !important;
                        `;
                        fallbackDiv.innerHTML = `
                            <div>
                                <div style="font-weight: bold; margin-bottom: 8px; font-size: 11px;">QR CODE</div>
                                <div style="line-height: 1.1; user-select: text;">${text}</div>
                            </div>
                        `;
                        
                        container.innerHTML = '';
                        container.appendChild(fallbackDiv);
                        
                        // Setup copy functionality for fallback
                        this.setupCopyDragFunctionality(fallbackDiv, container, text);
                        
                        resolve();
                    }
                }, 800); // Longer wait to ensure generation is complete
                
            } catch (error) {
                console.error('QR generation error:', error);
                // Single fallback display
                container.innerHTML = `
                    <div style="
                        width: 130px !important; 
                        height: 130px !important; 
                        border: 2px solid #dc3545 !important; 
                        display: flex !important; 
                        align-items: center !important; 
                        justify-content: center !important; 
                        background: #f8d7da !important; 
                        color: #721c24 !important;
                        font-size: 10px !important; 
                        text-align: center !important;
                        font-weight: bold !important;
                        margin: 0 auto !important;
                        cursor: not-allowed !important;
                    ">
                        <div>
                            <div>QR ERROR</div>
                            <div style="font-size: 8px; margin-top: 5px;">Manual verification required</div>
                        </div>
                    </div>
                `;
                resolve(); // Don't reject, use fallback
            }
        });
    },
    
    // NEW: Setup copy and drag functionality
    setupCopyDragFunctionality(qrElement, container, ticketId) {
        try {
            // Make container draggable
            container.draggable = true;
            qrElement.draggable = true;
            
            // Add visual feedback for interactions
            container.addEventListener('mouseenter', () => {
                container.style.transform = 'scale(1.05)';
                container.style.boxShadow = '0 4px 20px rgba(52, 152, 219, 0.3)';
                container.style.borderColor = '#3498db';
            });
            
            container.addEventListener('mouseleave', () => {
                container.style.transform = 'scale(1)';
                container.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
                container.style.borderColor = '#2c3e50';
            });
            
            // Drag start event
            const handleDragStart = (e) => {
                console.log('🎯 QR code drag started');
                container.style.opacity = '0.8';
                container.style.cursor = 'grabbing';
                
                try {
                    if (qrElement.tagName === 'CANVAS') {
                        // For canvas elements, convert to data URL
                        const dataURL = qrElement.toDataURL('image/png');
                        e.dataTransfer.setData('text/uri-list', dataURL);
                        e.dataTransfer.setData('text/plain', ticketId);
                        e.dataTransfer.setData('text/html', `<img src="${dataURL}" alt="QR Code: ${ticketId}" title="Ticket: ${ticketId}">`);
                    } else if (qrElement.tagName === 'IMG') {
                        // For image elements
                        e.dataTransfer.setData('text/uri-list', qrElement.src);
                        e.dataTransfer.setData('text/plain', ticketId);
                        e.dataTransfer.setData('text/html', `<img src="${qrElement.src}" alt="QR Code: ${ticketId}" title="Ticket: ${ticketId}">`);
                    } else {
                        // For text fallback
                        e.dataTransfer.setData('text/plain', ticketId);
                    }
                    
                    e.dataTransfer.effectAllowed = 'copy';
                    utils.showNotification('🎯 QR code ready to drop!', 'info');
                } catch (error) {
                    console.warn('Drag setup error:', error);
                    e.dataTransfer.setData('text/plain', ticketId);
                }
            };
            
            // Drag end event
            const handleDragEnd = (e) => {
                container.style.opacity = '1';
                container.style.cursor = 'grab';
                console.log('✅ QR code drag completed');
            };
            
            // Add drag event listeners
            container.addEventListener('dragstart', handleDragStart);
            container.addEventListener('dragend', handleDragEnd);
            qrElement.addEventListener('dragstart', handleDragStart);
            qrElement.addEventListener('dragend', handleDragEnd);
            
            // Right-click context menu for copy
            const handleRightClick = (e) => {
                e.preventDefault();
                this.copyQRCodeToClipboard(qrElement, ticketId);
            };
            
            container.addEventListener('contextmenu', handleRightClick);
            qrElement.addEventListener('contextmenu', handleRightClick);
            
            // Double-click to download QR code separately
            const handleDoubleClick = (e) => {
                e.preventDefault();
                this.downloadQRCodeOnly(qrElement, ticketId);
            };
            
            container.addEventListener('dblclick', handleDoubleClick);
            qrElement.addEventListener('dblclick', handleDoubleClick);
            
            // Keyboard shortcut: Ctrl+C to copy
            container.tabIndex = 0; // Make focusable
            container.addEventListener('keydown', (e) => {
                if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
                    e.preventDefault();
                    this.copyQRCodeToClipboard(qrElement, ticketId);
                }
            });
            
            console.log('🎯 QR code copy/drag functionality enabled');
            
        } catch (error) {
            console.warn('Setup copy/drag functionality error:', error);
        }
    },
    
    // NEW: Copy QR code to clipboard
    async copyQRCodeToClipboard(qrElement, ticketId) {
        try {
            console.log('📋 Copying QR code to clipboard...');
            
            if (qrElement.tagName === 'CANVAS') {
                // Convert canvas to blob and copy as image
                qrElement.toBlob(async (blob) => {
                    try {
                        await navigator.clipboard.write([
                            new ClipboardItem({
                                'image/png': blob,
                                'text/plain': new Blob([ticketId], { type: 'text/plain' })
                            })
                        ]);
                        utils.showNotification('📋 QR code copied to clipboard!', 'success');
                    } catch (error) {
                        console.warn('Clipboard image copy failed:', error);
                        // Fallback: copy ticket ID as text
                        await navigator.clipboard.writeText(ticketId);
                        utils.showNotification('📋 Ticket ID copied to clipboard!', 'success');
                    }
                }, 'image/png');
                
            } else if (qrElement.tagName === 'IMG') {
                // For image elements, try to copy the image
                try {
                    const response = await fetch(qrElement.src);
                    const blob = await response.blob();
                    await navigator.clipboard.write([
                        new ClipboardItem({
                            'image/png': blob,
                            'text/plain': new Blob([ticketId], { type: 'text/plain' })
                        })
                    ]);
                    utils.showNotification('📋 QR code copied to clipboard!', 'success');
                } catch (error) {
                    console.warn('Image copy failed:', error);
                    await navigator.clipboard.writeText(ticketId);
                    utils.showNotification('📋 Ticket ID copied to clipboard!', 'success');
                }
                
            } else {
                // Fallback: copy ticket ID as text
                await navigator.clipboard.writeText(ticketId);
                utils.showNotification('📋 Ticket ID copied to clipboard!', 'success');
            }
            
        } catch (error) {
            console.warn('Clipboard copy failed:', error);
            // Final fallback: select text
            try {
                const textArea = document.createElement('textarea');
                textArea.value = ticketId;
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
                utils.showNotification('📋 Ticket ID copied (fallback method)!', 'success');
            } catch (fallbackError) {
                utils.showNotification('❌ Copy failed. Ticket ID: ' + ticketId, 'error');
            }
        }
    },
    
    // NEW: Download QR code only
    async downloadQRCodeOnly(qrElement, ticketId) {
        try {
            console.log('💾 Downloading QR code only...');
            
            if (qrElement.tagName === 'CANVAS') {
                // Convert canvas to blob and download
                qrElement.toBlob((blob) => {
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.download = `qr-code-${ticketId}.png`;
                    link.href = url;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    URL.revokeObjectURL(url);
                    utils.showNotification('💾 QR code downloaded!', 'success');
                }, 'image/png');
                
            } else if (qrElement.tagName === 'IMG') {
                // For image elements
                const link = document.createElement('a');
                link.download = `qr-code-${ticketId}.png`;
                link.href = qrElement.src;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                utils.showNotification('💾 QR code downloaded!', 'success');
                
            } else {
                utils.showNotification('⚠️ QR code download not available for this format', 'warning');
            }
            
        } catch (error) {
            console.error('QR download error:', error);
            utils.showNotification('❌ QR code download failed', 'error');
        }
    }
};

// Download Manager
const downloadManager = {
    async downloadTicket() {
        const ticketElement = document.getElementById('ticketToDownload');
        const downloadButton = elements.downloadBtn;
        
        if (downloadButton.disabled) return;
        
        downloadButton.disabled = true;
        downloadButton.innerHTML = `
            <div class="btn-loading">
                <div class="btn-spinner"></div>
                <span>Preparing...</span>
            </div>
        `;

        try {
            console.log('💾 Starting ticket download...');
            
            const canvas = await html2canvas(ticketElement, {
                scale: 2,
                useCORS: true,
                allowTaint: true,
                backgroundColor: '#ffffff',
                width: ticketElement.offsetWidth,
                height: ticketElement.offsetHeight
            });
            
            // Convert to blob for better performance
            canvas.toBlob((blob) => {
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                const ticketId = document.getElementById('ticketId').textContent;
                link.download = `ticket-${ticketId}.png`;
                link.href = url;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
                
                console.log('✅ Ticket downloaded successfully');
                utils.showNotification('🎉 Ticket downloaded successfully!', 'success');
            }, 'image/png', 0.95);
            
        } catch (error) {
            console.error('Download error:', error);
            utils.showNotification('❌ Download failed. Please try again.', 'error');
        } finally {
            downloadButton.disabled = false;
            downloadButton.innerHTML = '<span>💾</span> Download Ticket';
        }
    }
};

// Form Validation
const validation = {
    validateName(name) {
        const nameRegex = /^[a-zA-Z\s]{2,50}$/;
        return nameRegex.test(name);
    },

    validateAge(age) {
        return age >= 1 && age <= 120;
    },

    validateForm(formData) {
        const errors = [];

        if (!this.validateName(formData.name)) {
            errors.push('Name should contain only letters and be 2-50 characters long');
        }

        if (!this.validateAge(formData.age)) {
            errors.push('Age should be between 1 and 120');
        }

        if (!utils.validatePhone(formData.phone)) {
            errors.push('Phone number should be a valid 10-digit Indian mobile number');
        }

        if (!formData.ticketType) {
            errors.push('Please select a ticket type');
        }

        return errors;
    }
};

// Main Functions - FIXED DATA BINDING
async function displayTicket(data) {
    try {
        console.log('🎫 Displaying ticket for:', data);
        
        // Get all ticket display elements
        const ticketNameElement = document.getElementById('ticketName');
        const ticketPassTypeElement = document.getElementById('ticketPassType');
        const ticketAgeElement = document.getElementById('ticketAge');
        const ticketIdElement = document.getElementById('ticketId');
        const ticketIdFooterElement = document.getElementById('ticketIdFooter');
        
        // FORCE populate with actual data - NO fallbacks to empty
        console.log('Setting name:', data.name);
        console.log('Setting age:', data.age);
        console.log('Setting pass type:', data.ticketType);
        console.log('Setting ticket ID:', data.ticketId);
        
        // Set Name with strong binding
        if (ticketNameElement) {
            ticketNameElement.textContent = data.name;
            ticketNameElement.innerHTML = data.name; // Double ensure
            ticketNameElement.setAttribute('data-name', data.name);
            console.log('Name element content:', ticketNameElement.textContent);
        }
        
        // Set Age with strong binding
        if (ticketAgeElement) {
            ticketAgeElement.textContent = data.age + ' years';
            ticketAgeElement.innerHTML = data.age + ' years'; // Double ensure
            ticketAgeElement.setAttribute('data-age', data.age);
            console.log('Age element content:', ticketAgeElement.textContent);
        }
        
        // Set Pass Type with strong binding
        if (ticketPassTypeElement) {
            ticketPassTypeElement.textContent = data.ticketType;
            ticketPassTypeElement.innerHTML = data.ticketType; // Double ensure
            ticketPassTypeElement.setAttribute('data-type', data.ticketType);
            console.log('Pass type element content:', ticketPassTypeElement.textContent);
        }
        
        // Set Ticket ID with strong binding
        if (ticketIdElement) {
            ticketIdElement.textContent = data.ticketId;
            ticketIdElement.innerHTML = data.ticketId; // Double ensure
            ticketIdElement.setAttribute('data-id', data.ticketId);
        }
        
        if (ticketIdFooterElement) {
            ticketIdFooterElement.textContent = data.ticketId;
            ticketIdFooterElement.innerHTML = data.ticketId; // Double ensure
        }
        
        // Force immediate DOM update
        if (document.contains(ticketNameElement)) {
            ticketNameElement.style.display = 'inline';
            ticketNameElement.style.visibility = 'visible';
            ticketNameElement.style.opacity = '1';
        }
        
        if (document.contains(ticketAgeElement)) {
            ticketAgeElement.style.display = 'inline';
            ticketAgeElement.style.visibility = 'visible';
            ticketAgeElement.style.opacity = '1';
        }
        
        // Generate QR code with retry mechanism
        const qrContainer = document.getElementById('qrcode');
        if (qrContainer) {
            qrContainer.style.display = 'block';
            qrContainer.style.visibility = 'visible';
            qrContainer.style.opacity = '1';
            
            let qrSuccess = false;
            let attempts = 0;
            const maxAttempts = 3;
            
            while (!qrSuccess && attempts < maxAttempts) {
                try {
                    attempts++;
                    console.log(`QR generation attempt ${attempts}/${maxAttempts}`);
                    await qrManager.generateQRCode(data.ticketId, qrContainer);
                    qrSuccess = true;
                } catch (error) {
                    console.warn(`QR generation attempt ${attempts} failed:`, error);
                    if (attempts === maxAttempts) {
                        qrContainer.innerHTML = `
                            <div style="
                                width: 130px !important; 
                                height: 130px !important; 
                                border: 3px solid #000 !important; 
                                display: flex !important; 
                                align-items: center !important; 
                                justify-content: center !important; 
                                background: #ffffff !important; 
                                font-size: 10px !important; 
                                text-align: center !important; 
                                word-wrap: break-word !important;
                                padding: 15px !important;
                                box-sizing: border-box !important;
                                margin: 0 auto !important;
                                font-family: monospace !important;
                            ">
                                <div>
                                    <div style="font-weight: bold; margin-bottom: 10px; font-size: 12px;">QR CODE</div>
                                    <div style="line-height: 1.2; font-size: 8px;">${data.ticketId}</div>
                                </div>
                            </div>
                        `;
                    }
                }
            }
        }

        // Show ticket result
        elements.ticketResultDiv.classList.remove('hidden');
        elements.form.parentElement.classList.add('hidden');
        
        // CRITICAL: Force re-populate after DOM changes
        setTimeout(() => {
            console.log('🔄 Force re-populating fields after DOM update...');
            
            // Re-populate name if it's empty
            const nameCheck = document.getElementById('ticketName');
            if (nameCheck && (!nameCheck.textContent || nameCheck.textContent.trim() === '')) {
                console.log('⚠️ Name field was empty, re-populating...');
                nameCheck.textContent = data.name;
                nameCheck.innerHTML = data.name;
            }
            
            // Re-populate age if it's empty
            const ageCheck = document.getElementById('ticketAge');
            if (ageCheck && (!ageCheck.textContent || ageCheck.textContent.trim() === '')) {
                console.log('⚠️ Age field was empty, re-populating...');
                ageCheck.textContent = data.age + ' years';
                ageCheck.innerHTML = data.age + ' years';
            }
            
            // Re-populate pass type if it's empty
            const typeCheck = document.getElementById('ticketPassType');
            if (typeCheck && (!typeCheck.textContent || typeCheck.textContent.trim() === '')) {
                console.log('⚠️ Pass type field was empty, re-populating...');
                typeCheck.textContent = data.ticketType;
                typeCheck.innerHTML = data.ticketType;
            }
            
            // Re-populate ticket IDs if empty
            const idCheck = document.getElementById('ticketId');
            const idFooterCheck = document.getElementById('ticketIdFooter');
            if (idCheck && (!idCheck.textContent || idCheck.textContent.trim() === '')) {
                idCheck.textContent = data.ticketId;
                idCheck.innerHTML = data.ticketId;
            }
            if (idFooterCheck && (!idFooterCheck.textContent || idFooterCheck.textContent.trim() === '')) {
                idFooterCheck.textContent = data.ticketId;
                idFooterCheck.innerHTML = data.ticketId;
            }
            
            // Final verification log
            console.log('✅ Final verification:');
            console.log('Name displayed:', document.getElementById('ticketName')?.textContent);
            console.log('Age displayed:', document.getElementById('ticketAge')?.textContent);
            console.log('Pass type displayed:', document.getElementById('ticketPassType')?.textContent);
            console.log('Ticket ID displayed:', document.getElementById('ticketId')?.textContent);
            
            // Scroll to ticket
            elements.ticketResultDiv.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'start' 
            });
        }, 300);

    } catch (error) {
        console.error('Display error:', error);
        utils.showNotification('❌ Failed to display ticket. Please try again.', 'error');
    }
}

// Event Listeners
elements.form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    console.log('📝 Form submitted - generating ticket...');
    
    const formData = {
        action: 'createTicket',
        ticketId: utils.generateTicketId(),
        name: utils.sanitizeInput(elements.nameInput.value),
        age: parseInt(elements.ageInput.value),
        phone: utils.sanitizeInput(elements.phoneInput.value),
        ticketType: elements.ticketTypeSelect.value,
        timestamp: new Date().toISOString()
    };

    console.log('📝 Form data:', formData);

    // Validate form
    const validationErrors = validation.validateForm(formData);
    if (validationErrors.length > 0) {
        utils.showNotification(`❌ ${validationErrors[0]}`, 'error');
        return;
    }

    utils.toggleLoadingState(true);

    try {
        await api.createTicket(formData);
        await displayTicket(formData);
        utils.showNotification('🎉 Ticket generated successfully!', 'success');
        console.log('✅ Ticket generation completed successfully');
    } catch (error) {
        console.error('Generation error:', error);
        utils.showNotification(`❌ ${error.message}`, 'error');
    } finally {
        utils.toggleLoadingState(false);
    }
});

// Download button
elements.downloadBtn.addEventListener('click', () => {
    downloadManager.downloadTicket();
});

// Generate another ticket
elements.generateAnotherBtn.addEventListener('click', () => {
    elements.ticketResultDiv.classList.add('hidden');
    elements.form.parentElement.classList.remove('hidden');
    elements.form.reset();
    
    // Focus on first input
    elements.nameInput.focus();
    
    utils.showNotification('📝 Ready for new ticket generation', 'success');
    console.log('🔄 Ready for new ticket generation');
});

// Logout functionality
elements.logoutBtn.addEventListener('click', () => {
    if (confirm('🚪 Are you sure you want to logout?')) {
        console.log('🚪 User logging out...');
        sessionStorage.removeItem('isGeneratorLoggedIn');
        sessionStorage.removeItem('generatorLoginTime');
        sessionStorage.removeItem('generatorUser');
        utils.showNotification('👋 Logged out successfully', 'success');
        setTimeout(() => {
            window.location.href = 'generator_login.html';
        }, 1000);
    }
});

// Real-time validation
elements.phoneInput.addEventListener('input', (e) => {
    // Only allow numbers
    e.target.value = e.target.value.replace(/[^0-9]/g, '');
    
    // Limit to 10 digits
    if (e.target.value.length > 10) {
        e.target.value = e.target.value.substr(0, 10);
    }
    
    // Visual feedback
    if (e.target.value.length === 10 && utils.validatePhone(e.target.value)) {
        e.target.style.borderColor = '#28a745';
    } else if (e.target.value.length > 0) {
        e.target.style.borderColor = '#dc3545';
    } else {
        e.target.style.borderColor = '';
    }
});

elements.nameInput.addEventListener('input', (e) => {
    // Remove numbers and special characters
    e.target.value = e.target.value.replace(/[^a-zA-Z\s]/g, '');
});

elements.ageInput.addEventListener('input', (e) => {
    const age = parseInt(e.target.value);
    if (age < 1 || age > 120) {
        e.target.style.borderColor = '#dc3545';
    } else {
        e.target.style.borderColor = '#28a745';
    }
});

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Ticket generator initialized');
    
    // Focus first input
    elements.nameInput.focus();
    
    // Show welcome message
    const currentUser = sessionStorage.getItem('generatorUser') || 'User';
    utils.showNotification(`👋 Welcome ${currentUser}! Ready to generate tickets.`, 'success');
});

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Ctrl + Enter to download ticket
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && !elements.ticketResultDiv.classList.contains('hidden')) {
        elements.downloadBtn.click();
    }
    
    // Escape to go back
    if (e.key === 'Escape' && !elements.ticketResultDiv.classList.contains('hidden')) {
        elements.generateAnotherBtn.click();
    }
});

// Performance monitoring
if ('performance' in window) {
    window.addEventListener('load', () => {
        const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
        console.log(`🚀 Ticket Generator loaded in ${loadTime}ms`);
    });
}

console.log('✅ Script initialization completed successfully');