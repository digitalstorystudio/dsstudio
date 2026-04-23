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

    // ================================================================
    // DYNAMIC HEADER OFFSET — measures real heights, sets CSS vars
    // Fixes top-bar height changing on mobile across screen sizes
    // ================================================================
    function updateHeaderOffsets() {
        const topBarEl = document.querySelector('.top-bar');
        const navbarEl = document.getElementById('navbar');
        const mainContent = document.querySelector('.main-content');

        if (!topBarEl || !navbarEl) return;

        // Use 0 when top-bar is scroll-hidden (transform hides it visually but offsetHeight still returns real height)
        const topBarH = topBarEl.classList.contains('scroll-hidden') ? 0 : topBarEl.offsetHeight;
        const navbarH = navbarEl.offsetHeight;
        const totalH  = topBarH + navbarH;

        // Update navbar top position
        navbarEl.style.top = topBarH + 'px';

        // Update CSS custom properties
        document.documentElement.style.setProperty('--top-bar-height-real', topBarH + 'px');
        document.documentElement.style.setProperty('--navbar-height-real',  navbarH + 'px');
        document.documentElement.style.setProperty('--header-total-height', totalH  + 'px');

        // Update nav-links panel top (always, so position is correct at all widths)
        const navLinksEl = document.getElementById('navLinks');
        if (navLinksEl) {
            navLinksEl.style.top = totalH + 'px';
            navLinksEl.style.maxHeight = (window.innerHeight - totalH) + 'px';
        }

        // Update main-content padding-top
        if (mainContent) {
            mainContent.style.paddingTop = totalH + 'px';
        }
    }

    // Run on load, resize, and orientation change
    updateHeaderOffsets();
    window.addEventListener('load',             updateHeaderOffsets);
    window.addEventListener('resize',             updateHeaderOffsets, { passive: true });
    window.addEventListener('orientationchange',  function() {
        setTimeout(updateHeaderOffsets, 200);
    });

    
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

    // ================================================================
    // NAVIGATION — COMPLETE REWRITE
    // Works on: Desktop hover | Mobile/Tablet touch accordion
    // Class system: .open on nav-item and .open on dropdown-item
    // ================================================================

    const hamburger = document.getElementById('hamburger');
    const navLinks  = document.getElementById('navLinks');
    const navbar    = document.getElementById('navbar');
    const topBar    = document.querySelector('.top-bar');

    // ── Hamburger open/close ──────────────────────────────────────
    if (hamburger && navLinks) {
        hamburger.addEventListener('click', function(e) {
            e.stopPropagation();
            // Recalculate FIRST so inline top is correct before the menu becomes visible
            updateHeaderOffsets();
            const isOpen = navLinks.classList.toggle('active');
            hamburger.classList.toggle('active', isOpen);
            hamburger.setAttribute('aria-expanded', isOpen);
            // Prevent body scroll when menu open on mobile
            document.body.style.overflow = isOpen ? 'hidden' : '';
        });

        // Close menu on outside click / tap
        document.addEventListener('click', function(e) {
            if (navLinks.classList.contains('active') &&
                !navLinks.contains(e.target) &&
                !hamburger.contains(e.target)) {
                closeAllMenus();
            }
        });

        // Close menu on Escape key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') closeAllMenus();
        });
    }

    function closeAllMenus() {
        if (navLinks) {
            navLinks.classList.remove('active');
            document.body.style.overflow = '';
        }
        if (hamburger) {
            hamburger.classList.remove('active');
            hamburger.setAttribute('aria-expanded', 'false');
        }
        document.querySelectorAll('.nav-item.open').forEach(function(el) {
            el.classList.remove('open');
        });
        document.querySelectorAll('.dropdown-item.open').forEach(function(el) {
            el.classList.remove('open');
        });
    }

    // ── Mobile accordion: Level 1 (nav-item > dropdown-menu) ─────
    document.querySelectorAll('.nav-item > .nav-link').forEach(function(link) {
        const navItem = link.closest('.nav-item');
        if (!navItem || !navItem.querySelector('.dropdown-menu')) return;

        link.addEventListener('click', function(e) {
            if (window.innerWidth > 992) return; // desktop uses hover
            e.preventDefault();
            e.stopPropagation();

            const isOpen = navItem.classList.contains('open');

            // Close all sibling nav-items
            document.querySelectorAll('.nav-item.open').forEach(function(el) {
                el.classList.remove('open');
                // Also close any open sub-items inside
                el.querySelectorAll('.dropdown-item.open').forEach(function(di) {
                    di.classList.remove('open');
                });
            });

            if (!isOpen) navItem.classList.add('open');
        });
    });

    // ── Mobile accordion: Level 2 (dropdown-item > submenu) ──────
    document.querySelectorAll('.dropdown-item > .dropdown-link').forEach(function(link) {
        const dropItem = link.closest('.dropdown-item');
        if (!dropItem || !dropItem.querySelector('.submenu')) return;

        link.addEventListener('click', function(e) {
            if (window.innerWidth > 992) return; // desktop uses hover
            e.preventDefault();
            e.stopPropagation();

            const isOpen = dropItem.classList.contains('open');

            // Close sibling dropdown-items
            const parent = dropItem.parentElement;
            if (parent) {
                parent.querySelectorAll(':scope > .dropdown-item.open').forEach(function(el) {
                    el.classList.remove('open');
                });
            }

            if (!isOpen) dropItem.classList.add('open');
        });
    });

    // ── Reset accordion state on resize to desktop ────────────────
    window.addEventListener('resize', function() {
        if (window.innerWidth > 992) {
            document.body.style.overflow = '';
            document.querySelectorAll('.nav-item.open, .dropdown-item.open').forEach(function(el) {
                el.classList.remove('open');
            });
        }
    });

    // ── Smooth Scroll (skip empty # anchors) ─────────────────────
    document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (!href || href === '#') { e.preventDefault(); return; }
            try {
                const target = document.querySelector(href);
                if (target) {
                    e.preventDefault();
                    const offset = 130;
                    const top = target.getBoundingClientRect().top + window.pageYOffset - offset;
                    window.scrollTo({ top: top, behavior: 'smooth' });
                    closeAllMenus();
                }
            } catch(err) { /* invalid selector — ignore */ }
        });
    });

    // ── Sticky Navbar ─────────────────────────────────────────────
    if (navbar) {
        window.addEventListener('scroll', function() {
            if (window.scrollY > 80) {
                navbar.classList.add('sticky');
            } else {
                navbar.classList.remove('sticky');
            }
        }, { passive: true });
    }

    // ── Hide top-bar on scroll down, show on scroll up (mobile only) ──
    (function() {
        var lastScrollY = window.scrollY;
        var ticking = false;
        var SCROLL_THRESHOLD = 5;

        function handleScrollDirection() {
            var currentScrollY = window.scrollY;
            var isMobile = window.innerWidth <= 768;

            if (!topBar || !navbar) { ticking = false; return; }

            if (!isMobile) {
                topBar.classList.remove('scroll-hidden');
                navbar.classList.remove('top-bar-hidden');
                var mc = document.querySelector('.main-content');
                if (mc) mc.classList.remove('top-bar-hidden');
                updateHeaderOffsets();
                lastScrollY = currentScrollY;
                ticking = false;
                return;
            }

            if (currentScrollY <= 5) {
                // At very top — always show top-bar
                topBar.classList.remove('scroll-hidden');
                navbar.classList.remove('top-bar-hidden');
                var mc = document.querySelector('.main-content');
                if (mc) mc.classList.remove('top-bar-hidden');
            } else if (currentScrollY > lastScrollY + SCROLL_THRESHOLD) {
                // Scrolling DOWN — hide top-bar, move navbar to top
                topBar.classList.add('scroll-hidden');
                navbar.classList.add('top-bar-hidden');
                var mc = document.querySelector('.main-content');
                if (mc) mc.classList.add('top-bar-hidden');
            } else if (currentScrollY < lastScrollY - SCROLL_THRESHOLD) {
                // Scrolling UP — bring back top-bar
                topBar.classList.remove('scroll-hidden');
                navbar.classList.remove('top-bar-hidden');
                var mc = document.querySelector('.main-content');
                if (mc) mc.classList.remove('top-bar-hidden');
            }

            // Recompute so nav-links snaps directly below the visible navbar
            updateHeaderOffsets();

            lastScrollY = currentScrollY;
            ticking = false;
        }

        window.addEventListener('scroll', function() {
            if (!ticking) {
                requestAnimationFrame(handleScrollDirection);
                ticking = true;
            }
        }, { passive: true });

        window.addEventListener('resize', function() {
            if (window.innerWidth > 768) {
                if (topBar) topBar.classList.remove('scroll-hidden');
                if (navbar) navbar.classList.remove('top-bar-hidden');
                var mc = document.querySelector('.main-content');
                if (mc) mc.classList.remove('top-bar-hidden');
                updateHeaderOffsets();
            }
        }, { passive: true });
    })();

    // ================================================================
    // BANNER VIDEO SLIDER — Auto-slide every 3s + manual prev/next
    // ================================================================
    (function () {
        var bannerVideos = document.querySelectorAll('.banner-video');
        var prevBtn      = document.getElementById('prevBanner');
        var nextBtn      = document.getElementById('nextBanner');

        if (!bannerVideos.length) return;

        var current    = 0;
        var autoSlideTimer = null;

        function showSlide(index) {
            // Wrap around
            current = (index + bannerVideos.length) % bannerVideos.length;

            bannerVideos.forEach(function (vid, i) {
                if (i === current) {
                    vid.classList.add('active');
                    vid.play().catch(function () {}); // autoplay may be blocked; swallow error
                } else {
                    vid.classList.remove('active');
                    vid.pause();
                }
            });
        }

        function startAutoSlide() {
            clearInterval(autoSlideTimer);
            autoSlideTimer = setInterval(function () {
                showSlide(current + 1);
            }, 3000);
        }

        // Previous button
        if (prevBtn) {
            prevBtn.addEventListener('click', function () {
                showSlide(current - 1);
                startAutoSlide(); // Reset the 3s countdown after manual click
            });
        }

        // Next button
        if (nextBtn) {
            nextBtn.addEventListener('click', function () {
                showSlide(current + 1);
                startAutoSlide(); // Reset the 3s countdown after manual click
            });
        }

        // Initialise: show first slide and start auto-slide
        showSlide(0);
        startAutoSlide();
    })();

    // ── Smart dropdown viewport positioning (desktop only) ────────
    function adjustDropdowns() {
        if (window.innerWidth <= 992) return;
        document.querySelectorAll('.dropdown-menu').forEach(function(dd) {
            dd.classList.remove('align-left', 'align-right');
            const r = dd.getBoundingClientRect();
            if (r.right > window.innerWidth) dd.classList.add('align-right');
            else if (r.left < 0)             dd.classList.add('align-left');
        });
        document.querySelectorAll('.submenu').forEach(function(sm) {
            sm.classList.remove('open-left', 'open-right');
            const r = sm.getBoundingClientRect();
            if (r.right > window.innerWidth) sm.classList.add('open-left');
            else if (r.left < 0)             sm.classList.add('open-right');
        });
    }
    document.querySelectorAll('.nav-item').forEach(function(item) {
        item.addEventListener('mouseenter', function() { setTimeout(adjustDropdowns, 50); });
    });
    document.querySelectorAll('.dropdown-item').forEach(function(item) {
        item.addEventListener('mouseenter', function() { setTimeout(adjustDropdowns, 50); });
    });
    window.addEventListener('resize', function() { setTimeout(adjustDropdowns, 150); }, { passive: true });

});

// ===================================================
// FORM TAB SWITCHER
// ===================================================
function switchTab(tab) {
    document.querySelectorAll('.form-tab').forEach(function(btn) {
        btn.classList.remove('active');
    });
    document.querySelectorAll('.form-step').forEach(function(step) {
        step.classList.remove('active');
    });
    if (tab === 'booking') {
        document.getElementById('booking-form').classList.add('active');
        document.querySelector('.form-tab:nth-child(1)').classList.add('active');
    } else {
        document.getElementById('general-form').classList.add('active');
        document.querySelector('.form-tab:nth-child(2)').classList.add('active');
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
    const whatsappURL = `https://wa.me/918810696407?text=${encodedMessage}`;
    
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