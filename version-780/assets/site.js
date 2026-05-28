(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
      return;
    }
    document.addEventListener("DOMContentLoaded", fn);
  }

  function setupMenu() {
    var button = document.querySelector("[data-menu-toggle]");
    var menu = document.querySelector("[data-mobile-menu]");
    if (!button || !menu) {
      return;
    }
    button.addEventListener("click", function () {
      menu.classList.toggle("is-open");
    });
  }

  function setupHero() {
    var slider = document.querySelector("[data-hero-slider]");
    if (!slider) {
      return;
    }
    var slides = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
    var next = slider.querySelector("[data-hero-next]");
    var prev = slider.querySelector("[data-hero-prev]");
    var current = 0;
    var timer = null;

    function show(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, idx) {
        slide.classList.toggle("is-active", idx === current);
      });
      dots.forEach(function (dot, idx) {
        dot.classList.toggle("is-active", idx === current);
      });
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    if (next) {
      next.addEventListener("click", function () {
        show(current + 1);
        restart();
      });
    }

    if (prev) {
      prev.addEventListener("click", function () {
        show(current - 1);
        restart();
      });
    }

    dots.forEach(function (dot, idx) {
      dot.addEventListener("click", function () {
        show(idx);
        restart();
      });
    });

    show(0);
    restart();
  }

  function setupFilters() {
    var groups = Array.prototype.slice.call(document.querySelectorAll("[data-filter-group]"));
    groups.forEach(function (group) {
      var input = group.querySelector("[data-search-input]");
      var cards = Array.prototype.slice.call(group.querySelectorAll("[data-movie-card]"));
      var buttons = Array.prototype.slice.call(group.querySelectorAll("[data-filter-value]"));
      var empty = group.querySelector("[data-empty-state]");
      var active = "all";

      function apply() {
        var query = input ? input.value.trim().toLowerCase() : "";
        var visible = 0;
        cards.forEach(function (card) {
          var haystack = (card.getAttribute("data-search") || "").toLowerCase();
          var type = card.getAttribute("data-type") || "";
          var year = card.getAttribute("data-year") || "";
          var category = card.getAttribute("data-category") || "";
          var matchQuery = !query || haystack.indexOf(query) !== -1;
          var matchFilter = active === "all" || type === active || year === active || category === active;
          var shouldShow = matchQuery && matchFilter;
          card.style.display = shouldShow ? "" : "none";
          if (shouldShow) {
            visible += 1;
          }
        });
        if (empty) {
          empty.classList.toggle("is-visible", visible === 0);
        }
      }

      if (input) {
        input.addEventListener("input", apply);
      }

      buttons.forEach(function (button) {
        button.addEventListener("click", function () {
          active = button.getAttribute("data-filter-value") || "all";
          buttons.forEach(function (item) {
            item.classList.toggle("is-active", item === button);
          });
          apply();
        });
      });

      apply();
    });
  }

  function canPlayNative(video) {
    return video.canPlayType("application/vnd.apple.mpegurl") || video.canPlayType("application/x-mpegURL");
  }

  function attachHls(video, src, onReady, onError) {
    if (canPlayNative(video)) {
      video.src = src;
      onReady();
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
      hls.loadSource(src);
      hls.attachMedia(video);
      hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
        onReady();
      });
      hls.on(window.Hls.Events.ERROR, function (event, data) {
        if (data && data.fatal) {
          onError();
        }
      });
      return;
    }

    onError();
  }

  window.Site = {
    initPlayer: function (videoId, buttonId, src, messageId) {
      ready(function () {
        var video = document.getElementById(videoId);
        var button = document.getElementById(buttonId);
        var message = messageId ? document.getElementById(messageId) : null;
        var started = false;

        if (!video || !button || !src) {
          return;
        }

        function showError() {
          if (message) {
            message.textContent = "视频暂时无法播放，请稍后再试";
            message.classList.add("is-visible");
          }
          button.classList.remove("is-hidden");
        }

        function play() {
          video.play().then(function () {
            button.classList.add("is-hidden");
          }).catch(function () {
            button.classList.remove("is-hidden");
          });
        }

        function start() {
          if (message) {
            message.classList.remove("is-visible");
          }
          button.classList.add("is-hidden");
          if (started) {
            play();
            return;
          }
          started = true;
          attachHls(video, src, play, showError);
        }

        button.addEventListener("click", start);
        video.addEventListener("click", function () {
          if (!started || video.paused) {
            start();
          }
        });
      });
    }
  };

  ready(function () {
    setupMenu();
    setupHero();
    setupFilters();
  });
})();
