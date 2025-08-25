// /public/js/blocks/icon.js
import { escapeAttr } from "../utils.js";

export const type = "icon";

export function render(b) {
  const size  = b.data?.size  || "m";     // s | m | l
  const style = b.data?.style || "plain"; // plain | nest
  const src   = b.data?.src;
  const label = escapeAttr(b.data?.alt || "");

  const sizeCls = size === "s" ? "h-12 w-12"
                : size === "l" ? "h-24 w-24"
                :                 "h-16 w-16";

  if (style === "nest") {
    return `
      <div class="rounded-full bg-pebbleTeal-400/10 flex items-center justify-center ${sizeCls}">
        <img src="${src}" alt="${label}" class="h-3/4 w-3/4 object-contain" />
      </div>`;
  }
  return `<img src="${src}" alt="${label}" class="${sizeCls} object-contain" />`;
}
