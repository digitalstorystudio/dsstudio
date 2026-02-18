// ===================================================
// DESTINATION WEDDING PAGE - MINIMAL JAVASCRIPT
// Only page-specific functionality, no duplicates
// =================================================== */

document.addEventListener('DOMContentLoaded', function() {
    
    // ===================================================
    // PAGE-SPECIFIC SMOOTH SCROLL
    // ===================================================
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href !== '#' && href.length > 1) {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    const offset = 140;
                    const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - offset;
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            }
        });
    });
    
    // ===================================================
    // SCROLL ANIMATIONS
    // ===================================================
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    const animatedElements = document.querySelectorAll(
        '.special-card, .approach-item, .destination-card, .style-card, ' +
        '.process-step, .bts-card, .portfolio-item, .stat-card'
    );
    
    animatedElements.forEach(element => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(30px)';
        element.style.transition = 'all 0.6s ease';
        observer.observe(element);
    });
    
    // ===================================================
    // FAQ ACCORDION
    // ===================================================
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        
        question.addEventListener('click', function() {
            faqItems.forEach(otherItem => {
                if (otherItem !== item && otherItem.classList.contains('active')) {
                    otherItem.classList.remove('active');
                }
            });
            item.classList.toggle('active');
        });
    });
    
    // ===================================================
    // COUNTER ANIMATION FOR STATS
    // ===================================================
    function animateCounter(element, target, duration = 2000) {
        const start = 0;
        const increment = target / (duration / 16);
        let current = start;
        
        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                element.textContent = target + '+';
                clearInterval(timer);
            } else {
                element.textContent = Math.floor(current) + '+';
            }
        }, 16);
    }
    
    const statNumbers = document.querySelectorAll('.stat-number');
    const statsObserver = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting && !entry.target.dataset.animated) {
                const target = parseInt(entry.target.textContent);
                animateCounter(entry.target, target);
                entry.target.dataset.animated = 'true';
            }
        });
    }, { threshold: 0.5 });
    
    statNumbers.forEach(stat => {
        statsObserver.observe(stat);
    });
    
    // ===================================================
    // FORM VALIDATION
    // ===================================================
    const contactForm = document.getElementById('destinationContactForm');
    
    if (contactForm) {
        function validateName(name) {
            const re = /^[a-zA-Z\s]{2,100}$/;
            return re.test(name);
        }
        
        function validateEmail(email) {
            const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
            return re.test(email);
        }
        
        function validatePhone(phone) {
            const re = /^[0-9]{10}$/;
            return re.test(phone.replace(/\D/g, ''));
        }
        
        function sanitizeInput(input) {
            const temp = document.createElement('div');
            temp.textContent = input;
            return temp.innerHTML;
        }
        
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const name = document.getElementById('name').value.trim();
            const email = document.getElementById('email').value.trim();
            const phone = document.getElementById('phone').value.trim();
            const destination = document.getElementById('destination').value;
            const weddingDate = document.getElementById('weddingDate').value;
            const message = document.getElementById('message').value.trim();
            
            let errors = [];
            
            if (!validateName(name)) {
                errors.push('Please enter a valid name (letters and spaces only)');
            }
            
            if (!validateEmail(email)) {
                errors.push('Please enter a valid email address');
            }
            
            if (!validatePhone(phone)) {
                errors.push('Please enter a valid 10-digit phone number');
            }
            
            if (!destination) {
                errors.push('Please select a destination');
            }
            
            if (!weddingDate) {
                errors.push('Please select your wedding date');
            }
            
            if (errors.length > 0) {
                alert('Please fix the following errors:\n\n' + errors.join('\n'));
                return;
            }
            
            const sanitizedData = {
                name: sanitizeInput(name),
                email: sanitizeInput(email),
                phone: phone.replace(/\D/g, ''),
                destination: sanitizeInput(destination),
                weddingDate: weddingDate,
                message: sanitizeInput(message)
            };
            
            const submitBtn = contactForm.querySelector('.submit-btn');
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
            submitBtn.disabled = true;
            
            setTimeout(() => {
                alert('Thank you for your inquiry! We will contact you within 24 hours to discuss your destination wedding videography needs.');
                contactForm.reset();
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            }, 1500);
        });
        
        const phoneInput = document.getElementById('phone');
        if (phoneInput) {
            phoneInput.addEventListener('input', function(e) {
                let value = e.target.value.replace(/\D/g, '');
                if (value.length > 10) {
                    value = value.substr(0, 10);
                }
                e.target.value = value;
            });
        }
        
        const dateInput = document.getElementById('weddingDate');
        if (dateInput) {
            const today = new Date().toISOString().split('T')[0];
            dateInput.setAttribute('min', today);
        }
    }
    
    // ===================================================
    // PORTFOLIO VIDEO CLICK
    // ===================================================
    const portfolioVideos = document.querySelectorAll('.portfolio-video');
    
    portfolioVideos.forEach(video => {
        video.addEventListener('click', function() {
            alert('Video player would open here. Integrate with your video hosting service.');
        });
    });
    
    // ===================================================
    // SCROLL TO TOP BUTTON
    // ===================================================
    const scrollTopBtn = document.createElement('button');
    scrollTopBtn.innerHTML = '<i class="fas fa-chevron-up"></i>';
    scrollTopBtn.className = 'scroll-to-top';
    scrollTopBtn.style.cssText = `
        position: fixed;
        bottom: 30px;
        right: 30px;
        width: 50px;
        height: 50px;
        background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
        border: none;
        border-radius: 50%;
        color: #0a0a1a;
        font-size: 1.2rem;
        cursor: pointer;
        display: none;
        align-items: center;
        justify-content: center;
        z-index: 999;
        box-shadow: 0 4px 15px rgba(0, 240, 255, 0.4);
        transition: all 0.3s ease;
    `;
    document.body.appendChild(scrollTopBtn);
    
    window.addEventListener('scroll', function() {
        if (window.pageYOffset > 300) {
            scrollTopBtn.style.display = 'flex';
        } else {
            scrollTopBtn.style.display = 'none';
        }
    });
    
    scrollTopBtn.addEventListener('click', function() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
    
    scrollTopBtn.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-5px)';
        this.style.boxShadow = '0 8px 25px rgba(0, 240, 255, 0.6)';
    });
    
    scrollTopBtn.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0)';
        this.style.boxShadow = '0 4px 15px rgba(0, 240, 255, 0.4)';
    });
    
    // ===================================================
    // PARALLAX EFFECT FOR HERO
    // ===================================================
    const hero = document.querySelector('.dest-hero');
    
    if (hero) {
        window.addEventListener('scroll', function() {
            const scrolled = window.pageYOffset;
            const parallax = scrolled * 0.5;
            hero.style.transform = `translateY(${parallax}px)`;
        });
    }
    
    console.log('Destination Wedding Page Loaded Successfully!');
});
