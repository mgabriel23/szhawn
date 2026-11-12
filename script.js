document.addEventListener('DOMContentLoaded', () => {

	// ==========================================
	// 1. SCENE MANAGER & VARIABLES
	// ==========================================
	const scenes = {
		invite: document.getElementById('scene-invite'), // Now Act 1
		start: document.getElementById('scene-start'),   // Now Act 2 & 3
		splash: document.getElementById('scene-splash'), // Now Act 4
		main: document.getElementById('scene-main')      // Now Act 5
	};

	const video = document.getElementById('intro-video');
	const splashAudio = document.getElementById('splash-audio');
	const whiteOverlay = document.getElementById('video-fade-overlay');

	// Slider Variables
	const track = document.getElementById('slide-track');
	const thumb = document.getElementById('slide-thumb');
	const curtainLeft = document.querySelector('.curtain-left');
	const curtainRight = document.querySelector('.curtain-right');

	let isDragging = false;
	let startX = 0;
	let currentX = 0;
	const maxDrag = 200;
	const threshold = maxDrag * 0.8;

	// ==========================================
	// 2. UTILITY FUNCTIONS
	// ==========================================
	const switchScene = (currentScene, nextScene) => {
		currentScene.classList.remove('active');
		setTimeout(() => {
			currentScene.style.display = '';
			nextScene.style.display = '';
			nextScene.classList.add('active');
			window.scrollTo(0, 0);
		}, 400);
	};

	const triggerConfetti = () => {
		if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
		var duration = 3 * 1000;
		var animationEnd = Date.now() + duration;
		var defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

		function randomInRange(min, max) { return Math.random() * (max - min) + min; }

		var interval = setInterval(function () {
			var timeLeft = animationEnd - Date.now();
			if (timeLeft <= 0) return clearInterval(interval);

			var particleCount = 50 * (timeLeft / duration);
			confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } }));
			confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } }));
		}, 250);
	};

	const initScrollAnimations = () => {
		const observerOptions = { root: null, rootMargin: '0px', threshold: 0.15 };
		const observer = new IntersectionObserver((entries, observer) => {
			entries.forEach(entry => {
				if (entry.isIntersecting) {
					entry.target.classList.add('is-visible');
					observer.unobserve(entry.target);
				}
			});
		}, observerOptions);

		document.querySelectorAll('.animate-on-scroll').forEach(el => observer.observe(el));
	};

	// ==========================================
	// 3. FLOW ACT 1 -> ACT 2 (Invite -> Slider)
	// ==========================================
	document.getElementById('open-invite-btn').addEventListener('click', () => {
		switchScene(scenes.invite, scenes.start);
	});

	// ==========================================
	// 4. FLOW ACT 2 -> ACT 3 (Slider -> Video)
	// ==========================================
	const startDrag = (e) => {
		isDragging = true;
		startX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
		thumb.style.animation = 'none';
		thumb.style.transition = 'none';
		curtainLeft.style.transition = 'none';
		curtainRight.style.transition = 'none';
	};

	const onDrag = (e) => {
		if (!isDragging) return;
		const clientX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
		let deltaX = clientX - startX;

		if (deltaX < 0) deltaX = 0;
		if (deltaX > maxDrag) deltaX = maxDrag;

		currentX = deltaX;
		thumb.style.transform = `translateX(${currentX}px)`;

		const progress = currentX / maxDrag;
		curtainLeft.style.transform = `translateX(-${progress * 100}%)`;
		curtainRight.style.transform = `translateX(${progress * 100}%)`;
	};

	const endDrag = () => {
		if (!isDragging) return;
		isDragging = false;

		curtainLeft.style.transition = 'transform 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
		curtainRight.style.transition = 'transform 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275)';

		if (currentX >= threshold) {
			thumb.style.transform = `translateX(${maxDrag}px)`;
			thumb.style.background = '#ffffff';

			curtainLeft.style.transform = `translateX(-100%)`;
			curtainRight.style.transform = `translateX(100%)`;

			completeSlide();
		} else {
			thumb.style.transition = 'transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
			thumb.style.transform = `translateX(0)`;
			currentX = 0;

			curtainLeft.style.transform = `translateX(0)`;
			curtainRight.style.transform = `translateX(0)`;

			setTimeout(() => { thumb.style.animation = 'breatheX 2.5s infinite ease-in-out'; }, 400);
		}
	};

	const completeSlide = () => {
		track.style.transition = 'opacity 0.3s ease';
		track.style.opacity = '0';
		setTimeout(() => { track.style.display = 'none'; }, 300);

		// Play video immediately while curtains are opening
		video.play().catch(e => console.log("Video autoplay failed:", e));
	};

	// Slider Event Listeners
	thumb.addEventListener('mousedown', startDrag);
	window.addEventListener('mousemove', onDrag);
	window.addEventListener('mouseup', endDrag);
	thumb.addEventListener('touchstart', startDrag, { passive: false });
	window.addEventListener('touchmove', onDrag, { passive: false });
	window.addEventListener('touchend', endDrag);

	// Keyboard Accessibility
	thumb.addEventListener('keydown', (e) => {
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			thumb.style.transform = `translateX(${maxDrag}px)`;
			thumb.style.background = '#ffffff';
			curtainLeft.style.transform = `translateX(-100%)`;
			curtainRight.style.transform = `translateX(100%)`;
			completeSlide();
		}
	});

	// ==========================================
	// 5. FLOW ACT 3 -> ACT 4 (Video -> Splash)
	// ==========================================
	video.addEventListener('ended', () => {

		// 1. Instantly swap the scenes (since the video already faded to white)
		scenes.start.classList.remove('active');
		scenes.start.style.display = 'none';

		scenes.splash.style.display = '';
		scenes.splash.classList.add('active');

		// 2. Play the "Love ko 'to" sound effect
		if (splashAudio) {
			splashAudio.play().catch(error => console.log("Audio play failed:", error));
		}

		// 3. Trigger Splash Animations
		const splashLogo = document.querySelector('.splash-logo');
		const splashText = document.querySelector('.splash-text');
		setTimeout(() => {
			splashLogo.classList.add('animate-in');
			splashText.classList.add('animate-in');
		}, 100);

		// 4. Auto transition to Main Event after 4 seconds
		setTimeout(() => {
			switchScene(scenes.splash, scenes.main);
			triggerConfetti();
			initScrollAnimations();
		}, 4000);

	});

	// ==========================================
	// 6. COUNTDOWN TIMER & RSVP (No changes)
	// ==========================================
	const eventDate = new Date(2026, 9, 25, 13, 0, 0).getTime();

	const updateCountdown = () => {
		const now = new Date().getTime();
		const distance = eventDate - now;
		const countdownEl = document.getElementById('countdown');
		if (!countdownEl) return;

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

	setInterval(updateCountdown, 1000);
	updateCountdown();

	const form = document.getElementById('rsvp-form');
	if (form) {
		form.addEventListener('submit', function (e) {
			const btn = form.querySelector('button[type="submit"]');
			const originalText = btn.innerText;
			btn.innerText = "Sending...";
			btn.disabled = true;
			setTimeout(() => {
				btn.innerText = originalText;
				btn.disabled = false;
			}, 5000);
		});
	}

});