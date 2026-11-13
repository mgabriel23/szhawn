document.addEventListener('DOMContentLoaded', () => {

	// ==========================================
	// 1. SCENE MANAGER & VARIABLES
	// ==========================================
	const scenes = {
		invite: document.getElementById('scene-invite'),
		start: document.getElementById('scene-start'),
		main: document.getElementById('scene-main') // Splash removed as requested
	};

	const video = document.getElementById('intro-video');

	// ADDED: Missing Audio & Mute Variables
	const bgMusic = document.getElementById('bg-music');
	const muteBtn = document.getElementById('mute-btn');
	let isMusicMuted = false;

	// Slider Variables
	const track = document.getElementById('slide-track');
	const trackText = document.querySelector('.track-text');
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
		trackText.classList.add('hide');
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
			trackText.classList.remove('hide');
			setTimeout(() => { thumb.style.animation = 'breatheX 2.5s infinite ease-in-out'; }, 400);
		}
	};

	const completeSlide = () => {
		track.style.transition = 'opacity 0.3s ease';
		track.style.opacity = '0';
		setTimeout(() => { track.style.display = 'none'; }, 300);
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
			trackText.classList.add('hide');
			thumb.style.transform = `translateX(${maxDrag}px)`;
			thumb.style.background = '#ffffff';
			curtainLeft.style.transform = `translateX(-100%)`;
			curtainRight.style.transform = `translateX(100%)`;
			completeSlide();
		}
	});

	// ==========================================
	// 5. SUPER CONFETTI BURST
	// ==========================================
	const triggerSuperConfetti = () => {
		if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

		// 1. The Initial Massive Burst (Center screen)
		confetti({
			particleCount: 150,
			spread: 100,
			origin: { y: 0.6 },
			zIndex: 9999,
			colors: ['#ffc72c', '#DA291C', '#4b2c70', '#ffffff'],
			disableForReducedMotion: true
		});

		// 2. The Cascading Rain (Sides)
		var duration = 3 * 1000;
		var animationEnd = Date.now() + duration;
		var defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

		function randomInRange(min, max) { return Math.random() * (max - min) + min; }

		var interval = setInterval(function () {
			var timeLeft = animationEnd - Date.now();
			if (timeLeft <= 0) return clearInterval(interval);

			var particleCount = 40 * (timeLeft / duration);
			confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } }));
			confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } }));
		}, 250);
	};

	// ==========================================
	// 6. FLOW ACT 3 -> ACT 5 (Video -> Main Event)
	// ==========================================
	let hasTransitionedToMain = false;

	const transitionToMain = () => {
		if (hasTransitionedToMain) return;
		hasTransitionedToMain = true;

		// 1. Play Background Music & Show Mute Button
		if (bgMusic) {
			bgMusic.volume = 0.4;
			bgMusic.play().catch(e => console.log("BG music autoplay blocked:", e));
			muteBtn.classList.add('active');
		}

		// 2. Fire the Confetti IMMEDIATELY
		triggerSuperConfetti();

		// 3. Wait 200ms for the confetti to burst, then swap scenes
		setTimeout(() => {

			const heroElements = document.querySelectorAll('#scene-main .hero .animate-on-scroll');
			heroElements.forEach(el => {
				el.style.transition = 'none';
				el.classList.add('is-visible');
			});

			// Instantly hide the video scene
			scenes.start.style.transition = 'none';
			scenes.start.classList.remove('active');
			scenes.start.style.display = 'none';

			// Fade in the main scene smoothly (0.6s instead of 0.2s)
			scenes.main.style.transition = 'opacity 0.6s ease-in-out';
			scenes.main.style.display = 'flex';
			scenes.main.style.opacity = '0';
			scenes.main.classList.add('active');

			window.scrollTo(0, 0);
			initScrollAnimations();

			requestAnimationFrame(() => {
				setTimeout(() => {
					scenes.main.style.opacity = '1';
				}, 10);
			});

			// Cleanup: Wait 600ms before removing inline styles
			setTimeout(() => {
				heroElements.forEach(el => { el.style.transition = ''; });
				scenes.main.style.transition = '';
				scenes.main.style.opacity = '';
			}, 600); // Matches the 0.6s fade time

		}, 200); // 200ms initial delay for the confetti burst
	};

	// 6. The High-Performance Video Monitor
	const monitorVideo = () => {
		if (hasTransitionedToMain || video.paused || video.ended) return;

		const cutTime = 0.1; // Cuts the video 0.1s before the end

		if (video.currentTime >= video.duration - cutTime) {
			transitionToMain();
		} else {
			requestAnimationFrame(monitorVideo);
		}
	};

	video.addEventListener('play', () => {
		requestAnimationFrame(monitorVideo);
	});

	video.addEventListener('ended', transitionToMain);

	// --- MUTE BUTTON LOGIC ---
	if (muteBtn) {
		muteBtn.addEventListener('click', () => {
			if (isMusicMuted) {
				bgMusic.play();
				muteBtn.innerText = '🔊';
				muteBtn.setAttribute('aria-label', 'Mute background music');
			} else {
				bgMusic.pause();
				muteBtn.innerText = '🔇';
				muteBtn.setAttribute('aria-label', 'Unmute background music');
			}
			isMusicMuted = !isMusicMuted;
		});
	}

	// ==========================================
	// 7. COUNTDOWN TIMER
	// ==========================================
	const eventDate = new Date(2026, 11, 13, 10, 0, 0).getTime(); // Dec 13, 2026 at 10:00 AM

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

	// ==========================================
	// 7. ADD TO CALENDAR (.ics) GENERATOR
	// ==========================================
	const calendarBtn = document.getElementById('add-to-calendar-btn');

	if (calendarBtn) {
		calendarBtn.addEventListener('click', () => {
			// Updated Event Details
			const title = "Szhawn's 1st Birthday and Baptism";
			const location = "San Francisco de Assisi Parish Church & Government Center, Meycauayan, Bulacan";
			// Format: YYYYMMDDTHHmmSS (Local time)
			const startTime = "20261213T120000"; // 12:00 PM
			const endTime = "20261213T160000"; // Assuming 4:00 PM end time
			const description = "Baptism at 12:00 NN at San Francisco de Assisi Parish Church (Gasak). Reception at 1:00 PM at Government Center (Saluysoy).";

			// ICS File Formatting
			const icsContent = `BEGIN:VCALENDAR
				VERSION:2.0
				PRODID:-//Szhawn Invite//EN
				BEGIN:VEVENT
				SUMMARY:${title}
				DTSTART:${startTime}
				DTEND:${endTime}
				LOCATION:${location}
				DESCRIPTION:${description}
				STATUS:CONFIRMED
				END:VEVENT
				END:VCALENDAR`;

			// Create the file and trigger download
			const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
			const link = document.createElement('a');
			link.href = window.URL.createObjectURL(blob);
			link.download = 'Szhawn_Party_Invite.ics';
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
		});
	}

	// ==========================================
	// 9. RSVP FORM HANDLING
	// ==========================================
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

	// ==========================================
	// 10. CUSTOM DROPDOWN LOGIC
	// ==========================================
	const dropdown = document.getElementById('guest-dropdown');
	const trigger = document.getElementById('guest-trigger');
	const options = document.querySelectorAll('.select-options li');
	const label = document.getElementById('guest-label');
	const hiddenInput = document.getElementById('guests-input');

	if (dropdown && trigger) {
		// Toggle menu on click
		trigger.addEventListener('click', (e) => {
			e.preventDefault(); // Stops any form submission interference
			e.stopPropagation(); // Prevents immediate closing
			dropdown.classList.toggle('open');
		});

		// Handle option selection
		options.forEach(option => {
			option.addEventListener('click', (e) => {
				e.stopPropagation();

				options.forEach(o => o.classList.remove('selected'));
				option.classList.add('selected');

				const value = option.getAttribute('data-value');
				label.textContent = value;
				hiddenInput.value = value;

				dropdown.classList.remove('open');
			});
		});

		// Close menu when clicking outside
		document.addEventListener('click', (e) => {
			if (!dropdown.contains(e.target)) {
				dropdown.classList.remove('open');
			}
		});
	}

});