(function () {
	"use strict";

	var header = document.querySelector(".site-header");
	var toggle = document.querySelector(".js-nav-toggle");
	var nav = document.querySelector(".js-site-nav");

	function onScroll() {
		if (!header) return;
		header.classList.toggle("is-scrolled", window.scrollY > 24);
	}

	window.addEventListener("scroll", onScroll, { passive: true });
	onScroll();

	if (toggle && nav) {
		toggle.addEventListener("click", function () {
			var open = nav.classList.toggle("is-open");
			toggle.setAttribute("aria-expanded", open ? "true" : "false");
		});

		nav.querySelectorAll('a[href^="#"]').forEach(function (link) {
			link.addEventListener("click", function () {
				nav.classList.remove("is-open");
				toggle.setAttribute("aria-expanded", "false");
			});
		});
	}

	document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
		anchor.addEventListener("click", function (e) {
			var id = anchor.getAttribute("href");
			if (!id || id === "#") return;
			var target = document.querySelector(id);
			if (target) {
				e.preventDefault();
				target.scrollIntoView({ behavior: "smooth", block: "start" });
			}
		});
	});
})();
