// Configuration
const CONFIG = {
    SCRIPT_URL: "https://script.google.com/macros/s/AKfycbxgcC0w3kjgG8sBR-sqyQUxKj2hiCK0mWgF2NeB2OUhSYh_usgGbVnV4t8QLP5H0JvC/exec",
    MAX_LOGIN_ATTEMPTS: 5,
    LOCKOUT_TIME: 300000 // 5 minutes
};

// DOM Elements
const elements = {
    loginForm: document.getElementById('loginForm'),
    usernameInput: document.getElementById('username'),
    passwordInput: document.getElementById('password'),
    loginBtn: document.getElementById('loginBtn'),
    loginMessage: document.getElementById('loginMessage'),
    passwordToggle: document.getElementById('passwordToggle'),
    toggleIcon: document.getElementById('toggleIcon'),
    loadingOverlay: document.getElementById('loadingOverlay')
};

// Login attempts tracking
let loginAttempts = parseInt(localStorage.getItem('loginAttempts')) || 0;
let lastAttemptTime = parseInt(localStorage.getItem('lastAttemptTime')) || 0;

// Utility Functions
const utils = {
    showMessage(message, type = 'error') {
        elements.loginMessage.className = `login-message ${type}`;
        elements.loginMessage.innerHTML = `
            <div class="message-content">
                <span class="message-icon">${type === 'success' ? '✅' : type === 'warning' ? '⚠️' : '❌'}</span>
                <span class="message-text">${message}</span>
            </div>
        `;
        elements.loginMessage.classList.remove('hidden');
        
        // Auto-hide success messages
        if (type === 'success') {
            setTimeout(() => {
                elements.loginMessage.classList.add('hidden');
            }, 3000);
        }
    },

    hideMessage() {
        elements.loginMessage.classList.add('hidden');
    },

    showLoading(show = true) {
        elements.loadingOverlay.classList.toggle('hidden', !show);
        elements.loginBtn.disabled = show;
        
        if (show) {
            elements.loginBtn.innerHTML = `
                <span class="btn-content">
                    <div class="btn-spinner"></div>
                    <span class="btn-text">Signing In...</span>
                </span>
            `;
        } else {
            elements.loginBtn.innerHTML = `
                <span class="btn-content">
                    <span class="btn-icon">🚀</span>
                    <span class="btn-text">Sign In</span>
                </span>
            `;
        }
    },

    validateCredentials(username, password) {
        const errors = [];
        
        if (!username || username.length < 3) {
            errors.push('Username must be at least 3 characters long');
        }
        
        if (!password || password.length < 4) {
            errors.push('Password must be at least 4 characters long');
        }
        
        // Check for basic security patterns
        if (username.includes(' ')) {
            errors.push('Username cannot contain spaces');
        }
        
        return errors;
    },

    sanitizeInput(input) {
        return input.trim().replace(/[<>\"'&]/g, '');
    },

    checkLockout() {
        const now = Date.now();
        
        if (loginAttempts >= CONFIG.MAX_LOGIN_ATTEMPTS) {
            const timeSinceLastAttempt = now - lastAttemptTime;
            
            if (timeSinceLastAttempt < CONFIG.LOCKOUT_TIME) {
                const remainingTime = Math.ceil((CONFIG.LOCKOUT_TIME - timeSinceLastAttempt) / 60000);
                return {
                    locked: true,
                    remainingMinutes: remainingTime
                };
            } else {
                // Reset attempts after lockout period
                this.resetAttempts();
            }
        }
        
        return { locked: false };
    },

    recordAttempt() {
        loginAttempts++;
        lastAttemptTime = Date.now();
        localStorage.setItem('loginAttempts', loginAttempts.toString());
        localStorage.setItem('lastAttemptTime', lastAttemptTime.toString());
    },

    resetAttempts() {
        loginAttempts = 0;
        localStorage.removeItem('loginAttempts');
        localStorage.removeItem('lastAttemptTime');
    },

    addShakeAnimation(element) {
        element.classList.add('shake');
        setTimeout(() => element.classList.remove('shake'), 500);
    }
};

// API Functions
const api = {
    async authenticateUser(username, password) {
        try {
            const response = await fetch(CONFIG.SCRIPT_URL, {
                method: 'POST',
                mode: 'cors',
                headers: {
                    'Content-Type': 'text/plain;charset=utf-8',
                },
                body: JSON.stringify({
                    action: 'staffLogin',
                    username: username,
                    password: password,
                    timestamp: new Date().toISOString()
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: Server error`);
            }

            const result = await response.json();
            return result;
            
        } catch (error) {
            console.error('Authentication error:', error);
            throw new Error(`Authentication failed: ${error.message}`);
        }
    }
};

// Main login handler
async function handleLogin(username, password) {
    // Check lockout status
    const lockoutStatus = utils.checkLockout();
    if (lockoutStatus.locked) {
        utils.showMessage(
            `🔒 Account temporarily locked. Try again in ${lockoutStatus.remainingMinutes} minute(s).`,
            'warning'
        );
        return;
    }

    // Validate inputs
    const validationErrors = utils.validateCredentials(username, password);
    if (validationErrors.length > 0) {
        utils.showMessage(validationErrors[0], 'error');
        utils.addShakeAnimation(elements.loginForm);
        return;
    }

    utils.showLoading(true);
    utils.hideMessage();

    try {
        // Simulate minimum loading time for better UX
        const [result] = await Promise.all([
            api.authenticateUser(username, password),
            new Promise(resolve => setTimeout(resolve, 1500))
        ]);

        if (result.status === 'success') {
            // Reset login attempts on success
            utils.resetAttempts();
            
            // Store login state
            sessionStorage.setItem('isVerifierLoggedIn', 'true');
            sessionStorage.setItem('loginTime', Date.now().toString());
            sessionStorage.setItem('userRole', result.role || 'staff');
            
            utils.showMessage('🎉 Login successful! Redirecting...', 'success');
            
            // Redirect after short delay
            setTimeout(() => {
                window.location.href = 'verify.html';
            }, 1500);
            
        } else {
            // Record failed attempt
            utils.recordAttempt();
            
            const remainingAttempts = CONFIG.MAX_LOGIN_ATTEMPTS - loginAttempts;
            let errorMessage = result.message || 'Invalid username or password';
            
            if (remainingAttempts > 0) {
                errorMessage += ` (${remainingAttempts} attempt(s) remaining)`;
            }
            
            utils.showMessage(errorMessage, 'error');
            utils.addShakeAnimation(elements.loginForm);
            
            // Clear password field
            elements.passwordInput.value = '';
            elements.passwordInput.focus();
        }

    } catch (error) {
        console.error('Login error:', error);
        utils.recordAttempt();
        
        let errorMessage = 'Login failed. Please check your connection and try again.';
        if (error.message.includes('fetch')) {
            errorMessage = 'Network error. Please check your internet connection.';
        }
        
        utils.showMessage(errorMessage, 'error');
        utils.addShakeAnimation(elements.loginForm);
        
    } finally {
        utils.showLoading(false);
    }
}

// Event Listeners
elements.loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const username = utils.sanitizeInput(elements.usernameInput.value);
    const password = elements.passwordInput.value; // Don't sanitize password
    
    await handleLogin(username, password);
});

// Password toggle functionality
elements.passwordToggle.addEventListener('click', () => {
    const isPassword = elements.passwordInput.type === 'password';
    elements.passwordInput.type = isPassword ? 'text' : 'password';
    elements.toggleIcon.textContent = isPassword ? '🙈' : '👁️';
});

// Input validation and feedback
elements.usernameInput.addEventListener('input', (e) => {
    const value = e.target.value;
    
    // Remove invalid characters
    e.target.value = value.replace(/[^a-zA-Z0-9_.-]/g, '');
    
    // Visual feedback
    if (e.target.value.length >= 3) {
        e.target.style.borderColor = '#28a745';
    } else if (e.target.value.length > 0) {
        e.target.style.borderColor = '#ffc107';
    } else {
        e.target.style.borderColor = '';
    }
});

elements.passwordInput.addEventListener('input', (e) => {
    // Visual feedback
    if (e.target.value.length >= 4) {
        e.target.style.borderColor = '#28a745';
    } else if (e.target.value.length > 0) {
        e.target.style.borderColor = '#ffc107';
    } else {
        e.target.style.borderColor = '';
    }
});

// Clear messages when user starts typing
[elements.usernameInput, elements.passwordInput].forEach(input => {
    input.addEventListener('focus', () => {
        utils.hideMessage();
        input.style.borderColor = '#3498db';
    });
    
    input.addEventListener('blur', () => {
        if (!input.value) {
            input.style.borderColor = '';
        }
    });
});

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Enter key to submit (if not already focused on form)
    if (e.key === 'Enter' && document.activeElement !== elements.loginBtn) {
        elements.loginForm.dispatchEvent(new Event('submit'));
    }
    
    // Escape to clear form
    if (e.key === 'Escape') {
        elements.usernameInput.value = '';
        elements.passwordInput.value = '';
        utils.hideMessage();
        elements.usernameInput.focus();
    }
});

// Auto-focus username field
document.addEventListener('DOMContentLoaded', () => {
    elements.usernameInput.focus();
    
    // Check if already logged in
    if (sessionStorage.getItem('isVerifierLoggedIn') === 'true') {
        const loginTime = parseInt(sessionStorage.getItem('loginTime')) || 0;
        const hoursSinceLogin = (Date.now() - loginTime) / (1000 * 60 * 60);
        
        if (hoursSinceLogin < 8) { // 8 hour session
            utils.showMessage('🔄 You are already logged in. Redirecting...', 'success');
            setTimeout(() => {
                window.location.href = 'verify.html';
            }, 2000);
        } else {
            // Session expired
            sessionStorage.clear();
        }
    }
    
    // Show lockout status if applicable
    const lockoutStatus = utils.checkLockout();
    if (lockoutStatus.locked) {
        utils.showMessage(
            `🔒 Account locked due to multiple failed attempts. Try again in ${lockoutStatus.remainingMinutes} minute(s).`,
            'warning'
        );
        elements.loginBtn.disabled = true;
        
        // Auto-enable after lockout
        setTimeout(() => {
            location.reload();
        }, lockoutStatus.remainingMinutes * 60000);
    }
});

// Prevent multiple form submissions
let isSubmitting = false;
elements.loginForm.addEventListener('submit', (e) => {
    if (isSubmitting) {
        e.preventDefault();
        return;
    }
    isSubmitting = true;
    setTimeout(() => { isSubmitting = false; }, 2000);
});

// Performance monitoring
if ('performance' in window) {
    window.addEventListener('load', () => {
        const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
        console.log(`🔐 Login page loaded in ${loadTime}ms`);
    });
}