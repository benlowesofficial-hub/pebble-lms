(async function () {
  const res = await fetch("/courses/fire-safety.json");
  const course = await res.json();

  const root = document.getElementById("course-root");
  let current = 0;

  function renderScreen(index) {
    const screen = course.screens[index];
    if (!screen) return;

    root.innerHTML = `
      <h1 class="text-3xl font-bold mb-6">${screen.title}</h1>
      <div class="space-y-4">
        ${screen.blocks.map(renderBlock).join("")}
      </div>
      <div class="mt-8 flex justify-between">
        <button ${index===0?"disabled":""}
          class="px-4 py-2 rounded bg-gray-200 disabled:opacity-50"
          onclick="window._nav(${index-1})">Back</button>
        <button ${index===course.screens.length-1?"disabled":""}
          class="px-4 py-2 rounded bg-pebbleTeal-600 text-white"
          onclick="window._nav(${index+1})">Next</button>
      </div>
    `;
  }

  function renderBlock(block) {
    switch (block.type) {
      case "text":
        return `<p class="text-lg">${block.text}</p>`;
      case "image":
        return `<img src="${block.src}" alt="" class="h-24 w-24" />`;
      case "list":
        return `<ul class="list-disc pl-6 space-y-1">${block.items.map(i=>`<li>${i}</li>`).join("")}</ul>`;
      default:
        return `<div class="p-4 border">${block.type} not implemented</div>`;
    }
  }

  window._nav = (i) => {
    current = i;
    renderScreen(current);
  };

  renderScreen(current);
})();
