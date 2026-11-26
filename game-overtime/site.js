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
const filmChapters = document.getElementById("film-chapters");
const chapterButtons = Array.from(filmChapters.querySelectorAll("button"));

function setFilmChapter(time) {
  const chapter = chapterButtons.findLast((button) => time >= Number(button.dataset.start)) || chapterButtons[0];
  if (mediaDialog.dataset.phase === chapter.dataset.phase) return;
  mediaDialog.dataset.phase = chapter.dataset.phase;
  for (const button of chapterButtons) {
    if (button === chapter) button.setAttribute("aria-current", "true");
    else button.removeAttribute("aria-current");
  }
}

function prepareFilm(video) {
  video.controls = true;
  video.playsInline = true;
  video.poster = "assets/intro-demarrage.webp";
  video.setAttribute("aria-label", "Présentation de Game OverTime, du démarrage à la partie de boxe");
  const track = document.createElement("track");
  track.kind = "captions";
  track.label = "Description des images";
  track.srclang = "fr";
  track.src = "assets/intro-demo-fr.vtt";
  video.append(track);
  setFilmChapter(0);
  const sync = () => { if (video.isConnected) setFilmChapter(video.currentTime); };
  video.addEventListener("seeking", sync);
  video.addEventListener("timeupdate", sync);
  if (video.requestVideoFrameCallback) {
    const followFrame = (_, frame) => {
      if (!video.isConnected) return;
      setFilmChapter(frame.mediaTime);
      video.requestVideoFrameCallback(followFrame);
    };
    video.requestVideoFrameCallback(followFrame);
  }
}

filmChapters.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-start]");
  const video = mediaContent.querySelector("video");
  if (!button || !video) return;
  video.currentTime = Number(button.dataset.start);
  video.play().catch(() => {});
});

document.addEventListener("click", (event) => {
  const link = event.target.closest("a[data-film], a[data-lightbox]");
  if (!link || !mediaDialog.showModal || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  event.preventDefault();
  const isFilm = link.hasAttribute("data-film");
  const title = isFilm ? "L’intro de Game OverTime · 55 s" : link.dataset.lightbox;
  document.getElementById("media-title").textContent = title;
  const item = document.createElement(isFilm ? "video" : "img");
  mediaDialog.classList.toggle("film-dialog", isFilm);
  filmChapters.hidden = !isFilm;
  if (isFilm) {
    prepareFilm(item);
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
    video.remove();
    video.removeAttribute("src");
    video.load();
  }
  delete mediaDialog.dataset.phase;
  mediaDialog.classList.remove("film-dialog");
  filmChapters.hidden = true;
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
