(() => {
  "use strict";

  const WA_NUMBER = "8781219700";
  const body = document.body;
  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* =========================================================
     LOADER
     ========================================================= */
  const loader = document.getElementById("loading-screen");
  const loaderFill = document.getElementById("loader-fill");
  const loaderPct = document.getElementById("loader-pct");
  let loaderFinished = false;

  const revealSite = () => {
    if (loaderFinished) return;
    loaderFinished = true;
    if (loaderFill) loaderFill.style.width = "100%";
    if (loaderPct) loaderPct.textContent = "100%";

    window.setTimeout(() => {
      loader?.classList.add("is-done");
      document.documentElement.classList.remove("is-loading");
      body.classList.add("is-ready");
      window.setTimeout(() => loader?.classList.add("is-gone"), 1100);
      window.setTimeout(() => {
        document.querySelectorAll(".hero-title .text-sun").forEach((el) => el.classList.add("is-lit"));
      }, 1150);
    }, 220);
  };

  if (!loader) {
    document.documentElement.classList.remove("is-loading");
    body.classList.add("is-ready");
  } else if (prefersReduced) {
    window.setTimeout(revealSite, 280);
  } else {
    const MIN_MS = 1300;
    const MAX_MS = 2800;
    const started = performance.now();
    let pageLoaded = document.readyState === "complete";
    let shown = 0;
    let target = 0;

    window.addEventListener("load", () => { pageLoaded = true; });

    const tickLoader = (now) => {
      const elapsed = now - started;
      const ceiling = pageLoaded ? 100 : 90;
      const paced = Math.min(100, (elapsed / MIN_MS) * 100);
      target = Math.max(target, Math.min(ceiling, paced));
      shown += (target - shown) * 0.16;

      const value = Math.min(100, Math.round(shown));
      if (loaderFill) loaderFill.style.width = `${value}%`;
      if (loaderPct) loaderPct.textContent = `${value}%`;

      if ((shown > 99.2 && elapsed > MIN_MS) || elapsed > MAX_MS) {
        revealSite();
        return;
      }
      window.requestAnimationFrame(tickLoader);
    };

    window.requestAnimationFrame(tickLoader);
    window.setTimeout(revealSite, MAX_MS + 400);
  }

  /* =========================================================
     NAV
     ========================================================= */
  const header = document.getElementById("site-header");
  const navToggle = document.getElementById("nav-toggle");
  const mainNav = document.getElementById("main-nav");
  const navLinks = document.querySelectorAll(".nav-link");
  let navScrollY = 0;

  const openNav = () => {
    if (body.classList.contains("nav-open")) return;
    navScrollY = window.scrollY;
    body.style.top = `-${navScrollY}px`;
    body.classList.add("nav-open");
    navToggle?.setAttribute("aria-expanded", "true");
  };

  const closeNav = () => {
    if (!body.classList.contains("nav-open")) return;
    body.classList.remove("nav-open");
    body.style.top = "";
    window.scrollTo(0, navScrollY);
    navToggle?.setAttribute("aria-expanded", "false");
  };

  navToggle?.addEventListener("click", () => {
    body.classList.contains("nav-open") ? closeNav() : openNav();
  });

  navLinks.forEach((link) => link.addEventListener("click", closeNav));

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && body.classList.contains("nav-open")) closeNav();
  });

  /* =========================================================
     WHATSAPP MODAL
     ========================================================= */
  const waModal = document.getElementById("wa-modal");
  const waTriggers = document.querySelectorAll("[data-wa-trigger]");
  const waCloseEls = document.querySelectorAll("[data-wa-close]");
  const waOptions = document.querySelectorAll(".wa-modal-option");
  let waLastFocused = null;

  const openWaModal = () => {
    if (!waModal) return;
    closeNav();
    waLastFocused = document.activeElement;
    waModal.classList.add("is-open");
    waModal.setAttribute("aria-hidden", "false");
    body.classList.add("wa-modal-open");
    waModal.querySelector(".wa-modal-close")?.focus();
  };

  const closeWaModal = () => {
    if (!waModal) return;
    waModal.classList.remove("is-open");
    waModal.setAttribute("aria-hidden", "true");
    body.classList.remove("wa-modal-open");
    if (waLastFocused instanceof HTMLElement) waLastFocused.focus();
  };

  waTriggers.forEach((trigger) => trigger.addEventListener("click", openWaModal));
  waCloseEls.forEach((el) => el.addEventListener("click", closeWaModal));
  waOptions.forEach((option) => option.addEventListener("click", closeWaModal));

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && waModal?.classList.contains("is-open")) closeWaModal();
  });

  /* =========================================================
     CONTACT FORM -> WHATSAPP
     ========================================================= */
  const contactForm = document.getElementById("contact-form");
  const formStatus = document.getElementById("form-status");

  if (contactForm) {
    const nameField = document.getElementById("cf-name");
    const phoneField = document.getElementById("cf-phone");
    const typeField = document.getElementById("cf-type");
    const messageField = document.getElementById("cf-message");
    const required = [nameField, phoneField, typeField].filter(Boolean);

    required.forEach((field) => {
      field.addEventListener("input", () => field.closest(".field")?.classList.remove("has-error"));
      field.addEventListener("change", () => field.closest(".field")?.classList.remove("has-error"));
    });

    contactForm.addEventListener("submit", (event) => {
      event.preventDefault();
      formStatus?.classList.remove("is-visible");

      let valid = true;
      required.forEach((field) => {
        const empty = !field.value.trim();
        field.closest(".field")?.classList.toggle("has-error", empty);
        if (empty) valid = false;
      });
      if (!valid) {
        required.find((field) => !field.value.trim())?.focus();
        return;
      }

      const typeLabel = typeField.options[typeField.selectedIndex]?.text || typeField.value;
      const lines = [
        "Hola, quiero cotizar un sistema solar con Lesaran Electric.",
        `Nombre: ${nameField.value.trim()}`,
        `Teléfono: ${phoneField.value.trim()}`,
        `Tipo de propiedad: ${typeLabel}`
      ];
      if (messageField && messageField.value.trim()) lines.push(`Consumo o dudas: ${messageField.value.trim()}`);

      const text = encodeURIComponent(lines.join("\n"));
      window.open(`https://wa.me/${WA_NUMBER}?text=${text}`, "_blank", "noopener");

      if (formStatus) {
        formStatus.classList.add("is-visible");
        window.setTimeout(() => formStatus.classList.remove("is-visible"), 7000);
      }
      contactForm.reset();
    });
  }

  /* =========================================================
     LIGHTBOX
     ========================================================= */
  const lightbox = document.getElementById("lightbox");
  const lightboxImage = document.getElementById("lightbox-image");
  const lightboxCaption = document.getElementById("lightbox-caption");
  const lightboxCurrent = document.getElementById("lightbox-current");
  const lightboxTotal = document.getElementById("lightbox-total");
  const lightboxCloseEls = document.querySelectorAll("[data-lightbox-close]");
  const lightboxPrevBtn = document.querySelector("[data-lightbox-prev]");
  const lightboxNextBtn = document.querySelector("[data-lightbox-next]");
  const lightboxTriggers = [...document.querySelectorAll("[data-lightbox-open]")];
  const lightboxSlides = [...document.querySelectorAll(".gallery-item img")].map((img) => ({
    src: img.currentSrc || img.src,
    alt: img.alt || ""
  }));

  let lightboxIndex = 0;
  let lightboxLastFocused = null;

  const renderLightboxSlide = () => {
    if (!lightbox || !lightboxImage || !lightboxSlides.length) return;
    const slide = lightboxSlides[lightboxIndex];
    lightboxImage.classList.remove("is-loaded");

    const applySlide = () => {
      lightboxImage.src = slide.src;
      lightboxImage.alt = slide.alt;
      requestAnimationFrame(() => lightboxImage.classList.add("is-loaded"));
    };

    const preload = new Image();
    preload.onload = applySlide;
    preload.onerror = applySlide;
    preload.src = slide.src;

    if (lightboxCaption) lightboxCaption.textContent = slide.alt;
    if (lightboxCurrent) lightboxCurrent.textContent = String(lightboxIndex + 1);
    if (lightboxTotal) lightboxTotal.textContent = String(lightboxSlides.length);
  };

  const openLightbox = (index) => {
    if (!lightbox || !lightboxSlides.length) return;
    lightboxIndex = ((index % lightboxSlides.length) + lightboxSlides.length) % lightboxSlides.length;
    lightboxLastFocused = document.activeElement;
    renderLightboxSlide();
    lightbox.classList.add("is-open");
    lightbox.setAttribute("aria-hidden", "false");
    body.classList.add("lightbox-open");
    lightbox.querySelector(".lightbox-close")?.focus();
  };

  const closeLightbox = () => {
    if (!lightbox) return;
    lightbox.classList.remove("is-open");
    lightbox.setAttribute("aria-hidden", "true");
    body.classList.remove("lightbox-open");
    if (lightboxLastFocused instanceof HTMLElement) lightboxLastFocused.focus();
  };

  const stepLightbox = (delta) => {
    if (!lightboxSlides.length) return;
    lightboxIndex = ((lightboxIndex + delta) % lightboxSlides.length + lightboxSlides.length) % lightboxSlides.length;
    renderLightboxSlide();
  };

  lightboxTriggers.forEach((trigger) => {
    trigger.addEventListener("click", () => openLightbox(Number(trigger.dataset.lightboxIndex || 0)));
  });

  lightboxCloseEls.forEach((el) => el.addEventListener("click", closeLightbox));
  lightboxPrevBtn?.addEventListener("click", () => stepLightbox(-1));
  lightboxNextBtn?.addEventListener("click", () => stepLightbox(1));

  document.addEventListener("keydown", (event) => {
    if (!lightbox?.classList.contains("is-open")) return;
    if (event.key === "Escape") closeLightbox();
    if (event.key === "ArrowLeft") stepLightbox(-1);
    if (event.key === "ArrowRight") stepLightbox(1);
  });

  /* =========================================================
     TITLES: word-by-word rise + sun sweep
     ========================================================= */
  const riseTargets = document.querySelectorAll(".section-title, .statement-content h2");

  const wrapRiseWords = (el) => {
    [...el.childNodes].forEach((node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent;
        if (!text.trim()) return;
        const frag = document.createDocumentFragment();
        text.split(/(\s+)/).forEach((chunk) => {
          if (!chunk) return;
          if (/^\s+$/.test(chunk)) { frag.appendChild(document.createTextNode(chunk)); return; }
          const outer = document.createElement("span");
          outer.className = "rise-word";
          const inner = document.createElement("span");
          inner.className = "rise-word-inner";
          inner.textContent = chunk;
          outer.appendChild(inner);
          frag.appendChild(outer);
        });
        node.replaceWith(frag);
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        const outer = document.createElement("span");
        outer.className = "rise-word";
        const inner = document.createElement("span");
        inner.className = "rise-word-inner";
        node.replaceWith(outer);
        inner.appendChild(node);
        outer.appendChild(inner);
      }
    });
  };

  if (!prefersReduced) {
    riseTargets.forEach((el) => { wrapRiseWords(el); el.removeAttribute("data-reveal"); });

    const riseObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const words = [...entry.target.querySelectorAll(".rise-word")];
          words.forEach((word, index) => {
            word.style.setProperty("--wd", `${Math.min(index, 10) * 50}ms`);
            word.classList.add("is-visible");
          });
          window.setTimeout(() => {
            entry.target.querySelectorAll(".text-sun").forEach((el) => el.classList.add("is-lit"));
          }, words.length * 50 + 380);
          riseObserver.unobserve(entry.target);
        });
      },
      { threshold: 0.35, rootMargin: "0px 0px -10% 0px" }
    );

    riseTargets.forEach((el) => riseObserver.observe(el));
  }

  /* =========================================================
     SCROLL REVEAL (staggered)
     ========================================================= */
  const grouped = new Set();
  const revealGroups = document.querySelectorAll("[data-reveal-group]");

  const groupObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const items = entry.target.querySelectorAll("[data-reveal]");
        items.forEach((item, index) => {
          item.style.setProperty("--rd", `${Math.min(index, 9) * 80}ms`);
          item.classList.add("is-visible");
        });
        groupObserver.unobserve(entry.target);
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
  );

  revealGroups.forEach((group) => {
    group.querySelectorAll("[data-reveal]").forEach((item) => grouped.add(item));
    groupObserver.observe(group);
  });

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      });
    },
    { threshold: 0.14, rootMargin: "0px 0px -8% 0px" }
  );

  document.querySelectorAll("[data-reveal]").forEach((el) => {
    if (!grouped.has(el)) revealObserver.observe(el);
  });

  /* =========================================================
     TIMELINE: step lights up once reached
     ========================================================= */
  const timelineSteps = [...document.querySelectorAll(".timeline-step")];
  if (timelineSteps.length) {
    const timelineObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => entry.target.classList.toggle("is-active", entry.isIntersecting));
      },
      { threshold: 0.5, rootMargin: "0px 0px -15% 0px" }
    );
    timelineSteps.forEach((step) => timelineObserver.observe(step));
  }

  /* =========================================================
     HEADER: compact on scroll, progress bar, active link
     ========================================================= */
  const progressBar = document.getElementById("scroll-progress");
  const sections = [...document.querySelectorAll("main section[id]")];
  let scrollTicking = false;
  let lastScrollY = window.scrollY;

  const onScroll = () => {
    const scrollY = window.scrollY;
    const viewport = window.innerHeight;

    header?.classList.toggle("is-scrolled", scrollY > 16);

    if (header) {
      const delta = scrollY - lastScrollY;
      if (scrollY < 120) header.classList.remove("is-compact");
      else if (delta > 3) header.classList.add("is-compact");
      else if (delta < -3) header.classList.remove("is-compact");
      lastScrollY = scrollY;
    }

    if (progressBar) {
      const max = document.documentElement.scrollHeight - viewport;
      const ratio = max > 0 ? Math.min(1, scrollY / max) : 0;
      progressBar.style.width = `${ratio * 100}%`;
    }

    if (sections.length) {
      const offset = viewport * 0.34;
      const current = sections.reduce(
        (active, section) => (section.offsetTop <= scrollY + offset ? section : active),
        sections[0]
      );
      navLinks.forEach((link) => link.classList.toggle("is-active", link.getAttribute("href") === `#${current?.id}`));
    }

    scrollTicking = false;
  };

  const requestScroll = () => {
    if (scrollTicking) return;
    scrollTicking = true;
    window.requestAnimationFrame(onScroll);
  };

  onScroll();
  window.addEventListener("scroll", requestScroll, { passive: true });
  window.addEventListener("resize", requestScroll);
  window.addEventListener("load", () => window.setTimeout(onScroll, 120));

  /* =========================================================
     PARALLAX: photo layers drift slower than scroll
     ========================================================= */
  if (!prefersReduced) {
    const parallaxLayers = [...document.querySelectorAll("[data-parallax-layer]")].map((el) => ({
      el,
      strength: Number(el.dataset.parallaxLayer) || 0.14
    }));

    if (parallaxLayers.length) {
      let parallaxTicking = false;
      const runParallax = () => {
        const viewport = window.innerHeight;
        parallaxLayers.forEach(({ el, strength }) => {
          const host = el.parentElement;
          if (!host) return;
          const rect = host.getBoundingClientRect();
          if (rect.bottom < 0 || rect.top > viewport) return;
          const centerDelta = rect.top + rect.height / 2 - viewport / 2;
          el.style.transform = `translate3d(0, ${(-centerDelta * strength).toFixed(1)}px, 0) scale(1.14)`;
        });
        parallaxTicking = false;
      };
      const requestParallax = () => {
        if (parallaxTicking) return;
        parallaxTicking = true;
        window.requestAnimationFrame(runParallax);
      };
      runParallax();
      window.addEventListener("scroll", requestParallax, { passive: true });
      window.addEventListener("resize", requestParallax);
    }
  }

  /* =========================================================
     HERO PARTICLES: drifting energy sparks, brand-colored
     ========================================================= */
  const canvas = document.getElementById("particles-canvas");
  const ctx = canvas?.getContext("2d");
  const hero = document.querySelector(".hero");

  if (canvas && ctx && hero) {
    const LINK_DISTANCE = 128;
    const TONES = { green: "31, 163, 92", amber: "245, 166, 35", paper: "245, 247, 250" };
    let width = 0;
    let height = 0;
    let particles = [];
    let animationFrame = null;
    let running = false;
    const pointer = { x: 0, y: 0, tx: 0, ty: 0 };

    const makeSprite = (rgb) => {
      const sprite = document.createElement("canvas");
      const size = 46;
      sprite.width = size;
      sprite.height = size;
      const sctx = sprite.getContext("2d");
      const gradient = sctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
      gradient.addColorStop(0, `rgba(${rgb}, 0.95)`);
      gradient.addColorStop(0.2, `rgba(${rgb}, 0.5)`);
      gradient.addColorStop(0.5, `rgba(${rgb}, 0.12)`);
      gradient.addColorStop(1, `rgba(${rgb}, 0)`);
      sctx.fillStyle = gradient;
      sctx.fillRect(0, 0, size, size);
      return sprite;
    };

    const sprites = { green: makeSprite(TONES.green), amber: makeSprite(TONES.amber) };

    const pickSprite = () => (Math.random() > 0.72 ? { sprite: sprites.amber, core: TONES.amber } : { sprite: sprites.green, core: TONES.green });

    const createParticles = () => {
      const density = width < 720 ? 16000 : 11500;
      const count = Math.max(24, Math.min(88, Math.round((width * height) / density)));
      particles = Array.from({ length: count }, () => {
        const tone = pickSprite();
        return {
          x: Math.random() * width,
          y: Math.random() * height,
          radius: Math.random() * 1.4 + 0.7,
          speedX: (Math.random() - 0.5) * 0.2,
          speedY: -Math.abs((Math.random() - 0.5) * 0.22) - 0.05,
          alpha: Math.random() * 0.5 + 0.35,
          pulse: Math.random() * Math.PI * 2,
          depth: Math.random() * 0.8 + 0.2,
          sprite: tone.sprite,
          core: tone.core
        };
      });
    };

    const resizeCanvas = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      width = hero.offsetWidth;
      height = hero.offsetHeight;
      canvas.width = Math.floor(width * ratio);
      canvas.height = Math.floor(height * ratio);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      createParticles();
    };

    const drawFrame = () => {
      ctx.clearRect(0, 0, width, height);
      pointer.x += (pointer.tx - pointer.x) * 0.045;
      pointer.y += (pointer.ty - pointer.y) * 0.045;

      for (let i = 0; i < particles.length; i += 1) {
        const p = particles[i];
        p.x += p.speedX;
        p.y += p.speedY;
        p.pulse += 0.012;
        if (p.y < -12) p.y = height + 12;
        if (p.y > height + 12) p.y = -12;
        if (p.x < -12) p.x = width + 12;
        if (p.x > width + 12) p.x = -12;
        p.px = p.x + pointer.x * p.depth;
        p.py = p.y + pointer.y * p.depth;
      }

      ctx.lineWidth = 1;
      for (let i = 0; i < particles.length; i += 1) {
        const a = particles[i];
        for (let j = i + 1; j < particles.length; j += 1) {
          const b = particles[j];
          const dist = Math.hypot(a.px - b.px, a.py - b.py);
          if (dist > LINK_DISTANCE) continue;
          const strength = (1 - dist / LINK_DISTANCE) * 0.18;
          ctx.strokeStyle = `rgba(${TONES.paper}, ${strength.toFixed(3)})`;
          ctx.beginPath();
          ctx.moveTo(a.px, a.py);
          ctx.lineTo(b.px, b.py);
          ctx.stroke();
        }
      }

      for (let i = 0; i < particles.length; i += 1) {
        const p = particles[i];
        const flicker = 0.78 + Math.sin(p.pulse) * 0.22;
        const glow = p.radius * 11;
        ctx.globalAlpha = p.alpha * flicker;
        ctx.drawImage(p.sprite, p.px - glow / 2, p.py - glow / 2, glow, glow);
        ctx.globalAlpha = 1;
        ctx.beginPath();
        ctx.arc(p.px, p.py, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.core}, ${(p.alpha * flicker).toFixed(3)})`;
        ctx.fill();
      }

      ctx.globalAlpha = 1;
      animationFrame = window.requestAnimationFrame(drawFrame);
    };

    const start = () => { if (running || prefersReduced) return; running = true; animationFrame = window.requestAnimationFrame(drawFrame); };
    const stop = () => { running = false; if (animationFrame) window.cancelAnimationFrame(animationFrame); animationFrame = null; };

    resizeCanvas();

    if (prefersReduced) {
      particles.forEach((p) => {
        ctx.globalAlpha = p.alpha;
        const glow = p.radius * 10;
        ctx.drawImage(p.sprite, p.x - glow / 2, p.y - glow / 2, glow, glow);
      });
      ctx.globalAlpha = 1;
    } else {
      start();
    }

    let resizeTimer;
    window.addEventListener("resize", () => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(resizeCanvas, 180);
    });

    window.addEventListener(
      "pointermove",
      (event) => {
        if (event.pointerType === "touch") return;
        const rect = hero.getBoundingClientRect();
        pointer.tx = ((event.clientX - rect.width / 2) / rect.width) * 24;
        pointer.ty = ((event.clientY - rect.height / 2) / rect.height) * 24;
      },
      { passive: true }
    );

    const heroObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => (entry.isIntersecting ? start() : stop()));
    }, { threshold: 0 });
    heroObserver.observe(hero);

    document.addEventListener("visibilitychange", () => { document.hidden ? stop() : start(); });
  }
})();
