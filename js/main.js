/* =========================================================
   Té Quiero Pastelería - Scripts
   1. Intro con video (se reproduce en cada carga)
   2. Header visible después de la intro
   3. Revelado de secciones al scrollear
   4. Menú mobile
   5. Sombra del header al scrollear
   6. Año automático en el footer
   ========================================================= */

(function () {
  "use strict";

  var html = document.documentElement;
  var intro = document.getElementById("intro");
  var introVideo = document.getElementById("introVideo");
  var header = document.getElementById("siteHeader");
  var navToggle = document.getElementById("navToggle");
  var nav = document.getElementById("siteNav");
  var yearEl = document.getElementById("year");

  /* Tiempo máximo de seguridad por si el video no termina
     o el navegador no lo carga (en ms). */
  var INTRO_TIMEOUT = 9000;
  var introDone = false;
  var introTimer = null;

  /* ---------- 1 y 2. Intro + header ---------- */

  function showSite() {
    // Muestra el header y revela el contenido visible al cargar
    if (header) header.classList.add("is-visible");
    revealVisibleSections();
  }

  function finishIntro() {
    if (introDone) return;
    introDone = true;

    clearTimeout(introTimer);

    if (intro) {
      intro.classList.add("intro--hidden");
      // Quita el overlay del DOM cuando termina el fade
      setTimeout(function () {
        if (intro && intro.parentNode) intro.parentNode.removeChild(intro);
      }, 900);
    }

    // Libera el scroll
    html.classList.remove("is-loading");

    showSite();
  }

  function startIntro() {
    // Bloquea el scroll mientras corre la intro
    html.classList.add("is-loading");

    // Si el navegador no permite el autoplay, o no hay video, cerramos la intro
    if (!introVideo) {
      finishIntro();
      return;
    }

    // Seguridad: si algo falla, la página igual se muestra
    introTimer = setTimeout(finishIntro, INTRO_TIMEOUT);

    introVideo.addEventListener("ended", finishIntro);
    introVideo.addEventListener("error", finishIntro);

    var playPromise = introVideo.play();
    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch(function () {
        // Autoplay bloqueado: mostramos la web sin esperar
        finishIntro();
      });
    }
  }

  // Tocar la intro la saltea (útil si alguien se quiere saltar el video)
  if (intro) {
    intro.addEventListener("click", finishIntro);
  }

  /* ---------- 3. Revelado de secciones al scrollear ---------- */

  var revealEls = document.querySelectorAll(".reveal");

  function revealVisibleSections() {
    // Las secciones que ya están en pantalla al cargar se muestran de una
    revealEls.forEach(function (el) {
      var rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.9) {
        el.classList.add("is-visible");
      }
    });
  }

  if ("IntersectionObserver" in window) {
    var observer = new IntersectionObserver(
      function (entries, obs) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
    );

    revealEls.forEach(function (el) {
      observer.observe(el);
    });
  } else {
    // Navegadores viejos: mostramos todo sin animación
    revealEls.forEach(function (el) {
      el.classList.add("is-visible");
    });
  }

  /* ---------- 4. Menú mobile ---------- */

  function setMenu(open) {
    if (!navToggle || !nav) return;
    navToggle.setAttribute("aria-expanded", String(open));
    navToggle.setAttribute("aria-label", open ? "Cerrar menú" : "Abrir menú");
    nav.classList.toggle("is-open", open);
  }

  if (navToggle && nav) {
    navToggle.addEventListener("click", function () {
      var isOpen = navToggle.getAttribute("aria-expanded") === "true";
      setMenu(!isOpen);
    });

    // Cierra el menú al tocar un link
    nav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        setMenu(false);
      });
    });

    // Cierra con Escape
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") setMenu(false);
    });
  }

  /* ---------- 5. Sombra del header al scrollear ---------- */

  function onScroll() {
    if (!header) return;
    header.classList.toggle("is-scrolled", window.scrollY > 10);
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- 6. Año automático ---------- */

  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  /* ---------- Arranque ---------- */

  // Si el DOM ya está listo, arrancamos; si no, esperamos
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", startIntro);
  } else {
    startIntro();
  }
})();
