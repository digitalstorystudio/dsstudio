(function () {
  'use strict';

  var btn = document.getElementById('ham-btn');
  var nav = document.querySelector('.navbar nav') || document.querySelector('header nav');
  var topbar = document.querySelector('.topbar');

  /* ── Hamburger toggle ── */
  if (btn && nav) {
    var closeBtn = null;

    function openNav() {
      nav.classList.add('ham-open');
      btn.innerHTML = '<i class="fas fa-times"></i>';
      btn.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';
      // Inject a ✕ close button inside the overlay for easier tap-to-close
      if (!document.getElementById('ham-close')) {
        closeBtn = document.createElement('button');
        closeBtn.id = 'ham-close';
        closeBtn.className = 'ham-close-btn';
        closeBtn.setAttribute('aria-label', 'Close menu');
        closeBtn.innerHTML = '<i class="fas fa-times"></i>';
        closeBtn.addEventListener('click', closeNav);
        nav.appendChild(closeBtn);
      }
    }

    function closeNav() {
      nav.classList.remove('ham-open');
      btn.innerHTML = '<i class="fas fa-bars"></i>';
      btn.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
      if (closeBtn) { closeBtn.remove(); closeBtn = null; }
      var old = document.getElementById('ham-close');
      if (old) old.remove();
    }

    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      nav.classList.contains('ham-open') ? closeNav() : openNav();
    });

    // Close when a nav link is tapped
    nav.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', closeNav);
    });

    // Close on outside tap
    document.addEventListener('click', function (e) {
      if (nav.classList.contains('ham-open') && !nav.contains(e.target) && !btn.contains(e.target)) {
        closeNav();
      }
    });

    // Close on Escape
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeNav();
    });

    // Close + reset on desktop resize
    window.addEventListener('resize', function () {
      if (window.innerWidth > 768) closeNav();
    });
  }

  /* ── Topbar hide-on-scroll (mobile only) ── */
  if (topbar) {
    var lastScroll = 0;
    var ticking = false;

    window.addEventListener('scroll', function () {
      if (!ticking) {
        requestAnimationFrame(function () {
          var current = window.pageYOffset || document.documentElement.scrollTop;
          if (window.innerWidth <= 768) {
            if (current <= 10) {
              topbar.classList.remove('mob-hidden');
            } else if (current > lastScroll + 8) {
              topbar.classList.add('mob-hidden');
            } else if (current < lastScroll - 8) {
              topbar.classList.remove('mob-hidden');
            }
          } else {
            topbar.classList.remove('mob-hidden');
          }
          lastScroll = current;
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
  }
})();
