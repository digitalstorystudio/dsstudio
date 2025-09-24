// script.js (UPDATED)

// ⚠️ अपना नया Web App URL यहाँ पेस्ट करें
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzkC9MrZAcfvJ39iq0cBZX9Udi31WFWj4X8W3dQaHRm-oJQAS83or9TAw3CUI5OAt7A/exec";

// चेक करें कि यूज़र लॉग इन है या नहीं
if (sessionStorage.getItem('isGeneratorLoggedIn') !== 'true') {
    alert('You must be logged in to access the ticket generator.');
    window.location.href = 'generator_login.html';
}

const form = document.getElementById('ticketForm');
const submitBtn = document.getElementById('submitBtn');
const loadingDiv = document.getElementById('loading');
const ticketResultDiv = document.getElementById('ticketResult');
const downloadBtn = document.getElementById('downloadBtn');
const generateAnotherBtn = document.getElementById('generateAnotherBtn');

form.addEventListener('submit', async (e) => {
    e.preventDefault();

    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="spinner"></span>Generating Ticket...';
    loadingDiv.classList.remove('hidden');
    ticketResultDiv.classList.add('hidden');

    const uniqueId = 'EVENT-' + Date.now().toString(36).substr(2, 5).toUpperCase() + Math.random().toString(36).substr(2, 5).toUpperCase();

    const formData = {
        action: 'createTicket',
        ticketId: uniqueId,
        name: document.getElementById('name').value,
        age: document.getElementById('age').value,
        phone: document.getElementById('phone').value,
        ticketType: document.getElementById('ticketType').value,
    };

    try {
        const response = await fetch(SCRIPT_URL, {
            method: 'POST',
            mode: 'cors',
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            body: JSON.stringify(formData),
        });
        const result = await response.json();

        if (result.status === 'success') {
            submitBtn.innerHTML = '<span></span>Success! 🎉';
            displayTicket(formData);
        } else {
            throw new Error(result.message || 'Failed to create ticket on the backend.');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('❌ Failed to generate ticket. Please try again. ' + error.message);
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<span class="btn-text">✨ Generate Ticket</span>';
        loadingDiv.classList.add('hidden');
    }
});

function displayTicket(data) {
    document.getElementById('ticketName').textContent = data.name;
    document.getElementById('ticketPassType').textContent = data.ticketType;
    document.getElementById('ticketId').textContent = data.ticketId;

    const qrCodeContainer = document.getElementById('qrcode');
    qrCodeContainer.innerHTML = '';

    // नई QR कोड लाइब्रेरी का उपयोग
    new QRCode(qrCodeContainer, {
        text: data.ticketId,
        width: 128,
        height: 128,
        colorDark: "#000000",
        colorLight: "#ffffff",
        correctLevel: QRCode.CorrectLevel.H
    });

    form.classList.add('hidden');
    ticketResultDiv.classList.remove('hidden');
    ticketResultDiv.scrollIntoView({ behavior: 'smooth' });
}

downloadBtn.addEventListener('click', () => {
    const ticketElement = document.getElementById('ticketToDownload');
    html2canvas(ticketElement, { scale: 2 }).then(canvas => {
        const link = document.createElement('a');
        link.download = `ticket-${document.getElementById('ticketId').textContent}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
    });
});

generateAnotherBtn.addEventListener('click', () => {
    ticketResultDiv.classList.add('hidden');
    form.classList.remove('hidden');
    form.reset();
    document.getElementById('name').focus();
});

document.getElementById('logoutBtn').addEventListener('click', () => {
    if (confirm('🚪 Are you sure you want to logout?')) {
        sessionStorage.removeItem('isGeneratorLoggedIn');
        window.location.href = 'generator_login.html';
    }
});