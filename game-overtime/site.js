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

const storyTabs = Array.from(document.querySelectorAll(".scene-switch [role=tab]"));
const story = document.getElementById("story-image");
const storyArt = {
  "tv-tab": {
    large: "assets/une-vie-chacun.webp", small: "assets/une-vie-chacun-640.webp",
    alt: "Sur le canapé, un père passe la manette à sa fille devant un passage secret."
  },
  "hand-tab": {
    large: "assets/station-nacre.webp", small: "assets/station-nacre.webp",
    alt: "Sur le téléphone en paysage, les touches entourent le jeu de la station Nacre."
  }
};

function chooseStory(tab) {
  for (const item of storyTabs) {
    const selected = item === tab;
    item.setAttribute("aria-selected", String(selected));
    item.tabIndex = selected ? 0 : -1;
    document.getElementById(item.getAttribute("aria-controls")).hidden = !selected;
  }
  const art = storyArt[tab.id];
  story.querySelector("source").srcset = art.small;
  const img = story.querySelector("img");
  img.src = art.large;
  img.alt = art.alt;
  story.parentElement.classList.toggle("is-pocket", tab.id === "hand-tab");
}
for (const [index, tab] of storyTabs.entries()) {
  tab.addEventListener("click", () => chooseStory(tab));
  tab.addEventListener("keydown", (event) => {
    const keys = ["ArrowLeft", "ArrowRight", "Home", "End"];
    if (!keys.includes(event.key)) return;
    event.preventDefault();
    const next = event.key === "Home" ? 0 : event.key === "End" ? storyTabs.length - 1 : (index + 1) % storyTabs.length;
    chooseStory(storyTabs[next]);
    storyTabs[next].focus();
  });
}

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
    if (!guide.open) return;
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
