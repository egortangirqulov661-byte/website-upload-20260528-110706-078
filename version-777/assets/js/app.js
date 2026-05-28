(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function initNavigation() {
    var toggle = document.querySelector("[data-nav-toggle]");
    var nav = document.querySelector("[data-main-nav]");
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener("click", function () {
      nav.classList.toggle("is-open");
    });
  }

  function initCarousel() {
    var carousel = document.querySelector("[data-carousel]");
    if (!carousel) {
      return;
    }
    var slides = Array.prototype.slice.call(carousel.querySelectorAll("[data-slide]"));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll("[data-slide-to]"));
    var prev = carousel.querySelector("[data-carousel-prev]");
    var next = carousel.querySelector("[data-carousel-next]");
    var current = 0;
    var timer;

    function show(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    if (prev) {
      prev.addEventListener("click", function () {
        show(current - 1);
        start();
      });
    }
    if (next) {
      next.addEventListener("click", function () {
        show(current + 1);
        start();
      });
    }
    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-slide-to")) || 0);
        start();
      });
    });
    carousel.addEventListener("mouseenter", stop);
    carousel.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function playVideo(video) {
    var promise = video.play();
    if (promise && typeof promise.catch === "function") {
      promise.catch(function () {});
    }
  }

  function initPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));
    players.forEach(function (shell) {
      var video = shell.querySelector("video");
      var trigger = shell.querySelector("[data-stream]");
      if (!video || !trigger) {
        return;
      }
      var stream = trigger.getAttribute("data-stream");
      var mounted = false;

      function start() {
        if (!stream) {
          return;
        }
        trigger.classList.add("is-hidden");
        video.setAttribute("controls", "controls");
        if (mounted) {
          playVideo(video);
          return;
        }
        mounted = true;
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = stream;
          playVideo(video);
          return;
        }
        if (window.Hls && window.Hls.isSupported()) {
          var hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true,
            backBufferLength: 90
          });
          hls.loadSource(stream);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
            playVideo(video);
          });
          video._hls = hls;
          return;
        }
        video.src = stream;
        playVideo(video);
      }

      trigger.addEventListener("click", start);
      shell.addEventListener("click", function (event) {
        if (event.target === shell) {
          start();
        }
      });
      video.addEventListener("click", function () {
        if (video.paused) {
          start();
        }
      });
    });
  }

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  function createSearchCard(item) {
    var tags = (item.tags || []).slice(0, 2).map(function (tag) {
      return '<span class="chip">' + escapeHtml(tag) + '</span>';
    }).join("");
    return [
      '<article class="movie-card">',
      '  <a class="movie-poster" href="' + escapeAttribute(item.href) + '">',
      '    <img src="' + escapeAttribute(item.cover) + '" alt="' + escapeAttribute(item.title) + '" loading="lazy">',
      '    <span class="poster-shade"></span>',
      '    <span class="play-badge">▶</span>',
      '    <span class="quality-badge">高清</span>',
      '  </a>',
      '  <div class="movie-card-body">',
      '    <div class="card-chips">' + tags + '</div>',
      '    <h3><a href="' + escapeAttribute(item.href) + '">' + escapeHtml(item.title) + '</a></h3>',
      '    <p>' + escapeHtml(item.line || "") + '</p>',
      '    <div class="movie-meta">',
      '      <span>' + escapeHtml(item.region || "") + '</span>',
      '      <span>' + escapeHtml(item.year || "") + '</span>',
      '      <span>' + escapeHtml(item.type || "") + '</span>',
      '    </div>',
      '  </div>',
      '</article>'
    ].join("");
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function escapeAttribute(value) {
    return escapeHtml(value).replace(/`/g, "&#096;");
  }

  function initSearch() {
    var box = document.querySelector("[data-search-results]");
    if (!box || typeof MOVIE_INDEX === "undefined") {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var query = normalize(params.get("q"));
    var input = document.querySelector("[data-search-input]");
    if (input) {
      input.value = params.get("q") || "";
    }
    var items = MOVIE_INDEX;
    if (query) {
      items = MOVIE_INDEX.filter(function (item) {
        var text = normalize([
          item.title,
          item.line,
          item.region,
          item.year,
          item.type,
          item.genre,
          (item.tags || []).join(" ")
        ].join(" "));
        return text.indexOf(query) !== -1;
      });
    }
    items = items.slice(0, 120);
    if (!items.length) {
      box.innerHTML = '<div class="story-card"><span class="eyebrow">搜索结果</span><h2>暂未找到相关影片</h2><p>可以尝试更换片名、地区、年份或题材关键词。</p></div>';
      return;
    }
    box.innerHTML = items.map(createSearchCard).join("");
  }

  ready(function () {
    initNavigation();
    initCarousel();
    initPlayers();
    initSearch();
  });
})();
