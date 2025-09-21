// FIXED Generator Login Script
document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();

    const usernameInput = document.getElementById('username').value.trim();
    const passwordInput = document.getElementById('password').value;
    const loginMessage = document.getElementById('loginMessage');

    // --- CHANGE THESE CREDENTIALS AS NEEDED ---
    const CORRECT_USERNAME = 'user';
    const CORRECT_PASSWORD = 'password';
    // ------------------------------------------

    // Clear any previous messages
    loginMessage.classList.add('hidden');
    
    // Show loading state
    const loginBtn = document.getElementById('loginBtn');
    const originalBtnContent = loginBtn.innerHTML;
    loginBtn.disabled = true;
    loginBtn.innerHTML = `
        <span class="btn-content">
            <div class="btn-spinner"></div>
            <span class="btn-text">Authenticating...</span>
        </span>
    `;

    // Simulate loading for better UX
    setTimeout(() => {
        // Check credentials
        if (usernameInput === CORRECT_USERNAME && passwordInput === CORRECT_PASSWORD) {
            // Success - Set session and redirect
            sessionStorage.setItem('isGeneratorLoggedIn', 'true');
            sessionStorage.setItem('generatorLoginTime', Date.now().toString());
            sessionStorage.setItem('generatorUser', usernameInput);
            
            // Show success message
            loginMessage.className = 'login-message success';
            loginMessage.innerHTML = `
                <div class="message-content">
                    <span class="message-icon">✅</span>
                    <span class="message-text">Login successful! Redirecting to generator...</span>
                </div>
            `;
            loginMessage.classList.remove('hidden');
            
            // Redirect after short delay
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1500);
            
        } else {
            // Failed login
            loginMessage.className = 'login-message error';
            loginMessage.innerHTML = `
                <div class="message-content">
                    <span class="message-icon">❌</span>
                    <span class="message-text">Invalid username or password. Please try again.</span>
                </div>
            `;
            loginMessage.classList.remove('hidden');
            
            // Clear password field
            document.getElementById('password').value = '';
            document.getElementById('password').focus();
            
            // Add shake animation
            document.getElementById('loginForm').style.animation = 'shake 0.5s ease-in-out';
            setTimeout(() => {
                document.getElementById('loginForm').style.animation = '';
            }, 500);
        }
        
        // Reset button
        loginBtn.disabled = false;
        loginBtn.innerHTML = originalBtnContent;
        
    }, 1000); // 1 second delay for loading effect
});

// Password toggle functionality
document.getElementById('passwordToggle').addEventListener('click', () => {
    const passwordInput = document.getElementById('password');
    const toggleIcon = document.getElementById('toggleIcon');
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        toggleIcon.textContent = '🙈';
    } else {
        passwordInput.type = 'password';
        toggleIcon.textContent = '👁️';
    }
});

// Clear messages when user starts typing
document.getElementById('username').addEventListener('input', () => {
    document.getElementById('loginMessage').classList.add('hidden');
});

document.getElementById('password').addEventListener('input', () => {
    document.getElementById('loginMessage').classList.add('hidden');
});

// Auto-focus username field
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('username').focus();
    
    // Check if already logged in
    if (sessionStorage.getItem('isGeneratorLoggedIn') === 'true') {
        const loginTime = parseInt(sessionStorage.getItem('generatorLoginTime')) || 0;
        const timeSinceLogin = Date.now() - loginTime;
        
        // Session valid for 8 hours
        if (timeSinceLogin < 8 * 60 * 60 * 1000) {
            document.getElementById('loginMessage').className = 'login-message success';
            document.getElementById('loginMessage').innerHTML = `
                <div class="message-content">
                    <span class="message-icon">🔄</span>
                    <span class="message-text">You are already logged in. Redirecting...</span>
                </div>
            `;
            document.getElementById('loginMessage').classList.remove('hidden');
            
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 2000);
        } else {
            // Session expired
            sessionStorage.removeItem('isGeneratorLoggedIn');
            sessionStorage.removeItem('generatorLoginTime');
            sessionStorage.removeItem('generatorUser');
        }
    }
});

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        document.getElementById('loginForm').dispatchEvent(new Event('submit'));
    }
    
    if (e.key === 'Escape') {
        document.getElementById('username').value = '';
        document.getElementById('password').value = '';
        document.getElementById('loginMessage').classList.add('hidden');
        document.getElementById('username').focus();
    }
});

console.log('🎟️ Generator login system initialized');
console.log('💡 Default credentials: username="user", password="password"');