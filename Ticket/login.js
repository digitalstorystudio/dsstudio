// In login.js
document.getElementById('loginForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    const usernameInput = document.getElementById('username').value;
    const passwordInput = document.getElementById('password').value;
    const loginMessage = document.getElementById('loginMessage');

    // Your Google Apps Script URL
    const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxgcC0w3kjgG8sBR-sqyQUxKj2hiCK0mWgF2NeB2OUhSYh_usgGbVnV4t8QLP5H0JvC/exec";

    try {
        const response = await fetch(SCRIPT_URL, {
            method: 'POST',
            mode: 'cors',
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            body: JSON.stringify({ 
                action: 'staffLogin', 
                username: usernameInput, 
                password: passwordInput 
            })
        });
        const result = await response.json();

        if (result.status === 'success') {
            sessionStorage.setItem('isVerifierLoggedIn', 'true');
            window.location.href = 'verify.html';
        } else {
            loginMessage.textContent = result.message || 'Invalid username or password.';
        }
    } catch (error) {
        loginMessage.textContent = 'Login failed. Check your connection.';
    }
});