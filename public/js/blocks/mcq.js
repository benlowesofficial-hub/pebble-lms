// /public/js/blocks/mcq.js
import { escapeHtml } from "../utils.js";
import bus from "../event-bus.js";

export const type = "mcq";

export function render(b) {
  return `
    <div id="${b.id}" class="space-y-3">
      <p class="font-semibold">${escapeHtml(b.data?.question || "")}</p>
      ${(b.data?.options || []).map(opt => `
        <label class="block border rounded p-2 cursor-pointer">
          <input type="${b.data?.multiple ? "checkbox" : "radio"}"
                 name="${b.id}"
                 value="${opt.id}"
                 class="mr-2">
          ${escapeHtml(opt.text || "")}
        </label>
      `).join("")}
      <div class="mt-2 text-sm text-inkMuted hidden"></div>
    </div>`;
}

export function hydrate(b) {
  const container = document.getElementById(b.id);
  if (!container) return;

  const inputs     = container.querySelectorAll("input");
  const feedbackEl = container.querySelector("div.mt-2");

  inputs.forEach(input => {
    input.addEventListener("change", () => {
      const opt = (b.data?.options || []).find(o => o.id === input.value);
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
