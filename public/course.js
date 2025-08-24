// /public/course.js
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

  // ---------- Utilities ----------
  function cx(...parts) {
    return parts.filter(Boolean).join(" ");
  }
  function escapeHtml(s = "") {
    return s.replace(/[&<>"']/g, c => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    }[c]));
  }
  function escapeAttr(s = "") { return escapeHtml(s); }

  // ---------- Event bus for linking ----------
  const bus = {
    events: {},
    emit(event, payload) {
      (this.events[event] || []).forEach(fn => fn(payload));
    },
    on(event, fn) {
      this.events[event] = this.events[event] || [];
      this.events[event].push(fn);
    }
  };

  // ---------- Block registry ----------
  const registry = {
    header: {
      render: (b) =>
        `<h2 class="text-[22px] font-extrabold leading-tight">${escapeHtml(b.data.text)}</h2>`
    },

    // DIVIDER: simple horizontal rule
divider: {
  render: (_b) => {
    return `<hr class="border-t-2 border-pebbleTeal-200 mt-8 mb-4" />`;
  }
},


    // TEXT: paragraphs + optional eyebrow + soft [[highlight]]
    text: {
      render: (b) => {
        const raw = String(b.data.text || "");
        let safe = escapeHtml(raw);
        safe = safe.replace(/\[\[(.+?)\]\]/g, (_m, inner) =>
          `<span class="rounded px-1.5 py-0.5 bg-pebbleTeal-50">${inner}</span>`
        );
        const parts = safe.split(/\n\s*\n/).filter(Boolean);

        const eyebrow = b.data.eyebrow
          ? `<div class="mb-2 pl-3 border-l-2 border-pebbleTeal-200">
               <span class="text-xs uppercase tracking-wide text-inkMuted">${escapeHtml(b.data.eyebrow)}</span>
             </div>`
          : "";

        const paras = parts.map(p =>
          `<p class="text-lg leading-relaxed text-ink">${p}</p>`
        ).join("");

        // IMPORTANT: text block itself does NOT impose max-width.
        // Width is controlled by the ROW wrapper (prose vs container).
        return `<div class="space-y-5">${eyebrow}${paras}</div>`;
      }
    },

    // LIST: unordered bullets + optional eyebrow
list: {
  render: (b) => {
    const items = Array.isArray(b.data?.items) ? b.data.items : [];
    const eyebrow = b.data?.eyebrow
      ? `<div class="mb-2 pl-3 border-l-2 border-pebbleTeal-200">
           <span class="text-xs uppercase tracking-wide text-inkMuted">${escapeHtml(b.data.eyebrow)}</span>
         </div>`
      : "";

const lis = items
  .map(txt =>
    `<li class="text-lg font-bold leading-relaxed text-ink">
       ${escapeHtml(String(txt))}
     </li>`
  )
  .join("");


    return `<div class="space-y-3">
              ${eyebrow}
              <ul class="list-disc list-inside space-y-2 marker:text-pebbleTeal-500">
                ${lis}
              </ul>
            </div>`;
  }
},


    
    icon: {
      render: (b) => {
        const size = b.data.size || "m"; // s | m | l
        const style = b.data.style || "plain"; // plain | nest
        const src = b.data.src;
        const label = escapeAttr(b.data.alt || "");
        const sizeCls = size === "s" ? "h-12 w-12"
          : size === "l" ? "h-24 w-24"
          : "h-16 w-16";

        if (style === "nest") {
          return `
            <div class="rounded-full bg-pebbleTeal-400/10 flex items-center justify-center ${sizeCls}">
              <img src="${src}" alt="${label}" class="h-3/4 w-3/4 object-contain" />
            </div>`;
        }
        return `<img src="${src}" alt="${label}" class="${sizeCls} object-contain" />`;
      }
    },

    image: {
      render: (b) =>
        `<img src="${b.data.src}" alt="${escapeAttr(b.data.alt || "")}" class="mx-auto rounded shadow" />`
    },

    multiImage: {
      render: (b) => {
        const state = b.data.defaultState || "default";
        const src = b.data.states[state];
        return `
          <img id="${b.id}" 
               src="${src}" 
               alt="${escapeAttr(b.data.alt || "")}" 
               class="mx-auto rounded shadow transition-opacity duration-300" />`;
      },
      hydrate: (b) => {
        const el = document.getElementById(b.id);
        bus.on(`setState:${b.id}`, (state) => {
          const newSrc = b.data.states[state];
          if (!newSrc) return;
          el.style.opacity = 0;
          setTimeout(() => {
            el.src = newSrc;
            el.style.opacity = 1;
          }, 200);
        });
      }
    },

// accordion block type
accordion: {
  render: (b) => {
    const eyebrow = b.data.eyebrow
      ? `<div class="mb-2 pl-3 border-l-2 border-pebbleTeal-200">
           <span class="text-xs uppercase tracking-wide text-inkMuted">${escapeHtml(b.data.eyebrow)}</span>
         </div>`
      : "";

    return `
      <div class="mx-auto max-w-prose">
        ${eyebrow}
        <div id="${b.id}" class="rounded-xl border-2 border-border bg-white shadow-pebble overflow-hidden">
          ${b.data.tabs.map((tab) => `
            <div class="border-t first:border-t-0 border-border">
              <button
                class="group w-full flex items-center justify-between gap-4 px-4 py-3 text-left font-semibold text-ink hover:bg-pebbleTeal-50 transition-colors"
                data-acc-btn="${tab.id}"
                aria-expanded="false"
              >
                <span class="truncate">${escapeHtml(tab.title)}</span>
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
                  ${escapeHtml(tab.content)}
                </div>
              </div>
            </div>
          `).join("")}
        </div>
      </div>
    `;
  },

  hydrate: (b) => {
    const root = document.getElementById(b.id);
    if (!root) return;

    const btns = Array.from(root.querySelectorAll("[data-acc-btn]"));
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

    // Open the first item after mount (so measurements are correct)
    const firstId = b.data?.tabs?.[0]?.id;
    if (firstId) setTimeout(() => setOpen(firstId, true), 0);

    btns.forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-acc-btn");
        const isOpen = btn.getAttribute("aria-expanded") === "true";
        closeAll();
        if (!isOpen) setOpen(id, true); // toggle behaviour
      });
    });
  }
},


    mcq: {
      render: (b) => `
        <div id="${b.id}" class="space-y-3">
          <p class="font-semibold">${escapeHtml(b.data.question)}</p>
          ${b.data.options.map(opt => `
            <label class="block border rounded p-2 cursor-pointer">
              <input type="${b.data.multiple ? "checkbox" : "radio"}" 
                     name="${b.id}" 
                     value="${opt.id}" 
                     class="mr-2">
              ${escapeHtml(opt.text)}
            </label>
          `).join("")}
          <div class="mt-2 text-sm text-inkMuted hidden"></div>
        </div>`,
      hydrate: (b) => {
        const container = document.getElementById(b.id);
        const inputs = container.querySelectorAll("input");
        const feedbackEl = container.querySelector("div.mt-2");

        inputs.forEach(input => {
          input.addEventListener("change", () => {
            const opt = b.data.options.find(o => o.id === input.value);
            if (!opt) return;

            if (opt.correct) {
              feedbackEl.textContent = opt.feedback || "Correct!";
              feedbackEl.classList.remove("hidden", "text-danger");
              feedbackEl.classList.add("text-success");
              bus.emit(`answer:correct:${b.id}`, opt.id);
            } else {
              feedbackEl.textContent = opt.feedback || "Try again.";
              feedbackEl.classList.remove("hidden", "text-success");
              feedbackEl.classList.add("text-danger");
              bus.emit(`answer:wrong:${b.id}`, opt.id);
            }
          });
        });
      }
    }
  };

 function renderRow(row) {
  // Back-compat: support either row.width ("prose" | "container") or row.layout.mode
  const mode = (row.layout && row.layout.mode) || row.width || "prose";
  const blocks = row.blocks || [];
  const cols = Math.max(1, blocks.length);

  // Width wrapper
  const widthWrapOpen = mode === "container"
    ? `<div class="mx-auto">`
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

  const gridOpen = cols === 1
    ? `<div class="grid grid-cols-1 gap-6">`
    : `<div class="grid grid-cols-1 lg:grid-cols-12 items-start gap-6 lg:gap-8">`;
  const gridClose = `</div>`;

  const content = blocks.map((b, i) => {
    const spanCls = cols === 1 ? "" : `lg:col-span-${spans[i]}`;
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
    const total = course.sections.length;
    const isFirst = current === 0;
    const isLast = current === total - 1;

    const prev = !isFirst ? course.sections[current - 1] : null;
    const next = !isLast ? course.sections[current + 1] : null;

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
