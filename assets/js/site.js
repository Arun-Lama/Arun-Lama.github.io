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

	/* Optional “data universe” canvas — skipped when user prefers reduced motion */
	function initCosmosCanvas() {
		if (!window.matchMedia || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
			return;
		}
		var canvas = document.querySelector(".cosmos__canvas");
		if (!canvas || !canvas.getContext) {
			return;
		}
		var ctx = canvas.getContext("2d");
		var particles = [];
		var n = 70;
		var linkDist = 118;
		var w = 0;
		var h = 0;
		var dpr = 1;
		var raf = 0;
		var running = true;

		function resize() {
			dpr = Math.min(window.devicePixelRatio || 1, 2);
			w = canvas.clientWidth || window.innerWidth;
			h = canvas.clientHeight || window.innerHeight;
			if (w < 1 || h < 1) return;
			canvas.width = Math.floor(w * dpr);
			canvas.height = Math.floor(h * dpr);
			ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
			linkDist = Math.min(140, Math.max(88, Math.floor(Math.min(w, h) / 6)));
			particles.length = 0;
			for (var i = 0; i < n; i++) {
				particles.push({
					x: Math.random() * w,
					y: Math.random() * h,
					vx: (Math.random() - 0.5) * 0.22,
					vy: (Math.random() - 0.5) * 0.22,
					r: Math.random() * 1.1 + 0.35,
				});
			}
		}

		function step() {
			if (!running) return;
			ctx.clearRect(0, 0, w, h);
			var i;
			for (i = 0; i < particles.length; i++) {
				var p = particles[i];
				p.x += p.vx;
				p.y += p.vy;
				if (p.x < 0) p.x = w;
				if (p.x > w) p.x = 0;
				if (p.y < 0) p.y = h;
				if (p.y > h) p.y = 0;
			}
			for (i = 0; i < particles.length; i++) {
				for (var j = i + 1; j < particles.length; j++) {
					var a = particles[i];
					var b = particles[j];
					var dx = a.x - b.x;
					var dy = a.y - b.y;
					var dist = Math.sqrt(dx * dx + dy * dy);
					if (dist < linkDist) {
						var alpha = (1 - dist / linkDist) * 0.14;
						ctx.strokeStyle = "rgba(158,197,255," + alpha + ")";
						ctx.lineWidth = 0.55;
						ctx.beginPath();
						ctx.moveTo(a.x, a.y);
						ctx.lineTo(b.x, b.y);
						ctx.stroke();
					}
				}
			}
			ctx.fillStyle = "rgba(236,238,242,0.42)";
			for (i = 0; i < particles.length; i++) {
				var q = particles[i];
				ctx.beginPath();
				ctx.arc(q.x, q.y, q.r, 0, Math.PI * 2);
				ctx.fill();
			}
			raf = requestAnimationFrame(step);
		}

		var resizeTimer;
		window.addEventListener(
			"resize",
			function () {
				clearTimeout(resizeTimer);
				resizeTimer = setTimeout(function () {
					cancelAnimationFrame(raf);
					resize();
					raf = requestAnimationFrame(step);
				}, 180);
			},
			{ passive: true }
		);

		document.addEventListener("visibilitychange", function () {
			if (document.hidden) {
				running = false;
				cancelAnimationFrame(raf);
			} else {
				running = true;
				raf = requestAnimationFrame(step);
			}
		});

		resize();
		raf = requestAnimationFrame(step);
	}

	initCosmosCanvas();
})();
