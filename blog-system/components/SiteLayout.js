'use client';
import { useEffect } from 'react';

export default function SiteLayout({ children }) {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = '/script.js';
    script.defer = true;
    document.body.appendChild(script);
    return () => {
      if (document.body.contains(script)) document.body.removeChild(script);
    };
  }, []);

  return (
    <>
      {/* Main site CSS — nav dropdowns & footer styles */}
      <link rel="stylesheet" href="/css/nav.css" />
      <link rel="stylesheet" href="/css/style.css" />

      {/* Top Bar */}
      <div className="top-bar">
        <div className="top-bar-left">
          <a href="#" className="top-bar-item location" aria-label="Location">
            <i className="fas fa-map-marker-alt"></i>
            <span>8/334, Lalita Park, Laxminagar, New Delhi 110092</span>
          </a>
        </div>
        <div className="top-bar-right">
          <a href="mailto:chat.dsstudio@gmail.com" className="top-bar-item email" aria-label="Email">
            <i className="fas fa-envelope"></i>
            <span>chat.dsstudio@gmail.com</span>
          </a>
          <a href="https://www.youtube.com/channel/UCElZTJcE8x4mt1HCghZFBuw" target="_blank" rel="noreferrer" className="top-bar-item youtube" aria-label="YouTube">
            <i className="fab fa-youtube"></i>
          </a>
          <a href="https://www.instagram.com/digitalstorystudio/" target="_blank" rel="noreferrer" className="top-bar-item instagram" aria-label="Instagram">
            <i className="fab fa-instagram"></i>
          </a>
          <a href="#" className="top-bar-item linkedin" aria-label="LinkedIn">
            <i className="fab fa-linkedin-in"></i>
          </a>
          <a href="https://www.facebook.com/DigitalStorystudios" target="_blank" rel="noreferrer" className="top-bar-item facebook" aria-label="Facebook">
            <i className="fab fa-facebook-f"></i>
          </a>
          <a href="tel:+918810696407" className="top-bar-item contact" aria-label="Contact Number">
            <i className="fas fa-phone"></i>
            <span>+91-8810696407</span>
          </a>
        </div>
      </div>

      <div className="main-website">
        {/* Navbar */}
        <nav className="navbar" id="navbar">
          <div className="logo-wrapper">
            <a href="https://www.digitalstorystudio.in" className="logo-link">
              <img src="/logo.jpeg" alt="Digital Story Studio Logo" className="logo" loading="lazy" />
              <span className="logo-text">Digital Story Studio</span>
            </a>
          </div>
          <button className="hamburger" id="hamburger" aria-label="Toggle menu" aria-expanded="false">
            <i className="fas fa-bars"></i>
          </button>

          <ul className="nav-links" id="navLinks">

            {/* Home */}
            <li className="nav-item">
              <a href="https://www.digitalstorystudio.in" className="nav-link">Home</a>
            </li>

            {/* About */}
            <li className="nav-item">
              <a href="https://www.digitalstorystudio.in/about.html" className="nav-link">About</a>
            </li>

            {/* Services */}
            <li className="nav-item">
              <a href="https://www.digitalstorystudio.in/contactus.html" className="nav-link">
                Services <i className="fas fa-chevron-down dropdown-arrow"></i>
              </a>
              <div className="dropdown-menu">

                {/* Wedding */}
                <div className="dropdown-item">
                  <a href="#" className="dropdown-link">Wedding <i className="fas fa-chevron-right"></i></a>
                  <div className="submenu">

                    {/* Videography */}
                    <div className="dropdown-item">
                      <a href="#" className="dropdown-link">Videography <i className="fas fa-chevron-right"></i></a>
                      <div className="submenu">
                        <a href="https://www.digitalstorystudio.in/Service/cinematicweddingvideography.html" className="submenu-link featured-item">Cinematic Wedding Videography</a>
                        <a href="https://www.digitalstorystudio.in/Service/traditionalweddingvideography.html" className="submenu-link">Traditional Wedding Videography</a>
                        <a href="https://www.digitalstorystudio.in/Service/destinationweddingvideography.html" className="submenu-link">Destination Wedding Videography</a>
                        <a href="https://www.digitalstorystudio.in/Service/luxuryweddingvideography.html" className="submenu-link">Luxury Wedding Videography</a>
                        <a href="https://www.digitalstorystudio.in/Service/preweddingshoot.html" className="submenu-link">Pre-Wedding Shoot</a>
                        <a href="https://www.digitalstorystudio.in/Service/droneweddingvideography.html" className="submenu-link">Drone Wedding Videography</a>
                        <a href="https://www.digitalstorystudio.in/Service/haldiceremonyvideography.html" className="submenu-link">Haldi Ceremony</a>
                        <a href="https://www.digitalstorystudio.in/Service/mehndiceremonyvideography.html" className="submenu-link">Mehndi Ceremony</a>
                        <a href="https://www.digitalstorystudio.in/Service/engagementroka.html" className="submenu-link">Engagement/Roka Videography</a>
                        <a href="https://www.digitalstorystudio.in/Service/weddinghighlightteaser.html" className="submenu-link">Wedding Highlight and Teaser Films</a>
                        <a href="https://www.digitalstorystudio.in/Service/fulldocumentarywedding.html" className="submenu-link">Full Documentary Wedding Videography</a>
                      </div>
                    </div>

                    {/* Wedding Photography */}
                    <div className="dropdown-item">
                      <a href="#" className="dropdown-link">Wedding Photography <i className="fas fa-chevron-right"></i></a>
                      <div className="submenu">
                        <a href="#" className="submenu-link">Pre-Wedding Photography</a>
                        <a href="#" className="submenu-link">Candid Photography</a>
                        <a href="#" className="submenu-link">Destination Wedding Photography</a>
                        <a href="#" className="submenu-link">Luxury Wedding Photography</a>
                        <a href="#" className="submenu-link featured-item">Traditional Wedding Photography</a>
                        <a href="#" className="submenu-link">Engagement &amp; Roka Photography</a>
                        <a href="#" className="submenu-link">Haldi &amp; Mehndi Ceremony Photography</a>
                        <a href="#" className="submenu-link">Reception Photography</a>
                        <a href="#" className="submenu-link">Couple Portrait Photography</a>
                      </div>
                    </div>

                  </div>
                </div>

                {/* Events */}
                <div className="dropdown-item">
                  <a href="#" className="dropdown-link">Events <i className="fas fa-chevron-right"></i></a>
                  <div className="submenu">

                    {/* Event Videography */}
                    <div className="dropdown-item">
                      <a href="#" className="dropdown-link">Event Videography <i className="fas fa-chevron-right"></i></a>
                      <div className="submenu">
                        <a href="#" className="submenu-link">Drone &amp; Aerial Videography</a>
                        <a href="#" className="submenu-link">Corporate Event Videography</a>
                        <a href="#" className="submenu-link">Cocktail Party Shoot</a>
                        <a href="#" className="submenu-link">Award Ceremony &amp; Event Videography</a>
                        <a href="#" className="submenu-link">Music Concert Videography</a>
                        <a href="#" className="submenu-link">Live Show Videography</a>
                        <a href="#" className="submenu-link">School &amp; College Event Videography</a>
                        <a href="#" className="submenu-link">Trade Show Videography</a>
                        <a href="#" className="submenu-link">Religious &amp; Temple Event Videography</a>
                        <a href="#" className="submenu-link">Exhibition Show Videography</a>
                        <a href="#" className="submenu-link">Training &amp; Workshop Videography</a>
                        <a href="#" className="submenu-link">Charity &amp; Fund Raising Event Videography</a>
                      </div>
                    </div>

                    {/* Event Photography */}
                    <div className="dropdown-item">
                      <a href="#" className="dropdown-link">Event Photography <i className="fas fa-chevron-right"></i></a>
                      <div className="submenu">
                        <a href="#" className="submenu-link">Drone &amp; Aerial Photography</a>
                        <a href="#" className="submenu-link">Corporate Event Photography</a>
                        <a href="#" className="submenu-link">Award Ceremony Photography</a>
                        <a href="#" className="submenu-link">College Event Photography</a>
                        <a href="#" className="submenu-link">Cultural Events Photography</a>
                        <a href="#" className="submenu-link">Seminar &amp; Conference Photography</a>
                      </div>
                    </div>

                  </div>
                </div>

                {/* Model/Fashion Shoot */}
                <div className="dropdown-item">
                  <a href="#" className="dropdown-link">Model/Fashion Shoot <i className="fas fa-chevron-right"></i></a>
                  <div className="submenu">

                    {/* Model/Fashion Videography */}
                    <div className="dropdown-item">
                      <a href="#" className="dropdown-link">Model/Fashion Videography <i className="fas fa-chevron-right"></i></a>
                      <div className="submenu">
                        <a href="#" className="submenu-link">Fashion Shoot Videography</a>
                        <a href="#" className="submenu-link">Jewellery &amp; Luxury Product Photography</a>
                        <a href="#" className="submenu-link">Lifestyle Shoot Videography</a>
                      </div>
                    </div>

                    {/* Model/Fashion Photography */}
                    <div className="dropdown-item">
                      <a href="#" className="dropdown-link">Model/Fashion Photography <i className="fas fa-chevron-right"></i></a>
                      <div className="submenu">
                        <a href="#" className="submenu-link">Portfolio Shoot for Models &amp; Actors</a>
                        <a href="#" className="submenu-link">Model Shoot</a>
                        <a href="#" className="submenu-link">Fashion Shoot Photography</a>
                        <a href="#" className="submenu-link">Model Photography</a>
                        <a href="#" className="submenu-link">Celebrity &amp; Influencer Shoot</a>
                        <a href="#" className="submenu-link">Lifestyle Photoshoot</a>
                      </div>
                    </div>

                  </div>
                </div>

                {/* Creative Shoot */}
                <div className="dropdown-item">
                  <a href="#" className="dropdown-link">Creative Shoot <i className="fas fa-chevron-right"></i></a>
                  <div className="submenu">
                    <a href="#" className="submenu-link">Advertising &amp; Commercial Ad Shoot</a>
                    <a href="#" className="submenu-link">Product Shoot</a>
                    <a href="#" className="submenu-link">E-Commerce Product Shoot</a>
                    <a href="#" className="submenu-link">Real Estate &amp; Interior Shoot</a>
                    <a href="#" className="submenu-link">Food &amp; Restaurant Ad Shoot</a>
                    <a href="#" className="submenu-link">Brand Promotion Shoot</a>
                    <a href="#" className="submenu-link">Music Video Shoot</a>
                    <a href="#" className="submenu-link">Short Film &amp; Ad Film Shoot</a>
                    <a href="#" className="submenu-link">Magazine &amp; Editorial Shoot</a>
                    <a href="#" className="submenu-link">Fitness &amp; Gym Shoot</a>
                    <a href="#" className="submenu-link">Creative Concept Shoot</a>
                    <a href="#" className="submenu-link">Green Screen &amp; Professional Video Shoot</a>
                    <a href="#" className="submenu-link">Industrial/Machinery Photography</a>
                  </div>
                </div>

                {/* Others */}
                <div className="dropdown-item">
                  <a href="#" className="dropdown-link">Others <i className="fas fa-chevron-right"></i></a>
                  <div className="submenu">
                    <a href="#" className="submenu-link">Anniversary Event Shoot</a>
                    <a href="#" className="submenu-link">Birthday Party Shoot</a>
                    <a href="#" className="submenu-link">Maternity &amp; Baby Shower Shoot</a>
                    <a href="#" className="submenu-link">Family Event &amp; Social Gathering Shoot</a>
                    <a href="#" className="submenu-link">New Born/Kids Photography</a>
                  </div>
                </div>

              </div>
            </li>

            {/* Our Work */}
            <li className="nav-item">
              <a href="https://www.digitalstorystudio.in/Ourwork/destination-wedding.html" className="nav-link">
                Our Work <i className="fas fa-chevron-down dropdown-arrow"></i>
              </a>
              <div className="dropdown-menu">

                {/* Wedding */}
                <div className="dropdown-item">
                  <a href="#" className="dropdown-link">Wedding <i className="fas fa-chevron-right"></i></a>
                  <div className="submenu">
                    <a href="#" className="submenu-link">Destination Wedding Videography from Delhi</a>
                    <a href="#" className="submenu-link">Hindu Wedding Videography in Delhi</a>
                    <a href="#" className="submenu-link">Sikh Wedding Videography in Delhi</a>
                    <a href="#" className="submenu-link">Muslim Wedding Videography in Delhi</a>
                    <a href="#" className="submenu-link">Pre-wedding Shoot Videography in Delhi NCR</a>
                    <a href="#" className="submenu-link">Engagement and Roka Ceremony in Gurgaon</a>
                    <a href="#" className="submenu-link">Mehndi Ceremony Videography in Delhi NCR</a>
                    <a href="#" className="submenu-link">Reception Ceremony Videography in Delhi and Gurgaon</a>
                    <a href="#" className="submenu-link">Wedding Photography Service in Delhi NCR</a>
                    <a href="#" className="submenu-link">Wedding Highlight and Teaser Video Production in Delhi</a>
                    <a href="#" className="submenu-link">Same-Day Edit Wedding Videography in Delhi</a>
                    <a href="#" className="submenu-link">Live Streaming Wedding Services in Delhi</a>
                  </div>
                </div>

                <div className="dropdown-item">
                  <a href="#" className="dropdown-link">Events</a>
                </div>
                <div className="dropdown-item">
                  <a href="#" className="dropdown-link">Model</a>
                </div>
                <div className="dropdown-item">
                  <a href="#" className="dropdown-link">Creative</a>
                </div>
                <div className="dropdown-item">
                  <a href="#" className="dropdown-link">Others</a>
                </div>
                <div className="dropdown-item">
                  <a href="#" className="dropdown-link">💬 Client Testimonials</a>
                </div>

              </div>
            </li>

            {/* Contact & Booking */}
            <li className="nav-item">
              <a href="https://www.digitalstorystudio.in/contactus.html" className="nav-link">Contact &amp; Booking</a>
            </li>

            {/* Login */}
            <li className="nav-item">
              <a href="https://www.digitalstorystudio.in/contactus.html" className="nav-link login-link">Login</a>
            </li>

          </ul>
        </nav>

        {/* Page Content */}
        <main>{children}</main>

        {/* WhatsApp Button */}
        <a href="https://wa.me/918810696407" className="whatsapp-btn" target="_blank" rel="noreferrer" aria-label="Chat on WhatsApp">
          <i className="fab fa-whatsapp"></i>
        </a>

        {/* Footer */}
        <footer className="footer">
          <div className="footer-header">
            <div className="footer-logo">
              <img src="/logo.jpeg" alt="Digital Story Studio Logo" />
              <span className="footer-logo-text">Digital Story Studio</span>
            </div>
            <p className="footer-tagline">"Cinematic Wedding Films &amp; Event Shoot in Delhi — Crafted with Passion."</p>
            <div className="footer-contact-info">
              <div className="footer-contact-item">
                <i className="fas fa-map-marker-alt"></i>
                <span>Delhi NCR, India</span>
              </div>
              <div className="footer-contact-item">
                <i className="fas fa-phone"></i>
                <span>+91-8810696407</span>
              </div>
              <div className="footer-contact-item">
                <i className="fas fa-envelope"></i>
                <span>chat.dsstudio@gmail.com</span>
              </div>
            </div>
          </div>

          <div className="footer-links">
            <div className="footer-column">
              <h4>Company</h4>
              <ul>
                <li><a href="https://www.digitalstorystudio.in">Home</a></li>
                <li><a href="https://www.digitalstorystudio.in/about.html">About Us</a></li>
                <li><a href="https://www.digitalstorystudio.in/contactus.html">Services</a></li>
                <li><a href="https://www.digitalstorystudio.in/Ourwork/destination-wedding.html">Our Work</a></li>
                <li><a href="https://www.digitalstorystudio.in/contactus.html">Contact Us</a></li>
              </ul>
            </div>
            <div className="footer-column">
              <h4>Services</h4>
              <ul>
                <li><a href="#">Weddings</a></li>
                <li><a href="#">Events</a></li>
                <li><a href="#">Fashion Shoot</a></li>
                <li><a href="#">Creative Shoot</a></li>
                <li><a href="#">Others</a></li>
              </ul>
            </div>
            <div className="footer-column">
              <h4>Wedding Types</h4>
              <ul>
                <li><a href="#">Sikh Wedding</a></li>
                <li><a href="#">Hindu Wedding</a></li>
                <li><a href="#">Muslim Wedding</a></li>
                <li><a href="#">Christian Wedding</a></li>
                <li><a href="#">Royal Weddings</a></li>
              </ul>
            </div>
            <div className="footer-column">
              <h4>Explore Us</h4>
              <ul>
                <li><a href="/blog">Blog</a></li>
                <li><a href="#">Testimonial</a></li>
                <li><a href="#">Package</a></li>
                <li><a href="#">FAQs</a></li>
                <li><a href="#">Clients Login</a></li>
              </ul>
            </div>
            <div className="footer-column">
              <h4>Event &amp; Model | Fashion</h4>
              <ul>
                <li><a href="#">Model Videography</a></li>
                <li><a href="#">Model Photography</a></li>
                <li><a href="#">Event Videography</a></li>
                <li><a href="#">Event Photography</a></li>
                <li><a href="#">Ad Shoot</a></li>
              </ul>
            </div>
          </div>

          <div className="social-section">
            <h3>🌐 Follow Us On:</h3>
            <div className="social-slider">
              <div className="social-track">
                <a href="https://www.instagram.com/digitalstorystudio/" className="social-item" target="_blank" rel="noreferrer">
                  <i className="fab fa-instagram"></i><span>Instagram</span>
                </a>
                <a href="https://www.youtube.com/channel/UCElZTJcE8x4mt1HCghZFBuw" className="social-item" target="_blank" rel="noreferrer">
                  <i className="fab fa-youtube"></i><span>YouTube</span>
                </a>
                <a href="#" className="social-item" target="_blank" rel="noreferrer">
                  <i className="fas fa-heart"></i><span>WedMeGood</span>
                </a>
                <a href="#" className="social-item" target="_blank" rel="noreferrer">
                  <i className="fas fa-ring"></i><span>WeddingWire</span>
                </a>
                <a href="#" className="social-item" target="_blank" rel="noreferrer">
                  <i className="fas fa-shopping-bag"></i><span>WeddingBazaar</span>
                </a>
                <a href="#" className="social-item" target="_blank" rel="noreferrer">
                  <i className="fas fa-store"></i><span>SaadiDukan</span>
                </a>
                <a href="#" className="social-item" target="_blank" rel="noreferrer">
                  <i className="fas fa-phone-alt"></i><span>Justdial</span>
                </a>
                <a href="#" className="social-item" target="_blank" rel="noreferrer">
                  <i className="fas fa-search"></i><span>Sulekha</span>
                </a>
                <a href="https://www.facebook.com/DigitalStorystudios" className="social-item" target="_blank" rel="noreferrer">
                  <i className="fab fa-facebook-f"></i><span>Facebook</span>
                </a>
                {/* Duplicate for seamless loop */}
                <a href="https://www.instagram.com/digitalstorystudio/" className="social-item" target="_blank" rel="noreferrer">
                  <i className="fab fa-instagram"></i><span>Instagram</span>
                </a>
                <a href="https://www.youtube.com/channel/UCElZTJcE8x4mt1HCghZFBuw" className="social-item" target="_blank" rel="noreferrer">
                  <i className="fab fa-youtube"></i><span>YouTube</span>
                </a>
                <a href="#" className="social-item" target="_blank" rel="noreferrer">
                  <i className="fas fa-heart"></i><span>WedMeGood</span>
                </a>
                <a href="#" className="social-item" target="_blank" rel="noreferrer">
                  <i className="fas fa-ring"></i><span>WeddingWire</span>
                </a>
              </div>
            </div>
          </div>

          <div className="footer-bottom">
            <div className="footer-bottom-left">
              <div className="designed-by">
                designed by{' '}
                <a href="https://www.instagram.com/lostinhack/" target="_blank" rel="noreferrer">
                  Lostinhack <i className="fab fa-instagram"></i>
                </a>
              </div>
              <div className="visitor-counter">
                Visitors: <span id="visitorCount">100000</span>
              </div>
            </div>
            <div className="copyright">
              © {new Date().getFullYear()} Digital Story Studio. All Rights Reserved.
            </div>
            <div className="footer-links-bottom">
              <a href="https://www.digitalstorystudio.in/privacy-policy.html">Privacy</a>
              <a href="https://www.digitalstorystudio.in/privacy-policy.html">Terms</a>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
