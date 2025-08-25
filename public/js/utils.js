// /public/js/utils.js
export function cx(...parts) {
  return parts.filter(Boolean).join(" ");
}

export function escapeHtml(s = "") {
  return String(s).replace(/[&<>"']/g, c => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  }[c]));
}

export function escapeAttr(s = "") {
  return escapeHtml(s);
}
