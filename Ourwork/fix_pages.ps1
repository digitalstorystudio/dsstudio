# Script to inject nav, footer, and fix CSS paths in all Ourwork HTML pages

$NAV_CSS_LINE = '    <!-- Nav & Global Styles -->
    <link rel="stylesheet" href="../css/nav.css">'

$SCRIPT_LINE = '    <!-- Main Script -->
    <script src="../script.js" defer></script>'

$NAV_HTML = @'
    <div class="main-website">
        <!-- Top Bar -->
        <div class="top-bar">
            <div class="top-bar-left">
                <a href="#" class="top-bar-item location" aria-label="Location">
                    <i class="fas fa-map-marker-alt"></i>
                    <span>8/334, Lalita Park, Laxminagar, New Delhi 110092</span>
                </a>
            </div>
            <div class="top-bar-right">
                <a href="mailto:chat.dsstudio@gmail.com" class="top-bar-item email" aria-label="Email">
                    <i class="fas fa-envelope"></i>
                    <span>chat.dsstudio@gmail.com</span>
                </a>
                <a href="https://www.youtube.com/channel/UCElZTJcE8x4mt1HCghZFBuw/?sub_confirmation=1" target="_blank" class="top-bar-item youtube" aria-label="YouTube">
                    <i class="fab fa-youtube"></i>
                </a>
                <a href="https://www.instagram.com/digitalstorystudio/" target="_blank" class="top-bar-item instagram" aria-label="Instagram">
                    <i class="fab fa-instagram"></i>
                </a>
                <a href="#" class="top-bar-item linkedin" aria-label="LinkedIn">
                    <i class="fab fa-linkedin-in"></i>
                </a>
                <a href="https://www.facebook.com/DigitalStorystudios" target="_blank" class="top-bar-item facebook" aria-label="Facebook">
                    <i class="fab fa-facebook-f"></i>
                </a>
                <a href="tel:+918810696407" class="top-bar-item contact" aria-label="Contact Number">
                    <i class="fas fa-phone"></i>
                    <span>+91-8810696407</span>
                </a>
            </div>
        </div>

        <nav class="navbar" id="navbar">
            <div class="logo-wrapper">
                <a href="../index.html" class="logo-link">
                    <img src="../assets/logo.jpeg" alt="Digital Story Studio Logo" class="logo" loading="lazy">
                    <span class="logo-text">Digital Story Studio</span></a>
            </div>
            <button class="hamburger" id="hamburger" aria-label="Toggle menu" aria-expanded="false">
                <i class="fas fa-bars"></i>
            </button>
            <ul class="nav-links" id="navLinks">
                <li class="nav-item">
                    <a href="../index.html" class="nav-link">Home</a>
                </li>
                <li class="nav-item">
                    <a href="../about.html" class="nav-link">About</a>
                </li>
                <li class="nav-item">
                    <a href="../contactus.html" class="nav-link">Services
                        <i class="fas fa-chevron-down dropdown-arrow"></i>
                    </a>
                    <div class="dropdown-menu">
                        <div class="dropdown-item">
                            <a href="#" class="dropdown-link">Wedding <i class="fas fa-chevron-right"></i></a>
                            <div class="submenu">
                                <div class="dropdown-item">
                                    <a href="#" class="dropdown-link">Videography <i class="fas fa-chevron-right"></i></a>
                                    <div class="submenu">
                                        <a href="#" class="submenu-link featured-item">Cinematic Wedding Videography</a>
                                        <a href="#" class="submenu-link">Traditional Wedding Videography</a>
                                        <a href="#" class="submenu-link">Destination Wedding Videography</a>
                                        <a href="#" class="submenu-link">Luxury Wedding Videography</a>
                                        <a href="#" class="submenu-link">Pre-Wedding Shoot</a>
                                        <a href="#" class="submenu-link">Drone Wedding Videography</a>
                                    </div>
                                </div>
                                <div class="dropdown-item">
                                    <a href="#" class="dropdown-link">Wedding Photography <i class="fas fa-chevron-right"></i></a>
                                    <div class="submenu">
                                        <a href="#" class="submenu-link">Pre-Wedding Photography</a>
                                        <a href="#" class="submenu-link">Candid Photography</a>
                                        <a href="#" class="submenu-link">Traditional Wedding Photography</a>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="dropdown-item">
                            <a href="#" class="dropdown-link">Events <i class="fas fa-chevron-right"></i></a>
                            <div class="submenu">
                                <a href="#" class="submenu-link">Corporate Event Videography</a>
                                <a href="#" class="submenu-link">Concert Videography</a>
                            </div>
                        </div>
                        <div class="dropdown-item">
                            <a href="#" class="dropdown-link">Model/Fashion Shoot <i class="fas fa-chevron-right"></i></a>
                            <div class="submenu">
                                <a href="#" class="submenu-link">Portfolio Shoot</a>
                                <a href="#" class="submenu-link">Fashion Shoot Photography</a>
                            </div>
                        </div>
                        <div class="dropdown-item">
                            <a href="#" class="dropdown-link">Creative Shoot <i class="fas fa-chevron-right"></i></a>
                            <div class="submenu">
                                <a href="#" class="submenu-link">Product Shoot</a>
                                <a href="#" class="submenu-link">Brand Promotion Shoot</a>
                            </div>
                        </div>
                    </div>
                </li>
                <li class="nav-item">
                    <a href="destination-wedding.html" class="nav-link">Our Work
                        <i class="fas fa-chevron-down dropdown-arrow"></i>
                    </a>
                    <div class="dropdown-menu">
                        <div class="dropdown-item">
                            <a href="#" class="dropdown-link">Wedding <i class="fas fa-chevron-right"></i></a>
                            <div class="submenu">
                                <a href="destination-wedding.html" class="submenu-link">Destination Wedding Videography</a>
                                <a href="#" class="submenu-link">Hindu Wedding Videography</a>
                                <a href="#" class="submenu-link">Sikh Wedding Videography</a>
                                <a href="wedding-highlights-teaser.html" class="submenu-link">Wedding Highlights &amp; Teaser</a>
                                <a href="same-day-edit.html" class="submenu-link">Same-Day Edit</a>
                                <a href="live-streaming.html" class="submenu-link">Live Streaming</a>
                            </div>
                        </div>
                        <div class="dropdown-item">
                            <a href="events.html" class="dropdown-link">Events</a>
                        </div>
                        <div class="dropdown-item">
                            <a href="model-photoshoot.html" class="dropdown-link">Model</a>
                        </div>
                        <div class="dropdown-item">
                            <a href="creative-shoot.html" class="dropdown-link">Creative</a>
                        </div>
                        <div class="dropdown-item">
                            <a href="others.html" class="dropdown-link">Others</a>
                        </div>
                        <div class="dropdown-item">
                            <a href="testimonials.html" class="dropdown-link">&#x1F4AC; Client Testimonials</a>
                        </div>
                    </div>
                </li>
                <li class="nav-item">
                    <a href="../contactus.html" class="nav-link">Contact &amp; Booking</a>
                </li>
                <li class="nav-item">
                    <a href="../contactus.html" class="nav-link login-link">Login</a>
                </li>
            </ul>
        </nav>

'@

$FOOTER_HTML = @'

        <!-- WhatsApp Button -->
        <a href="https://wa.me/+918810696407" class="whatsapp-btn" target="_blank" aria-label="Chat on WhatsApp">
            <i class="fab fa-whatsapp"></i>
        </a>

        <!-- Offer Marquee -->
        <div class="offer-marquee">
            <div class="marquee-content">
                &#x1F389; SPECIAL OFFER GOING ON! CALL US NOW FOR EXCLUSIVE WEDDING PACKAGES! &#x1F4DE; +91-8810696407 &#x1F389; BOOK YOUR DREAM WEDDING SHOOT TODAY! &#x1F389;
            </div>
        </div>

        <!-- Main Footer -->
        <footer class="footer">
            <div class="footer-header">
                <div class="footer-logo">
                    <img src="../assets/logo.jpeg" alt="Digital Story Studio Logo">
                    <span class="footer-logo-text">Digital Story Studio</span>
                </div>
                <p class="footer-tagline">"Cinematic Wedding Films &amp; Event Shoot in Delhi — Crafted with Passion."</p>
                <div class="footer-contact-info">
                    <div class="footer-contact-item"><i class="fas fa-map-marker-alt"></i><span>Delhi NCR, India</span></div>
                    <div class="footer-contact-item"><i class="fas fa-phone"></i><span>+91-8810696407</span></div>
                    <div class="footer-contact-item"><i class="fas fa-envelope"></i><span>chat.dsstudio@gmail.com</span></div>
                </div>
            </div>
            <div class="footer-links">
                <div class="footer-column">
                    <h4>Company</h4>
                    <ul>
                        <li><a href="../index.html">Home</a></li>
                        <li><a href="../about.html">About Us</a></li>
                        <li><a href="../contactus.html">Services</a></li>
                        <li><a href="destination-wedding.html">Our Work</a></li>
                        <li><a href="../contactus.html">Contact Us</a></li>
                    </ul>
                </div>
                <div class="footer-column">
                    <h4>Services</h4>
                    <ul>
                        <li><a href="#">Weddings</a></li>
                        <li><a href="events.html">Events</a></li>
                        <li><a href="model-photoshoot.html">Fashion Shoot</a></li>
                        <li><a href="creative-shoot.html">Creative Shoot</a></li>
                        <li><a href="others.html">Others</a></li>
                    </ul>
                </div>
                <div class="footer-column">
                    <h4>Our Work</h4>
                    <ul>
                        <li><a href="destination-wedding.html">Destination Wedding</a></li>
                        <li><a href="wedding-highlights-teaser.html">Wedding Highlights</a></li>
                        <li><a href="same-day-edit.html">Same-Day Edit</a></li>
                        <li><a href="live-streaming.html">Live Streaming</a></li>
                        <li><a href="testimonials.html">Testimonials</a></li>
                    </ul>
                </div>
                <div class="footer-column">
                    <h4>Explore Us</h4>
                    <ul>
                        <li><a href="#">Blog</a></li>
                        <li><a href="testimonials.html">Testimonial</a></li>
                        <li><a href="#">Package</a></li>
                        <li><a href="#">FAQs</a></li>
                        <li><a href="../contactus.html">Clients Login</a></li>
                    </ul>
                </div>
                <div class="footer-column">
                    <h4>Event &amp; Model | Fashion</h4>
                    <ul>
                        <li><a href="model-photoshoot.html">Model Videography</a></li>
                        <li><a href="model-photoshoot.html">Model Photography</a></li>
                        <li><a href="events.html">Event Videography</a></li>
                        <li><a href="events.html">Event Photography</a></li>
                        <li><a href="creative-shoot.html">Ad Shoot</a></li>
                    </ul>
                </div>
            </div>
            <div class="social-section">
                <h3>&#x1F310; Follow Us On:</h3>
                <div class="social-slider">
                    <div class="social-track">
                        <a href="https://www.instagram.com/digitalstorystudio/" class="social-item" target="_blank"><i class="fab fa-instagram"></i><span>Instagram</span></a>
                        <a href="https://www.youtube.com/channel/UCElZTJcE8x4mt1HCghZFBuw" class="social-item" target="_blank"><i class="fab fa-youtube"></i><span>YouTube</span></a>
                        <a href="#" class="social-item" target="_blank"><i class="fas fa-heart"></i><span>WedMeGood</span></a>
                        <a href="#" class="social-item" target="_blank"><i class="fas fa-ring"></i><span>WeddingWire</span></a>
                        <a href="https://www.facebook.com/DigitalStorystudios" class="social-item" target="_blank"><i class="fab fa-facebook-f"></i><span>Facebook</span></a>
                        <a href="https://www.instagram.com/digitalstorystudio/" class="social-item" target="_blank"><i class="fab fa-instagram"></i><span>Instagram</span></a>
                        <a href="https://www.youtube.com/channel/UCElZTJcE8x4mt1HCghZFBuw" class="social-item" target="_blank"><i class="fab fa-youtube"></i><span>YouTube</span></a>
                        <a href="#" class="social-item" target="_blank"><i class="fas fa-heart"></i><span>WedMeGood</span></a>
                    </div>
                </div>
            </div>
            <div class="footer-bottom">
                <div class="footer-bottom-left">
                    <div class="designed-by">designed by <a href="https://www.instagram.com/lostinhack/" target="_blank">Lostinhack <i class="fab fa-instagram"></i></a></div>
                    <div class="visitor-counter">Visitors: <span id="visitorCount">100000</span></div>
                </div>
                <div class="copyright">&copy; <span id="currentYear">2025</span> Digital Story Studio. All Rights Reserved.</div>
                <div class="footer-links-bottom">
                    <a href="../privacy-policy.html">Privacy</a>
                    <a href="../privacy-policy.html">Terms</a>
                </div>
            </div>
        </footer>

    </div><!-- /.main-website -->
'@

# Pages to process (excluding destination-wedding.html which is already done)
$pages = @(
    "creative-shoot.html",
    "events.html",
    "live-streaming.html",
    "model-photoshoot.html",
    "others.html",
    "same-day-edit.html",
    "testimonials.html",
    "wedding-highlights-teaser.html"
)

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

foreach ($page in $pages) {
    $filePath = Join-Path $scriptDir $page
    if (-not (Test-Path $filePath)) {
        Write-Host "SKIPPING (not found): $page"
        continue
    }
    
    $content = Get-Content $filePath -Raw -Encoding UTF8
    
    # 1. Fix favicon paths: href="assets/ -> href="../assets/
    $content = $content -replace 'href="assets/logo\.jpeg"', 'href="../assets/logo.jpeg"'
    
    # 2. Add ../css/nav.css before closing </head> if not already present
    if ($content -notmatch 'css/nav\.css') {
        $content = $content -replace '(</head>)', "    <link rel=`"stylesheet`" href=`"../css/nav.css`">`n`$1"
    }
    
    # 3. Add ../script.js before </head> if not already present
    if ($content -notmatch '\.\./script\.js') {
        $content = $content -replace '(</head>)', "    <script src=`"../script.js`" defer></script>`n`$1"
    }
    
    # 4. Replace <body>\n<main or <body>\nmain marker with nav injection
    # Handle various body opening patterns
    if ($content -match '<body>\s*\n\s*<main') {
        $content = $content -replace '(<body>)\s*\n(\s*<main)', "`$1`n`n$NAV_HTML        <main"
    } elseif ($content -match '<body>\s*\n\s*<!--.*?-->\s*\n\s*<main') {
        # Has a comment before main
        $content = $content -replace '(<body>)([\s\S]*?)(<main\s)', "`$1`n`n$NAV_HTML        `$3"
    } else {
        # Fallback: replace <body> open with body + nav
        $content = $content -replace '(<body>)', "`$1`n`n$NAV_HTML"
        # Try to add indent to <main
        $content = $content -replace '\n(<main\s)', "`n        `$1"
    }
    
    # 5. Close main tag and add footer before the script/body end
    # Replace </main> followed by optional script tags and </body></html>
    if ($content -match '</main>\s*\n\s*<script src="destinationwedding\.js"') {
        $content = $content -replace '(</main>)(\s*\n\s*<script src="destinationwedding\.js"[\s\S]*?</body>\s*\n\s*</html>)', "        `$1`n$FOOTER_HTML`n`n    `$2"
    } elseif ($content -match '</main>\s*\n\s*</body>') {
        $content = $content -replace '(</main>)(\s*\n\s*</body>\s*\n\s*</html>)', "        `$1`n$FOOTER_HTML`n`n`$2"
    } else {
        # Generic replace at the very end
        $mainClose = $content.LastIndexOf('</main>')
        if ($mainClose -gt 0) {
            $beforeMain = $content.Substring(0, $mainClose + 7)
            $afterMain = $content.Substring($mainClose + 7)
            $content = $beforeMain + "`n$FOOTER_HTML`n" + $afterMain
        }
    }
    
    # Write back
    [System.IO.File]::WriteAllText($filePath, $content, [System.Text.Encoding]::UTF8)
    Write-Host "DONE: $page"
}

Write-Host "`nAll pages processed!"
