// login.js (UPDATED for Verifier)

document.getElementById('loginForm').addEventListener('submit', async function(e) {
    e.preventDefault();

    const usernameInput = document.getElementById('username').value.trim();
    const passwordInput = document.getElementById('password').value;
    const loginMessage = document.getElementById('loginMessage');
    const loginBtn = document.getElementById('loginBtn');

    // ⚠️ अपना नया Web App URL यहाँ पेस्ट करें
    const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzkC9MrZAcfvJ39iq0cBZX9Udi31WFWj4X8W3dQaHRm-oJQAS83or9TAw3CUI5OAt7A/exec";

    try {
        loginBtn.classList.add('loading');
        loginBtn.innerHTML = '<span class="spinner"></span>Authenticating...';

        const response = await fetch(SCRIPT_URL, {
            method: 'POST',
            mode: 'cors',
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            body: JSON.stringify({
                action: 'login',
                username: usernameInput,
                password: passwordInput
            })
        });

        const result = await response.json();

        if (result.status === 'success' && result.role === 'verifier') {
            loginBtn.innerHTML = '<span></span>Success! Redirecting...';
            sessionStorage.setItem('isVerifierLoggedIn', 'true');
            setTimeout(() => {
                window.location.href = 'verify.html';
            }, 800);
        } else {
            throw new Error(result.message || 'Invalid credentials or not a verifier.');
        }

    } catch (error) {
        loginBtn.classList.remove('loading');
        loginBtn.innerHTML = '<span class="btn-text">🚀 Access Verification</span>';
        loginMessage.textContent = '❌ ' + error.message;
        loginMessage.classList.remove('hidden');
    }
});