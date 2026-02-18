// ===================================================
// SECURITY UTILITIES - CRITICAL
// ===================================================

const SecurityUtils = {
    // XSS Protection - Sanitize HTML
    sanitizeHTML: function(str) {
        const temp = document.createElement('div');
        temp.textContent = str;
        return temp.innerHTML;
    },

    // Sanitize user input
    sanitizeInput: function(input, type = 'text') {
        if (!input) return '';
        
        input = input.toString().trim();
        
        switch(type) {
            case 'email':
                // Remove everything except valid email characters
                return input.replace(/[^a-zA-Z0-9@._-]/g, '').toLowerCase();
            
            case 'phone':
                // Remove everything except digits
                return input.replace(/\D/g, '');
            
            case 'text':
                // Remove HTML tags and special characters
                return input.replace(/<[^>]*>/g, '')
                           .replace(/[<>\"\']/g, '')
                           .substring(0, 1000);
            
            case 'number':
                return input.replace(/[^0-9]/g, '');
            
            default:
                return this.sanitizeHTML(input);
        }
    },

    // Validate email
    validateEmail: function(email) {
        const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return re.test(email);
    },

    // Validate phone
    validatePhone: function(phone) {
        const re = /^[0-9]{10}$/;
        return re.test(phone);
    },

    // Validate name
    validateName: function(name) {
        const re = /^[a-zA-Z\s]{2,100}$/;
        return re.test(name);
    },

    // Generate CSRF Token
    generateCSRFToken: function() {
        return Array.from(crypto.getRandomValues(new Uint8Array(32)))
            .map(b => b.toString(16).padStart(2, '0'))
            .join('');
    },

    // Store CSRF token securely
    setCSRFToken: function() {
        const token = this.generateCSRFToken();
        sessionStorage.setItem('csrf_token', token);
        
        const csrfInput = document.getElementById('csrf_token');
        if (csrfInput) {
            csrfInput.value = token;
        }
        
        return token;
    },

    // Validate CSRF token
    validateCSRFToken: function(token) {
        const storedToken = sessionStorage.getItem('csrf_token');
        return token && storedToken && token === storedToken;
    },

    // Rate Limiting
    RateLimiter: {
        attempts: {},
        
        checkLimit: function(key, maxAttempts = 5, windowMs = 60000) {
            const now = Date.now();
            
            if (!this.attempts[key]) {
                this.attempts[key] = [];
            }
            
            // Remove old attempts outside time window
            this.attempts[key] = this.attempts[key].filter(
                timestamp => now - timestamp < windowMs
            );
            
            // Check if limit exceeded
            if (this.attempts[key].length >= maxAttempts) {
                return false;
            }
            
            // Record new attempt
            this.attempts[key].push(now);
            return true;
        }
    },

    // Encode URL parameters safely
    encodeURLParam: function(str) {
        return encodeURIComponent(str)
            .replace(/[!'()*]/g, c => '%' + c.charCodeAt(0).toString(16).toUpperCase());
    }
};

// ===================================================
// INITIALIZE SECURITY ON PAGE LOAD
// ===================================================

document.addEventListener('DOMContentLoaded', function() {
    // Generate CSRF token
    SecurityUtils.setCSRFToken();
    
    // Set current year
    const yearSpan = document.getElementById('currentYear');
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }
    
    // Initialize visitor counter (load from API or localStorage)
    initVisitorCounter();
    
    // Initialize all secure forms
    initSecureForms();
    
    // --- VIDEO AND AUDIO INITIALIZATION ---
    const video = document.getElementById('intro-video');
    const soundEnableBtn = document.getElementById('soundEnableBtn');
    const enterButton = document.getElementById('enterButton');
    const bgMusic = document.getElementById('bg-music');
    const audioControls = document.getElementById('audioControls');
    const audioToggle = document.getElementById('audioToggle');
    const mainWebsiteDiv = document.querySelector('.main-website');
    const videoContainer = document.querySelector('.video-container');
    
    // Navigation elements
    const hamburger = document.getElementById('hamburger');
    const navLinks = document.getElementById('navLinks');

    // Intro Video Logic
    const isIndexPage = window.location.pathname.endsWith('/') || 
                       window.location.pathname.endsWith('index.html') || 
                       window.location.pathname === "";

    if (isIndexPage && video && soundEnableBtn && mainWebsiteDiv && videoContainer) {
        try {
            // Check session storage for intro completion
            if (sessionStorage.getItem('introPlayed')) {
                videoContainer.style.display = 'none';
                soundEnableBtn.style.display = 'none';
                if (enterButton) enterButton.style.display = 'none';
                showMainWebsite(false);
            } else {
                // Initialize video
                video.muted = true;
                if (bgMusic) {
                    bgMusic.volume = 0.3;
                }

                // Show sound button after delay
                setTimeout(() => {
                    if (soundEnableBtn) {
                        soundEnableBtn.style.display = 'block';
                    }
                }, 1000);

                // Start video playback
                const playPromise = video.play();
                if (playPromise !== undefined) {
                    playPromise.catch(error => {
                        console.warn("Video autoplay prevented:", error);
                        setTimeout(() => {
                            showMainWebsite(true);
                            sessionStorage.setItem('introPlayed', 'true');
                        }, 2000);
                        if (soundEnableBtn) {
                            soundEnableBtn.style.display = 'none';
                        }
                    });
                }

                // Sound enable button event
                if (soundEnableBtn) {
                    soundEnableBtn.addEventListener('click', function() {
                        try {
                            video.muted = false;
                            soundEnableBtn.style.display = 'none';
                            video.play().catch(e => console.error('Video playback error:', e));
                        } catch (e) {
                            console.error('Sound enable error:', e);
                        }
                    });
                }

                // Video end event
                if (video) {
                    video.addEventListener('ended', () => {
                        try {
                            showMainWebsite(true);
                            sessionStorage.setItem('introPlayed', 'true');
                            
                            if (soundEnableBtn) {
                                soundEnableBtn.style.display = 'none';
                            }
                        } catch (e) {
                            console.error('Video end event error:', e);
                        }
                    });
                }

                // Enter button
                if (enterButton) {
                    enterButton.addEventListener('click', () => {
                        try {
                            showMainWebsite(true);
                            sessionStorage.setItem('introPlayed', 'true');
                        } catch (e) {
                            console.error('Enter button error:', e);
                        }
                    });
                }
            }
        } catch (error) {
            console.error('Critical video initialization error:', error);
            showMainWebsite(false);
        }
    } else if (mainWebsiteDiv) {
        showMainWebsite(false);
    }

    // Main Website Display Function
    function showMainWebsite(removeIntroContainer) {
        try {
            if (mainWebsiteDiv) {
                document.body.classList.add('show-website');
                mainWebsiteDiv.style.display = 'block';
                setTimeout(() => {
                    mainWebsiteDiv.style.opacity = '1';
                }, 50);
            }

            if (enterButton) enterButton.style.display = 'none';
            if (soundEnableBtn) soundEnableBtn.style.display = 'none';

            // Initialize background music
            if (bgMusic && audioControls && audioToggle) {
                const musicStart = bgMusic.play();
                if (musicStart !== undefined) {
                    musicStart.catch((e) => {
                        console.warn("Background music autoplay prevented:", e);
                        if (audioToggle) {
                            audioToggle.innerHTML = '<i class="fas fa-volume-mute"></i>';
                        }
                    });
                }
                if (audioControls) {
                    audioControls.style.display = 'flex';
                }
            }

            // Handle video container removal
            if (removeIntroContainer && videoContainer) {
                setTimeout(() => {
                    try {
                        videoContainer.remove();
                    } catch (e) {
                        console.warn('Video container removal error:', e);
                    }
                }, 1500);
            } else if (videoContainer && sessionStorage.getItem('introPlayed')) {
                videoContainer.style.display = 'none';
            }
        } catch (error) {
            console.error('Show main website error:', error);
        }
    }

    // Audio Controls
    if (audioToggle && bgMusic) {
        audioToggle.addEventListener('click', () => {
            try {
                if (bgMusic.paused || bgMusic.muted) {
                    bgMusic.play().then(() => {
                        bgMusic.muted = false;
                        audioToggle.innerHTML = '<i class="fas fa-volume-up"></i>';
                    }).catch(e => console.error("Error playing music:", e));
                } else {
                    bgMusic.pause();
                    audioToggle.innerHTML = '<i class="fas fa-volume-mute"></i>';
                }
            } catch (error) {
                console.error('Audio toggle error:', error);
            }
        });
    }
    
    // Background Music Visibility Management
    let wasMusicPlayingBeforeHidden = false; 
    document.addEventListener('visibilitychange', () => {
        try {
            if (bgMusic) {
                if (document.hidden) {
                    if (!bgMusic.paused && !bgMusic.muted) {
                        bgMusic.pause();
                        wasMusicPlayingBeforeHidden = true; 
                    } else {
                        wasMusicPlayingBeforeHidden = false; 
                    }
                } else {
                    if (wasMusicPlayingBeforeHidden) {
                        bgMusic.play().catch(e => console.warn("Background music resume prevented:", e));
                    }
                }
            }
        } catch (error) {
            console.error('Visibility change error:', error);
        }
    });

    // Hamburger Menu
    if (hamburger && navLinks) {
        hamburger.addEventListener('click', () => {
            try {
                navLinks.classList.toggle('active');
                hamburger.classList.toggle('active');
                
                const isExpanded = hamburger.classList.contains('active');
                hamburger.setAttribute('aria-expanded', isExpanded);
            } catch (error) {
                console.error('Hamburger menu error:', error);
            }
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!hamburger.contains(e.target) && !navLinks.contains(e.target)) {
                navLinks.classList.remove('active');
                hamburger.classList.remove('active');
                hamburger.setAttribute('aria-expanded', 'false');
            }
        });
    }

    // Smooth Scroll
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
                
                // Close mobile menu if open
                if (navLinks) navLinks.classList.remove('active');
                if (hamburger) {
                    hamburger.classList.remove('active');
                    hamburger.setAttribute('aria-expanded', 'false');
                }
            }
        });
    });

    // Sticky Navbar
    const navbar = document.getElementById('navbar');
    if (navbar) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 100) {
                navbar.classList.add('sticky');
            } else {
                navbar.classList.remove('sticky');
            }
        }, { passive: true });
    }

    // ===================================================
    // PACKAGE CALCULATOR FUNCTIONALITY
    // ===================================================
    
    // Initialize Package Calculator if exists
    if (document.querySelector('.package-calculator')) {
        new PackageCalculator();
    }
});

// ===================================================
// PACKAGE CALCULATOR CLASS
// ===================================================

class PackageCalculator {
    constructor() {
        this.packages = {
            basic: {
                name: 'Basic Package',
                basePrice: 25000,
                features: ['2 Cameras', 'Basic Editing', '50+ Photos', '1 Videographer']
            },
            standard: {
                name: 'Standard Package',
                basePrice: 45000,
                features: ['3 Cameras', 'Professional Editing', '100+ Photos', '2 Videographers', 'Drone Coverage']
            },
            premium: {
                name: 'Premium Package',
                basePrice: 75000,
                features: ['4+ Cameras', 'Cinematic Editing', '200+ Photos', '3 Videographers', 'Drone Coverage', 'Pre-Wedding Shoot']
            },
            luxury: {
                name: 'Luxury Package',
                basePrice: 125000,
                features: ['5+ Cameras', 'Premium Editing', 'Unlimited Photos', '4+ Videographers', 'Drone Coverage', 'Pre & Post Wedding Shoot', 'Album & Frame']
            }
        };

        this.addons = {
            extraDay: { name: 'Extra Day Coverage', price: 15000 },
            album: { name: 'Premium Album', price: 10000 },
            drone: { name: 'Drone Videography', price: 8000 },
            crane: { name: 'Crane/Jimmy Jib', price: 12000 },
            lights: { name: 'Professional Lighting', price: 7000 },
            makeup: { name: 'Makeup Artist', price: 15000 }
        };

        this.selectedPackage = null;
        this.selectedAddons = [];
        
        this.init();
    }

    init() {
        this.attachEventListeners();
    }

    attachEventListeners() {
        // Package selection
        document.querySelectorAll('input[name="package"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                this.selectedPackage = e.target.value;
                this.updateQuote();
                this.highlightSelectedPackage(e.target.value);
            });
        });

        // Addon selection
        document.querySelectorAll('input[data-addon]').forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                this.updateQuote();
            });
        });

        // Guest count, location, duration changes
        const selects = ['guest-count', 'location-type', 'event-duration'];
        selects.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener('change', () => {
                    this.updateQuote();
                });
            }
        });

        // Book now buttons
        document.querySelectorAll('.book-now-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.bookPackage();
            });
        });

        // Share quote button
        const shareBtn = document.getElementById('share-quote-btn');
        if (shareBtn) {
            shareBtn.addEventListener('click', () => {
                this.shareQuote();
            });
        }
    }

    highlightSelectedPackage(packageType) {
        document.querySelectorAll('.package-card').forEach(card => {
            card.classList.remove('selected');
        });
        
        const selectedCard = document.querySelector(`input[value="${packageType}"]`)?.closest('.package-card');
        if (selectedCard) {
            selectedCard.classList.add('selected');
        }
    }

    updateQuote() {
        if (!this.selectedPackage) return;

        let totalPrice = this.packages[this.selectedPackage].basePrice;
        
        // Add addon prices
        document.querySelectorAll('input[data-addon]:checked').forEach(checkbox => {
            const addonKey = checkbox.getAttribute('data-addon');
            if (this.addons[addonKey]) {
                totalPrice += this.addons[addonKey].price;
            }
        });

        // Guest count multiplier
        const guestCount = document.getElementById('guest-count');
        if (guestCount && guestCount.value !== '0') {
            const multiplier = parseFloat(guestCount.options[guestCount.selectedIndex].getAttribute('data-multiplier') || 1);
            totalPrice *= multiplier;
        }

        // Location multiplier
        const location = document.getElementById('location-type');
        if (location && location.value !== '0') {
            const multiplier = parseFloat(location.options[location.selectedIndex].getAttribute('data-multiplier') || 1);
            totalPrice *= multiplier;
        }

        // Duration multiplier
        const duration = document.getElementById('event-duration');
        if (duration && duration.value !== '0') {
            const multiplier = parseFloat(duration.options[duration.selectedIndex].getAttribute('data-multiplier') || 1);
            totalPrice *= multiplier;
        }

        // Update display
        const priceElement = document.getElementById('total-price');
        if (priceElement) {
            priceElement.textContent = `₹${totalPrice.toLocaleString('en-IN')}`;
        }

        // Update package details
        this.updatePackageDetails();
    }

    updatePackageDetails() {
        const detailsElement = document.getElementById('package-details');
        if (!detailsElement || !this.selectedPackage) return;

        const packageInfo = this.packages[this.selectedPackage];
        let html = `<h4>${packageInfo.name}</h4><ul>`;
        
        packageInfo.features.forEach(feature => {
            html += `<li><i class="fas fa-check"></i> ${feature}</li>`;
        });
        
        html += '</ul>';
        detailsElement.innerHTML = html;
    }

    bookPackage() {
        if (!this.selectedPackage) {
            this.showMessage('Please select a package first');
            return;
        }

        // Populate booking form
        const bookingForm = document.getElementById('booking-form');
        if (bookingForm) {
            const messageTextarea = bookingForm.querySelector('textarea[name="message"]');
            if (messageTextarea) {
                const totalPrice = document.getElementById('total-price')?.textContent || 'Not calculated';
                const packageName = this.packages[this.selectedPackage].name;
                
                // Sanitize data before inserting
                const sanitizedPackageName = SecurityUtils.sanitizeInput(packageName, 'text');
                const sanitizedTotalPrice = SecurityUtils.sanitizeInput(totalPrice, 'text');
                const sanitizedAddons = SecurityUtils.sanitizeInput(this.getSelectedAddons(), 'text');
                const sanitizedEventDetails = SecurityUtils.sanitizeInput(this.getEventDetails(), 'text');
                
                const packageDetails = `
Package Selected: ${sanitizedPackageName}
Estimated Total: ${sanitizedTotalPrice}
Additional Services: ${sanitizedAddons}
Event Details: ${sanitizedEventDetails}

Please provide detailed quote and availability.`;
                messageTextarea.value = packageDetails;
            }
        }
        
        this.showMessage('Booking form populated! Please review and submit.');
    }

    getSelectedAddons() {
        const selectedAddons = [];
        document.querySelectorAll('input[data-addon]:checked').forEach(checkbox => {
            const name = checkbox.parentElement.querySelector('.addon-name')?.textContent || '';
            selectedAddons.push(name);
        });
        return selectedAddons.length > 0 ? selectedAddons.join(', ') : 'None';
    }

    getEventDetails() {
        const details = [];
        const guestCount = document.getElementById('guest-count');
        const location = document.getElementById('location-type');
        const duration = document.getElementById('event-duration');
        
        if (guestCount && guestCount.value !== '0') {
            details.push(`Guests: ${guestCount.options[guestCount.selectedIndex].text}`);
        }
        if (location && location.value !== '0') {
            details.push(`Location: ${location.options[location.selectedIndex].text}`);
        }
        if (duration && duration.value !== '0') {
            details.push(`Duration: ${duration.options[duration.selectedIndex].text}`);
        }
        
        return details.join(', ') || 'Not specified';
    }

    shareQuote() {
        if (!this.selectedPackage) {
            this.showMessage('Please select a package first');
            return;
        }

        const totalPrice = document.getElementById('total-price')?.textContent || 'Not calculated';
        const packageName = this.packages[this.selectedPackage].name;
        
        // Sanitize all data before URL encoding
        const sanitizedPackageName = SecurityUtils.sanitizeInput(packageName, 'text');
        const sanitizedTotalPrice = SecurityUtils.sanitizeInput(totalPrice, 'text');
        const sanitizedAddons = SecurityUtils.sanitizeInput(this.getSelectedAddons(), 'text');
        const sanitizedEventDetails = SecurityUtils.sanitizeInput(this.getEventDetails(), 'text');
        
        const shareText = `Digital Story Studio Wedding Quote
Package: ${sanitizedPackageName}
Total: ${sanitizedTotalPrice}
Additional Services: ${sanitizedAddons}
Event Details: ${sanitizedEventDetails}

Contact: +91-93183 44023
Website: digitalstorystudio.in`;

        // Use secure URL encoding
        const encodedText = SecurityUtils.encodeURLParam(shareText);
        const whatsappUrl = `https://wa.me/919318344023?text=${encodedText}`;
        
        window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    }

    showMessage(message) {
        showNotification(SecurityUtils.sanitizeHTML(message), 'info');
    }
}

// ===================================================
// SECURE FORM INITIALIZATION
// ===================================================

function initSecureForms() {
    const forms = document.querySelectorAll('form');
    
    forms.forEach(form => {
        // Add security attributes
        form.setAttribute('autocomplete', 'off');
        
        // Prevent multiple submissions
        let isSubmitting = false;
        
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Prevent double submission
            if (isSubmitting) {
                return false;
            }
            
            // Check honeypot
            const honeypot = form.querySelector('.honeypot');
            if (honeypot && honeypot.value) {
                console.warn('Bot detected');
                return false;
            }
            
            // Validate CSRF token
            const csrfToken = form.querySelector('input[name="csrf_token"]');
            if (!csrfToken || !SecurityUtils.validateCSRFToken(csrfToken.value)) {
                showNotification('Security validation failed. Please refresh the page.', 'error');
                return false;
            }
            
            // Rate limiting
            const formId = form.id || 'form';
            if (!SecurityUtils.RateLimiter.checkLimit(formId, 3, 60000)) {
                showNotification('Too many attempts. Please try again later.', 'error');
                return false;
            }
            
            // Validate and sanitize all inputs
            const isValid = validateForm(form);
            if (!isValid) {
                return false;
            }
            
            // Mark as submitting
            isSubmitting = true;
            
            // Get form data
            const formData = getSecureFormData(form);
            
            // Submit to WhatsApp or Email
            submitFormSecurely(formData, form);
            
            // Reset after 3 seconds
            setTimeout(() => {
                isSubmitting = false;
            }, 3000);
        });
    });
}

// ===================================================
// FORM VALIDATION
// ===================================================

function validateForm(form) {
    let isValid = true;
    const inputs = form.querySelectorAll('input, textarea');
    
    inputs.forEach(input => {
        // Skip hidden inputs and honeypot
        if (input.type === 'hidden' || input.classList.contains('honeypot')) {
            return;
        }
        
        const value = input.value.trim();
        const type = input.getAttribute('data-sanitize') || input.type;
        
        // Required field check
        if (input.hasAttribute('required') && !value) {
            showFieldError(input, 'This field is required');
            isValid = false;
            return;
        }
        
        // Type-specific validation
        switch(type) {
            case 'email':
                if (value && !SecurityUtils.validateEmail(value)) {
                    showFieldError(input, 'Please enter a valid email');
                    isValid = false;
                }
                break;
            
            case 'phone':
            case 'tel':
                if (value && !SecurityUtils.validatePhone(value)) {
                    showFieldError(input, 'Please enter a valid 10-digit phone number');
                    isValid = false;
                }
                break;
            
            case 'text':
                if (input.name === 'name' && value && !SecurityUtils.validateName(value)) {
                    showFieldError(input, 'Please enter a valid name (letters only)');
                    isValid = false;
                }
                break;
        }
        
        // Clear error if valid
        if (isValid) {
            clearFieldError(input);
        }
    });
    
    return isValid;
}

function showFieldError(input, message) {
    clearFieldError(input);
    
    input.classList.add('error');
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'field-error';
    errorDiv.textContent = message;
    
    input.parentElement.appendChild(errorDiv);
}

function clearFieldError(input) {
    input.classList.remove('error');
    
    const existingError = input.parentElement.querySelector('.field-error');
    if (existingError) {
        existingError.remove();
    }
}

// ===================================================
// SECURE FORM DATA EXTRACTION
// ===================================================

function getSecureFormData(form) {
    const data = {};
    const inputs = form.querySelectorAll('input, textarea, select');
    
    inputs.forEach(input => {
        // Skip hidden inputs, honeypot, and csrf token
        if (input.type === 'hidden' || input.classList.contains('honeypot')) {
            return;
        }
        
        const name = input.name;
        const type = input.getAttribute('data-sanitize') || input.type;
        const value = input.value;
        
        // Sanitize based on type
        data[name] = SecurityUtils.sanitizeInput(value, type);
    });
    
    return data;
}

// ===================================================
// SECURE FORM SUBMISSION
// ===================================================

function submitFormSecurely(data, form) {
    // Build message for WhatsApp
    let message = 'New Contact Form Submission:\n\n';
    
    for (let key in data) {
        const label = key.charAt(0).toUpperCase() + key.slice(1);
        message += `${label}: ${data[key]}\n`;
    }
    
    // Encode message safely
    const encodedMessage = SecurityUtils.encodeURLParam(message);
    
    // WhatsApp URL
    const whatsappURL = `https://wa.me/919318344023?text=${encodedMessage}`;
    
    // Open in new tab
    window.open(whatsappURL, '_blank', 'noopener,noreferrer');
    
    // Show success message
    showNotification('Form submitted successfully! Redirecting to WhatsApp...', 'success');
    
    // Reset form
    form.reset();
    
    // Generate new CSRF token
    SecurityUtils.setCSRFToken();
}

// ===================================================
// NOTIFICATION SYSTEM
// ===================================================

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = SecurityUtils.sanitizeHTML(message);
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    // Remove after 5 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 5000);
}

// ===================================================
// VISITOR COUNTER (SECURE)
// ===================================================

function initVisitorCounter() {
    const counterElement = document.getElementById('visitorCount');
    if (!counterElement) return;
    
    try {
        // Try to get from localStorage (for demo purposes)
        let count = parseInt(localStorage.getItem('visitorCount') || '100000');
        
        // Check if new visitor today
        const lastVisit = localStorage.getItem('lastVisit');
        const today = new Date().toDateString();
        
        if (lastVisit !== today) {
            count++;
            localStorage.setItem('visitorCount', count);
            localStorage.setItem('lastVisit', today);
        }
        
        // Animate counter
        animateCounter(counterElement, count);
    } catch (error) {
        console.error('Visitor counter error:', error);
        counterElement.textContent = '100000+';
    }
}

function animateCounter(element, target) {
    let current = 0;
    const increment = Math.ceil(target / 50);
    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            current = target;
            clearInterval(timer);
        }
        element.textContent = current.toLocaleString();
    }, 20);
}

// ===================================================
// ADDITIONAL SECURITY MEASURES
// ===================================================

// Disable right-click on images (optional)
document.addEventListener('contextmenu', function(e) {
    if (e.target.tagName === 'IMG') {
        e.preventDefault();
        return false;
    }
});

// Prevent console manipulation (basic)
(function() {
    try {
        const devtools = /./;
        devtools.toString = function() {
            this.opened = true;
        };
        console.log('%c', devtools);
        
        if (devtools.opened) {
            console.warn('Developer tools detected. Please be aware that unauthorized access attempts are monitored.');
        }
    } catch (e) {}
})();

// Monitor for XSS attempts
window.addEventListener('error', function(e) {
    if (e.message && e.message.includes('script')) {
        console.error('Potential XSS attempt detected');
    }
});

// Add CSS for notifications
const notificationCSS = `
    .notification {
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 25px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        z-index: 10000;
        opacity: 0;
        transform: translateY(-20px);
        transition: all 0.3s ease;
        max-width: 400px;
        font-weight: 500;
    }
    
    .notification.show {
        opacity: 1;
        transform: translateY(0);
    }
    
    .notification-success {
        background: #10b981;
        color: white;
    }
    
    .notification-error {
        background: #ef4444;
        color: white;
    }
    
    .notification-info {
        background: #3b82f6;
        color: white;
    }
    
    .field-error {
        color: #ef4444;
        font-size: 0.85rem;
        margin-top: 5px;
        animation: shake 0.3s;
    }
    
    input.error, textarea.error {
        border-color: #ef4444 !important;
        box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1) !important;
    }
    
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-5px); }
        75% { transform: translateX(5px); }
    }
`;

const styleSheet = document.createElement('style');
styleSheet.textContent = notificationCSS;
document.head.appendChild(styleSheet);

// ===================================================
// SMART DROPDOWN POSITIONING
// Screen ke bahar jaane se rokne ke liye
// ===================================================

(function() {
    'use strict';
    
    // Function to check and adjust dropdown position
    function adjustDropdownPosition() {
        // Only apply on desktop (screen width > 992px)
        if (window.innerWidth <= 992) return;
        
        const dropdowns = document.querySelectorAll('.dropdown-menu');
        const submenus = document.querySelectorAll('.submenu');
        
        // Reset all positioning classes
        dropdowns.forEach(dropdown => {
            dropdown.classList.remove('align-left', 'align-right');
        });
        
        submenus.forEach(submenu => {
            submenu.classList.remove('open-left', 'open-right');
        });
        
        // Check and adjust dropdown menus
        dropdowns.forEach(dropdown => {
            const rect = dropdown.getBoundingClientRect();
            const viewportWidth = window.innerWidth;
            
            // If dropdown goes beyond right edge
            if (rect.right > viewportWidth) {
                dropdown.classList.add('align-right');
            }
            // If dropdown goes beyond left edge
            else if (rect.left < 0) {
                dropdown.classList.add('align-left');
            }
        });
        
        // Check and adjust submenus
        submenus.forEach(submenu => {
            const parentDropdown = submenu.closest('.dropdown-menu');
            const rect = submenu.getBoundingClientRect();
            const viewportWidth = window.innerWidth;
            
            // Default: submenu opens to left (right: 100%)
            // If submenu goes beyond left edge, open to right
            if (rect.left < 0) {
                submenu.classList.add('open-right');
                submenu.classList.remove('open-left');
            }
            // If submenu goes beyond right edge, open to left
            else if (rect.right > viewportWidth) {
                submenu.classList.add('open-left');
                submenu.classList.remove('open-right');
            }
            // If parent dropdown is aligned right, open submenu to right
            else if (parentDropdown && parentDropdown.classList.contains('align-right')) {
                submenu.classList.add('open-right');
            }
        });
    }
    
    // Function to handle hover events and check position
    function setupDropdownListeners() {
        const navItems = document.querySelectorAll('.nav-item');
        const dropdownItems = document.querySelectorAll('.dropdown-item');
        
        // Main dropdown hover
        navItems.forEach(item => {
            const dropdown = item.querySelector('.dropdown-menu');
            if (!dropdown) return;
            
            item.addEventListener('mouseenter', function() {
                setTimeout(() => {
                    adjustDropdownPosition();
                }, 50);
            });
        });
        
        // Submenu hover
        dropdownItems.forEach(item => {
            const submenu = item.querySelector('.submenu');
            if (!submenu) return;
            
            item.addEventListener('mouseenter', function() {
                setTimeout(() => {
                    adjustDropdownPosition();
                }, 50);
            });
        });
    }
    
    // Initialize on page load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            setupDropdownListeners();
            adjustDropdownPosition();
        });
    } else {
        setupDropdownListeners();
        adjustDropdownPosition();
    }
    
    // Adjust on window resize
    let resizeTimeout;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(function() {
            adjustDropdownPosition();
        }, 150);
    });
    
    // Adjust on scroll (for sticky nav)
    let scrollTimeout;
    window.addEventListener('scroll', function() {
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(function() {
            adjustDropdownPosition();
        }, 100);
    }, { passive: true });
    
})();