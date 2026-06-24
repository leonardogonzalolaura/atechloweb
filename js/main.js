document.addEventListener('DOMContentLoaded', function () {
    // ============================================
    // NAVBAR: Scroll effect + Mobile menu + Dropdowns
    // ============================================
    window.addEventListener('scroll', function () {
        const navbar = document.querySelector('.navbar');
        if (navbar) {
            if (window.scrollY > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        }
    });

    const menuToggle = document.getElementById('mobile-menu');
    const navLinks = document.getElementById('nav-links');

    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            menuToggle.classList.toggle('is-active');
        });
    }

    document.querySelectorAll('.dropdown').forEach(dropdown => {
        const link = dropdown.querySelector('a');
        if (link) {
            link.addEventListener('click', function (e) {
                if (window.innerWidth <= 992) {
                    if (dropdown.querySelector('.dropdown-content')) {
                        e.preventDefault();
                        dropdown.classList.toggle('active');
                    }
                }
            });
        }
    });

    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', function () {
            if (window.innerWidth <= 992) {
                const isDropdownLink = link.parentElement.classList.contains('dropdown');
                if (!isDropdownLink) {
                    if (navLinks) navLinks.classList.remove('active');
                    if (menuToggle) menuToggle.classList.remove('is-active');
                }
            }
        });
    });

    // ============================================
    // PARTICLES BACKGROUND
    // ============================================
    const canvas = document.getElementById('particles');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const particles = [];
        for (let i = 0; i < 60; i++) {
            particles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                size: Math.random() * 3 + 1,
                speedX: Math.random() * 1 - 0.5,
                speedY: Math.random() * 1 - 0.5
            });
        }

        function animateParticles() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = 'rgba(52, 152, 219, 0.5)';
            particles.forEach(particle => {
                particle.x += particle.speedX;
                particle.y += particle.speedY;
                if (particle.x < 0 || particle.x > canvas.width) particle.speedX *= -1;
                if (particle.y < 0 || particle.y > canvas.height) particle.speedY *= -1;
                ctx.beginPath();
                ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
                ctx.fill();
            });
            requestAnimationFrame(animateParticles);
        }
        animateParticles();

        window.addEventListener('resize', function () {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        });
    }

    // ============================================
    // CAROUSEL
    // ============================================
    const slides = document.querySelectorAll('.carousel-slide');
    const indicators = document.querySelectorAll('.indicator');
    const prevBtn = document.querySelector('.carousel-control.prev');
    const nextBtn = document.querySelector('.carousel-control.next');
    const carouselContainer = document.querySelector('.carousel-container');

    if (slides.length && prevBtn && nextBtn) {
        let currentIndex = 0;
        let autoAdvance = setInterval(nextSlide, 5000);

        function updateCarousel() {
            slides.forEach((slide, index) => {
                slide.classList.toggle('active', index === currentIndex);
            });
            indicators.forEach((indicator, index) => {
                indicator.classList.toggle('active', index === currentIndex);
            });
        }

        function nextSlide() {
            currentIndex = (currentIndex + 1) % slides.length;
            updateCarousel();
        }

        function prevSlide() {
            currentIndex = (currentIndex - 1 + slides.length) % slides.length;
            updateCarousel();
        }

        function pauseAutoAdvance() {
            clearInterval(autoAdvance);
        }

        function resumeAutoAdvance() {
            clearInterval(autoAdvance);
            autoAdvance = setInterval(nextSlide, 5000);
        }

        nextBtn.addEventListener('click', function () {
            nextSlide();
            pauseAutoAdvance();
            setTimeout(resumeAutoAdvance, 10000);
        });

        prevBtn.addEventListener('click', function () {
            prevSlide();
            pauseAutoAdvance();
            setTimeout(resumeAutoAdvance, 10000);
        });

        if (carouselContainer) {
            carouselContainer.addEventListener('mouseenter', pauseAutoAdvance);
            carouselContainer.addEventListener('mouseleave', resumeAutoAdvance);
        }

        indicators.forEach((indicator, index) => {
            indicator.addEventListener('click', () => {
                currentIndex = index;
                updateCarousel();
                pauseAutoAdvance();
                setTimeout(resumeAutoAdvance, 10000);
            });
        });
    }

    // ============================================
    // SCROLL ANIMATIONS (banerservice.js)
    // ============================================
    const animateElements = document.querySelectorAll('.animate-on-scroll');
    if (animateElements.length) {
        const checkScroll = () => {
            animateElements.forEach(element => {
                if (!element) return;
                const elementPosition = element.getBoundingClientRect().top;
                const windowHeight = window.innerHeight;
                if (elementPosition < windowHeight * 0.8 && !element.classList.contains('animated')) {
                    element.classList.add('animated');
                    element.style.opacity = '1';
                    element.style.transform = 'translateY(0)';
                }
            });
        };
        window.addEventListener('scroll', () => {
            requestAnimationFrame(checkScroll);
        });
        checkScroll();
    }

    // ============================================
    // PAGE TRANSITIONS (pagina.js)
    // ============================================
    document.querySelectorAll('a.interest-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            document.body.classList.add('animate__animated', 'animate__fadeOut');
            setTimeout(() => {
                window.location.href = btn.getAttribute('href');
            }, 500);
        });
    });

    // ============================================
    // COUNTER ANIMATION (stas.js) - Fixed
    // ============================================
    const counters = document.querySelectorAll('.stat-value');
    if (counters.length) {
        const animateCounters = () => {
            counters.forEach(counter => {
                const target = parseInt(counter.getAttribute('data-count')) || 0;
                const current = parseInt(counter.innerText) || 0;
                if (current < target) {
                    const increment = Math.ceil((target - current) / 20) || 1;
                    counter.innerText = Math.min(current + increment, target);
                }
            });
            let allDone = true;
            counters.forEach(counter => {
                const target = parseInt(counter.getAttribute('data-count')) || 0;
                const current = parseInt(counter.innerText) || 0;
                if (current < target) allDone = false;
            });
            if (!allDone) {
                requestAnimationFrame(animateCounters);
            }
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animateCounters();
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });

        document.querySelectorAll('.stat-card').forEach(card => {
            observer.observe(card);
        });
    }

    // ============================================
    // CONTACT FORM HANDLING
    // ============================================
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', async function (e) {
            e.preventDefault();
            const submitBtn = contactForm.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn.innerText;
            submitBtn.innerText = 'Enviando...';
            submitBtn.disabled = true;
            const formData = new FormData(contactForm);
            try {
                const response = await fetch(contactForm.action, {
                    method: 'POST',
                    body: formData,
                    headers: { 'Accept': 'application/json' }
                });
                if (response.ok) {
                    submitBtn.innerText = '¡Enviado!';
                    submitBtn.style.background = '#82f065';
                    contactForm.reset();
                    setTimeout(() => {
                        submitBtn.innerText = originalBtnText;
                        submitBtn.disabled = false;
                        submitBtn.style.background = '';
                    }, 4000);
                } else {
                    throw new Error();
                }
            } catch (error) {
                submitBtn.innerText = 'Error';
                submitBtn.style.background = '#ff4d4d';
                setTimeout(() => {
                    submitBtn.innerText = originalBtnText;
                    submitBtn.disabled = false;
                    submitBtn.style.background = '';
                }, 3000);
            }
        });
    }
});
