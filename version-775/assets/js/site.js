(function() {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobileMenu = document.querySelector('[data-mobile-menu]');

  if (menuButton && mobileMenu) {
    menuButton.addEventListener('click', function() {
      mobileMenu.classList.toggle('open');
    });
  }

  var heroSlides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
  var heroDots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
  var heroIndex = 0;

  function showHero(index) {
    if (!heroSlides.length) {
      return;
    }
    heroIndex = (index + heroSlides.length) % heroSlides.length;
    heroSlides.forEach(function(slide, i) {
      slide.classList.toggle('active', i === heroIndex);
    });
    heroDots.forEach(function(dot, i) {
      dot.classList.toggle('active', i === heroIndex);
    });
  }

  heroDots.forEach(function(dot) {
    dot.addEventListener('click', function() {
      showHero(Number(dot.getAttribute('data-hero-dot')) || 0);
    });
  });

  if (heroSlides.length > 1) {
    setInterval(function() {
      showHero(heroIndex + 1);
    }, 5200);
  }

  var params = new URLSearchParams(window.location.search);
  var query = params.get('q') || '';
  var filterForms = Array.prototype.slice.call(document.querySelectorAll('[data-local-filter]'));

  function filterCards(keyword) {
    var grid = document.querySelector('[data-card-grid]');
    if (!grid) {
      return;
    }
    var cards = Array.prototype.slice.call(grid.querySelectorAll('.movie-card'));
    var value = String(keyword || '').trim().toLowerCase();
    cards.forEach(function(card) {
      var haystack = [
        card.getAttribute('data-title'),
        card.getAttribute('data-tags'),
        card.getAttribute('data-region'),
        card.getAttribute('data-year'),
        card.getAttribute('data-category')
      ].join(' ').toLowerCase();
      card.classList.toggle('is-filter-hidden', value && haystack.indexOf(value) === -1);
    });
  }

  filterForms.forEach(function(form) {
    var input = form.querySelector('input[type="search"]');
    if (input && query) {
      input.value = query;
      filterCards(query);
    }
    form.addEventListener('submit', function(event) {
      event.preventDefault();
      filterCards(input ? input.value : '');
    });
    if (input) {
      input.addEventListener('input', function() {
        filterCards(input.value);
      });
    }
  });

  Array.prototype.slice.call(document.querySelectorAll('[data-search-form]')).forEach(function(form) {
    form.addEventListener('submit', function(event) {
      var input = form.querySelector('input[name="q"]');
      if (!input || !input.value.trim()) {
        event.preventDefault();
        window.location.href = 'all.html';
      }
    });
  });
})();
