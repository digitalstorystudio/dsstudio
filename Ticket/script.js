if (sessionStorage.getItem('isGeneratorLoggedIn') !== 'true') {
    alert('You must be logged in to access the ticket generator.');
    window.location.href = 'generator_login.html';
}

// Replace with your Google Apps Script Web App URL
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxgcC0w3kjgG8sBR-sqyQUxKj2hiCK0mWgF2NeB2OUhSYh_usgGbVnV4t8QLP5H0JvC/exec";
 // 👈 yahan apna Web App URL dalein

// Form Elements
const form = document.getElementById('ticketForm');
const submitBtn = document.getElementById('submitBtn');
const loadingDiv = document.getElementById('loading');

// Ticket Result Elements
const ticketResultDiv = document.getElementById('ticketResult');
const downloadBtn = document.getElementById('downloadBtn');
const generateAnotherBtn = document.getElementById('generateAnotherBtn');


form.addEventListener('submit', async (e) => {
    e.preventDefault();

    submitBtn.disabled = true;
    loadingDiv.classList.remove('hidden');
    ticketResultDiv.classList.add('hidden');

    const uniqueId = 'EVENT-' + Date.now().toString(36).substr(2, 5) + Math.random().toString(36).substr(2, 5).toUpperCase();
    
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
            headers: {
                'Content-Type': 'text/plain;charset=utf-8',
            },
            body: JSON.stringify(formData),
        });

        const result = await response.json();
        if (result.status === 'success') {
            displayTicket(formData);
        } else {
            throw new Error(result.message);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred. Could not generate ticket. ' + error.message);
    } finally {
        submitBtn.disabled = false;
        loadingDiv.classList.add('hidden');
    }
});

function displayTicket(data) {
    document.getElementById('ticketName').textContent = data.name;
    document.getElementById('ticketPassType').textContent = data.ticketType;
    document.getElementById('ticketId').textContent = data.ticketId;

    const qrCodeContainer = document.getElementById('qrcode');
    qrCodeContainer.innerHTML = '';

    new QRCode(qrCodeContainer, {
        text: data.ticketId,
        width: 128,
        height: 128,
    });

    ticketResultDiv.classList.remove('hidden');
    form.classList.add('hidden');
}

// Download button ke liye event listener (FIXED)
downloadBtn.addEventListener('click', () => {
    const ticketElement = document.getElementById('ticketToDownload');
    const downloadButton = document.getElementById('downloadBtn');
    
    // Disable button to prevent multiple clicks
    downloadButton.disabled = true;
    downloadButton.textContent = 'Downloading...';

    // Wait for 200ms to ensure QR code is rendered before capturing
    setTimeout(() => {
        html2canvas(ticketElement).then(canvas => {
            const link = document.createElement('a');
            link.download = `ticket-${document.getElementById('ticketId').textContent}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();

            // Re-enable the button after download
            downloadButton.disabled = false;
            downloadButton.textContent = 'Download Ticket';
        }).catch(err => {
            console.error('Download failed:', err);
            alert('Sorry, the ticket could not be downloaded.');
            // Re-enable the button even if there's an error
            downloadButton.disabled = false;
            downloadButton.textContent = 'Download Ticket';
        });
    }, 200);
});


// "Generate Another Ticket" button ke liye event listener (RE-CHECKED)
generateAnotherBtn.addEventListener('click', () => {
    // Ticket result ko hide karein aur form ko waapis dikhayein
    ticketResultDiv.classList.add('hidden');
    form.classList.remove('hidden');
    // Nayi entry ke liye form fields ko reset karein
    form.reset();
});
// In script.js, inside the downloadBtn event listener
downloadBtn.addEventListener('click', () => {
    const ticketElement = document.getElementById('ticketToDownload');
    // ... (disable button logic) ...

    html2canvas(ticketElement).then(canvas => {
        const imgData = canvas.toDataURL('image/png');

        // Create a PDF. You might need to adjust dimensions.
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF({
            orientation: 'landscape',
            unit: 'px',
            format: [canvas.width, canvas.height]
        });

        pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
        pdf.save(`ticket-${document.getElementById('ticketId').textContent}.pdf`);

        // ... (re-enable button logic) ...
    });
});
// ...aapka purana code yahan khatam hoga

// "Generate Another Ticket" button ke liye event listener (RE-CHECKED)
generateAnotherBtn.addEventListener('click', () => {
    // ...
    form.reset();
});


// YEH NAYA LOGOUT CODE ADD KAREIN
document.getElementById('logoutBtn').addEventListener('click', () => {
    sessionStorage.removeItem('isGeneratorLoggedIn');
    alert('You have been logged out.');
    window.location.href = 'generator_login.html';
});
