function initMoviePlayer(source) {
    var start = function () {
        var video = document.querySelector(".movie-player");
        var cover = document.querySelector(".player-cover");
        var button = document.querySelector(".player-start");
        var message = document.querySelector(".player-message");
        var attached = false;
        var attach = function () {
            if (!video || attached) {
                return;
            }
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = source;
            } else if (window.Hls && window.Hls.isSupported()) {
                var hls = new Hls({
                    enableWorker: true,
                    lowLatencyMode: false
                });
                hls.loadSource(source);
                hls.attachMedia(video);
            } else {
                video.src = source;
            }
            attached = true;
        };
        var play = function () {
            attach();
            if (cover) {
                cover.classList.add("is-hidden");
            }
            video.controls = true;
            var promise = video.play();
            if (promise && promise.catch) {
                promise.catch(function () {
                    if (message) {
                        message.textContent = "点击视频继续播放";
                        message.classList.add("show");
                    }
                });
            }
        };
        if (button) {
            button.addEventListener("click", play);
        }
        if (cover) {
            cover.addEventListener("click", play);
        }
        if (video) {
            video.addEventListener("click", function () {
                if (video.paused) {
                    play();
                }
            });
        }
    };
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", start);
    } else {
        start();
    }
}
