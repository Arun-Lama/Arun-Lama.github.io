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

	/* “Interstellar” canvas — twinkling stars, glowing links, occasional shooting stars.
	   Skipped when the user prefers reduced motion. */
	function initCosmosCanvas() {
		if (!window.matchMedia || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
			return;
		}
		var canvas = document.querySelector(".cosmos__canvas");
		if (!canvas || !canvas.getContext) {
			return;
		}
		var ctx = canvas.getContext("2d");
		var stars = [];
		var shooters = [];
		var w = 0;
		var h = 0;
		var dpr = 1;
		var raf = 0;
		var running = true;
		var lastShoot = 0;
		var linkDist = 130;
		var palette = [
			"236,238,242",
			"158,197,255",
			"201,162,39",
			"190,140,255",
			"120,210,255",
		];

		function rand(a, b) {
			return a + Math.random() * (b - a);
		}

		function resize() {
			dpr = Math.min(window.devicePixelRatio || 1, 2);
			w = canvas.clientWidth || window.innerWidth;
			h = canvas.clientHeight || window.innerHeight;
			if (w < 1 || h < 1) return;
			canvas.width = Math.floor(w * dpr);
			canvas.height = Math.floor(h * dpr);
			ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
			var area = w * h;
			var n = Math.min(170, Math.max(80, Math.floor(area / 11500)));
			linkDist = Math.min(160, Math.max(95, Math.floor(Math.min(w, h) / 6)));
			stars.length = 0;
			for (var i = 0; i < n; i++) {
				var bright = Math.random() < 0.18;
				var color = palette[Math.floor(Math.random() * palette.length)];
				stars.push({
					x: Math.random() * w,
					y: Math.random() * h,
					vx: (Math.random() - 0.5) * 0.22,
					vy: (Math.random() - 0.5) * 0.22,
					r: bright ? rand(1.4, 2.4) : rand(0.4, 1.1),
					big: bright,
					c: color,
					phase: Math.random() * Math.PI * 2,
					speed: rand(0.006, 0.022),
				});
			}
			shooters.length = 0;
		}

		function spawnShooter() {
			var startX = rand(-50, w * 0.6);
			var startY = rand(-50, h * 0.4);
			var angle = rand(Math.PI * 0.16, Math.PI * 0.34);
			var speed = rand(9, 14);
			shooters.push({
				x: startX,
				y: startY,
				vx: Math.cos(angle) * speed,
				vy: Math.sin(angle) * speed,
				life: 0,
				maxLife: Math.floor(rand(45, 75)),
				len: rand(110, 190),
			});
		}

		function step(t) {
			if (!running) return;
			ctx.clearRect(0, 0, w, h);
			ctx.globalCompositeOperation = "lighter";

			var i, j;

			for (i = 0; i < stars.length; i++) {
				for (j = i + 1; j < stars.length; j++) {
					var a = stars[i];
					var b = stars[j];
					var dx = a.x - b.x;
					var dy = a.y - b.y;
					var d2 = dx * dx + dy * dy;
					if (d2 < linkDist * linkDist) {
						var d = Math.sqrt(d2);
						var alpha = (1 - d / linkDist) * 0.32;
						ctx.strokeStyle = "rgba(150,180,255," + alpha + ")";
						ctx.lineWidth = 0.7;
						ctx.beginPath();
						ctx.moveTo(a.x, a.y);
						ctx.lineTo(b.x, b.y);
						ctx.stroke();
					}
				}
			}

			for (i = 0; i < stars.length; i++) {
				var s = stars[i];
				s.x += s.vx;
				s.y += s.vy;
				if (s.x < -10) s.x = w + 10;
				if (s.x > w + 10) s.x = -10;
				if (s.y < -10) s.y = h + 10;
				if (s.y > h + 10) s.y = -10;
				s.phase += s.speed;
				var twinkle = 0.55 + Math.sin(s.phase) * 0.4;

				if (s.big) {
					var halo = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.r * 7);
					halo.addColorStop(0, "rgba(" + s.c + "," + twinkle * 0.9 + ")");
					halo.addColorStop(0.35, "rgba(" + s.c + "," + twinkle * 0.22 + ")");
					halo.addColorStop(1, "rgba(" + s.c + ",0)");
					ctx.fillStyle = halo;
					ctx.beginPath();
					ctx.arc(s.x, s.y, s.r * 7, 0, Math.PI * 2);
					ctx.fill();
				}

				ctx.fillStyle = "rgba(" + s.c + "," + Math.min(1, twinkle + 0.25) + ")";
				ctx.beginPath();
				ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
				ctx.fill();
			}

			if (t - lastShoot > 4200 && Math.random() < 0.02 && shooters.length < 2) {
				spawnShooter();
				lastShoot = t;
			}
			for (i = shooters.length - 1; i >= 0; i--) {
				var ss = shooters[i];
				ss.x += ss.vx;
				ss.y += ss.vy;
				ss.life++;
				var lifeRatio = ss.life / ss.maxLife;
				var a2 = Math.max(0, 1 - lifeRatio);
				var mag = Math.sqrt(ss.vx * ss.vx + ss.vy * ss.vy) || 1;
				var tx = ss.x - (ss.vx / mag) * ss.len;
				var ty = ss.y - (ss.vy / mag) * ss.len;
				var trail = ctx.createLinearGradient(ss.x, ss.y, tx, ty);
				trail.addColorStop(0, "rgba(255,255,255," + 0.95 * a2 + ")");
				trail.addColorStop(0.4, "rgba(180,210,255," + 0.55 * a2 + ")");
				trail.addColorStop(1, "rgba(180,210,255,0)");
				ctx.strokeStyle = trail;
				ctx.lineWidth = 1.6;
				ctx.lineCap = "round";
				ctx.beginPath();
				ctx.moveTo(tx, ty);
				ctx.lineTo(ss.x, ss.y);
				ctx.stroke();

				var head = ctx.createRadialGradient(ss.x, ss.y, 0, ss.x, ss.y, 9);
				head.addColorStop(0, "rgba(255,255,255," + a2 + ")");
				head.addColorStop(1, "rgba(255,255,255,0)");
				ctx.fillStyle = head;
				ctx.beginPath();
				ctx.arc(ss.x, ss.y, 9, 0, Math.PI * 2);
				ctx.fill();

				if (ss.life >= ss.maxLife || ss.x > w + 120 || ss.y > h + 120) {
					shooters.splice(i, 1);
				}
			}

			ctx.globalCompositeOperation = "source-over";
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
