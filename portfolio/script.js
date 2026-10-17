const navToggle = document.querySelector('.nav-toggle');
const mainNav = document.querySelector('.site-nav');
const revealItems = document.querySelectorAll('.reveal');
const year = document.getElementById('year');

const mouseGlow = document.querySelector('.mouse-glow');

if (mouseGlow) {
  window.addEventListener('pointermove', (event) => {
    if (event.pointerType !== 'mouse') {
      return;
    }

    mouseGlow.style.transform = `translate3d(${event.clientX}px, ${event.clientY}px, 0) translate(-50%, -50%)`;
    mouseGlow.classList.add('visible');
  });

  document.documentElement.addEventListener('pointerleave', () => {
    mouseGlow.classList.remove('visible');
  });

  window.addEventListener('blur', () => {
    mouseGlow.classList.remove('visible');
  });
}

const particleCanvas = document.querySelector('.orbit-particles');

if (particleCanvas instanceof HTMLCanvasElement) {
  const context = particleCanvas.getContext('2d');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  if (context) {
    const particles = Array.from({ length: 110 }, () => ({
    angle: Math.random() * Math.PI * 2,
    radius: Math.random() * (Math.min(window.innerWidth, window.innerHeight) * 0.46) + 40,
    speed: (Math.random() * 0.003 + 0.001) * (Math.random() > 0.5 ? 1 : -1),
    size: Math.random() * 1.8 + 0.6,
    opacity: Math.random() * 0.55 + 0.2,
    pulse: Math.random() * Math.PI,
    }));
    let animationFrame = 0;
    let width = 0;
    let height = 0;
    let pixelRatio = 1;

    const resizeCanvas = () => {
    width = window.innerWidth;
    height = window.innerHeight;
    pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    particleCanvas.width = Math.round(width * pixelRatio);
    particleCanvas.height = Math.round(height * pixelRatio);
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    };

    const render = (animate) => {
    context.clearRect(0, 0, width, height);
    const centerX = width / 2;
    const centerY = height / 2;
      const coordinates = particles.map((particle) => {
        if (animate) {
          particle.angle += particle.speed;
          particle.pulse += 0.02;
        }

        const x = centerX + Math.cos(particle.angle) * particle.radius;
        const y = centerY + Math.sin(particle.angle) * particle.radius * 0.68;
        const opacity = particle.opacity * (0.65 + 0.35 * Math.sin(particle.pulse));

        context.beginPath();
        context.arc(x, y, particle.size, 0, Math.PI * 2);
        context.fillStyle = `rgba(65, 202, 255, ${opacity})`;
        context.shadowBlur = 8;
        context.shadowColor = '#00cfff';
        context.fill();

        return { x, y };
      });

    context.shadowBlur = 0;
    context.lineWidth = 0.55;
    for (let first = 0; first < coordinates.length; first += 1) {
      for (let second = first + 1; second < coordinates.length; second += 1) {
        const deltaX = coordinates[first].x - coordinates[second].x;
        const deltaY = coordinates[first].y - coordinates[second].y;
        const distance = Math.hypot(deltaX, deltaY);

        if (distance < 80) {
          context.beginPath();
          context.moveTo(coordinates[first].x, coordinates[first].y);
          context.lineTo(coordinates[second].x, coordinates[second].y);
          context.strokeStyle = `rgba(0, 210, 255, ${(1 - distance / 80) * 0.16})`;
          context.stroke();
        }
      }
    }

    if (animate && !document.hidden) {
      animationFrame = window.requestAnimationFrame(() => render(true));
    }
    };

    const startAnimation = () => {
    window.cancelAnimationFrame(animationFrame);
    render(!reducedMotion.matches);
    };

    resizeCanvas();
    startAnimation();
    window.addEventListener('resize', () => {
    resizeCanvas();
    startAnimation();
    });
    document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      window.cancelAnimationFrame(animationFrame);
    } else if (!reducedMotion.matches) {
      animationFrame = window.requestAnimationFrame(() => render(true));
    }
    });
    reducedMotion.addEventListener('change', startAnimation);
  }
}

if (year) {
  year.textContent = new Date().getFullYear();
}

if (navToggle && mainNav) {
  navToggle.addEventListener('click', () => {
    const isOpen = mainNav.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
  });

  mainNav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      mainNav.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });
}

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12 }
);

revealItems.forEach((item) => observer.observe(item));
