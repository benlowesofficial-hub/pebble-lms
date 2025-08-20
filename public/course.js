// /public/course.js
(async function () {
  // Load the course JSON
  const res = await fetch("/courses/fire-safety.json");
  const course = await res.json();

  const root = document.getElementById("course-root");
  let current = 0;

  // Ensure content doesn't hide behind the fixed nav
  const NAV_RESERVED_SPACE = 96; // px
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

    // Fresh wrapper so animate-fade-in plays on every render
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

    // Re-render nav for this screen
    renderNav();
  }

  function renderNav() {
    const total = course.screens.length;
    const prev = current > 0 ? course.screens[current - 1] : null;
    const next = current < total - 1 ? course.screens[current + 1] : null;

    const prevLabel = prev ? (prev.label || prev.title) : "";
    const nextLabel = next ? (next.label || next.title) : "";

    const pct = Math.round(((current + 1) / total) * 100);

    // Create/replace fixed nav container
    let nav = document.getElementById("course-nav");
    if (!nav) {
      nav = document.createElement("div");
      nav.id = "course-nav";
      document.body.appendChild(nav);
    }

    nav.className = `
      fixed inset-x-0 bottom-4 z-20
      px-4
    `;

    nav.innerHTML = `
      <div class="mx-auto max-w-5xl rounded-xl border border-border bg-surface shadow-pebble
                  backdrop-blur p-3 md:p-4 animate-fade-in">
        <div class="flex items-center justify-between gap-3">
          <!-- Back -->
          <button ${!prev ? "disabled" : ""}
            class="px-3 md:px-4 py-2 rounded-lg border border-border bg-surface text-ink/80
                   disabled:opacity-40 hover:bg-canvas transition
                   focus:outline-none focus-visible:ring-4 focus-visible:ring-pebbleTeal-200"
            aria-label="${prev ? `Go to previous: ${escapeAttr(prevLabel)}` : "No previous screen"}">
            ← ${prev ? escapeHtml(prevLabel) : "Back"}
          </button>

          <!-- Center: step count -->
          <div class="text-sm md:text-base font-semibold text-ink/80 select-none">
            ${current + 1} / ${total}
          </div>

          <!-- Next -->
          <button ${!next ? "disabled" : ""}
            class="px-4 md:px-5 py-2.5 rounded-lg bg-pebbleTeal-600 text-surface font-semibold
                   hover:bg-pebbleTeal-500 disabled:opacity-40
                   focus:outline-none focus-visible:ring-4 focus-visible:ring-pebbleTeal-200"
            aria-label="${next ? `Go to next: ${escapeAttr(nextLabel)}` : "No next screen"}">
            ${next ? escapeHtml(nextLabel) + " →" : "Next"}
          </button>
        </div>

        <!-- Progress bar -->
        <div class="mt-3 h-2.5 w-full rounded-full bg-track overflow-hidden">
          <div class="h-2.5 rounded-full bg-pebbleTeal-500"
               style="width:${pct}%"></div>
        </div>
      </div>
    `;

    // Wire up buttons
    const [backBtn] = nav.querySelectorAll("button");
    const nextBtn = nav.querySelectorAll("button")[1];

    backBtn && backBtn.addEventListener("click", () => navTo(current - 1));
    nextBtn && nextBtn.addEventListener("click", () => navTo(current + 1));
  }

  function navTo(i) {
    if (i < 0 || i >= course.screens.length) return;
    current = i;
    renderScreen(current);
  }

  // Keyboard shortcuts: Left/Right arrows
  window.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") navTo(current - 1);
    if (e.key === "ArrowRight") navTo(current + 1);
  });

  // --- Escape helpers --------------------------------------------------------
  function escapeHtml(s = "") {
    return s.replace(/[&<>"']/g, c => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;" }[c]));
  }
  function escapeAttr(s = "") { return escapeHtml(s); }

  // Initial render
  renderScreen(current);
})();

