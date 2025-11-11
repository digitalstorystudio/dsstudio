document.addEventListener('DOMContentLoaded', function() {
    // --- CRITICAL: Video and Audio Elements - HIGHEST PRIORITY ---
    const video = document.getElementById('intro-video');
    const soundEnableBtn = document.getElementById('soundEnableBtn');
    const enterButton = document.getElementById('enterButton');
    const bgMusic = document.getElementById('bg-music');
    const audioControls = document.getElementById('audioControls');
    const audioToggle = document.getElementById('audioToggle');
    const mainWebsiteDiv = document.querySelector('.main-website');
    const videoContainer = document.querySelector('.video-container');
    
    // Navigation elements (lower priority)
    const hamburger = document.getElementById('hamburger');
    const navLinks = document.getElementById('navLinks');

    // --- CRITICAL: Intro Video Logic - MODIFIED FOR AUTO-ENTER ---
    const isIndexPage = window.location.pathname.endsWith('/') || 
                       window.location.pathname.endsWith('index.html') || 
                       window.location.pathname === "";

    if (isIndexPage && video && soundEnableBtn && mainWebsiteDiv && videoContainer) {
        // Protect video functionality from any interference
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
                        // If autoplay fails, automatically show main website after a delay
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
                            video.play().catch(e => console.error('Video playback error after sound enable:', e));
                        } catch (e) {
                            console.error('Sound enable error:', e);
                        }
                    });
                }

                // Video end event - AUTOMATICALLY SHOW WEBSITE
                if (video) {
                    video.addEventListener('ended', () => {
                        try {
                            // Automatically show main website when video ends
                            showMainWebsite(true);
                            sessionStorage.setItem('introPlayed', 'true');
                            
                            // Hide sound button if still visible
                            if (soundEnableBtn) {
                                soundEnableBtn.style.display = 'none';
                            }
                        } catch (e) {
                            console.error('Video end event error:', e);
                        }
                    });
                }

                // Optional: Keep enter button as backup (hidden by default via CSS)
                // This provides a fallback if video doesn't autoplay properly
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
            // Fallback: show main website if video fails
            showMainWebsite(false);
        }
    } else if (mainWebsiteDiv) {
        // For pages without intro video
        showMainWebsite(false);
    }

    // --- CRITICAL: Main Website Display Function ---
    function showMainWebsite(removeIntroContainer) {
        try {
            if (mainWebsiteDiv) {
                document.body.classList.add('show-website');
                mainWebsiteDiv.style.display = 'block';
                setTimeout(() => {
                    mainWebsiteDiv.style.opacity = '1';
                }, 50);
            }

            // Hide intro elements
            if (enterButton) enterButton.style.display = 'none';
            if (soundEnableBtn) soundEnableBtn.style.display = 'none';

            // Initialize background music
            if (bgMusic && audioControls && audioToggle) {
                const musicStart = bgMusic.play();
                if (musicStart !== undefined) {
                    musicStart.catch((e) => {
                        console.warn("Background music autoplay prevented on enter/load:", e);
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

    // --- CRITICAL: Audio Controls ---
    if (audioToggle && bgMusic) {
        audioToggle.addEventListener('click', () => {
            try {
                if (bgMusic.paused || bgMusic.muted) {
                    bgMusic.play().then(() => {
                        bgMusic.muted = false;
                        audioToggle.innerHTML = '<i class="fas fa-volume-up"></i>';
                    }).catch(e => console.error("Error playing music on toggle:", e));
                } else {
                    bgMusic.pause();
                    audioToggle.innerHTML = '<i class="fas fa-volume-mute"></i>';
                }
            } catch (error) {
                console.error('Audio toggle error:', error);
            }
        });
    }
    
    // --- CRITICAL: Background Music Visibility Management ---
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
                        bgMusic.play().catch(e => console.warn("Background music resume on visibility prevented:", e));
                    }
                }
            }
        } catch (error) {
            console.error('Visibility change error:', error);
        }
    });
    // --- END CRITICAL SECTIONS ---

    // --- Enhanced Multi-Level Navigation System ---
    if (hamburger && navLinks) {
        try {
            // Function to check if nav is scrollable and add indicator
            function checkNavScroll() {
                if (window.innerWidth <= 992 && navLinks.classList.contains('active')) {
                    const isScrollable = navLinks.scrollHeight > navLinks.clientHeight;
                    if (isScrollable) {
                        navLinks.classList.add('has-scroll');
                    } else {
                        navLinks.classList.remove('has-scroll');
                    }
                }
            }

            // Hamburger menu toggle with enhanced animations
            hamburger.addEventListener('click', () => {
                try {
                    navLinks.classList.toggle('active');
                    const icon = hamburger.querySelector('i');
                    if (icon) {
                        icon.classList.toggle('fa-bars');
                        icon.classList.toggle('fa-times');
                    }
                    // Update ARIA attributes for accessibility
                    const isExpanded = navLinks.classList.contains('active');
                    hamburger.setAttribute('aria-expanded', isExpanded);
                    
                    // Check if scrolling is needed
                    if (isExpanded) {
                        setTimeout(checkNavScroll, 100);
                    }
                } catch (e) {
                    console.error('Hamburger toggle error:', e);
                }
            });

            // Enhanced mobile menu handling
            navLinks.querySelectorAll('a').forEach(link => {
                link.addEventListener('click', (e) => {
                    try {
                        // Mobile dropdown behavior with improved UX
                        if (window.innerWidth <= 992) {
                            const parentItem = link.closest('.nav-item');
                            const dropdownMenu = parentItem?.querySelector('.dropdown-menu');
                            
                            if (dropdownMenu && link.querySelector('.dropdown-arrow')) {
                                e.preventDefault();
                                parentItem.classList.toggle('mobile-open');
                                
                                // Close other open menus for better UX
                                const otherOpenItems = document.querySelectorAll('.nav-item.mobile-open');
                                otherOpenItems.forEach(item => {
                                    if (item !== parentItem) {
                                        item.classList.remove('mobile-open');
                                    }
                                });
                                return;
                            }
                            
                            const dropdownItem = link.closest('.dropdown-item');
                            const submenu = dropdownItem?.querySelector('.submenu');
                            
                            if (submenu && link.querySelector('i.fa-chevron-right')) {
                                e.preventDefault();
                                dropdownItem.classList.toggle('mobile-open');
                                return;
                            }
                        }
                        
                        // Close mobile menu for regular navigation
                        if (navLinks.classList.contains('active')) {
                            navLinks.classList.remove('active');
                            const icon = hamburger.querySelector('i');
                            if (icon) {
                                icon.classList.remove('fa-times');
                                icon.classList.add('fa-bars');
                            }
                            hamburger.setAttribute('aria-expanded', 'false');
                        }
                    } catch (e) {
                        console.error('Navigation link click error:', e);
                    }
                });
            });
        } catch (error) {
            console.error('Navigation initialization error:', error);
        }
    }

    // --- Enhanced Smart Submenu Positioning ---
    function positionSubmenus() {
        try {
            const dropdownItems = document.querySelectorAll('.dropdown-item-submenu');
            
            dropdownItems.forEach(item => {
                const submenu = item.querySelector('.submenu');
                if (submenu && window.innerWidth > 992) {
                    const rect = item.getBoundingClientRect();
                    const submenuWidth = 350;
                    const viewportWidth = window.innerWidth;
                    const spaceOnRight = viewportWidth - rect.right;
                    const spaceOnLeft = rect.left;
                    
                    if (spaceOnRight < submenuWidth && spaceOnLeft > submenuWidth) {
                        item.classList.add('open-left');
                    } else {
                        item.classList.remove('open-left');
                    }
                }
            });
        } catch (error) {
            console.error('Submenu positioning error:', error);
        }
    }

    // Position submenus on hover with debouncing
    let positioningTimeout;
    document.querySelectorAll('.dropdown-item-submenu').forEach(item => {
        item.addEventListener('mouseenter', () => {
            clearTimeout(positioningTimeout);
            positioningTimeout = setTimeout(positionSubmenus, 10);
        });
    });

    // --- Enhanced Keyboard Navigation ---
    document.addEventListener('keydown', function(e) {
        try {
            if (e.key === 'Escape') {
                document.querySelectorAll('.nav-item').forEach(item => {
                    item.classList.remove('mobile-open');
                });
                document.querySelectorAll('.dropdown-item').forEach(item => {
                    item.classList.remove('mobile-open');
                });
                
                if (navLinks && navLinks.classList.contains('active')) {
                    navLinks.classList.remove('active');
                    const icon = hamburger?.querySelector('i');
                    if (icon) {
                        icon.classList.remove('fa-times');
                        icon.classList.add('fa-bars');
                    }
                    if (hamburger) {
                        hamburger.setAttribute('aria-expanded', 'false');
                    }
                }
            }
        } catch (error) {
            console.error('Keyboard navigation error:', error);
        }
    });

    // --- Enhanced Click Outside to Close ---
    document.addEventListener('click', function(e) {
        try {
            if (!e.target.closest('.navbar')) {
                document.querySelectorAll('.nav-item').forEach(item => {
                    item.classList.remove('mobile-open');
                });
                document.querySelectorAll('.dropdown-item').forEach(item => {
                    item.classList.remove('mobile-open');
                });
                
                if (navLinks && navLinks.classList.contains('active')) {
                    navLinks.classList.remove('active');
                    const icon = hamburger?.querySelector('i');
                    if (icon) {
                        icon.classList.remove('fa-times');
                        icon.classList.add('fa-bars');
                    }
                    if (hamburger) {
                        hamburger.setAttribute('aria-expanded', 'false');
                    }
                }
            }
        } catch (error) {
            console.error('Click outside error:', error);
        }
    });

    // --- Active Page Highlighting ---
    try {
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        document.querySelectorAll('.nav-link').forEach(link => {
            if (link.getAttribute('href') === currentPage) {
                link.classList.add('active');
            }
        });
    } catch (error) {
        console.error('Active page highlighting error:', error);
    }

    // --- Visitor Counter (Protected) ---
    try {
        const visitorCountEl = document.getElementById('visitorCount');
        if (visitorCountEl) {
            let visitorCount = localStorage.getItem('digitalStoryStudioVisitorCount');
            if (!visitorCount) {
                visitorCount = 100000;
            } else {
                visitorCount = parseInt(visitorCount) + 1;
            }
            localStorage.setItem('digitalStoryStudioVisitorCount', visitorCount);
            visitorCountEl.textContent = visitorCount.toLocaleString();
        }
    } catch (error) {
        console.error('Visitor counter error:', error);
    }

    // --- CRITICAL: Banner Video Navigation (Protected) ---
    try {
        const bannerItems = document.querySelectorAll('.banner-video'); 
        const prevBannerBtn = document.getElementById('prevBanner');
        const nextBannerBtn = document.getElementById('nextBanner');
        let currentBannerIndex = 0;
        let bannerAutoRotateInterval;

        function showBannerItem(index) {
            try {
                bannerItems.forEach((video, i) => {
                    if (i === index) {
                        video.classList.add('active');
                        video.muted = true; 
                        const playPromise = video.play();
                        if (playPromise !== undefined) {
                            playPromise.catch(error => {
                                console.warn("Banner video autoplay prevented:", error, video.src);
                            });
                        }
                    } else {
                        video.classList.remove('active');
                        video.pause();
                        video.currentTime = 0; 
                    }
                });
            } catch (error) {
                console.error('Banner video display error:', error);
            }
        }

        function startBannerAutoRotation() {
            try {
                if (bannerItems.length > 1) {
                   bannerAutoRotateInterval = setInterval(() => {
                        currentBannerIndex = (currentBannerIndex + 1) % bannerItems.length;
                        showBannerItem(currentBannerIndex);
                    }, 7000); 
                }
            } catch (error) {
                console.error('Banner auto-rotation error:', error);
            }
        }
        
        function stopBannerAutoRotation() {
            try {
                clearInterval(bannerAutoRotateInterval);
            } catch (error) {
                console.error('Banner stop rotation error:', error);
            }
        }

        if (bannerItems.length > 0) {
            showBannerItem(currentBannerIndex); 
            startBannerAutoRotation();

            if (prevBannerBtn) {
                prevBannerBtn.addEventListener('click', function() {
                    try {
                        stopBannerAutoRotation();
                        currentBannerIndex = (currentBannerIndex - 1 + bannerItems.length) % bannerItems.length;
                        showBannerItem(currentBannerIndex);
                        startBannerAutoRotation();
                    } catch (e) {
                        console.error('Previous banner error:', e);
                    }
                });
            }

            if (nextBannerBtn) {
                nextBannerBtn.addEventListener('click', function() {
                    try {
                        stopBannerAutoRotation();
                        currentBannerIndex = (currentBannerIndex + 1) % bannerItems.length;
                        showBannerItem(currentBannerIndex);
                        startBannerAutoRotation();
                    } catch (e) {
                        console.error('Next banner error:', e);
                    }
                });
            }
        }
    } catch (error) {
        console.error('Banner navigation initialization error:', error);
    }

    // --- Release Tabs (Protected) ---
    try {
        const releaseTabs = document.querySelectorAll('.release-tab');
        const upcomingProjects = document.getElementById('upcoming-projects');
        const releasedProjects = document.getElementById('released-projects');

        if (releaseTabs.length > 0 && upcomingProjects && releasedProjects) {
            releaseTabs.forEach(tab => {
                tab.addEventListener('click', function() {
                    try {
                        releaseTabs.forEach(t => t.classList.remove('active'));
                        this.classList.add('active');

                        if (this.dataset.tab === 'upcoming') {
                            upcomingProjects.style.display = 'grid';
                            releasedProjects.style.display = 'none';
                        } else {
                            upcomingProjects.style.display = 'none';
                            releasedProjects.style.display = 'grid';
                        }
                    } catch (e) {
                        console.error('Release tab error:', e);
                    }
                });
            });

            const activeTab = document.querySelector('.release-tab.active');
            if (activeTab) {
                if (activeTab.dataset.tab === 'upcoming') {
                    upcomingProjects.style.display = 'grid';
                    releasedProjects.style.display = 'none';
                } else {
                    upcomingProjects.style.display = 'none';
                    releasedProjects.style.display = 'grid';
                }
            } else if (releaseTabs.length > 0) {
                if (releaseTabs[0]) releaseTabs[0].click(); 
            }
        }
    } catch (error) {
        console.error('Release tabs error:', error);
    }

    // --- Smooth Scrolling (Protected) ---
    try {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                try {
                    const targetId = this.getAttribute('href');
                    if (targetId.length > 1 && document.querySelector(targetId)) {
                        e.preventDefault();
                        document.querySelector(targetId).scrollIntoView({
                            behavior: 'smooth'
                        });
                    } else if (targetId === "#" && this.closest('.nav-links a[href="index.html"]')) {
                        e.preventDefault();
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                    }
                } catch (e) {
                    console.error('Smooth scroll error:', e);
                }
            });
        });
    } catch (error) {
        console.error('Smooth scrolling initialization error:', error);
    }

    // --- ENHANCED CONTACT PAGE FUNCTIONALITY ---
    
    // Tab switching functionality for contact page
    window.switchTab = function(tabName) {
        try {
            document.querySelectorAll('.form-tab').forEach(tab => tab.classList.remove('active'));
            document.querySelectorAll('.form-step').forEach(step => step.classList.remove('active'));
            
            event.target.classList.add('active');
            
            const targetForm = document.getElementById(tabName + '-form');
            if (targetForm) {
                targetForm.classList.add('active');
            }
        } catch (error) {
            console.error('Tab switching error:', error);
        }
    };

    // Enhanced form validation and submission class
    class EnhancedFormHandler {
        constructor(formId, messageDivId) {
            this.form = document.getElementById(formId);
            this.messageDiv = document.getElementById(messageDivId);
            this.init();
        }

        init() {
            if (this.form && this.messageDiv) {
                this.addRealTimeValidation();
                this.form.addEventListener('submit', (e) => this.handleSubmit(e));
            }
        }

        addRealTimeValidation() {
            const inputs = this.form.querySelectorAll('input, select, textarea');
            inputs.forEach(input => {
                input.addEventListener('blur', () => this.validateField(input));
                input.addEventListener('input', () => this.clearFieldError(input));
            });
        }

        validateField(field) {
            const value = field.value.trim();
            let isValid = true;
            let errorMessage = '';

            field.classList.remove('error');
            this.removeFieldError(field);

            if (field.hasAttribute('required') && !value) {
                isValid = false;
                errorMessage = `${this.getFieldLabel(field)} is required.`;
            } else if (field.type === 'email' && value && !this.isValidEmail(value)) {
                isValid = false;
                errorMessage = 'Please enter a valid email address.';
            } else if (field.type === 'tel' && value && !this.isValidPhone(value)) {
                isValid = false;
                errorMessage = 'Please enter a valid phone number.';
            }

            if (!isValid) {
                this.showFieldError(field, errorMessage);
            }

            return isValid;
        }

        showFieldError(field, message) {
            field.classList.add('error');
            const errorDiv = document.createElement('div');
            errorDiv.className = 'field-error';
            errorDiv.textContent = message;
            field.parentNode.appendChild(errorDiv);
        }

        removeFieldError(field) {
            const errorDiv = field.parentNode.querySelector('.field-error');
            if (errorDiv) {
                errorDiv.remove();
            }
        }

        clearFieldError(field) {
            field.classList.remove('error');
            this.removeFieldError(field);
        }

        getFieldLabel(field) {
            const label = field.parentNode.querySelector('label');
            return label ? label.textContent.replace('*', '').replace(':', '').trim() : field.name;
        }

        isValidEmail(email) {
            return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
        }

        isValidPhone(phone) {
            return /^[\+]?[\d\s\-\(\)]{10,}$/.test(phone);
        }

        async handleSubmit(e) {
            e.preventDefault();
            
            const submitBtn = this.form.querySelector('.submit-btn');
            const originalHTML = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
            submitBtn.disabled = true;

            const inputs = this.form.querySelectorAll('input, select, textarea');
            let isFormValid = true;
            
            inputs.forEach(input => {
                if (!this.validateField(input)) {
                    isFormValid = false;
                }
            });

            if (!isFormValid) {
                submitBtn.innerHTML = originalHTML;
                submitBtn.disabled = false;
                this.showMessage('Please fix the errors above.', 'error');
                return;
            }

            try {
                await this.submitForm();
                this.showMessage('Thank you! Your message has been sent successfully. We will contact you within 24 hours.', 'success');
                this.form.reset();
            } catch (error) {
                this.showMessage('Sorry, there was an error sending your message. Please try again or contact us directly.', 'error');
            } finally {
                submitBtn.innerHTML = originalHTML;
                submitBtn.disabled = false;
            }
        }

        async submitForm() {
            return new Promise((resolve) => {
                setTimeout(() => {
                    const formData = new FormData(this.form);
                    console.log('Form submitted:', Object.fromEntries(formData));
                    resolve();
                }, 2000);
            });
        }

        showMessage(message, type) {
            this.messageDiv.textContent = message;
            this.messageDiv.className = `form-response-message ${type}`;
            this.messageDiv.style.display = 'block';

            setTimeout(() => {
                this.messageDiv.style.display = 'none';
            }, 6000);
        }
    }

    // Initialize enhanced contact form handlers
    try {
        if (document.getElementById('bookingForm')) {
            new EnhancedFormHandler('bookingForm', 'bookingFormMsg');
        }
        if (document.getElementById('generalForm')) {
            new EnhancedFormHandler('generalForm', 'generalFormMsg');
        }
        
        const dateInputs = document.querySelectorAll('input[type="date"]');
        const today = new Date().toISOString().split('T')[0];
        dateInputs.forEach(input => {
            input.min = today;
        });
    } catch (error) {
        console.error('Enhanced contact form initialization error:', error);
    }

    // --- MOBILE TOP BAR SCROLL HIDE/SHOW FUNCTIONALITY ---
    // Only top bar hides on mobile scroll, navbar always stays visible
    try {
        let lastScrollTop = 0;
        let scrollTimeout;
        const topBar = document.querySelector('.top-bar');
        const navbar = document.querySelector('.navbar');
        const mainContent = document.querySelector('.main-content');
        
        function handleTopBarScroll() {
            // Desktop: Always show everything, no scroll hide behavior
            if (window.innerWidth > 768) {
                if (topBar) {
                    topBar.classList.remove('scroll-hidden', 'scroll-visible');
                    topBar.style.transform = 'translateY(0)';
                    topBar.style.opacity = '1';
                }
                if (navbar) {
                    navbar.classList.remove('top-bar-hidden');
                }
                if (mainContent) {
                    mainContent.classList.remove('top-bar-hidden');
                }
                return;
            }

            // Mobile: Hide only top bar on scroll down, navbar stays visible at top
            const currentScrollTop = window.pageYOffset || document.documentElement.scrollTop;
            
            clearTimeout(scrollTimeout);
            
            scrollTimeout = setTimeout(() => {
                // Scrolling down and past threshold - hide only top bar
                if (currentScrollTop > lastScrollTop && currentScrollTop > 80) {
                    if (topBar) {
                        topBar.classList.add('scroll-hidden');
                        topBar.classList.remove('scroll-visible');
                    }
                    // Navbar moves to top position (stays visible)
                    if (navbar) {
                        navbar.classList.add('top-bar-hidden');
                    }
                    if (mainContent) {
                        mainContent.classList.add('top-bar-hidden');
                    }
                } 
                // Scrolling up - show top bar again
                else if (currentScrollTop < lastScrollTop || currentScrollTop <= 80) {
                    if (topBar) {
                        topBar.classList.remove('scroll-hidden');
                        topBar.classList.add('scroll-visible');
                    }
                    // Navbar returns to position below top bar
                    if (navbar) {
                        navbar.classList.remove('top-bar-hidden');
                    }
                    if (mainContent) {
                        mainContent.classList.remove('top-bar-hidden');
                    }
                }
                
                lastScrollTop = currentScrollTop <= 0 ? 0 : currentScrollTop;
            }, 10);
        }

        function throttle(func, limit) {
            let inThrottle;
            return function() {
                const args = arguments;
                const context = this;
                if (!inThrottle) {
                    func.apply(context, args);
                    inThrottle = true;
                    setTimeout(() => inThrottle = false, limit);
                }
            }
        }

        // Add scroll listener with throttling for performance
        window.addEventListener('scroll', throttle(handleTopBarScroll, 16));
        
        // Initialize on page load
        handleTopBarScroll();
        
        // Re-evaluate on window resize
        window.addEventListener('resize', throttle(function() {
            handleTopBarScroll();
        }, 250));
        
    } catch (error) {
        console.error('Top bar scroll hide functionality error:', error);
    }

    // --- Security Features (Protected) ---
    try {
        document.addEventListener('keydown', function(event) {
            try {
                if (
                    event.key === 'F12' ||
                    (event.ctrlKey && event.shiftKey && (event.key === 'I' || event.key === 'J')) ||
                    (event.ctrlKey && event.key === 'U')
                ) {
                    event.preventDefault();
                    console.warn('Inspect mode is disabled for this page.');
                }
            } catch (e) {
                console.error('Keydown security error:', e);
            }
        }); 

        document.addEventListener('contextmenu', function(event) {
            try {
                event.preventDefault();
            } catch (e) {
                console.error('Context menu error:', e);
            }
        });
    } catch (error) {
        console.error('Security features error:', error);
    }

    // --- Performance Optimization ---
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    window.addEventListener('resize', debounce(function() {
        try {
            positionSubmenus();
            if (typeof handleTopBarScroll === 'function') {
                handleTopBarScroll();
            }
        } catch (error) {
            console.error('Resize handler error:', error);
        }
    }, 250));

    // --- Performance Monitoring ---
    try {
        if (performance.mark) {
            performance.mark('dss-navigation-ready');
        }
    } catch (error) {
        console.warn('Performance monitoring not available:', error);
    }

});

// Package calculator code remains the same...
class BookingCalculator {
    constructor() {
        this.basePrice = 0;
        this.addonPrice = 0;
        this.extraPrice = 0;
        this.selectedPackage = null;
        this.earlyBirdDiscount = 0.1;
        
        this.init();
    }

    init() {
        this.bindEvents();
        this.setMinDate();
    }

    bindEvents() {
        document.querySelectorAll('.package-card').forEach(card => {
            card.addEventListener('click', () => this.selectPackage(card));
        });

        document.querySelectorAll('input[data-addon]').forEach(checkbox => {
            checkbox.addEventListener('change', () => this.calculateTotal());
        });

        document.querySelectorAll('.detail-input').forEach(input => {
            input.addEventListener('change', () => this.calculateTotal());
        });

        document.getElementById('share-quote-btn').addEventListener('click', () => this.shareQuote());
    }

    setMinDate() {
        const dateInput = document.getElementById('wedding-date');
        const today = new Date();
        const minDate = today.toISOString().split('T')[0];
        dateInput.min = minDate;
    }

    selectPackage(selectedCard) {
        document.querySelectorAll('.package-card').forEach(card => {
            card.classList.remove('selected');
        });

        selectedCard.classList.add('selected');
        this.selectedPackage = selectedCard.dataset.package;
        this.basePrice = parseInt(selectedCard.dataset.price);
        
        this.calculateTotal();
    }

    calculateTotal() {
        if (!this.selectedPackage) {
            this.showMessage('Please select a package first');
            return;
        }

        this.addonPrice = 0;
        let gstApplicable = false;
        
        document.querySelectorAll('input[data-addon]:checked').forEach(checkbox => {
            if (checkbox.dataset.addon === 'gst-invoice') {
                gstApplicable = true;
            } else {
                this.addonPrice += parseInt(checkbox.dataset.price);
            }
        });

        this.extraPrice = 0;
        
        const locationCharge = parseInt(document.getElementById('location-type').value) || 0;
        this.extraPrice += locationCharge;

        const durationCharge = parseInt(document.getElementById('event-duration').value) || 0;
        this.extraPrice += durationCharge;

        const guestCount = parseInt(document.getElementById('guest-count').value) || 0;
        if (guestCount >= 500) {
            this.extraPrice += 10000;
        }

        const weddingDate = document.getElementById('wedding-date').value;
        let discount = 0;
        let showDiscount = false;

        if (weddingDate) {
            const wedding = new Date(weddingDate);
            const today = new Date();
            const daysUntilWedding = Math.ceil((wedding - today) / (1000 * 60 * 60 * 24));

            if (daysUntilWedding > 90) {
                showDiscount = true;
                discount = (this.basePrice + this.addonPrice + this.extraPrice) * this.earlyBirdDiscount;
            }
        }

        const subtotal = this.basePrice + this.addonPrice + this.extraPrice;
        let total = subtotal - discount;
        
        let gstAmount = 0;
        if (gstApplicable) {
            gstAmount = total * 0.18;
            total = total + gstAmount;
        }

        this.updateDisplay(subtotal, discount, total, showDiscount, gstAmount);
    }

    updateDisplay(subtotal, discount, total, showDiscount, gstAmount = 0) {
        document.getElementById('base-price').textContent = `₹${this.basePrice.toLocaleString()}`;
        document.getElementById('addon-price').textContent = `₹${this.addonPrice.toLocaleString()}`;
        document.getElementById('extra-price').textContent = `₹${this.extraPrice.toLocaleString()}`;
        document.getElementById('total-price').textContent = `₹${total.toLocaleString()}`;

        const discountLine = document.getElementById('discount-line');
        const savingsIndicator = document.getElementById('savings-indicator');
        
        if (showDiscount) {
            discountLine.style.display = 'flex';
            savingsIndicator.style.display = 'block';
            document.getElementById('discount-amount').textContent = `₹${discount.toLocaleString()}`;
            document.getElementById('savings-amount').textContent = discount.toLocaleString();
        } else {
            discountLine.style.display = 'none';
            savingsIndicator.style.display = 'none';
        }

        let gstLine = document.getElementById('gst-line');
        if (gstAmount > 0) {
            if (!gstLine) {
                gstLine = document.createElement('div');
                gstLine.id = 'gst-line';
                gstLine.className = 'price-line gst-line';
                gstLine.innerHTML = '<span>GST (18%):</span><span id="gst-amount">₹0</span>';
                document.querySelector('.price-breakdown').insertBefore(gstLine, document.querySelector('.total-line'));
            }
            gstLine.style.display = 'flex';
            document.getElementById('gst-amount').textContent = `₹${gstAmount.toLocaleString()}`;
        } else if (gstLine) {
            gstLine.style.display = 'none';
        }

        const advance = Math.round(total * 0.2);
        const weddingDay = Math.round(total * 0.6);
        const videoDelivery = Math.round(total * 0.1);
        const albumDelivery = total - advance - weddingDay - videoDelivery;

        document.getElementById('advance-amount').textContent = `₹${advance.toLocaleString()}`;
        document.getElementById('pre-event-amount').textContent = `₹${weddingDay.toLocaleString()}`;
        
        const videoDeliveryEl = document.getElementById('video-delivery-amount');
        if (videoDeliveryEl) {
            videoDeliveryEl.textContent = `₹${videoDelivery.toLocaleString()}`;
        }
        
        document.getElementById('final-amount').textContent = `₹${albumDelivery.toLocaleString()}`;
    }

    showMessage(message) {
        const messageEl = document.createElement('div');
        messageEl.className = 'calculator-message';
        messageEl.textContent = message;
        messageEl.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: var(--primary);
            color: #0a0a1a;
            padding: 15px 25px;
            border-radius: 10px;
            font-weight: bold;
            z-index: 10000;
            animation: fadeInOut 3s ease;
        `;

        document.body.appendChild(messageEl);
        setTimeout(() => messageEl.remove(), 3000);
    }

    bookPackage() {
        if (!this.selectedPackage) {
            this.showMessage('Please select a package first');
            return;
        }

        const bookingForm = document.getElementById('booking-form');
        if (bookingForm) {
            bookingForm.scrollIntoView({ behavior: 'smooth' });
            
            const serviceSelect = document.getElementById('booking-service');
            serviceSelect.value = 'cinematic_wedding';
            
            const weddingDate = document.getElementById('wedding-date').value;
            if (weddingDate) {
                const bookingDateInput = document.getElementById('booking-date');
                if (bookingDateInput) bookingDateInput.value = weddingDate;
            }
            
            const locationSelect = document.getElementById('location-type');
            const locationValue = locationSelect.options[locationSelect.selectedIndex].text;
            const bookingLocationInput = document.getElementById('booking-location');
            if (bookingLocationInput && locationValue !== 'Select location') {
                bookingLocationInput.value = locationValue;
            }
            
            const totalPrice = document.getElementById('total-price').textContent;
            const messageTextarea = document.getElementById('booking-message');
            if (messageTextarea) {
                const packageDetails = `
Selected Package: ${this.selectedPackage.charAt(0).toUpperCase() + this.selectedPackage.slice(1)}
Estimated Total: ${totalPrice}
Additional Services: ${this.getSelectedAddons()}
Event Details: ${this.getEventDetails()}

Please provide detailed quote and availability.`;
                messageTextarea.value = packageDetails;
            }
        }
        
        this.showMessage('Booking form populated! Please review and submit.');
    }

    getSelectedAddons() {
        const selectedAddons = [];
        document.querySelectorAll('input[data-addon]:checked').forEach(checkbox => {
            const name = checkbox.parentElement.querySelector('.addon-name').textContent;
            selectedAddons.push(name);
        });
        return selectedAddons.length > 0 ? selectedAddons.join(', ') : 'None';
    }

    getEventDetails() {
        const details = [];
        const guestCount = document.getElementById('guest-count');
        const location = document.getElementById('location-type');
        const duration = document.getElementById('event-duration');
        
        if (guestCount.value !== '0') {
            details.push(`Guests: ${guestCount.options[guestCount.selectedIndex].text}`);
        }
        if (location.value !== '0') {
            details.push(`Location: ${location.options[location.selectedIndex].text}`);
        }
        if (duration.value !== '0') {
            details.push(`Duration: ${duration.options[duration.selectedIndex].text}`);
        }
        
        return details.join(', ') || 'Not specified';
    }

    shareQuote() {
        if (!this.selectedPackage) {
            this.showMessage('Please select a package first');
            return;
        }

        const totalPrice = document.getElementById('total-price').textContent;
        const packageName = this.selectedPackage.charAt(0).toUpperCase() + this.selectedPackage.slice(1);
        
        const shareText = `Digital Story Studio Wedding Quote
Package: ${packageName}
Total: ${totalPrice}
Additional Services: ${this.getSelectedAddons()}
Event Details: ${this.getEventDetails()}

Contact: +91-93183 44023
Website: digitalstorystudio.in`;

        const whatsappUrl = `https://wa.me/919318344023?text=${encodeURIComponent(shareText)}`;
        
        window.open(whatsappUrl, '_blank');
    }
}

const animationCSS = `
@keyframes fadeInOut {
    0% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
    20% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
    80% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
    100% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
}
`;

const styleSheet = document.createElement('style');
styleSheet.textContent = animationCSS;
document.head.appendChild(styleSheet);

document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        new BookingCalculator();
    }, 500);
});

// Traditional wedding tab functionality
document.addEventListener('DOMContentLoaded', function() {
    const traditionalTabs = document.querySelectorAll('.release-tab[data-tab*="weddings"]');
    const traditionalProjects = {
        'hindu-weddings': document.getElementById('hindu-weddings'),
        'sikh-weddings': document.getElementById('sikh-weddings'),
        'punjabi-weddings': document.getElementById('punjabi-weddings')
    };

    if (traditionalTabs.length > 0 && Object.values(traditionalProjects).some(el => el)) {
        traditionalTabs.forEach(tab => {
            tab.addEventListener('click', function() {
                try {
                    traditionalTabs.forEach(t => t.classList.remove('active'));
                    this.classList.add('active');
                    
                    Object.values(traditionalProjects).forEach(grid => {
                        if (grid) {
                            grid.style.display = 'none';
                            grid.style.opacity = '0';
                        }
                    });
                    
                    const targetGrid = traditionalProjects[this.dataset.tab];
                    if (targetGrid) {
                        targetGrid.style.display = 'grid';
                        setTimeout(() => {
                            targetGrid.style.opacity = '1';
                        }, 50);
                    }
                } catch (error) {
                    console.error('Error switching traditional wedding tabs:', error);
                }
            });
        });

        const defaultTab = document.querySelector('.release-tab[data-tab="hindu-weddings"]');
        if (defaultTab && !defaultTab.classList.contains('active')) {
            defaultTab.click();
        }
    }
});
