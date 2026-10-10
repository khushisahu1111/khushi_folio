/* =========================================================
   Khushi Sahu — Portfolio interactions & animations
   ========================================================= */
(() => {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];

  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = matchMedia("(pointer: fine)").matches;
  const hasGSAP = !!(window.gsap && window.ScrollTrigger);

  /* ---------- Text splitting ---------- */
  // Wraps every character in .char, grouped into nowrap .w words so lines only break between words.
  function splitChars(el) {
    const words = el.textContent.trim().split(/\s+/);
    el.textContent = "";
    words.forEach((word, i) => {
      const w = document.createElement("span");
      w.className = "w";
      w.style.display = "inline-block";
      w.style.whiteSpace = "nowrap";
      [...word].forEach((ch) => {
        const c = document.createElement("span");
        c.className = "char";
        c.textContent = ch;
        w.appendChild(c);
      });
      el.appendChild(w);
      if (i < words.length - 1) el.appendChild(document.createTextNode(" "));
    });
    return $$(".char", el);
  }

  function splitWords(el, highlights = []) {
    const words = el.textContent.trim().split(/\s+/);
    el.textContent = "";
    words.forEach((word, i) => {
      const s = document.createElement("span");
      s.className = "word";
      const bare = word.replace(/[^\w-]/g, "").toLowerCase();
      if (highlights.includes(bare)) s.classList.add("hl");
      s.textContent = word;
      el.appendChild(s);
      if (i < words.length - 1) el.appendChild(document.createTextNode(" "));
    });
    return $$(".word", el);
  }

  /* ---------- Footer clock & year ---------- */
  $("#year").textContent = new Date().getFullYear();
  const timeEl = $("#localTime");
  const fmt = new Intl.DateTimeFormat("en-IN", { timeZone: "Asia/Kolkata", hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true });
  const tickClock = () => (timeEl.textContent = fmt.format(new Date()));
  tickClock();
  setInterval(tickClock, 1000);

  /* ---------- Typewriter rotator ---------- */
  function initRotator() {
    const el = $("#rotator");
    const phrases = ["self-healing cloud systems", "Voice AI agents", "real-time backends", "LLM-powered tools", "systems that scale"];
    let p = 0, i = phrases[0].length, deleting = true;
    const step = () => {
      const word = phrases[p];
      i += deleting ? -1 : 1;
      el.textContent = word.slice(0, i);
      let delay = deleting ? 35 : 70;
      if (!deleting && i === word.length) { deleting = true; delay = 2000; }
      else if (deleting && i === 0) { deleting = false; p = (p + 1) % phrases.length; delay = 350; }
      setTimeout(step, delay);
    };
    setTimeout(step, 2600);
  }

  /* ---------- Mobile menu ---------- */
  let lenis = null;
  function initMenu() {
    const burger = $("#burger");
    const menu = $("#mobileMenu");
    const setOpen = (open) => {
      burger.classList.toggle("is-open", open);
      menu.classList.toggle("is-open", open);
      burger.setAttribute("aria-expanded", String(open));
      document.body.style.overflow = open ? "hidden" : "";
      if (lenis) open ? lenis.stop() : lenis.start();
    };
    burger.addEventListener("click", () => setOpen(!menu.classList.contains("is-open")));
    $$("a", menu).forEach((a) => a.addEventListener("click", () => setOpen(false)));
  }

  /* ---------- Copy email ---------- */
  function initCopy() {
    const btn = $("#copyEmail");
    const toast = $("#toast");
    let t;
    btn.addEventListener("click", async () => {
      const email = btn.dataset.email;
      try {
        await navigator.clipboard.writeText(email);
        toast.classList.add("is-visible");
        clearTimeout(t);
        t = setTimeout(() => toast.classList.remove("is-visible"), 2200);
      } catch {
        location.href = `mailto:${email}`;
      }
    });
  }

  /* ---------- Spotlight (mouse-follow glow) ---------- */
  function initSpotlight() {
    $$(".spotlight").forEach((el) => {
      el.addEventListener("pointermove", (e) => {
        const r = el.getBoundingClientRect();
        el.style.setProperty("--mx", `${e.clientX - r.left}px`);
        el.style.setProperty("--my", `${e.clientY - r.top}px`);
      });
    });
  }

  /* ---------- Scramble text on hover ---------- */
  function initScramble() {
    const glyphs = "!<>-_\\/[]{}=+*^?#%&";
    $$("[data-scramble]").forEach((el) => {
      const original = el.textContent;
      el.addEventListener("mouseenter", () => {
        let frame = 0;
        cancelAnimationFrame(el._raf);
        const tick = () => {
          el.textContent = [...original].map((ch, i) => (i < frame / 2 ? ch : glyphs[(Math.random() * glyphs.length) | 0])).join("");
          if (frame++ < original.length * 2) el._raf = requestAnimationFrame(tick);
          else el.textContent = original;
        };
        tick();
      });
    });
  }

  /* ---------- Particle network ---------- */
  function initParticles() {
    const canvas = $("#heroCanvas");
    const hero = $("#hero");
    const ctx = canvas.getContext("2d");
    let w, h, pts = [], running = true;
    const mouse = { x: -9999, y: -9999 };

    const resize = () => {
      const dpr = Math.min(devicePixelRatio || 1, 2);
      w = canvas.offsetWidth;
      h = canvas.offsetHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.min(110, Math.floor((w * h) / 13000));
      pts = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        r: Math.random() * 1.6 + 0.4,
      }));
    };

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      for (const p of pts) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;

        const dx = p.x - mouse.x, dy = p.y - mouse.y;
        const d = Math.hypot(dx, dy);
        if (d < 140) {
          const f = (140 - d) / 140;
          p.x += (dx / d) * f * 2.2;
          p.y += (dy / d) * f * 2.2;
        }
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(236,235,245,0.55)";
        ctx.fill();
      }
      for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
          const a = pts[i], b = pts[j];
          const d = Math.hypot(a.x - b.x, a.y - b.y);
          if (d < 120) {
            ctx.strokeStyle = `rgba(139,92,246,${(1 - d / 120) * 0.35})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
        const md = Math.hypot(pts[i].x - mouse.x, pts[i].y - mouse.y);
        if (md < 200) {
          ctx.strokeStyle = `rgba(34,211,238,${(1 - md / 200) * 0.5})`;
          ctx.beginPath();
          ctx.moveTo(pts[i].x, pts[i].y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.stroke();
        }
      }
      if (running && !reduceMotion) requestAnimationFrame(draw);
    };

    hero.addEventListener("pointermove", (e) => {
      const r = canvas.getBoundingClientRect();
      mouse.x = e.clientX - r.left;
      mouse.y = e.clientY - r.top;
    });
    hero.addEventListener("pointerleave", () => { mouse.x = mouse.y = -9999; });

    new IntersectionObserver(([entry]) => {
      const was = running;
      running = entry.isIntersecting;
      if (running && !was) requestAnimationFrame(draw);
    }).observe(hero);

    let rt;
    addEventListener("resize", () => { clearTimeout(rt); rt = setTimeout(resize, 150); });
    resize();
    draw();
  }

  /* ---------- Terminal typing ---------- */
  function initTerminal(startNow) {
    const body = $("#terminalBody");
    const script = [
      { cmd: "whoami" },
      { out: '<span class="t-accent">khushi_sahu</span> — full-stack & cloud engineer' },
      { cmd: "cat stack.txt" },
      { out: "python · typescript · node.js · aws · redis" },
      { cmd: "./voiceops --run-evals" },
      { out: '<span class="t-ok">✓</span> tool-selection accuracy  69% → <span class="t-ok">92%</span>' },
      { out: '<span class="t-ok">✓</span> jobs lost on kill -9     <span class="t-ok">0</span>' },
      { out: '<span class="t-ok">✓</span> api cost                 <span class="t-ok">$0</span>' },
      { cmd: "echo $STATUS" },
      { out: "open to full-time roles 🚀" },
    ];
    const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
    let started = false;

    const run = async () => {
      if (started) return;
      started = true;
      const cursor = '<span class="t-cursor"></span>';
      let html = "";
      for (const line of script) {
        if (line.cmd) {
          const prefix = html + '<span class="t-prompt">❯ </span><span class="t-cmd">';
          for (let i = 1; i <= line.cmd.length; i++) {
            body.innerHTML = prefix + line.cmd.slice(0, i) + "</span>" + cursor;
            await sleep(reduceMotion ? 0 : 45 + Math.random() * 50);
          }
          html = prefix + line.cmd + "</span>\n";
          await sleep(reduceMotion ? 0 : 260);
        } else {
          html += line.out + "\n";
          body.innerHTML = html + cursor;
          await sleep(reduceMotion ? 0 : 140);
        }
      }
      body.innerHTML = html + '<span class="t-prompt">❯ </span>' + cursor;
    };

    if (startNow) return run();
    new IntersectionObserver(([e], obs) => {
      if (e.isIntersecting) { run(); obs.disconnect(); }
    }, { threshold: 0.4 }).observe($("#terminal"));
  }

  /* ---------- Shared, non-GSAP setup ---------- */
  initMenu();
  initCopy();
  initSpotlight();
  initScramble();
  initRotator();
  initParticles();

  const preloader = $("#preloader");
  const finalizeCounters = () => $$(".counter").forEach((el) => (el.textContent = el.dataset.to));

  if (!hasGSAP) {
    preloader.remove();
    document.body.classList.remove("is-loading");
    initTerminal(true);
    finalizeCounters();
    return;
  }

  /* =========================================================
     GSAP-powered animations
     ========================================================= */
  gsap.registerPlugin(ScrollTrigger);

  /* ---------- Smooth scroll ---------- */
  if (window.Lenis && !reduceMotion) {
    lenis = window.lenis = new Lenis({ lerp: 0.09, wheelMultiplier: 1 });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  $$('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      const id = a.getAttribute("href");
      const target = id === "#top" ? 0 : $(id);
      if (target === null) return;
      e.preventDefault();
      if (lenis) lenis.scrollTo(target, { duration: 1.6 });
      else if (target === 0) scrollTo({ top: 0, behavior: "smooth" });
      else target.scrollIntoView({ behavior: "smooth" });
    });
  });

  /* ---------- Split text up front ---------- */
  const heroChars = $$(".hero__title .split").flatMap(splitChars);
  const contactChars = $$(".contact__title .split").map(splitChars);
  $$(".reveal-title").forEach((el) => {
    el.style.overflow = "hidden";
    el.style.paddingBottom = "0.14em";
    splitChars(el);
  });
  const leadWords = splitWords($("#aboutLead"), ["full-stack", "end", "python", "typescript", "aws", "llm-powered", "voice", "agents", "heals", "observability", "reliability", "scale"]);

  /* ---------- Cursor ---------- */
  if (finePointer && !reduceMotion) {
    const cursor = $("#cursor");
    const follower = $("#cursorFollower");
    const label = $("#cursorText");
    const cx = gsap.quickTo(cursor, "x", { duration: 0.08, ease: "power3" });
    const cy = gsap.quickTo(cursor, "y", { duration: 0.08, ease: "power3" });
    const fx = gsap.quickTo(follower, "x", { duration: 0.5, ease: "power3" });
    const fy = gsap.quickTo(follower, "y", { duration: 0.5, ease: "power3" });
    gsap.set([cursor, follower], { xPercent: -50, yPercent: -50 });

    addEventListener("pointermove", (e) => { cx(e.clientX); cy(e.clientY); fx(e.clientX); fy(e.clientY); });
    document.addEventListener("pointerleave", () => gsap.to([cursor, follower], { opacity: 0, duration: 0.3 }));
    document.addEventListener("pointerenter", () => gsap.to([cursor, follower], { opacity: 1, duration: 0.3 }));
    addEventListener("pointerdown", () => gsap.to(follower, { scale: 0.75, duration: 0.2 }));
    addEventListener("pointerup", () => gsap.to(follower, { scale: 1, duration: 0.4, ease: "elastic.out(1, 0.4)" }));

    document.addEventListener("pointerover", (e) => {
      const withText = e.target.closest("[data-cursor]");
      const interactive = e.target.closest("a, button, .chips span, .tags span");
      follower.classList.toggle("has-text", !!withText);
      follower.classList.toggle("is-hover", !withText && !!interactive);
      label.textContent = withText ? withText.dataset.cursor : "";
    });

    /* ---------- Magnetic elements ---------- */
    $$(".magnetic").forEach((el) => {
      const strength = el.classList.contains("project") ? 0.12 : 0.35;
      el.addEventListener("pointermove", (e) => {
        const r = el.getBoundingClientRect();
        gsap.to(el, {
          x: (e.clientX - r.left - r.width / 2) * strength,
          y: (e.clientY - r.top - r.height / 2) * strength,
          duration: 0.5,
          ease: "power3.out",
        });
      });
      el.addEventListener("pointerleave", () => gsap.to(el, { x: 0, y: 0, duration: 0.9, ease: "elastic.out(1, 0.35)" }));
    });

    /* ---------- 3D tilt ---------- */
    $$(".tilt").forEach((el) => {
      const max = el.classList.contains("project") ? 6 : 9;
      gsap.set(el, { transformPerspective: 1000 });
      el.addEventListener("pointermove", (e) => {
        const r = el.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        gsap.to(el, { rotationY: px * max * 2, rotationX: -py * max * 2, duration: 0.6, ease: "power3.out" });
      });
      el.addEventListener("pointerleave", () => gsap.to(el, { rotationX: 0, rotationY: 0, duration: 1, ease: "elastic.out(1, 0.5)" }));
    });

    /* ---------- Hero floaters parallax ---------- */
    const floaters = $$(".floater");
    $("#hero").addEventListener("pointermove", (e) => {
      const nx = e.clientX / innerWidth - 0.5;
      const ny = e.clientY / innerHeight - 0.5;
      floaters.forEach((f) => {
        const d = parseFloat(f.dataset.depth);
        gsap.to(f, { x: -nx * 60 * d, y: -ny * 60 * d, duration: 1.2, ease: "power3.out" });
      });
    });
  }

  /* ---------- Preloader → hero intro ---------- */
  const intro = () => {
    const tl = gsap.timeline({ defaults: { ease: "expo.out" } });
    tl.from(".nav > *", { y: -40, opacity: 0, duration: 1.2, stagger: 0.08 })
      .from(heroChars, { yPercent: 120, rotate: 12, opacity: 0, duration: 1.4, stagger: 0.045 }, 0.05)
      .from(".hero-fade", { y: 40, opacity: 0, duration: 1.2, stagger: 0.12 }, 0.45)
      .from(".floater", { scale: 0, opacity: 0, duration: 1.2, stagger: 0.08, ease: "back.out(2)" }, 0.6)
      .from(".hero__grid", { opacity: 0, duration: 2 }, 0)
      .from(".hero__canvas", { opacity: 0, duration: 2 }, 0.2)
      .from(".scroll-indicator", { y: 20, opacity: 0, duration: 1 }, 1);
    return tl;
  };


  const finishLoading = () => {
    document.body.classList.remove("is-loading");
    preloader.remove();
    ScrollTrigger.refresh();
  };

  if (reduceMotion) {
    finishLoading();
    initTerminal(true);
    finalizeCounters();
  } else {
    // Build the intro paused so its "from" states hide the hero before the curtain lifts.
    const introTl = intro().pause();
    if (lenis) lenis.stop();
    const counter = { v: 0 };
    const load = gsap.timeline();
    load
      .from(".preloader__name span", { yPercent: 110, duration: 0.9, stagger: 0.06, ease: "expo.out" })
      .to(".preloader__name span", { backgroundPosition: "100% 0", duration: 1.6, ease: "none" }, 0)
      .to(counter, {
        v: 100, duration: 1.6, ease: "power2.inOut",
        onUpdate: () => {
          $("#preloaderCount").textContent = Math.round(counter.v);
          $("#preloaderBar").style.width = counter.v + "%";
        },
      }, 0)
      .to(".preloader__name span", { yPercent: -110, duration: 0.6, stagger: 0.04, ease: "expo.in" }, "+=0.1")
      .to([".preloader__bar", ".preloader__count"], { opacity: 0, duration: 0.3 }, "<")
      .to(preloader, { yPercent: -100, duration: 1, ease: "expo.inOut" }, "-=0.15")
      .add(() => introTl.play(), "-=0.55")
      .add(() => {
        finishLoading();
        if (lenis) lenis.start();
      });
    initTerminal(false);
  }

  if (reduceMotion) return;

  /* ---------- Scroll progress ---------- */
  gsap.to("#scrollProgress", {
    scaleX: 1, ease: "none",
    scrollTrigger: { trigger: document.body, start: "top top", end: "bottom bottom", scrub: 0.3 },
  });

  /* ---------- Nav: hide on scroll down, active section ---------- */
  const nav = $("#nav");
  ScrollTrigger.create({
    start: 0, end: "max",
    onUpdate: (self) => {
      const y = self.scroll();
      nav.classList.toggle("is-scrolled", y > 40);
      if (!$("#mobileMenu").classList.contains("is-open")) nav.classList.toggle("is-hidden", self.direction === 1 && y > 400);
    },
  });

  $$(".nav__link").forEach((link) => {
    const section = $(link.getAttribute("href"));
    ScrollTrigger.create({
      trigger: section, start: "top 55%", end: "bottom 55%",
      onToggle: (self) => link.classList.toggle("is-active", self.isActive),
    });
  });

  /* ---------- Hero scroll-out parallax ---------- */
  gsap.to(".hero__content", {
    yPercent: -18, opacity: 0, ease: "none",
    scrollTrigger: { trigger: "#hero", start: "top top", end: "bottom top", scrub: true },
  });
  gsap.to(".hero__canvas, .hero__grid", {
    yPercent: 25, ease: "none",
    scrollTrigger: { trigger: "#hero", start: "top top", end: "bottom top", scrub: true },
  });

  /* ---------- Marquee velocity skew ---------- */
  // Skew the marquee wrappers (the tracks themselves run a CSS transform animation).
  const skewTo = $$(".marquee").map((m) => gsap.quickTo(m, "skewX", { duration: 0.5, ease: "power3" }));
  let resetSkew;
  ScrollTrigger.create({
    onUpdate: (self) => {
      const v = gsap.utils.clamp(-10, 10, self.getVelocity() / -250);
      skewTo.forEach((fn) => fn(v));
      resetSkew?.kill();
      resetSkew = gsap.delayedCall(0.15, () => skewTo.forEach((fn) => fn(0)));
    },
  });

  /* ---------- Section titles ---------- */
  $$(".reveal-title").forEach((title) => {
    gsap.from($$(".char", title), {
      yPercent: 110, rotate: 6, opacity: 0, duration: 1.1, stagger: 0.03, ease: "expo.out",
      scrollTrigger: { trigger: title, start: "top 85%" },
    });
  });
  $$(".section__index").forEach((idx) => {
    gsap.from(idx, { scale: 0, opacity: 0, duration: 0.8, ease: "back.out(3)", scrollTrigger: { trigger: idx, start: "top 88%" } });
  });

  /* ---------- About: word-by-word reveal ---------- */
  gsap.fromTo(leadWords, { opacity: 0.12 }, {
    opacity: 1, stagger: 0.05, ease: "none",
    scrollTrigger: { trigger: "#aboutLead", start: "top 80%", end: "bottom 45%", scrub: true },
  });

  gsap.from(".stat", {
    y: 80, opacity: 0, rotationX: -25, duration: 1.1, stagger: 0.12, ease: "expo.out",
    scrollTrigger: { trigger: ".stats", start: "top 82%" },
  });
  gsap.from(".terminal", {
    y: 80, opacity: 0, scale: 0.94, duration: 1.2, ease: "expo.out",
    scrollTrigger: { trigger: ".terminal", start: "top 85%" },
  });

  $$(".counter").forEach((el) => {
    const to = +el.dataset.to;
    const obj = { v: 0 };
    gsap.to(obj, {
      v: to, duration: 2.2, ease: "power3.out",
      scrollTrigger: { trigger: el, start: "top 88%" },
      onUpdate: () => (el.textContent = Math.round(obj.v)),
    });
  });

  /* ---------- Experience timeline ---------- */
  gsap.to("#timelineFill", {
    scaleY: 1, ease: "none",
    scrollTrigger: { trigger: ".timeline", start: "top 70%", end: "bottom 60%", scrub: true },
  });
  $$(".tl-item").forEach((item) => {
    const tl = gsap.timeline({ scrollTrigger: { trigger: item, start: "top 80%" } });
    tl.from($(".tl-item__dot", item), { scale: 0, duration: 0.6, ease: "back.out(3)" })
      .from($(".tl-item__card", item), { x: 80, opacity: 0, duration: 1.1, ease: "expo.out" }, 0.1)
      .from($$("li", item), { x: 30, opacity: 0, duration: 0.8, stagger: 0.12, ease: "expo.out" }, 0.35)
      .from($$(".tags span", item), { y: 14, opacity: 0, duration: 0.5, stagger: 0.04, ease: "back.out(2)" }, 0.55);
  });

  /* ---------- Projects: horizontal scroll on desktop ---------- */
  const projects = $("#projects");
  const track = $("#projectsTrack");
  const mm = gsap.matchMedia();

  mm.add("(min-width: 1024px) and (min-height: 620px)", () => {
    projects.classList.add("is-horizontal");
    const distance = () => track.scrollWidth - innerWidth;
    const scrollTween = gsap.to(track, {
      x: () => -distance(), ease: "none",
      scrollTrigger: {
        trigger: projects, pin: true, scrub: 1, start: "top top",
        end: () => "+=" + distance(), invalidateOnRefresh: true, anticipatePin: 1,
      },
    });
    $$(".project", track).forEach((card, i) => {
      if (i === 0) return;
      gsap.from(card, {
        opacity: 0.25, scale: 0.86, transformOrigin: "left center", ease: "none",
        scrollTrigger: { trigger: card, containerAnimation: scrollTween, start: "left 100%", end: "left 55%", scrub: true },
      });
    });
    gsap.from(".projects__track .project:first-child", {
      y: 100, opacity: 0, duration: 1.2, ease: "expo.out",
      scrollTrigger: { trigger: projects, start: "top 70%" },
    });
    return () => projects.classList.remove("is-horizontal");
  });

  mm.add("(max-width: 1023px), (max-height: 619px)", () => {
    $$(".project", track).forEach((card) => {
      gsap.from(card, {
        y: 90, opacity: 0, rotationX: -12, duration: 1.1, ease: "expo.out",
        scrollTrigger: { trigger: card, start: "top 88%" },
      });
    });
  });

  /* ---------- Skills ---------- */
  $$(".skill-card").forEach((card, i) => {
    const tl = gsap.timeline({ scrollTrigger: { trigger: card, start: "top 85%" } });
    tl.from(card, { y: 70, opacity: 0, duration: 1, ease: "expo.out", delay: (i % 3) * 0.08 })
      .from($(".skill-card__icon", card), { scale: 0, rotate: -90, duration: 0.8, ease: "back.out(2.5)" }, "-=0.8")
      .from($$(".chips span", card), { scale: 0.5, opacity: 0, duration: 0.5, stagger: 0.03, ease: "back.out(2)" }, "-=0.6");
  });

  /* ---------- Journey ---------- */
  gsap.from(".journey-card", {
    y: 80, opacity: 0, rotationX: -18, transformOrigin: "50% 100%", duration: 1.1, stagger: 0.12, ease: "expo.out",
    scrollTrigger: { trigger: ".journey__grid", start: "top 80%" },
  });
  gsap.from(".certs span", {
    x: -30, opacity: 0, duration: 0.7, stagger: 0.1, ease: "expo.out",
    scrollTrigger: { trigger: ".certs", start: "top 90%" },
  });

  /* ---------- Contact ---------- */
  const gradientEl = $(".contact__title .gradient-text");
  const layoutGradient = () => {
    gradientEl.style.setProperty("--gw", gradientEl.offsetWidth + "px");
    contactChars[1].forEach((c) => c.style.setProperty("--ox", c.offsetLeft - gradientEl.offsetLeft + "px"));
  };
  layoutGradient();
  addEventListener("resize", layoutGradient);
  document.fonts?.ready.then(layoutGradient);
  gsap.fromTo(gradientEl, { "--shift": "0px" }, { "--shift": () => gradientEl.offsetWidth + "px", duration: 6, ease: "none", repeat: -1 });

  const ctl = gsap.timeline({ scrollTrigger: { trigger: ".contact", start: "top 65%" } });
  ctl.from(".contact__kicker", { y: 20, opacity: 0, duration: 0.8, ease: "expo.out" })
    .from(contactChars[0], { yPercent: 120, opacity: 0, duration: 1.2, stagger: 0.03, ease: "expo.out" }, 0.1)
    .from(contactChars[1], { yPercent: 120, opacity: 0, duration: 1.2, stagger: 0.03, ease: "expo.out" }, 0.3)
    .from(".contact__text", { y: 30, opacity: 0, duration: 1, ease: "expo.out" }, 0.6)
    .from(".contact__email", { scale: 0.7, opacity: 0, duration: 1.2, ease: "elastic.out(1, 0.6)" }, 0.75)
    .from(".social", { y: 30, opacity: 0, duration: 0.8, stagger: 0.1, ease: "expo.out" }, 0.9);

  gsap.from(".footer > *", {
    y: 20, opacity: 0, duration: 0.8, stagger: 0.1, ease: "expo.out",
    scrollTrigger: { trigger: ".footer", start: "top 98%" },
  });

  /* ---------- Refresh once fonts settle ---------- */
  if (document.fonts?.ready) document.fonts.ready.then(() => ScrollTrigger.refresh());
})();
