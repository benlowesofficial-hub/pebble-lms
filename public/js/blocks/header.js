// /public/js/blocks/header.js
import { escapeHtml } from "../utils.js";

export const type = "header";

export function render(b) {
  return `<h2 class="text-[22px] font-extrabold leading-tight">${escapeHtml(b.data?.text || "")}</h2>`;
}
