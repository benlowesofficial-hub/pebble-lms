// /public/js/blocks/list.js
import { escapeHtml } from "../utils.js";

export const type = "list";

export function render(b) {
  const items = Array.isArray(b.data?.items) ? b.data.items : [];

  const eyebrow = b.data?.eyebrow
    ? `<div class="mb-2 pl-3 border-l-2 border-pebbleTeal-200">
         <span class="text-xs uppercase tracking-wide text-inkMuted">${escapeHtml(b.data.eyebrow)}</span>
       </div>`
    : "";

  const lis = items.map(txt =>
    `<li class="text-lg font-bold leading-relaxed text-ink">
       ${escapeHtml(String(txt))}
     </li>`
  ).join("");

  return `<div class="space-y-3">
            ${eyebrow}
            <ul class="list-disc list-inside space-y-2 marker:text-pebbleTeal-500">
              ${lis}
            </ul>
          </div>`;
}
