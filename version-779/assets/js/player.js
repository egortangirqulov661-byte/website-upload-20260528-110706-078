
import { H as Hls } from './hls.js';

var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));

players.forEach(function (player) {
  var video = player.querySelector('video');
  var overlay = player.querySelector('.play-overlay');
  var stream = player.getAttribute('data-stream');
  var hls = null;
  var ready = false;

  function attachStream(callback) {
    if (!video || !stream) {
      return;
    }

    if (ready) {
      callback();
      return;
    }

    ready = true;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = stream;
      callback();
      return;
    }

    if (Hls.isSupported()) {
      hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.attachMedia(video);
      hls.on(Hls.Events.MEDIA_ATTACHED, function () {
        hls.loadSource(stream);
      });
      hls.on(Hls.Events.MANIFEST_PARSED, function () {
        callback();
      });
      return;
    }

    video.src = stream;
    callback();
  }

  function play() {
    attachStream(function () {
      if (overlay) {
        overlay.classList.add('is-hidden');
      }

      var attempt = video.play();

      if (attempt && typeof attempt.catch === 'function') {
        attempt.catch(function () {});
      }
    });
  }

  if (overlay) {
    overlay.addEventListener('click', play);
  }

  if (video) {
    video.addEventListener('click', function () {
      if (!ready) {
        play();
      }
    });
    video.addEventListener('play', function () {
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
    });
  }

  window.addEventListener('pagehide', function () {
    if (hls) {
      hls.destroy();
      hls = null;
    }
  });
});
