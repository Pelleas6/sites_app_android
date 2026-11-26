"use strict";

const softMenu = document.querySelector(".mobile-nav");
document.addEventListener("click", (event) => {
  if (softMenu.open && (!softMenu.contains(event.target) || event.target.closest("nav a"))) {
    softMenu.open = false;
  }
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && softMenu.open) {
    softMenu.open = false;
    softMenu.querySelector("summary").focus();
  }
});

const consoles = Array.from(document.querySelectorAll(".console-card"));
const consoleDialog = document.getElementById("console-dialog");
let consoleIndex = 0;

function showConsole(index) {
  const card = consoles[index];
  consoleIndex = index;
  consoleDialog.className = "modal hardware-dialog " + card.classList[1];
  document.getElementById("detail-image").src = card.querySelector(".console-art img").src;
  document.getElementById("detail-family").textContent = card.querySelector(".console-family").textContent;
  document.getElementById("console-title").textContent = card.querySelector("strong").textContent;
  const data = card.querySelector(".hardware-data");
  document.getElementById("detail-copy").replaceChildren(...Array.from(data.children, (child) => child.cloneNode(true)));
  if (!consoleDialog.open) consoleDialog.showModal();
  consoleDialog.scrollTop = 0;
}

consoles.forEach((card, index) => {
  const trigger = card.querySelector("summary");
  if (!consoleDialog.showModal) return;
  trigger.setAttribute("aria-haspopup", "dialog");
  trigger.addEventListener("click", (event) => {
    event.preventDefault();
    showConsole(index);
  });
});
document.getElementById("next-console").addEventListener("click", () => {
  showConsole((consoleIndex + 1) % consoles.length);
  const title = document.getElementById("console-title");
  title.setAttribute("tabindex","-1");
  title.focus({preventScroll: true});
});

function setupPlayCarousel(carousel) {
  const slides = Array.from(carousel.querySelectorAll(".feature-slide"));
  const picker = carousel.querySelector(".feature-picker");
  const arrows = carousel.querySelector(".feature-arrows");
  const status = carousel.querySelector(".feature-status");
  let current = 0;
  let swipeStart = null;

  const tabs = slides.map((slide, index) => {
    const tab = document.createElement("button");
    tab.type = "button";
    tab.id = slide.id + "-tab";
    tab.textContent = slide.dataset.label;
    tab.setAttribute("role", "tab");
    tab.setAttribute("aria-controls", slide.id);
    slide.setAttribute("role", "tabpanel");
    slide.setAttribute("aria-labelledby", tab.id);
    tab.addEventListener("click", () => showFeature(index));
    picker.append(tab);
    return tab;
  });

  function showFeature(index, announce = false) {
    current = (index + slides.length) % slides.length;
    slides.forEach((slide, position) => {
      const selected = position === current;
      slide.hidden = !selected;
      tabs[position].tabIndex = selected ? 0 : -1;
      tabs[position].setAttribute("aria-selected", String(selected));
    });
    status.textContent = announce ? slides[current].dataset.label + ", " + (current + 1) + " sur " + slides.length : "";
  }

  picker.addEventListener("keydown", (event) => {
    const destinations = { ArrowLeft: current - 1, ArrowRight: current + 1, Home: 0, End: slides.length - 1 };
    if (!Object.hasOwn(destinations, event.key)) return;
    event.preventDefault();
    showFeature(destinations[event.key]);
    tabs[current].focus({preventScroll: true});
  });
  arrows.querySelector(".feature-prev").addEventListener("click", () => showFeature(current - 1, true));
  arrows.querySelector(".feature-next").addEventListener("click", () => showFeature(current + 1, true));

  carousel.addEventListener("pointerdown", (event) => {
    swipeStart = null;
    if (event.pointerType === "mouse" || !event.isPrimary || !event.target.closest(".feature-slide") || event.target.closest("a")) return;
    swipeStart = { id: event.pointerId, x: event.clientX, y: event.clientY };
  });
  carousel.addEventListener("pointerup", (event) => {
    if (!swipeStart || event.pointerId !== swipeStart.id) return;
    const dx = event.clientX - swipeStart.x;
    const dy = event.clientY - swipeStart.y;
    swipeStart = null;
    if (Math.abs(dx) >= 40 && Math.abs(dx) > 1.4 * Math.abs(dy)) showFeature(current + (dx < 0 ? 1 : -1), true);
  });
  carousel.addEventListener("pointercancel", () => { swipeStart = null; });

  showFeature(0);
  carousel.classList.add("is-ready");
  carousel.closest("section").setAttribute("aria-roledescription", "carrousel");
  picker.hidden = false;
  arrows.hidden = false;
}
document.querySelectorAll(".play-carousel").forEach(setupPlayCarousel);

const guideImage = document.getElementById("guide-picture");
const guideArt = document.getElementById("guide-art");
const guideAlts = {
  importer: "Trois cartouches à étiquette OVNI dans un coffret bleu translucide.",
  jaquettes: "Trois jaquettes illustrées, dont une soucoupe au-dessus d’une forêt.",
  reprendre: "Une cartouche violette flotte au-dessus d’un point de sauvegarde doré."
};
const guides = Array.from(document.querySelectorAll(".guide-entry"));
guides.forEach((guide) => {
  guide.addEventListener("toggle", () => {
    if (!guide.open) {
      if (!guides.some((item) => item.open)) guide.open = true;
      return;
    }
    for (const other of guides) if (other !== guide) other.open = false;
    const key = guide.dataset.guide;
    const link = guide.querySelector(".guide-text a");
    guideImage.src = "assets/" + key + ".webp";
    guideImage.alt = guideAlts[key];
    guideArt.href = link.href;
    guideArt.dataset.lightbox = link.dataset.lightbox;
    guideArt.setAttribute("aria-label", "Agrandir la fiche illustrée « " + link.dataset.lightbox + " »");
  });
});

const mediaDialog = document.getElementById("media-dialog");
const mediaContent = document.getElementById("media-content");
document.addEventListener("click", (event) => {
  const link = event.target.closest("a[data-film], a[data-lightbox]");
  if (!link || !mediaDialog.showModal || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  event.preventDefault();
  const isFilm = link.hasAttribute("data-film");
  const title = isFilm ? "L’intro OVNI · 9 secondes" : link.dataset.lightbox;
  document.getElementById("media-title").textContent = title;
  const item = document.createElement(isFilm ? "video" : "img");
  if (isFilm) {
    item.controls = true;
    item.playsInline = true;
    item.poster = "assets/intro-poster.webp";
    item.setAttribute("aria-label", "Film d’ouverture de Game OverTime");
    const track = document.createElement("track");
    track.kind = "captions";
    track.label = "Description en français";
    track.srclang = "fr";
    track.src = "assets/intro-fr.vtt";
    item.append(track);
  } else {
    item.alt = title;
  }
  item.src = link.href;
  mediaContent.replaceChildren(item);
  mediaDialog.showModal();
  if (isFilm) item.play().catch(() => {});
});
mediaDialog.addEventListener("close", () => {
  const video = mediaContent.querySelector("video");
  if (video) {
    video.pause();
    video.removeAttribute("src");
    video.load();
  }
  mediaContent.replaceChildren();
});
for (const dialog of [consoleDialog, mediaDialog]) {
  dialog.querySelector("[data-dismiss]").addEventListener("click", () => dialog.close());
  dialog.addEventListener("click", (event) => {
    if (event.target !== dialog) return;
    const rect = dialog.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
  });
}
