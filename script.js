// ===========================================================
// QUALITY AGENCY LATAM — Interactions
// ===========================================================

document.addEventListener('DOMContentLoaded', function () {

  // -----------------------------------------------------------
  // Current year in footer
  // -----------------------------------------------------------
  var yearEl = document.getElementById('currentYear');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // -----------------------------------------------------------
  // Mobile nav toggle
  // -----------------------------------------------------------
  var navToggle = document.getElementById('navToggle');
  var mainNav = document.querySelector('.main-nav');
  if (navToggle && mainNav) {
    navToggle.addEventListener('click', function () {
      var isOpen = mainNav.classList.toggle('main-nav--open');
      navToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });

    // Close mobile menu when a nav link is clicked
    mainNav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        mainNav.classList.remove('main-nav--open');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // -----------------------------------------------------------
  // Portfolio tabs — switch category panel on click
  // -----------------------------------------------------------
  var portfolioTabs = document.querySelectorAll('.portfolio__tab');
  portfolioTabs.forEach(function (tabBtn) {
    tabBtn.addEventListener('click', function () {
      portfolioTabs.forEach(function (b) {
        b.classList.remove('portfolio__tab--active');
        b.setAttribute('aria-selected', 'false');
      });
      tabBtn.classList.add('portfolio__tab--active');
      tabBtn.setAttribute('aria-selected', 'true');

      var targetId = tabBtn.dataset.panel;
      document.querySelectorAll('.portfolio__panel').forEach(function (panel) {
        panel.classList.toggle('portfolio__panel--active', panel.id === targetId);
      });
    });
  });

  // -----------------------------------------------------------
  // Portfolio carousels — auto-scroll + click to open full size
  // Initializes every carousel on the page (one per team member)
  // -----------------------------------------------------------
  document.querySelectorAll('.portfolio__track').forEach(function (track) {
    var scrollAmount = 1.4;   // medium autoscroll speed
    var endDwellTime = 3500;  // pause at the end so the last slide is fully visible
    var autoScrollId;
    var endDwellId;
    var arrowAnimId;

    function startAutoScroll() {
      stopAutoScroll();
      autoScrollId = setInterval(function () {
        var maxScroll = track.scrollWidth - track.clientWidth;
        if (track.scrollLeft >= maxScroll) {
          // Reached the end — pause here instead of jumping straight back to start
          clearInterval(autoScrollId);
          endDwellId = setTimeout(function () {
            track.scrollLeft = 0;
            startAutoScroll();
          }, endDwellTime);
        } else {
          track.scrollLeft += scrollAmount;
        }
      }, 20);
    }

    function stopAutoScroll() {
      clearInterval(autoScrollId);
      clearTimeout(endDwellId);
    }

    function stopArrowAnim() {
      if (arrowAnimId) cancelAnimationFrame(arrowAnimId);
      arrowAnimId = null;
    }

    // Self-contained smooth-scroll animation (independent of CSS scroll-behavior,
    // so it can't be interrupted/fought by the autoscroll interval)
    function animateScrollTo(target, duration) {
      stopAutoScroll();
      stopArrowAnim();
      var startPos = track.scrollLeft;
      var change = target - startPos;
      var startTime = null;

      function step(timestamp) {
        if (startTime === null) startTime = timestamp;
        var progress = Math.min((timestamp - startTime) / duration, 1);
        var ease = progress < 0.5
          ? 2 * progress * progress
          : 1 - Math.pow(-2 * progress + 2, 2) / 2;
        track.scrollLeft = startPos + change * ease;

        if (progress < 1) {
          arrowAnimId = requestAnimationFrame(step);
        } else {
          arrowAnimId = null;
          startAutoScroll();
        }
      }
      arrowAnimId = requestAnimationFrame(step);
    }

    startAutoScroll();

    // Pause on hover/focus for accessibility, resume on leave
    track.addEventListener('mouseenter', function () { stopAutoScroll(); stopArrowAnim(); });
    track.addEventListener('mouseleave', startAutoScroll);

    // Click any slide with a real image/video (data-full) to open full-size in a new tab
    track.addEventListener('click', function (e) {
      var slide = e.target.closest('.portfolio__slide');
      if (slide && slide.dataset.full) {
        window.open(slide.dataset.full, '_blank', 'noopener');
      }
    });

    // Prev/next arrows — step by one slide's width, with their own smooth animation
    var carouselWrap = track.closest('.portfolio__carousel-wrap');
    if (carouselWrap) {
      var arrowButtons = carouselWrap.querySelectorAll('.portfolio__arrow');
      arrowButtons.forEach(function (arrowBtn) {
        arrowBtn.addEventListener('click', function () {
          var dir = parseInt(arrowBtn.dataset.dir, 10) || 1;
          var firstSlide = track.querySelector('.portfolio__slide');
          var gap = parseFloat(getComputedStyle(track).columnGap || getComputedStyle(track).gap) || 19;
          var step = firstSlide ? firstSlide.getBoundingClientRect().width + gap : track.clientWidth;

          var maxScroll = track.scrollWidth - track.clientWidth;
          var target = track.scrollLeft + (dir * step);
          if (target < 0) target = maxScroll;       // wrap to end
          if (target > maxScroll) target = 0;       // wrap to start

          animateScrollTo(target, 420);
        });
      });
    }
  });

  // -----------------------------------------------------------
  // Time zone converter
  // Business hours base: Mon–Fri, 07:00–19:00 Brasília (GMT-3)
  // -----------------------------------------------------------
  var tzSelect = document.getElementById('tzSelect');
  var tzResult = document.getElementById('tzResult');

  function formatHour(h) {
    h = ((h % 24) + 24) % 24;
    var period = h >= 12 ? 'PM' : 'AM';
    var displayH = h % 12;
    if (displayH === 0) displayH = 12;
    return displayH + ':00 ' + period;
  }

  function updateTimezoneDisplay() {
    if (!tzSelect || !tzResult) return;
    var targetOffset = parseFloat(tzSelect.value);
    var baseOffset = -3; // Brasília
    var diff = targetOffset - baseOffset;

    var startHour = 7 + diff;
    var endHour = 19 + diff;

    var dayNote = '';
    if (startHour < 0 || startHour >= 24) dayNote = ' (previous/next day may apply)';

    tzResult.textContent =
      'Our business hours (Mon–Fri) in your time zone: ' +
      formatHour(startHour) + ' – ' + formatHour(endHour) + dayNote;
  }

  if (tzSelect) {
    tzSelect.addEventListener('change', updateTimezoneDisplay);
    updateTimezoneDisplay();
  }

  // -----------------------------------------------------------
  // Language buttons — connected to Weglot's real translation API
  // Current free-plan language: German (DE)
  // -----------------------------------------------------------
  var langButtons = document.querySelectorAll('.lang-btn');
  langButtons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      langButtons.forEach(function (b) { b.classList.remove('lang-btn--active'); });
      btn.classList.add('lang-btn--active');

      var lang = btn.dataset.lang;
      // Weglot.switchTo() is provided by the Weglot script loaded in <head>.
      // It only works once a real api_key has been added there.
      if (window.Weglot && typeof window.Weglot.switchTo === 'function') {
        window.Weglot.switchTo(lang);
      }
    });
  });

  // -----------------------------------------------------------
  // Contact form — submit via fetch to Formspree, show inline
  // success message instead of redirecting away from the site
  // -----------------------------------------------------------
  var contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var btn = contactForm.querySelector('button[type="submit"]');
      var originalText = btn ? btn.textContent : '';
      if (btn) { btn.textContent = 'Sending...'; btn.disabled = true; }

      fetch(contactForm.action, {
        method: 'POST',
        body: new FormData(contactForm),
        headers: { 'Accept': 'application/json' }
      })
        .then(function (response) {
          if (response.ok) {
            contactForm.innerHTML =
              '<p class="form-success">Thank you — your request has been received. ' +
              'We reply during business hours: Monday to Friday, 7:00 AM – 7:00 PM (Brasília time).</p>';
          } else {
            if (btn) { btn.textContent = originalText; btn.disabled = false; }
            alert('Something went wrong sending your request. Please try again or contact us directly via WhatsApp.');
          }
        })
        .catch(function () {
          if (btn) { btn.textContent = originalText; btn.disabled = false; }
          alert('Something went wrong sending your request. Please try again or contact us directly via WhatsApp.');
        });
    });
  }

  // -----------------------------------------------------------
  // Opinion form — same fetch-based approach, inline confirmation
  // -----------------------------------------------------------
  var opinionForm = document.getElementById('opinionForm');
  if (opinionForm) {
    opinionForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var btn = opinionForm.querySelector('button[type="submit"]');
      var originalText = btn ? btn.textContent : '';
      if (btn) { btn.textContent = 'Sending...'; btn.disabled = true; }

      fetch(opinionForm.action, {
        method: 'POST',
        body: new FormData(opinionForm),
        headers: { 'Accept': 'application/json' }
      })
        .then(function (response) {
          if (response.ok) {
            opinionForm.innerHTML =
              '<p class="form-success">Thank you! Your opinion has been submitted and will appear once reviewed by our team.</p>';
          } else {
            if (btn) { btn.textContent = originalText; btn.disabled = false; }
            alert('Something went wrong submitting your opinion. Please try again.');
          }
        })
        .catch(function () {
          if (btn) { btn.textContent = originalText; btn.disabled = false; }
          alert('Something went wrong submitting your opinion. Please try again.');
        });
    });
  }

});
