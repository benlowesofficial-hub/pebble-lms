<script type="module">
// /public/course.js  (core runtime)
import { escapeHtml } from "./js/utils.js";
import { registry }   from "./js/block-registry.js";

(async function () {
  // ---------- Load course JSON ----------
  const res = await fetch("/courses/fire-safety.json");
  if (!res.ok) {
    console.error("Failed to load course JSON", res.status, res.statusText);
    return;
  }
  const course = await res.json();

  const root = document.getElementById("course-root");
  let current = 0; // index of current section

  const NAV_RESERVED_SPACE = 112;
  root.style.paddingBottom = NAV_RESERVED_SPACE + "px";

  // ---------- Row renderer ----------
  function renderRow(row) {
    // Back-compat: support either row.width ("prose" | "container") or row.layout.mode
    const mode   = (row.layout && row.layout.mode) || row.width || "prose";
    const blocks = row.blocks || [];
    const cols   = Math.max(1, blocks.length);

    // Width wrapper
    const widthWrapOpen  = mode === "container" ? `<div class="mx-auto">`
                                                : `<div class="mx-auto max-w-prose">`;
    const widthWrapClose = `</div>`;

    // Special case (generic, not type-specific): prose + 2 blocks → auto | 1fr
    if (mode !== "container" && cols === 2) {
      return (
        widthWrapOpen +
        `<div class="grid grid-cols-1 lg:grid-cols-[auto,1fr] items-start gap-6 lg:gap-8">
           <div class="flex justify-center lg:justify-start">${renderBlock(blocks[0])}</div>
           <div class="min-w-0">${renderBlock(blocks[1])}</div>
         </div>` +
        widthWrapClose
      );
    }

    // Generic path: stack on mobile; 12-col grid on lg
    const weights = blocks.map(b => {
      const w = Number(b.weight ?? 1);
      return Number.isFinite(w) && w > 0 ? w : 1;
    });
    const total = weights.reduce((a, b) => a + b, 0) || 1;
    const spans = weights.map(w => Math.max(1, Math.round((w / total) * 12)));

    const gridOpen  = cols === 1
      ? `<div class="grid grid-cols-1 gap-6">`
      : `<div class="grid grid-cols-1 lg:grid-cols-12 items-start gap-6 lg:gap-8">`;
    const gridClose = `</div>`;

    const content = blocks.map((b, i) => {
      const spanCls  = cols === 1 ? "" : `lg:col-span-${spans[i]}`;
      const alignCls = b.type === "icon" ? "flex justify-center lg:justify-start" : "";
      return `<div class="${spanCls} ${alignCls}">${renderBlock(b)}</div>`;
    }).join("");

    return widthWrapOpen + gridOpen + content + gridClose + widthWrapClose;
  }

  function renderBlock(block) {
    const entry = registry[block.type];
    if (!entry) {
      return `<div class="p-4 border border-border rounded text-sm opacity-70">[${block.type}] not implemented</div>`;
    }
    return entry.render(block);
  }

  function hydrateRow(row) {
    row.blocks.forEach(b => {
      const entry = registry[b.type];
      if (entry && entry.hydrate) entry.hydrate(b);
    });
  }

  function renderSection(section) {
    const wrap = document.createElement("div");
    wrap.className = "space-y-8 animate-fade-in";

    const maybeTitle = section.title
      ? `<div class="mb-6 border-b-2 border-pebbleTeal-200 pb-2">
           <h1 class="text-3xl md:text-4xl font-extrabold tracking-tight text-ink">${escapeHtml(section.title)}</h1>
         </div>`
      : "";

    wrap.innerHTML = maybeTitle + (section.rows || []).map(renderRow).join("");

    root.innerHTML = "";
    root.appendChild(wrap);

    (section.rows || []).forEach(hydrateRow);
    renderNav();
  }

  // ---------- Nav ----------
  function renderNav() {
    const total   = course.sections.length;
    const isFirst = current === 0;
    const isLast  = current === total - 1;

    const prev = !isFirst ? course.sections[current - 1] : null;
    const next = !isLast  ? course.sections[current + 1] : null;

    const pct = Math.round(((current + 1) / total) * 100);

    let nav = document.getElementById("course-nav");
    if (!nav) {
      nav = document.createElement("div");
      nav.id = "course-nav";
      document.body.appendChild(nav);
    }
    nav.className = `fixed inset-x-0 bottom-4 z-20 px-4`;

    nav.innerHTML = `
      <div class="mx-auto max-w-4xl rounded-xl border border-border bg-surface shadow-pebble backdrop-blur p-3 md:p-4 animate-fade-in">
        <div class="grid grid-cols-3 items-center gap-3">
          <div class="justify-self-start min-w-0">
            ${isFirst ? "" : `
              <button class="px-2 py-1 text-pebbleTeal-600 font-semibold hover:underline" aria-label="Prev section">
                ← ${escapeHtml(prev.title)}
              </button>
            `}
          </div>

          <div class="justify-self-center w-full max-w-xs">
            <div class="h-1.5 rounded-full bg-track overflow-hidden">
              <div class="h-1.5 rounded-full bg-pebbleTeal-500" style="width:${pct}%"></div>
            </div>
          </div>

          <div class="justify-self-end min-w-0">
            ${isLast ? `
              <button class="px-4 py-2 bg-pebbleTeal-600 text-white rounded-lg">Finish</button>
            ` : `
              <button class="px-2 py-1 text-pebbleTeal-600 font-semibold hover:underline" aria-label="Next section">
                ${escapeHtml(next.title)} →
              </button>
            `}
          </div>
        </div>
      </div>
    `;

    nav.querySelector("button[aria-label='Prev section']")?.addEventListener("click", () => navTo(current - 1));
    nav.querySelector("button[aria-label='Next section']")?.addEventListener("click", () => navTo(current + 1));
    nav.querySelector("button.bg-pebbleTeal-600")?.addEventListener("click", onFinish);
  }

  function navTo(i) {
    if (i < 0 || i >= course.sections.length) return;
    current = i;
    renderSection(course.sections[current]);
  }
  function onFinish() { window.location.href = "/learn.html"; }

  window.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft" && current > 0) navTo(current - 1);
    if (e.key === "ArrowRight" && current < course.sections.length - 1) navTo(current + 1);
  });

  // initial render
  renderSection(course.sections[current]);
})();
</script>


