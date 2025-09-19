// --- Security Guard ---
// Yeh check karta hai ki user logged in hai ya nahi
if (sessionStorage.getItem('isVerifierLoggedIn') !== 'true') {
    alert('You must be logged in to access the verification page.');
    window.location.href = 'login.html';
}

// Replace with your Google Apps Script Web App URL
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxgcC0w3kjgG8sBR-sqyQUxKj2hiCK0mWgF2NeB2OUhSYh_usgGbVnV4t8QLP5H0JvC/exec";

const resultDiv = document.getElementById('verificationResult');
const manualVerifyForm = document.getElementById('verifyForm');
const manualIdInput = document.getElementById('manualId');

async function verifyTicketId(ticketId) {
    resultDiv.className = 'verification-result';
    resultDiv.textContent = 'Verifying...';
    resultDiv.classList.add('result-warning');
    resultDiv.classList.remove('hidden');

    try {
        const verifyUrl = `${SCRIPT_URL}?id=${ticketId}`;
        const response = await fetch(verifyUrl);
        const result = await response.json();
        handleVerificationResponse(result);
    } catch (error) {
        console.error('Error:', error);
        handleVerificationResponse({ status: 'error', message: 'Verification failed. Please check connection.' });
    }
}

function handleVerificationResponse(result) {
    resultDiv.classList.remove('hidden');
    let name = result.data ? result.data.name : '';
    let type = result.data ? result.data.type : '';
    
    switch (result.status) {
        case 'success':
            resultDiv.className = 'verification-result result-success';
            resultDiv.innerHTML = `✅ ${result.message}<br>Name: ${name}<br>Pass: ${type}`;
            break;
        case 'already_verified':
            resultDiv.className = 'verification-result result-warning';
            resultDiv.innerHTML = `⚠️ ${result.message}<br>Name: ${name}<br>Pass: ${type}`;
            break;
        case 'not_found':
            resultDiv.className = 'verification-result result-error';
            resultDiv.textContent = `❌ ${result.message}`;
            break;
        default:
            resultDiv.className = 'verification-result result-error';
            resultDiv.textContent = `❌ An unknown error occurred: ${result.message}`;
            break;
    }
}

function onScanSuccess(decodedText, decodedResult) {
    verifyTicketId(decodedText);
}

function onScanError(errorMessage) {
    // Optional: handle scan error
}

const html5QrcodeScanner = new Html5QrcodeScanner("qr-reader", { fps: 10, qrbox: {width: 250, height: 250} });
html5QrcodeScanner.render(onScanSuccess, onScanError);

manualVerifyForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const ticketId = manualIdInput.value.trim();
    if (ticketId) {
        verifyTicketId(ticketId);
    }
});

document.getElementById('logoutBtn').addEventListener('click', () => {
    sessionStorage.removeItem('isVerifierLoggedIn');
    alert('You have been logged out.');
    window.location.href = 'login.html';
});
