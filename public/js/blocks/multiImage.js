// /public/js/blocks/multiImage.js
import { escapeAttr } from "../utils.js";
import bus from "../event-bus.js";

export const type = "multiImage";

export function render(b) {
  const state = b.data?.defaultState || "default";
  const src   = b.data?.states?.[state];
  return `
    <img id="${b.id}"
         src="${src}"
         alt="${escapeAttr(b.data?.alt || "")}"
         class="mx-auto rounded shadow transition-opacity duration-300" />`;
}

export function hydrate(b) {
  const el = document.getElementById(b.id);
  if (!el) return;

  bus.on(`setState:${b.id}`, (state) => {
    const newSrc = b.data?.states?.[state];
    if (!newSrc) return;
    el.style.opacity = 0;
    setTimeout(() => {
      el.src = newSrc;
      el.style.opacity = 1;
    }, 200);
  });
}
