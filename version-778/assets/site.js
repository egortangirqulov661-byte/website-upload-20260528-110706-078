(function () {
    function ready(fn) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", fn);
        } else {
            fn();
        }
    }

    ready(function () {
        var header = document.querySelector(".site-header");
        var toggle = document.querySelector(".menu-toggle");
        if (header && toggle) {
            toggle.addEventListener("click", function () {
                var open = header.classList.toggle("open");
                toggle.setAttribute("aria-expanded", open ? "true" : "false");
            });
        }

        var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
        if (slides.length > 1) {
            var current = 0;
            var show = function (index) {
                current = (index + slides.length) % slides.length;
                slides.forEach(function (slide, slideIndex) {
                    slide.classList.toggle("active", slideIndex === current);
                });
                dots.forEach(function (dot, dotIndex) {
                    dot.classList.toggle("active", dotIndex === current);
                });
            };
            dots.forEach(function (dot, index) {
                dot.addEventListener("click", function () {
                    show(index);
                });
            });
            setInterval(function () {
                show(current + 1);
            }, 5200);
        }

        var filterButtons = Array.prototype.slice.call(document.querySelectorAll(".filter-btn"));
        var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card[data-tags]"));
        if (filterButtons.length && cards.length) {
            filterButtons.forEach(function (button) {
                button.addEventListener("click", function () {
                    var filter = button.getAttribute("data-filter") || "all";
                    filterButtons.forEach(function (item) {
                        item.classList.toggle("active", item === button);
                    });
                    cards.forEach(function (card) {
                        var haystack = [
                            card.getAttribute("data-title") || "",
                            card.getAttribute("data-region") || "",
                            card.getAttribute("data-year") || "",
                            card.getAttribute("data-tags") || ""
                        ].join(" ").toLowerCase();
                        card.style.display = filter === "all" || haystack.indexOf(filter.toLowerCase()) !== -1 ? "" : "none";
                    });
                });
            });
        }

        var escapeHtml = function (value) {
            return String(value || "").replace(/[&<>"']/g, function (match) {
                return {
                    "&": "&amp;",
                    "<": "&lt;",
                    ">": "&gt;",
                    "\"": "&quot;",
                    "'": "&#39;"
                }[match];
            });
        };

        var searchRoot = document.querySelector("[data-search-root]");
        if (searchRoot && window.movieSearchData) {
            var input = searchRoot.querySelector("input[name='q']");
            var output = searchRoot.querySelector("[data-search-results]");
            var summary = searchRoot.querySelector("[data-search-summary]");
            var params = new URLSearchParams(window.location.search);
            var initial = params.get("q") || "";
            input.value = initial;
            var render = function () {
                var q = input.value.trim().toLowerCase();
                var list = window.movieSearchData.filter(function (item) {
                    if (!q) {
                        return item.hot;
                    }
                    return item.title.toLowerCase().indexOf(q) !== -1 ||
                        item.region.toLowerCase().indexOf(q) !== -1 ||
                        item.type.toLowerCase().indexOf(q) !== -1 ||
                        item.year.toLowerCase().indexOf(q) !== -1 ||
                        item.tags.toLowerCase().indexOf(q) !== -1 ||
                        item.genre.toLowerCase().indexOf(q) !== -1;
                }).slice(0, 120);
                summary.textContent = q ? "搜索结果" : "热门推荐";
                if (!list.length) {
                    output.innerHTML = "<div class=\"empty-state\">没有找到匹配内容</div>";
                    return;
                }
                output.innerHTML = list.map(function (item) {
                    var title = escapeHtml(item.title);
                    var url = escapeHtml(item.url);
                    var cover = escapeHtml(item.cover);
                    var year = escapeHtml(item.year);
                    var region = escapeHtml(item.region);
                    var type = escapeHtml(item.type);
                    var oneLine = escapeHtml(item.oneLine);
                    var tags = String(item.tags || "").split(" ").slice(0, 4).map(function (tag) {
                        return "<span>" + escapeHtml(tag) + "</span>";
                    }).join("");
                    return [
                        "<article class=\"movie-card\">",
                        "<a class=\"poster-link\" href=\"" + url + "\" aria-label=\"" + title + "\">",
                        "<img src=\"" + cover + "\" alt=\"" + title + "\" loading=\"lazy\">",
                        "<span class=\"poster-shade\"></span><span class=\"play-dot\">▶</span></a>",
                        "<div class=\"movie-card-body\"><h3><a href=\"" + url + "\">" + title + "</a></h3>",
                        "<p class=\"movie-meta\">" + year + " · " + region + " · " + type + "</p>",
                        "<p class=\"movie-line\">" + oneLine + "</p>",
                        "<div class=\"tag-list\">" + tags + "</div>",
                        "</div></article>"
                    ].join("");
                }).join("");
            };
            searchRoot.addEventListener("submit", function (event) {
                event.preventDefault();
                render();
            });
            input.addEventListener("input", render);
            render();
        }
    });
})();
