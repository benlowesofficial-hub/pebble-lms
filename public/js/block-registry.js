// /public/js/block-registry.js
import * as header     from "./blocks/header.js";
import * as divider    from "./blocks/divider.js";
import * as text       from "./blocks/text.js";
import * as list       from "./blocks/list.js";
import * as icon       from "./blocks/icon.js";
import * as image      from "./blocks/image.js";
import * as multiImage from "./blocks/multiImage.js";
import * as accordion  from "./blocks/accordion.js";
import * as mcq        from "./blocks/mcq.js";

// Build registry: { typeName: { render, hydrate? } }
function reg(...mods) {
  const out = {};
  for (const m of mods) {
    const type = m.type;
    if (!type || typeof m.render !== "function") {
      console.warn("[block-registry] Skipping invalid block module:", m);
      continue;
    }
    out[type] = { render: m.render, hydrate: m.hydrate };
  }
  return out;
}

export const registry = reg(
  header, divider, text, list, icon, image, multiImage, accordion, mcq
);
