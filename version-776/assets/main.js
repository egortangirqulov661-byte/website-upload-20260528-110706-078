(function () {
    var menuButton = document.querySelector(".menu-toggle");
    var mobilePanel = document.querySelector(".mobile-panel");

    if (menuButton && mobilePanel) {
        menuButton.addEventListener("click", function () {
            var expanded = menuButton.getAttribute("aria-expanded") === "true";
            menuButton.setAttribute("aria-expanded", String(!expanded));
            mobilePanel.hidden = expanded;
            document.body.classList.toggle("menu-open", !expanded);
        });
    }

    var hero = document.querySelector("[data-hero]");
    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        var current = 0;
        var timer = null;

        function showSlide(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("active", i === current);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("active", i === current);
            });
        }

        function startHero() {
            if (timer) {
                clearInterval(timer);
            }
            timer = setInterval(function () {
                showSlide(current + 1);
            }, 5200);
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                showSlide(index);
                startHero();
            });
        });

        if (slides.length > 1) {
            startHero();
        }
    }

    var params = new URLSearchParams(window.location.search);
    var query = params.get("q") || "";
    var filterForms = Array.prototype.slice.call(document.querySelectorAll("[data-filter-form]"));

    filterForms.forEach(function (form) {
        var keywordInput = form.querySelector('input[name="keyword"]');
        var yearSelect = form.querySelector('select[name="year"]');
        var typeSelect = form.querySelector('select[name="type"]');
        var state = document.querySelector("[data-filter-state]");
        var cards = Array.prototype.slice.call(document.querySelectorAll("[data-filter-card]"));

        if (keywordInput && query) {
            keywordInput.value = query;
        }

        function applyFilter() {
            var keyword = keywordInput ? keywordInput.value.trim().toLowerCase() : "";
            var year = yearSelect ? yearSelect.value : "";
            var type = typeSelect ? typeSelect.value : "";

            cards.forEach(function (card) {
                var searchText = (card.getAttribute("data-search") || card.textContent || "").toLowerCase();
                var cardYear = card.getAttribute("data-year") || "";
                var cardType = card.getAttribute("data-type") || "";
                var visible = true;

                if (keyword && searchText.indexOf(keyword) === -1) {
                    visible = false;
                }
                if (year && cardYear.indexOf(year) === -1) {
                    visible = false;
                }
                if (type && cardType.indexOf(type) === -1) {
                    visible = false;
                }

                card.hidden = !visible;
            });

            if (state) {
                state.hidden = false;
            }
        }

        form.addEventListener("submit", function (event) {
            event.preventDefault();
            applyFilter();
        });

        [keywordInput, yearSelect, typeSelect].forEach(function (element) {
            if (element) {
                element.addEventListener("input", applyFilter);
                element.addEventListener("change", applyFilter);
            }
        });

        if (query) {
            applyFilter();
        }
    });
})();
