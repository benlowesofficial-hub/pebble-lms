// /public/js/blocks/image.js
import { escapeAttr } from "../utils.js";

export const type = "image";

export function render(b) {
  return `<img src="${b.data?.src}" alt="${escapeAttr(b.data?.alt || "")}" class="mx-auto rounded shadow" />`;
}
