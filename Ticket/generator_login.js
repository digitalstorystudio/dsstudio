document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();

    const usernameInput = document.getElementById('username').value;
    const passwordInput = document.getElementById('password').value;
    const loginMessage = document.getElementById('loginMessage');

    // --- Ticket banane ke liye username aur password yahan daalein ---
    const CORRECT_USERNAME = 'user'; // Ise badal sakte hain
    const CORRECT_PASSWORD = 'password'; // Ise bhi badal sakte hain

    // Check karein ki username aur password sahi hai ya nahi
    if (usernameInput === CORRECT_USERNAME && passwordInput === CORRECT_PASSWORD) {
        // Agar sahi hai, toh session storage mein login status set karein
        sessionStorage.setItem('isGeneratorLoggedIn', 'true');
        
        // User ko ticket generator page (index.html) par bhej dein
        window.location.href = 'index.html';

    } else {
        // Agar galat hai, toh error message dikhayein
        loginMessage.textContent = 'Invalid username or password. Please try again.';
    }
});