// /public/course.js
(async function () {
  // Load the course JSON
  const res = await fetch("/courses/fire-safety.json");
  const course = await res.json();

  const root = document.getElementById("course-root");
  let current = 0;

  // Reserve space so content never hides behind the fixed nav
  const NAV_RESERVED_SPACE = 112; // px
  root.style.paddingBottom = NAV_RESERVED_SPACE + "px";

  // --- Render helpers --------------------------------------------------------
  function renderBlock(block) {
    switch (block.type) {
      case "header":
        return `<h2 class="text-[22px] font-extrabold leading-tight">${escapeHtml(block.text)}</h2>`;

      case "text":
        return `<p class="text-lg text-inkMuted">${escapeHtml(block.text)}</p>`;

      case "image":
        return `
          <div class="icon-nest mt-2 mx-auto">
            <img src="${block.src}" alt="${escapeAttr(block.alt || "")}" class="h-14 w-14 object-contain" />
          </div>`;

      case "list":
        return `<ul class="list-disc pl-6 space-y-1 text-lg">
          ${block.items.map(i => `<li>${escapeHtml(i)}</li>`).join("")}
        </ul>`;

      default:
        return `<div class="p-4 border border-border rounded text-sm opacity-70">[${block.type}] not implemented</div>`;
    }
  }

  function renderScreen(index) {
    const screen = course.screens[index];
    if (!screen) return;

    const wrap = document.createElement("div");
    wrap.className = "space-y-6 animate-fade-in";

    wrap.innerHTML = `
      <h1 class="text-3xl md:text-4xl font-extrabold tracking-tight mb-2">${escapeHtml(screen.title)}</h1>
      <div class="space-y-4">
        ${screen.blocks.map(renderBlock).join("")}
      </div>
    `;

    root.innerHTML = "";
    root.appendChild(wrap);

    renderNav();
  }

  function renderNav() {
    const total = course.screens.length;
    const isFirst = current === 0;
    const isLast = current === total - 1;

    const prev = !isFirst ? course.screens[current - 1] : null;
    const next = !isLast ? course.screens[current + 1] : null;
    const prevLabel = prev ? (prev.label || prev.title) : "";
    const nextLabel = next ? (next.label || next.title) : "";

    const pct = Math.round(((current + 1) / total) * 100);

    let nav = document.getElementById("course-nav");
    if (!nav) {
      nav = document.createElement("div");
      nav.id = "course-nav";
      document.body.appendChild(nav);
    }

    nav.className = `fixed inset-x-0 bottom-4 z-20 px-4`;

    // Stepper dots
    const dots = Array.from({ length: total }, (_, i) => {
      const active = i === current;
      const completed = i < current;
      const base = "h-2.5 w-2.5 rounded-full transition duration-200";
      const cls = active
        ? `${base} bg-pebbleTeal-600`
        : completed
        ? `${base} bg-pebbleTeal-400`
        : `${base} bg-track`;
      return `<span class="${cls}"></span>`;
    }).join("");

    nav.innerHTML = `
      <div class="mx-auto max-w-4xl rounded-xl border border-border bg-surface shadow-pebble backdrop-blur p-3 md:p-4 animate-fade-in">
        <div class="grid grid-cols-3 items-center gap-3">
          <!-- Back (hidden on first) -->
          <div class="justify-self-start min-w-0">
            ${isFirst ? "" : `
              <button
                class="px-3 md:px-4 py-2 rounded-lg border border-border bg-surface text-ink/80 whitespace-nowrap min-w-0 max-w-full
                       hover:bg-canvas transition
                       focus:outline-none focus-visible:ring-4 focus-visible:ring-pebbleTeal-200"
                aria-label="Go to previous: ${escapeAttr(prevLabel)}">
                <!-- Mobile: short label -->
                <span class="md:hidden">← Back</span>
                <!-- Desktop: contextual title, truncated if long -->
                <span class="hidden md:inline block truncate">← ${escapeHtml(prevLabel)}</span>
              </button>
            `}
          </div>

          <!-- Center: mini stepper -->
          <div class="justify-self-center flex items-center gap-2">
            ${dots}
          </div>

          <!-- Next / Finish -->
          <div class="justify-self-end min-w-0">
            ${isLast ? `
              <button
                class="px-4 md:px-5 py-2.5 rounded-lg bg-pebbleTeal-600 text-surface font-semibold whitespace-nowrap
                       hover:bg-pebbleTeal-500
                       focus:outline-none focus-visible:ring-4 focus-visible:ring-pebbleTeal-200"
                aria-label="Finish course">
                Finish
              </button>
            ` : `
              <button
                class="px-4 md:px-5 py-2.5 rounded-lg bg-pebbleTeal-600 text-surface font-semibold whitespace-nowrap min-w-0 max-w-full
                       hover:bg-pebbleTeal-500
                       focus:outline-none focus-visible:ring-4 focus-visible:ring-pebbleTeal-200"
                aria-label="Go to next: ${escapeAttr(nextLabel)}">
                <!-- Mobile: short label -->
                <span class="md:hidden">Next →</span>
                <!-- Desktop: contextual title, truncated if long -->
                <span class="hidden md:inline block truncate">${escapeHtml(nextLabel)} →</span>
              </button>
            `}
          </div>
        </div>

        <!-- Progress bar -->
        <div class="mt-3 h-2.5 w-full rounded-full bg-track overflow-hidden">
          <div class="h-2.5 rounded-full bg-pebbleTeal-500" style="width:${pct}%"></div>
        </div>
      </div>
    `;

    // Wire up buttons
    const backBtn = nav.querySelector('button[aria-label^="Go to previous"]');
    const nextBtn = nav.querySelector('button[aria-label^="Go to next"]');
    const finishBtn = nav.querySelector('button[aria-label="Finish course"]');

    backBtn && backBtn.addEventListener("click", () => navTo(current - 1));
    nextBtn && nextBtn.addEventListener("click", () => navTo(current + 1));
    finishBtn && finishBtn.addEventListener("click", () => onFinish());
  }

  function navTo(i) {
    if (i < 0 || i >= course.screens.length) return;
    current = i;
    renderScreen(current);
  }

  function onFinish() {
    // Placeholder finish action: return to training list
    window.location.href = "/learn.html";
  }

  // Keyboard shortcuts: Left/Right arrows
  window.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft" && current > 0) navTo(current - 1);
    if (e.key === "ArrowRight" && current < course.screens.length - 1) navTo(current + 1);
  });

  // --- Escape helpers --------------------------------------------------------
  function escapeHtml(s = "") {
    return s.replace(/[&<>"']/g, c => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;" }[c]));
  }
  function escapeAttr(s = "") { return escapeHtml(s); }

  // Initial render
  renderScreen(current);
})();
