// /public/course.js
(async function () {
  const res = await fetch("/courses/fire-safety.json");
  const course = await res.json();

  const root = document.getElementById("course-root");
  let current = 0;

  const NAV_RESERVED_SPACE = 112;
  root.style.paddingBottom = NAV_RESERVED_SPACE + "px";

  // ---------- Block renderers ----------
  function renderBlock(block) {
    switch (block.type) {
      case "group":  return renderGroup(block);
      case "header": return `<h2 class="text-[22px] font-extrabold leading-tight">${escapeHtml(block.text)}</h2>`;
      case "text":   return `<p class="text-lg text-inkMuted">${escapeHtml(block.text)}</p>`;
      case "image":  return renderImage(block);
      case "list":
        return `<ul class="list-disc pl-6 space-y-1 text-lg">${block.items.map(i => `<li>${escapeHtml(i)}</li>`).join("")}</ul>`;
      default:
        return `<div class="p-4 border border-border rounded text-sm opacity-70">[${block.type}] not implemented</div>`;
    }
  }

  function renderGroup(g) {
    const layout = g.layout || "full";         // "full" | "split"
    const ratio  = g.ratio  || "50-50";        // "50-50" | "40-60" | "60-40"
    const stack  = g.stack  || "ltr";          // "ltr" | "rtl"
    const gap    = g.gap    || "lg";           // "sm" | "md" | "lg"
    const align  = g.align  || "center";       // "start" | "center"

    const gapCls   = gap === "sm" ? "gap-4" : gap === "md" ? "gap-6" : "gap-10";
    const alignCls = align === "start" ? "lg:items-start" : "lg:items-center";
    const base     = `grid grid-cols-1 ${gapCls} lg:grid-cols-12 ${alignCls}`;

    if (layout === "full") {
      return `
        <div class="${base}">
          ${(g.items || []).map(it => `<div class="lg:col-span-12">${renderBlock(it.block)}</div>`).join("")}
        </div>`;
    }

    // --- split: use literal col-span classes so Tailwind never purges them ---
    const spanMap = {
      "50-50": ["lg:col-span-6", "lg:col-span-6"],
      "40-60": ["lg:col-span-5", "lg:col-span-7"],
      "60-40": ["lg:col-span-7", "lg:col-span-5"]
    };
    const [leftSpan, rightSpan] = spanMap[ratio] || spanMap["50-50"];

    const leftOrder  = stack === "rtl" ? "order-2 lg:order-none" : "order-1 lg:order-none";
    const rightOrder = stack === "rtl" ? "order-1 lg:order-none" : "order-2 lg:order-none";

    const left  = (g.items || []).find(i => i.slot === "left");
    const right = (g.items || []).find(i => i.slot === "right");

    return `
      <div class="${base}">
        <div class="${leftOrder} ${leftSpan}">${left ? renderBlock(left.block) : ""}</div>
        <div class="${rightOrder} ${rightSpan}">${right ? renderBlock(right.block) : ""}</div>
      </div>`;
  }

  function renderImage(b) {
  const size  = b.size  || "m";     // s | m | l | xl | xxl
  const style = b.style || "plain"; // plain | nest

  const outer = {
    s: "h-16 w-16",
    m: "h-20 w-20",
    l: "h-28 w-28",
    xl: "h-36 w-36 md:h-40 md:w-40",
    xxl: "h-48 w-48 md:h-56 md:w-56" // NEW: bigger size
  };
  const outerCls = outer[size] || outer.m;

  if (style === "nest") {
    return `
      <div class="rounded-full bg-pebbleTeal-400/10 flex items-center justify-center ${outerCls} mx-auto lg:mx-0">
        <img src="${b.src}" alt="${escapeAttr(b.alt || "")}" class="h-3/4 w-3/4 object-contain" />
      </div>`;
  }

  const img = {
    s: "h-12 w-12",
    m: "h-16 w-16",
    l: "h-24 w-24",
    xl: "h-28 w-28 md:h-32 md:w-32",
    xxl: "h-40 w-40 md:h-48 md:w-48" // NEW
  };
  const imgCls = img[size] || img.m;
  return `<img src="${b.src}" alt="${escapeAttr(b.alt || "")}" class="${imgCls} object-contain mx-auto lg:mx-0" />`;
}
  // ---------- Screen + Nav ----------
  function renderScreen(index) {
    const screen = course.screens[index];
    if (!screen) return;

    const wrap = document.createElement("div");
    wrap.className = "space-y-6 animate-fade-in";

    const maybeTitle = screen.title
      ? `<h1 class="text-3xl md:text-4xl font-extrabold tracking-tight mb-2">${escapeHtml(screen.title)}</h1>`
      : "";

    wrap.innerHTML = `
      ${maybeTitle}
      <div class="space-y-6">
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
    const isLast  = current === total - 1;

    const prev = !isFirst ? course.screens[current - 1] : null;
    const next = !isLast  ? course.screens[current + 1] : null;
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

    nav.innerHTML = `
      <div class="mx-auto max-w-4xl rounded-xl border border-border bg-surface shadow-pebble backdrop-blur p-3 md:p-4 animate-fade-in">
        <div class="grid grid-cols-3 items-center gap-3">
          <div class="justify-self-start min-w-0">
            ${isFirst ? "" : `
              <button
                class="px-2 py-1 text-pebbleTeal-600 font-semibold whitespace-nowrap min-w-0 max-w-full
                       border-b-2 border-transparent hover:border-pebbleTeal-500
                       focus:outline-none focus-visible:ring-2 focus-visible:ring-pebbleTeal-200
                       md:px-3 md:py-2 md:rounded-lg md:border md:border-border md:bg-surface md:hover:bg-canvas md:focus-visible:ring-4"
                aria-label="Go to previous: ${escapeAttr(prevLabel)}">
                <span class="md:hidden">← Back</span>
                <span class="hidden md:inline block truncate">← ${escapeHtml(prevLabel)}</span>
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
              <button
                class="px-2 py-1 text-pebbleTeal-600 font-semibold border-b-2 border-transparent
                       hover:border-pebbleTeal-500 whitespace-nowrap
                       focus:outline-none focus-visible:ring-2 focus-visible:ring-pebbleTeal-200
                       md:px-4 md:py-2.5 md:rounded-lg md:bg-pebbleTeal-600 md:text-surface md:hover:bg-pebbleTeal-500 md:focus-visible:ring-4"
                aria-label="Finish course">Finish</button>
            ` : `
              <button
                class="px-2 py-1 text-pebbleTeal-600 font-semibold border-b-2 border-transparent
                       hover:border-pebbleTeal-500 whitespace-nowrap min-w-0 max-w-full
                       focus:outline-none focus-visible:ring-2 focus-visible:ring-pebbleTeal-200
                       md:px-4 md:py-2.5 md:rounded-lg md:bg-pebbleTeal-600 md:text-surface md:hover:bg-pebbleTeal-500 md:focus-visible:ring-4"
                aria-label="Go to next: ${escapeAttr(nextLabel)}">
                <span class="md:hidden">Next →</span>
                <span class="hidden md:inline block truncate">${escapeHtml(nextLabel)} →</span>
              </button>
            `}
          </div>
        </div>
      </div>
    `;

    nav.querySelector('button[aria-label^="Go to previous"]')?.addEventListener("click", () => navTo(current - 1));
    nav.querySelector('button[aria-label^="Go to next"]')?.addEventListener("click", () => navTo(current + 1));
    nav.querySelector('button[aria-label="Finish course"]')?.addEventListener("click", onFinish);
  }

  function navTo(i) {
    if (i < 0 || i >= course.screens.length) return;
    current = i;
    renderScreen(current);
  }
  function onFinish() { window.location.href = "/learn.html"; }

  window.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft"  && current > 0) navTo(current - 1);
    if (e.key === "ArrowRight" && current < course.screens.length - 1) navTo(current + 1);
  });

  function escapeHtml(s=""){return s.replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
  function escapeAttr(s=""){return escapeHtml(s);}

  renderScreen(current);
})();


