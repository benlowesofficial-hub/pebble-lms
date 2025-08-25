// /public/js/blocks/text.js
import { escapeHtml } from "../utils.js";

export const type = "text";

export function render(b) {
  const raw = String(b.data?.text || "");
  let safe = escapeHtml(raw);

  // [[highlight]] → soft teal pill
  safe = safe.replace(/\[\[(.+?)\]\]/g, (_m, inner) =>
    `<span class="rounded px-1.5 py-0.5 bg-pebbleTeal-50">${inner}</span>`
  );

  const parts = safe.split(/\n\s*\n/).filter(Boolean);

  const eyebrow = b.data?.eyebrow
    ? `<div class="mb-2 pl-3 border-l-2 border-pebbleTeal-200">
         <span class="text-xs uppercase tracking-wide text-inkMuted">${escapeHtml(b.data.eyebrow)}</span>
       </div>`
    : "";

  const paras = parts.map(p =>
    `<p class="text-lg leading-relaxed text-ink">${p}</p>`
  ).join("");

  // Width is controlled by the ROW wrapper (prose vs container).
  return `<div class="space-y-5">${eyebrow}${paras}</div>`;
}
