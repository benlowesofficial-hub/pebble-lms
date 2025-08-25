// /public/js/blocks/accordion.js
import { escapeHtml } from "../utils.js";

export const type = "accordion";

export function render(b) {
  const eyebrow = b.data?.eyebrow
    ? `<div class="mb-2 pl-3 border-l-2 border-pebbleTeal-200">
         <span class="text-xs uppercase tracking-wide text-inkMuted">${escapeHtml(b.data.eyebrow)}</span>
       </div>`
    : "";

  // NOTE: width is controlled by the ROW wrapper (prose vs container)
  return `
    ${eyebrow}
    <div id="${b.id}" class="rounded-xl border-2 border-border bg-white shadow-pebble overflow-hidden">
      ${(b.data?.tabs || []).map((tab) => `
        <div class="border-t first:border-t-0 border-border">
          <button
            class="group w-full flex items-center justify-between gap-4 px-4 py-3 text-left font-semibold text-ink hover:bg-pebbleTeal-50 transition-colors"
            data-acc-btn="${tab.id}"
            aria-expanded="false"
          >
            <span class="truncate">${escapeHtml(tab.title || "")}</span>
            <svg class="h-5 w-5 transition-transform duration-200" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fill-rule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z" clip-rule="evenodd"/>
            </svg>
          </button>

          <!-- OUTER: no padding, we animate this height -->
          <div
            class="acc-panel overflow-hidden transition-all duration-300 ease-out"
            data-acc-panel="${tab.id}"
            style="max-height:0"
          >
            <!-- INNER: padding lives here so 'closed' height is truly 0 -->
            <div class="acc-inner px-4 pb-4 pt-1 text-inkMuted">
              ${escapeHtml(tab.content || "")}
            </div>
          </div>
        </div>
      `).join("")}
    </div>
  `;
}

export function hydrate(b) {
  const root = document.getElementById(b.id);
  if (!root) return;

  const btns   = Array.from(root.querySelectorAll("[data-acc-btn]"));
  const panels = Array.from(root.querySelectorAll(".acc-panel"));

  function setOpen(id, open) {
    const btn   = root.querySelector(`[data-acc-btn="${id}"]`);
    const panel = root.querySelector(`[data-acc-panel="${id}"]`);
    if (!btn || !panel) return;

    const icon  = btn.querySelector("svg");
    const inner = panel.querySelector(".acc-inner");

    if (open) {
      // measure inner content (has padding), apply to outer (has no padding)
      panel.style.maxHeight = inner.scrollHeight + "px";
      btn.setAttribute("aria-expanded", "true");
      icon && icon.classList.add("rotate-180");
    } else {
      panel.style.maxHeight = "0px";
      btn.setAttribute("aria-expanded", "false");
      icon && icon.classList.remove("rotate-180");
    }
  }

  function closeAll() {
    btns.forEach(bn => {
      bn.setAttribute("aria-expanded", "false");
      const ic = bn.querySelector("svg");
      ic && ic.classList.remove("rotate-180");
    });
    panels.forEach(p => p.style.maxHeight = "0px");
  }

  // Ensure all start closed
  btns.forEach(bn => bn.setAttribute("aria-expanded", "false"));
  panels.forEach(p => (p.style.maxHeight = "0px"));

  btns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const id     = btn.getAttribute("data-acc-btn");
      const isOpen = btn.getAttribute("aria-expanded") === "true";
      closeAll();
      if (!isOpen) setOpen(id, true); // toggle behaviour
    });
  });
}
