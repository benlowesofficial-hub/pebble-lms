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

    // TEXT BLOCK with: paragraphs, lead para, optional eyebrow, soft highlights
text: {
  render: (b) => {
    const raw = String(b.data.text || "");

    // Escape HTML
    let safe = escapeHtml(raw);

    // Soft highlights: [[phrase]]
    safe = safe.replace(/\[\[(.+?)\]\]/g, (_m, inner) => {
      return `<span class="rounded px-1.5 py-0.5 bg-pebbleTeal-50">${inner}</span>`;
    });

    // Split into paragraphs
    const parts = safe.split(/\n\s*\n/).filter(Boolean);

    // Eyebrow (optional)
    const eyebrow = b.data.eyebrow
      ? `<div class="mb-2 pl-3 border-l-2 border-pebbleTeal-200">
           <span class="text-xs uppercase tracking-wide text-inkMuted">${escapeHtml(b.data.eyebrow)}</span>
         </div>`
      : "";

    // Render all paragraphs consistently
    const paras = parts
      .map(p => `<p class="text-lg leading-relaxed text-ink">${p}</p>`)
      .join("");

    return `<div class="max-w-prose mx-auto space-y-5">${eyebrow}${paras}</div>`;
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
    accordion: {
      render: (b) => `
        <div id="${b.id}" class="border rounded divide-y">
          ${b.data.tabs.map((tab, i) => `
            <button class="w-full text-left p-3 font-semibold focus:outline-none"
                    data-tab="${tab.id}">
              ${escapeHtml(tab.title)}
            </button>
            <div class="p-3 text-inkMuted hidden">${escapeHtml(tab.content)}</div>
          `).join("")}
        </div>`,
      hydrate: (b) => {
        const container = document.getElementById(b.id);
        const buttons = container.querySelectorAll("button[data-tab]");
        buttons.forEach(btn => {
          btn.addEventListener("click", () => {
            const tabId = btn.dataset.tab;
            // toggle content
            const allPanels = container.querySelectorAll("div");
            allPanels.forEach(p => p.classList.add("hidden"));
            btn.nextElementSibling.classList.remove("hidden");
            // emit event
            bus.emit(`accordion:open:${b.id}`, { tabId });
            // also emit general tab:open for linking
            bus.emit("tab:open", { source: b.id, tabId });
          });
        });

        // set up interactions
        (b.interactions || []).forEach(inter => {
          bus.on(inter.on, payload => {
            const target = inter.target;
            const action = inter.action;
            const param = inter.param.replace("{{tab.id}}", payload.tabId);
            bus.emit(`${action}:${target}`, param);
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

  // ---------- Row + Section renderers ----------
  function getLayout(row) {
    const types = row.blocks.map(b => b.type);

    // Icon + Text combo
    if (types.includes("icon") && types.includes("text")) {
      // Icon smaller, text wider
      return ["lg:col-span-4 flex justify-center", "lg:col-span-8"];
    }

    // Image + Text combo
    if (types.includes("image") && types.includes("text")) {
      // Image larger, text narrower
      return ["lg:col-span-7", "lg:col-span-5"];
    }

    // Default: equal split
    const span = 12 / row.blocks.length;
    return Array(row.blocks.length).fill(`lg:col-span-${span}`);
  }

  function renderRow(row) {
    const cols = row.blocks.length;

    // Single block row → full width
    if (cols === 1) {
      return `<div class="grid grid-cols-1">${renderBlock(row.blocks[0])}</div>`;
    }

    const types = row.blocks.map(b => b.type);

    // Icon + Text → flex row
    if (types.includes("icon") && types.includes("text")) {
      return `
        <div class="flex flex-col lg:flex-row gap-6 items-center">
          <div class="flex-shrink-0 flex justify-center">${renderBlock(row.blocks[0])}</div>
          <div class="flex-1 max-w-prose">${renderBlock(row.blocks[1])}</div>
        </div>`;
    }

    // Image or MultiImage + Text → flex row
    if ((types.includes("image") || types.includes("multiImage")) && types.includes("text")) {
      return `
        <div class="flex flex-col lg:flex-row gap-6 items-center">
          <div class="flex-1 flex justify-center">${renderBlock(row.blocks[0])}</div>
          <div class="flex-1 max-w-md">${renderBlock(row.blocks[1])}</div>
        </div>`;
    }

    // Default = equal grid (safe fallback)
    const span = 12 / cols;
    return `
      <div class="grid grid-cols-1 lg:grid-cols-${cols} gap-6">
        ${row.blocks.map(b => `<div class="lg:col-span-${span}">${renderBlock(b)}</div>`).join("")}
      </div>`;
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


    wrap.innerHTML = maybeTitle +
      section.rows.map(renderRow).join("");

    root.innerHTML = "";
    root.appendChild(wrap);

    section.rows.forEach(hydrateRow);

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
