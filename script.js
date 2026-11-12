document.addEventListener('DOMContentLoaded', () => {

	// --- SCENE MANAGER ---
	const scenes = {
		splash: document.getElementById('scene-splash'),
		invite: document.getElementById('scene-invite'),
		video: document.getElementById('scene-video'),
		main: document.getElementById('scene-main')
	};

	const switchScene = (currentScene, nextScene) => {
		currentScene.classList.remove('active');
		setTimeout(() => {
			currentScene.style.display = 'none';
			nextScene.style.display = 'flex';
			// Small delay to ensure display is block before opacity transition
			setTimeout(() => {
				nextScene.classList.add('active');
			}, 50);
		}, 400); // Matches CSS transition speed
	};

	// Scene 1 -> Scene 2 (Auto transition after 2.5 seconds)
	setTimeout(() => {
		switchScene(scenes.splash, scenes.invite);
	}, 2500);

	// Scene 2 -> Scene 3 (On Button Click)
	document.getElementById('open-invite-btn').addEventListener('click', () => {
		switchScene(scenes.invite, scenes.video);
	});

	// Scene 3 -> Scene 4 (On Video End or Skip)
	const video = document.getElementById('intro-video');
	const skipBtn = document.getElementById('skip-video-btn');

	const goToMain = () => {
		if (!scenes.main.classList.contains('active')) {
			switchScene(scenes.video, scenes.main);
			triggerConfetti();
			initScrollAnimations(); // Initialize intersection observer here
		}
	};

	video.addEventListener('ended', goToMain);
	skipBtn.addEventListener('click', goToMain);

	// In case video fails to load or user doesn't have it, let them skip after 3s
	setTimeout(() => { skipBtn.style.opacity = '1'; }, 3000);

	// --- CONFETTI ---
	const triggerConfetti = () => {
		// Check if user prefers reduced motion
		if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

		var duration = 3 * 1000;
		var animationEnd = Date.now() + duration;
		var defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

		function randomInRange(min, max) {
			return Math.random() * (max - min) + min;
		}

		var interval = setInterval(function () {
			var timeLeft = animationEnd - Date.now();

			if (timeLeft <= 0) {
				return clearInterval(interval);
			}

			var particleCount = 50 * (timeLeft / duration);
			// since particles fall down, start a bit higher than random
			confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } }));
			confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } }));
		}, 250);
	};

	// --- SCROLL REVEAL (Intersection Observer) ---
	const initScrollAnimations = () => {
		const observerOptions = {
			root: null,
			rootMargin: '0px',
			threshold: 0.15
		};

		const observer = new IntersectionObserver((entries, observer) => {
			entries.forEach(entry => {
				if (entry.isIntersecting) {
					entry.target.classList.add('is-visible');
					observer.unobserve(entry.target); // Stop observing once visible
				}
			});
		}, observerOptions);

		document.querySelectorAll('.animate-on-scroll').forEach(el => {
			observer.observe(el);
		});
	};

	// --- COUNTDOWN TIMER ---
	// Set your event date here (Year, Month - 1, Day, Hours, Minutes)
	const eventDate = new Date(2026, 9, 25, 13, 0, 0).getTime(); // Oct 25, 2026 at 1:00 PM

	const updateCountdown = () => {
		const now = new Date().getTime();
		const distance = eventDate - now;
		const countdownEl = document.getElementById('countdown');

		if (distance < 0) {
			countdownEl.innerHTML = "<h3 class='heading'>The Party Has Started!</h3>";
			return;
		}

		const days = Math.floor(distance / (1000 * 60 * 60 * 24));
		const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
		const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
		const seconds = Math.floor((distance % (1000 * 60)) / 1000);

		countdownEl.innerHTML = `
            <div class="count-box"><span>${days}</span><small>Days</small></div>
            <div class="count-box"><span>${hours}</span><small>Hrs</small></div>
            <div class="count-box"><span>${minutes}</span><small>Mins</small></div>
            <div class="count-box"><span>${seconds}</span><small>Secs</small></div>
        `;
	};

	// Update every 1 second
	setInterval(updateCountdown, 1000);
	updateCountdown(); // Initial call

	// --- RSVP FORM HANDLING ---
	const form = document.getElementById('rsvp-form');
	form.addEventListener('submit', function (e) {
		// Let Web3Forms handle the actual submission.
		// This is just for UX feedback.
		const btn = form.querySelector('button[type="submit"]');
		const originalText = btn.innerText;

		btn.innerText = "Sending...";
		btn.disabled = true;

		// Web3Forms resets the form and shows a success message natively if configured.
		// If using AJAX, you would fetch the form action. Here we let standard POST happen,
		// but we can add a timeout to reset the button if they go back.
		setTimeout(() => {
			btn.innerText = originalText;
			btn.disabled = false;
		}, 5000);
	});

});