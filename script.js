document.addEventListener('DOMContentLoaded', function() {
    // --- Elements ---
    const video = document.getElementById('intro-video');
    const soundEnableBtn = document.getElementById('soundEnableBtn');
    const enterButton = document.getElementById('enterButton');
    const bgMusic = document.getElementById('bg-music');
    const audioControls = document.getElementById('audioControls');
    const audioToggle = document.getElementById('audioToggle');
    const mainWebsiteDiv = document.querySelector('.main-website');
    const hamburger = document.getElementById('hamburger');
    const navLinks = document.getElementById('navLinks');
    const videoContainer = document.querySelector('.video-container'); // Define videoContainer here

    // --- Intro Video Logic (Only for pages with intro video) ---
    // Check if the current page is index.html (or root) and if intro video elements exist
    const isIndexPage = window.location.pathname.endsWith('/') || window.location.pathname.endsWith('index.html') || window.location.pathname === "";

    if (isIndexPage && video && soundEnableBtn && enterButton && mainWebsiteDiv && videoContainer) {
        // Check if intro has already been played in this session
        if (sessionStorage.getItem('introPlayed')) {
            // If intro played, hide video container and show main website
            videoContainer.style.display = 'none';
            soundEnableBtn.style.display = 'none';
            enterButton.style.display = 'none';
            showMainWebsite(false); // Pass false to not remove video container again
        } else {
            // Intro not played yet, proceed with intro logic
            video.muted = true;
            if (bgMusic) bgMusic.volume = 0.3;

            setTimeout(() => {
                soundEnableBtn.style.display = 'block';
            }, 1000);

            const playPromise = video.play();
            if (playPromise !== undefined) {
                playPromise.catch(error => {
                    console.warn("Video autoplay prevented:", error);
                    enterButton.style.display = 'block';
                    soundEnableBtn.style.display = 'none';
                });
            }

            soundEnableBtn.addEventListener('click', function() {
                video.muted = false;
                soundEnableBtn.style.display = 'none';
                video.play().catch(e => console.error('Video playback error after sound enable:', e));
            });

            video.addEventListener('ended', () => {
                enterButton.style.display = 'block';
                soundEnableBtn.style.display = 'none';
            });

            enterButton.addEventListener('click', () => {
                showMainWebsite(true); // Pass true to remove video container
                sessionStorage.setItem('introPlayed', 'true'); // Set flag that intro has played
            });
        }
    } else if (mainWebsiteDiv) {
        // --- For pages without intro video or if intro was skipped ---
        showMainWebsite(false); // Show main content directly
    }

    // --- Shared Function to Show Main Website ---
    // Parameter 'removeIntroContainer' controls if the video container should be removed
    function showMainWebsite(removeIntroContainer) {
        if (mainWebsiteDiv) {
            document.body.classList.add('show-website');
            mainWebsiteDiv.style.display = 'block';
            setTimeout(() => {
                 mainWebsiteDiv.style.opacity = '1';
            }, 50);
        }

        if (enterButton) enterButton.style.display = 'none';
        if (soundEnableBtn) soundEnableBtn.style.display = 'none';

        if (bgMusic && audioControls && audioToggle) {
            const musicStart = bgMusic.play();
            if (musicStart !== undefined) {
                musicStart.catch((e) => {
                     console.warn("Background music autoplay prevented on enter/load:", e);
                     if(audioToggle) audioToggle.innerHTML = '<i class="fas fa-volume-mute"></i>';
                });
            }
            audioControls.style.display = 'flex';
        }

        if (removeIntroContainer && videoContainer) {
            setTimeout(() => {
                videoContainer.remove();
            }, 1500);
        } else if (videoContainer && sessionStorage.getItem('introPlayed')) {
            // If intro was played and we are just showing the website (e.g. on page refresh)
            // ensure the video container is hidden if not already removed.
            videoContainer.style.display = 'none';
        }
    }

    // --- Audio Controls ---
    if (audioToggle && bgMusic) {
        audioToggle.addEventListener('click', () => {
            if (bgMusic.paused || bgMusic.muted) {
                bgMusic.play().then(() => {
                    bgMusic.muted = false;
                    audioToggle.innerHTML = '<i class="fas fa-volume-up"></i>';
                }).catch(e => console.error("Error playing music on toggle:", e));
            } else {
                bgMusic.pause();
                audioToggle.innerHTML = '<i class="fas fa-volume-mute"></i>';
            }
        });
    }
    
    // --- Add visibility change listener for background music ---
    let wasMusicPlayingBeforeHidden = false; // यह ट्रैक करने के लिए कि टैब छिपाने से पहले म्यूजिक चल रहा था या नहीं
    document.addEventListener('visibilitychange', () => {
        if (bgMusic) {
            if (document.hidden) {
                // if tab is hidden then stop the music(if playing)
                if (!bgMusic.paused && !bgMusic.muted) {
                    bgMusic.pause();
                    wasMusicPlayingBeforeHidden = true; // chek it paused successfully
                } else {
                    wasMusicPlayingBeforeHidden = false; // if not playing then don't need to paly that
                }
            } else {
                // if tab again visible then resume bgm 
                if (wasMusicPlayingBeforeHidden) {
                    bgMusic.play().catch(e => console.warn("Background music resume on visibility prevented:", e));
                }
            }
        }
    });

    // --- Hamburger Menu Toggle ---
    if (hamburger && navLinks) {
        hamburger.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            const icon = hamburger.querySelector('i');
            if (icon) {
                icon.classList.toggle('fa-bars');
                icon.classList.toggle('fa-times');
            }
        });
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                if (navLinks.classList.contains('active')) {
                    navLinks.classList.remove('active');
                    const icon = hamburger.querySelector('i');
                    if (icon) {
                        icon.classList.remove('fa-times');
                        icon.classList.add('fa-bars');
                    }
                }
            });
        });
    }

    // --- Visitor Counter ---
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

    // --- Banner Navigation (Updated for Videos) ---
    const bannerItems = document.querySelectorAll('.banner-video'); // Selector for video elements
    const prevBannerBtn = document.getElementById('prevBanner');
    const nextBannerBtn = document.getElementById('nextBanner');
    let currentBannerIndex = 0;
    let bannerAutoRotateInterval;

    function showBannerItem(index) {
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
    }

    function startBannerAutoRotation() {
        if (bannerItems.length > 1) {
           bannerAutoRotateInterval = setInterval(() => {
                currentBannerIndex = (currentBannerIndex + 1) % bannerItems.length;
                showBannerItem(currentBannerIndex);
            }, 7000); 
        }
    }
    
    function stopBannerAutoRotation() {
        clearInterval(bannerAutoRotateInterval);
    }

    if (bannerItems.length > 0) {
        showBannerItem(currentBannerIndex); 
        startBannerAutoRotation();

        if(prevBannerBtn) {
            prevBannerBtn.addEventListener('click', function() {
                stopBannerAutoRotation();
                currentBannerIndex = (currentBannerIndex - 1 + bannerItems.length) % bannerItems.length;
                showBannerItem(currentBannerIndex);
                startBannerAutoRotation();
            });
        }

        if(nextBannerBtn) {
            nextBannerBtn.addEventListener('click', function() {
                stopBannerAutoRotation();
                currentBannerIndex = (currentBannerIndex + 1) % bannerItems.length;
                showBannerItem(currentBannerIndex);
                startBannerAutoRotation();
            });
        }
    }


    // --- Release Tabs (if present) ---
    const releaseTabs = document.querySelectorAll('.release-tab');
    const upcomingProjects = document.getElementById('upcoming-projects');
    const releasedProjects = document.getElementById('released-projects');

    if (releaseTabs.length > 0 && upcomingProjects && releasedProjects) {
        releaseTabs.forEach(tab => {
            tab.addEventListener('click', function() {
                releaseTabs.forEach(t => t.classList.remove('active'));
                this.classList.add('active');

                if (this.dataset.tab === 'upcoming') {
                    upcomingProjects.style.display = 'grid';
                    releasedProjects.style.display = 'none';
                } else {
                    upcomingProjects.style.display = 'none';
                    releasedProjects.style.display = 'grid';
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
             if (releaseTabs[0]) releaseTabs[0].click(); // Ensure element exists
        }
    }


    // --- Smooth Scrolling for on-page anchors (if any) ---
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            if (targetId.length > 1 && document.querySelector(targetId)) {
                e.preventDefault();
                document.querySelector(targetId).scrollInView({
                    behavior: 'smooth'
                });
            } else if (targetId === "#" && this.closest('.nav-links a[href="index.html"]')) {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        });
    });




    //--here from contact form and booking sectionn





// --- Block inspect mode on-page (if any) ---


document.addEventListener('keydown', function(event) {
    // Block F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U
    if (
        event.key === 'F12' ||
        (event.ctrlKey && event.shiftKey && (event.key === 'I' || event.key === 'J')) ||
        (event.ctrlKey && event.key === 'U')
    ) {
        event.preventDefault();
        alert('Inspect mode is disabled.');
    }
}); 
// --- Block right clink  ---
document.addEventListener('contextmenu', function(event) {
    event.preventDefault();
});



});
