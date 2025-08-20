// /public/course.js
(async function () {
  // 1) Load the course JSON
  const res = await fetch("/courses/fire-safety.json");
  const course = await res.json();

  const root = document.getElementById("course-root");
  let current = 0;

  // 2) Render helpers ---------------------------------------------------------
  function renderBlock(block) {
    switch (block.type) {
      case "header":
        return `<h2 class="text-[22px] font-extrabold leading-tight">${escapeHtml(block.text)}</h2>`;

      case "text":
        return `<p class="text-lg text-inkMuted">${escapeHtml(block.text)}</p>`;

      case "image":
        // Match learner card icon look (free-floating icon in a soft nest)
        return `
          <div class="icon-nest mt-2 mx-auto">
            <img src="${block.src}" alt="${escapeAttr(block.alt || "")}" class="h-14 w-14 object-contain" />
          </div>`;

      case "list":
        return `<ul class="list-disc pl-6 space-y-1 text-lg">
          ${block.items.map(i => `<li>${escapeHtml(i)}</li>`).join("")}
        </ul>`;

      default:
        return `<div class="p-4 border rounded text-sm opacity-70">[${block.type}] not implemented</div>`;
    }
  }

  function renderScreen(index) {
    const screen = course.screens[index];
    if (!screen) return;

    // Build a fresh wrapper so Tailwind's animate-fade-in runs every time
    const wrap = document.createElement("div");
    wrap.className = "space-y-6 animate-fade-in";

    wrap.innerHTML = `
      <h1 class="text-3xl md:text-4xl font-extrabold tracking-tight mb-2">${escapeHtml(screen.title)}</h1>
      <div class="space-y-4">
        ${screen.blocks.map(renderBlock).join("")}
      </div>

      <div class="mt-10 flex items-center justify-between">
        <button ${index === 0 ? "disabled" : ""}
          class="px-4 py-2 rounded-lg bg-gray-100 text-ink/70 disabled:opacity-50 hover:bg-gray-200 focus:outline-none focus-visible:ring-4 focus-visible:ring-[rgba(150,182,182,0.35)]">
          Back
        </button>

        <button ${index === course.screens.length - 1 ? "disabled" : ""}
          class="px-5 py-2.5 rounded-lg bg-pebbleTeal text-white font-semibold hover:opacity-90 disabled:opacity-40 focus:outline-none focus-visible:ring-4 focus-visible:ring-[rgba(150,182,182,0.35)]">
          Next
        </button>
      </div>
    `;

    // Wire up nav
    const [backBtn, nextBtn] = wrap.querySelectorAll("button");
    backBtn && backBtn.addEventListener("click", () => nav(index - 1));
    nextBtn && nextBtn.addEventListener("click", () => nav(index + 1));

    // Swap content
    root.innerHTML = "";
    root.appendChild(wrap);
  }

  function nav(i) {
    if (i < 0 || i >= course.screens.length) return;
    current = i;
    renderScreen(current);
  }

  // 3) Tiny escape helpers ----------------------------------------------------
  function escapeHtml(s = "") {
    return s.replace(/[&<>"']/g, c => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;" }[c]));
  }
  function escapeAttr(s = "") { return escapeHtml(s); }

  // 4) Initial render ---------------------------------------------------------
  renderScreen(current);
})();
