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
	// 5. SUPER CONFETTI BURST (Optimized for Low-End)
	// ==========================================
	const triggerSuperConfetti = () => {
		if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

		// 1. Clear any existing confetti to free up memory
		if (typeof confetti.reset === 'function') {
			confetti.reset();
		}

		// 2. Initial Burst (Reduced from 150 to 80 for performance)
		confetti({
			particleCount: 80,
			spread: 100,
			origin: { y: 0.6 },
			zIndex: 9999,
			colors: ['#ffc72c', '#DA291C', '#4b2c70', '#ffffff'],
			disableForReducedMotion: true,
			ticks: 40 // Particles disappear faster
		});

		// 3. Cascading Rain (Optimized using requestAnimationFrame)
		var duration = 2000; // Reduced from 3s to 2s
		var animationEnd = Date.now() + duration;
		var defaults = {
			startVelocity: 25,
			spread: 360,
			ticks: 40, // Faster cleanup
			zIndex: 9999
		};

		function randomInRange(min, max) {
			return Math.random() * (max - min) + min;
		}

		// Use requestAnimationFrame instead of setInterval.
		// This prevents the browser from freezing if the frame rate drops.
		function frame() {
			var timeLeft = animationEnd - Date.now();
			if (timeLeft <= 0) return; // Stop the loop entirely

			// Drastically reduced particle count per frame
			var particleCount = 15 * (timeLeft / duration);

			confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } }));
			confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } }));

			requestAnimationFrame(frame);
		}

		// Start the loop
		requestAnimationFrame(frame);
	};

	// ==========================================
	// 6. FLOW ACT 3 -> ACT 5 (Video -> Main Event)
	// ==========================================
	let hasTransitionedToMain = false;

	const transitionToMain = () => {
		if (hasTransitionedToMain) return;
		hasTransitionedToMain = true;

		if (bgMusic) {
			bgMusic.volume = 0.4;
			bgMusic.play().catch(e => console.log("BG music autoplay blocked:", e));
			muteBtn.classList.add('active');
		}

		// 1. Fire the Optimized Confetti
		triggerSuperConfetti();

		// 2. Wait 200ms for the confetti to burst, then swap scenes
		setTimeout(() => {

			const heroElements = document.querySelectorAll('#scene-main .hero .animate-on-scroll');
			heroElements.forEach(el => {
				el.style.transition = 'none';
				el.classList.add('is-visible');
			});

			scenes.start.style.transition = 'none';
			scenes.start.classList.remove('active');
			scenes.start.style.display = 'none';

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

			setTimeout(() => {
				heroElements.forEach(el => { el.style.transition = ''; });
				scenes.main.style.transition = '';
				scenes.main.style.opacity = '';
			}, 600);

			// 3. THE FIX: Hard reset the canvas after 3.5 seconds
			// This guarantees the canvas is wiped clean and stops using CPU
			setTimeout(() => {
				if (typeof confetti.reset === 'function') {
					confetti.reset();
				}
			}, 3500);

		}, 200);
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
				muteBtn.classList.remove('is-muted'); // CSS handles the icon swap
				muteBtn.setAttribute('aria-label', 'Mute background music');
			} else {
				bgMusic.pause();
				muteBtn.classList.add('is-muted'); // CSS handles the icon swap
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
	// 7. ADD TO CALENDAR (.ics) GENERATOR + FALLBACK
	// ==========================================
	const calendarBtn = document.getElementById('add-to-calendar-btn');

	if (calendarBtn) {
		calendarBtn.addEventListener('click', (e) => {
			e.preventDefault();

			// Detect if we are in an in-app browser like Messenger
			const isInApp = /FBAN|FBAV|Messenger/i.test(navigator.userAgent);

			if (isInApp) {
				// The .ics download will fail here.
				// We will redirect to the Google Calendar link instead.
				const googleCalendarUrl = "https://calendar.google.com/calendar/render?action=TEMPLATE&text=Szhawn's+1st+Birthday+and+Baptism&dates=20261213T040000Z/20261213T080000Z&details=Join+us+in+celebrating+Szhawn's+1st+Birthday+and+Baptism!&location=San+Francisco+de+Assisi+Parish+Church+%26+Government+Center,+Meycauayan,+Bulacan";
				window.open(googleCalendarUrl, '_blank');
				return;
			}

			// Original .ics generation for standard browsers
			const title = "Szhawn's 1st Birthday and Baptism";
			const location = "San Francisco de Assisi Parish Church & Government Center, Meycauayan, Bulacan";
			const description = "Baptism at 12:00 NN at San Francisco de Assisi Parish. Reception at 1:00 PM at Government Center. We can't wait to celebrate with you!";

			// 12:00 PM PHT (GMT+8) is 04:00 AM UTC.
			const startTime = "20261213T040000Z";
			// 4:00 PM PHT (GMT+8) is 08:00 AM UTC.
			const endTime = "20261213T080000Z";

			const icsLines = [
				"BEGIN:VCALENDAR",
				"VERSION:2.0",
				"PRODID:-//Szhawn Invite//EN",
				"CALSCALE:GREGORIAN",
				"METHOD:PUBLISH",
				"BEGIN:VEVENT",
				`UID:${Date.now()}@szhawnparty.com`,
				`DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
				`DTSTART:${startTime}`,
				`DTEND:${endTime}`,
				`SUMMARY:${title}`,
				`LOCATION:${location}`,
				`DESCRIPTION:${description}`,
				"STATUS:CONFIRMED",
				"SEQUENCE:0",
				"END:VEVENT",
				"END:VCALENDAR"
			];

			const icsContent = icsLines.join("\r\n");
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
	// 9. RSVP FORM HANDLING (Validation & AJAX)
	// ==========================================
	const form = document.getElementById('rsvp-form');
	if (form) {
		const fieldsContainer = document.getElementById('form-fields');
		const successMessage = document.getElementById('form-success');
		const submitBtn = document.getElementById('submit-btn');
		const btnText = document.getElementById('btn-text');
		const btnIcon = document.getElementById('btn-icon');

		form.addEventListener('submit', function (e) {
			e.preventDefault(); // Prevent standard page reload

			// 1. Basic Validation Check
			let isValid = true;
			const nameInput = document.getElementById('name');
			const attendanceInputs = document.querySelectorAll('input[name="attendance"]');

			// Remove old error states
			document.querySelectorAll('.form-group').forEach(el => el.classList.remove('has-error'));

			// Check Name
			if (nameInput.value.trim() === '') {
				nameInput.parentElement.classList.add('has-error');
				isValid = false;
			}

			// Check Attendance (Radio Buttons)
			let attendanceSelected = false;
			attendanceInputs.forEach(input => {
				if (input.checked) attendanceSelected = true;
			});
			if (!attendanceSelected) {
				document.querySelector('.attendance-toggle').parentElement.classList.add('has-error');
				isValid = false;
			}

			if (!isValid) {
				// Stop submission and gently shake the form
				form.style.animation = 'none';
				setTimeout(() => { form.style.animation = 'shake 0.4s ease'; }, 10);
				return;
			}

			// 2. Prepare for AJAX Submission
			btnText.innerText = "Sending...";
			btnIcon.style.display = 'none'; // Hide the paper plane icon
			submitBtn.disabled = true;

			// 3. Send data to Web3Forms via Fetch API
			const formData = new FormData(form);

			fetch(form.action, {
				method: 'POST',
				body: formData
			})
				.then(response => response.json())
				.then(data => {
					if (data.success) {
						// 4. Show Success Message (Hide Form)
						fieldsContainer.style.display = 'none';
						successMessage.classList.remove('hidden');
					} else {
						// Handle Web3Forms errors (e.g., invalid access key)
						alert("Something went wrong. Please check your Web3Forms access key.");
						resetButton();
					}
				})
				.catch(error => {
					console.error('Error:', error);
					alert("Network error. Please try again.");
					resetButton();
				});

			function resetButton() {
				btnText.innerText = "Send RSVP Response";
				btnIcon.style.display = 'block';
				submitBtn.disabled = false;
			}
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

	// ==========================================
	// 11. PREMIUM CAROUSEL LOGIC
	// ==========================================
	const carousel = document.getElementById('milestone-carousel');
	const slides = document.querySelectorAll('.carousel-slide');
	const dotsContainer = document.getElementById('carousel-dots');
	const prevBtn = document.getElementById('prev-btn');
	const nextBtn = document.getElementById('next-btn');

	if (carousel && slides.length > 0) {
		let currentIndex = 0;
		let autoPlayInterval;
		const intervalTime = 3500; // 3.5 seconds per slide

		// 1. Generate Dots dynamically
		slides.forEach((_, index) => {
			const dot = document.createElement('div');
			dot.classList.add('dot');
			if (index === 0) dot.classList.add('active');
			dot.addEventListener('click', () => goToSlide(index));
			dotsContainer.appendChild(dot);
		});

		const dots = document.querySelectorAll('.dot');

		// 2. The function to change slides
		const goToSlide = (index) => {
			// Remove active class from current
			slides[currentIndex].classList.remove('active');
			dots[currentIndex].classList.remove('active');

			// Update index (handle looping)
			currentIndex = (index + slides.length) % slides.length;

			// Add active class to new
			slides[currentIndex].classList.add('active');
			dots[currentIndex].classList.add('active');
		};

		// 3. AutoPlay Functions
		const startAutoPlay = () => {
			autoPlayInterval = setInterval(() => {
				goToSlide(currentIndex + 1);
			}, intervalTime);
		};

		const stopAutoPlay = () => {
			clearInterval(autoPlayInterval);
		};

		// 4. Arrow Click Listeners
		prevBtn.addEventListener('click', () => {
			goToSlide(currentIndex - 1);
			stopAutoPlay();
			startAutoPlay(); // Reset timer
		});

		nextBtn.addEventListener('click', () => {
			goToSlide(currentIndex + 1);
			stopAutoPlay();
			startAutoPlay(); // Reset timer
		});

		// 5. Pause on Hover (Desktop)
		carousel.addEventListener('mouseenter', stopAutoPlay);
		carousel.addEventListener('mouseleave', startAutoPlay);

		// 6. Swipe Support (Mobile)
		let touchStartX = 0;
		let touchEndX = 0;

		carousel.addEventListener('touchstart', (e) => {
			touchStartX = e.changedTouches[0].screenX;
			stopAutoPlay(); // Pause while swiping
		}, { passive: true });

		carousel.addEventListener('touchend', (e) => {
			touchEndX = e.changedTouches[0].screenX;
			handleSwipe();
			startAutoPlay(); // Resume after swipe
		}, { passive: true });

		const handleSwipe = () => {
			const swipeThreshold = 50; // Minimum distance to trigger a swipe

			if (touchEndX < touchStartX - swipeThreshold) {
				// Swiped Left -> Next Slide
				goToSlide(currentIndex + 1);
			} else if (touchEndX > touchStartX + swipeThreshold) {
				// Swiped Right -> Prev Slide
				goToSlide(currentIndex - 1);
			}
		};

		// 7. Start the carousel
		startAutoPlay();
	}

});