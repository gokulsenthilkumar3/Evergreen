import {
  billingModel,
  buildBrief,
  buildReview,
  findGuideEntry,
  directions,
  stageDetails,
  roleReadings,
} from "./model.js";

const root = document.documentElement;
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];
const media = matchMedia("(prefers-reduced-motion: reduce)");
const art = $("#hero-art");
const film = $(".film-art");
const announceElement = $("#announcement");
let announcementTimer;
let preferredMotion = true;
let heroVisible = true;
let webglController;
let webglPending;
let effectRevision = 0;
let filmFrame = 0;
let filmProgress = 0;
let filmPlaying = false;
let filmTime = 0;
let lastFocus;
const state = {
  direction: "editorial",
  effect: "sculpture",
  layer: "material",
  role: "owner",
  section: false,
};
try {
  preferredMotion = localStorage.getItem("evergreen-atelier-motion") !== "off";
} catch {
  /* A preference can remain visit-only. */
}

function announce(message) {
  clearTimeout(announcementTimer);
  announceElement.textContent = message;
  announceElement.dataset.show = "true";
  announcementTimer = setTimeout(() => {
    announceElement.dataset.show = "false";
  }, 4500);
}
function motionAllowed() {
  return preferredMotion && !media.matches && !document.hidden;
}
function renderMotion() {
  const active = motionAllowed();
  root.dataset.motion = active ? "on" : "off";
  root.dataset.pageVisible = String(!document.hidden);
  $("#motion-toggle").setAttribute("aria-pressed", String(!active));
  $("#motion-label").textContent = media.matches
    ? "Device: reduced motion"
    : preferredMotion
      ? "Pause motion"
      : "Motion paused";
  $("#motion-toggle").disabled = media.matches;
  $("#motion-footer").setAttribute("aria-pressed", String(!active));
  $("#motion-footer").disabled = media.matches;
  $("#motion-footer").textContent = media.matches
    ? "Motion: reduced by device"
    : preferredMotion
      ? "Pause motion"
      : "Resume motion";
  webglController?.setRunning(
    active && heroVisible && state.effect === "webgl" && !state.section,
  );
  if (!active || !heroVisible || state.effect !== "sequence" || state.section)
    stopFilm();
}
function toggleMotion() {
  preferredMotion = !preferredMotion;
  try {
    localStorage.setItem(
      "evergreen-atelier-motion",
      preferredMotion ? "on" : "off",
    );
  } catch {
    /* No personal data is persisted. */
  }
  renderMotion();
}
$("#motion-toggle").addEventListener("click", toggleMotion);
$("#motion-footer").addEventListener("click", toggleMotion);
media.addEventListener("change", renderMotion);
document.addEventListener("visibilitychange", renderMotion);
if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        entry.target.dataset.visible = String(entry.isIntersecting);
        if (entry.target === art) {
          heroVisible = entry.isIntersecting;
          renderMotion();
        }
      }
    },
    { threshold: 0.04 },
  );
  observer.observe(art);
  observer.observe($("#flow-panel"));
}

function updateTabs(buttons, selected, key) {
  buttons.forEach((button) => {
    const active = button.dataset[key] === selected;
    button.setAttribute("aria-selected", String(active));
    button.tabIndex = active ? 0 : -1;
  });
}
function arrowTabs(container, buttons) {
  container.addEventListener("keydown", (event) => {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    const current = buttons.indexOf(document.activeElement);
    if (current < 0) return;
    event.preventDefault();
    const index =
      event.key === "Home"
        ? 0
        : event.key === "End"
          ? buttons.length - 1
          : (current + (event.key === "ArrowRight" ? 1 : -1) + buttons.length) %
            buttons.length;
    buttons[index].focus();
    buttons[index].click();
  });
}
function setDirection(key, scroll = false) {
  if (!Object.hasOwn(directions, key)) return;
  const direction = directions[key];
  state.direction = key;
  root.dataset.direction = key;
  updateTabs($$(".direction-tabs button"), key, "direction");
  $("#concept").setAttribute("aria-labelledby", `tab-${key}`);
  $$(".direction-card").forEach((button) =>
    button.setAttribute("aria-pressed", String(button.dataset.choice === key)),
  );
  const headline = [];
  direction.headline.forEach((line, index) => {
    if (index) headline.push(document.createElement("br"));
    const element = document.createElement(line.emphasis ? "em" : "span");
    element.textContent = line.text;
    headline.push(element);
  });
  $("#hero-title").replaceChildren(...headline);
  $(".hero-intro").textContent = direction.intro;
  const url = new URL(location.href);
  url.searchParams.set("direction", key);
  history.replaceState(null, "", url);
  setEffect(direction.effect);
  if (scroll) {
    $("#main").scrollIntoView({
      behavior: motionAllowed() ? "smooth" : "instant",
    });
    $("#hero-title").tabIndex = -1;
    $("#hero-title").focus({ preventScroll: true });
  }
}
$$(".direction-tabs button").forEach((button) =>
  button.addEventListener("click", () =>
    setDirection(button.dataset.direction),
  ),
);
$$(".direction-card").forEach((button) =>
  button.addEventListener("click", () =>
    setDirection(button.dataset.choice, true),
  ),
);
arrowTabs($(".direction-tabs"), $$(".direction-tabs button"));

async function setEffect(key) {
  if (!["blueprint", "sculpture", "webgl", "sequence"].includes(key)) return;
  const revision = ++effectRevision;
  state.effect = key;
  $("#brief-preview").textContent = currentBrief();
  root.dataset.effect = key;
  state.section = false;
  root.dataset.section = "false";
  $("#section-toggle").setAttribute("aria-pressed", "false");
  $$(".effect-options button").forEach((button) =>
    button.setAttribute("aria-pressed", String(button.dataset.effect === key)),
  );
  const captions = {
    blueprint: "A 2D section study. The thread shows direction.",
    sculpture: "A dimensional yarn study. Four layers, one object.",
    webgl: "A true 3D yarn package. Procedural geometry and light.",
    sequence: "Fibre → yarn → record. An eight-second motion study.",
  };
  const notes = {
    blueprint:
      "SVG lines, a travelling thread and a static reduced-motion view.",
    sculpture:
      "CSS perspective and a four-layer spool. No WebGL or 3D library.",
    webgl:
      "Loading the optional local 3D renderer. The CSS object remains as a fallback.",
    sequence:
      "Native SVG/CSS composition. Play or scrub it; an After Effects authoring script is available.",
  };
  $("#art-caption").textContent = captions[key];
  $("#motion-note").textContent = notes[key];
  $("#film-controls").hidden = key !== "sequence";
  if (key === "sequence") renderFilm(0);
  renderMotion();
  if (key === "webgl") {
    try {
      webglPending ||= import("./webgl.js");
      const module = await webglPending;
      if (revision !== effectRevision) return;
      webglController ||= module.createSpool($("#spool-webgl"), () => {
        webglController?.dispose();
        webglController = undefined;
        root.dataset.webgl = "fallback";
        if (state.effect === "webgl")
          $("#motion-note").textContent =
            "The 3D context was lost. The CSS yarn illustration remains available.";
      });
      root.dataset.webgl = "ready";
      $("#motion-note").textContent =
        "Real WebGL geometry. Drag the pointer gently to inspect; static on reduced-motion devices. Rendering pauses offscreen.";
      renderMotion();
      webglController.draw();
    } catch {
      if (revision !== effectRevision) return;
      root.dataset.webgl = "fallback";
      $("#motion-note").textContent =
        "WebGL is unavailable on this device. You are seeing the CSS 3D fallback; all content still works.";
    }
  }
}
$$(".effect-options button").forEach((button) =>
  button.addEventListener("click", () => setEffect(button.dataset.effect)),
);
$("#section-toggle").addEventListener("click", () => {
  state.section = !state.section;
  root.dataset.section = String(state.section);
  $("#section-toggle").setAttribute("aria-pressed", String(state.section));
  renderMotion();
});
art.addEventListener("pointermove", (event) => {
  if (
    !motionAllowed() ||
    !matchMedia("(pointer:fine)").matches ||
    state.section
  )
    return;
  const bounds = art.getBoundingClientRect();
  const x = (event.clientX - bounds.left) / bounds.width - 0.5;
  const y = (event.clientY - bounds.top) / bounds.height - 0.5;
  if (state.effect === "webgl") webglController?.setPointer(x, y);
  else if (state.effect === "sculpture") {
    art.style.setProperty("--tilt-x", `${-y * 8}deg`);
    art.style.setProperty("--tilt-y", `${x * 12}deg`);
  }
});
art.addEventListener("pointerleave", () => {
  art.style.setProperty("--tilt-x", "0deg");
  art.style.setProperty("--tilt-y", "0deg");
  webglController?.setPointer(0, 0);
});

function renderFilm(progress) {
  filmProgress = Math.max(0, Math.min(1, progress));
  const ease = (value) => {
    const clamped = Math.max(0, Math.min(1, value));
    return clamped * clamped * (3 - 2 * clamped);
  };
  const reveal = ease((filmProgress - 0.2) / 0.22);
  const record = ease((filmProgress - 0.43) / 0.2);
  const title = ease((filmProgress - 0.74) / 0.2);
  const fibres = $(".film-fibres");
  fibres.style.opacity = String(1 - reveal);
  fibres.style.transform = `scaleX(${1 - reveal * 0.8}) rotate(${reveal * -16}deg)`;
  $(".film-cone").style.opacity = String(reveal * (1 - record));
  $(".film-cone").style.transform =
    `translateY(${(1 - reveal) * 18}px) rotate(-12deg)`;
  $(".film-record").style.opacity = String(record * (1 - title));
  $(".film-record").style.transform =
    `translateY(${(1 - record) * 22}px) scale(${0.96 + record * 0.04})`;
  $(".film-word").style.opacity = String(title);
  $(".film-word").style.transform = `translateY(${(1 - title) * 18}px)`;
  $("#film-frame-time").textContent =
    `FRAME ${String(Math.round(filmProgress * 480)).padStart(3, "0")} / 480`;
  $("#film-scrub").value = String(filmProgress * 100);
}
function stopFilm() {
  cancelAnimationFrame(filmFrame);
  filmFrame = 0;
  filmPlaying = false;
  $("#film-play").textContent = "Play 8-second study";
}
function advanceFilm(time) {
  if (!filmPlaying || !motionAllowed() || !heroVisible) {
    stopFilm();
    return;
  }
  const next = Math.min(1, (time - filmTime) / 8000);
  renderFilm(next);
  if (next >= 1) stopFilm();
  else filmFrame = requestAnimationFrame(advanceFilm);
}
$("#film-play").addEventListener("click", () => {
  if (filmPlaying) {
    stopFilm();
    return;
  }
  if (!motionAllowed()) {
    announce(
      "Motion is paused. You can still inspect frames with the scrubber.",
    );
    return;
  }
  const from = filmProgress >= 0.999 ? 0 : filmProgress;
  filmTime = performance.now() - from * 8000;
  filmPlaying = true;
  $("#film-play").textContent = "Pause study";
  filmFrame = requestAnimationFrame(advanceFilm);
});
$("#film-scrub").addEventListener("input", (event) => {
  stopFilm();
  renderFilm(Number(event.target.value) / 100);
});

function renderFlow() {
  updateTabs($$(".segmented button"), state.layer, "layer");
  $("#flow-panel").setAttribute("aria-labelledby", `layer-${state.layer}`);
  $$(".flow-node").forEach((button) => {
    button.querySelector(".node-detail").textContent =
      stageDetails[button.dataset.node][state.layer];
  });
  const fault = $("#fault-toggle").checked;
  $("#flow-panel").dataset.fault = String(fault);
  $("#flow-caption").textContent = fault
    ? "Illustrative missing receipt: later teams cannot verify the opening quantity or supplier record. Software does not reconstruct an unrecorded handoff automatically."
    : `${state.layer[0].toUpperCase() + state.layer.slice(1)} layer: ${state.layer === "material" ? "an illustrative route through a textile business. Individual mill routes and records vary." : state.layer === "data" ? "the record required at each handoff. Review actual cross-module reconciliation in your demo." : "where a commitment becomes stock, cost, receivable or cash. No live amounts are shown."}`;
}
$$(".segmented button").forEach((button) =>
  button.addEventListener("click", () => {
    state.layer = button.dataset.layer;
    renderFlow();
  }),
);
arrowTabs($(".segmented"), $$(".segmented button"));
$("#fault-toggle").addEventListener("change", renderFlow);
function setRole(role) {
  state.role = role;
  const reading = roleReadings[role];
  updateTabs($$(".role-options button"), role, "role");
  $("#role-panel").setAttribute("aria-labelledby", `role-${role}`);
  $("#role-panel h3").textContent = reading.title;
  $("#role-panel p").textContent = reading.body;
  $$(".flow-node").forEach((button) => {
    button.dataset.roleRelevant = String(
      reading.nodes.includes(button.dataset.node),
    );
  });
}
$$(".role-options button").forEach((button) =>
  button.addEventListener("click", () => setRole(button.dataset.role)),
);
arrowTabs($(".role-options"), $$(".role-options button"));

function openDialog(dialog) {
  lastFocus = document.activeElement;
  dialog.showModal();
}
function closeDialog(dialog) {
  dialog.close();
  lastFocus?.focus({ preventScroll: true });
}
$$("[data-close]").forEach((button) =>
  button.addEventListener("click", () =>
    closeDialog(document.getElementById(button.dataset.close)),
  ),
);
$$("dialog").forEach((dialog) => {
  dialog.addEventListener("cancel", () =>
    queueMicrotask(() => lastFocus?.focus({ preventScroll: true })),
  );
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) {
      const rect = dialog.getBoundingClientRect();
      if (
        event.clientX < rect.left ||
        event.clientX > rect.right ||
        event.clientY < rect.top ||
        event.clientY > rect.bottom
      )
        closeDialog(dialog);
    }
  });
});
$$(".flow-node").forEach((button) =>
  button.addEventListener("click", () => {
    const node = stageDetails[button.dataset.node];
    $("#node-title").textContent = node.title;
    $("#node-kicker").textContent = node.kicker;
    const fragment = document.createDocumentFragment();
    for (const [label, content] of [
      ["Physical handoff", node.physical],
      ["The record", node.record],
      ["What can break", node.risk],
      ["Application coverage", node.coverage],
    ]) {
      const dt = document.createElement("dt");
      dt.textContent = label;
      const dd = document.createElement("dd");
      dd.textContent = content;
      fragment.append(dt, dd);
    }
    $("#node-content").replaceChildren(fragment);
    $("#node-source").hidden = button.dataset.node !== "production";
    openDialog($("#node-dialog"));
  }),
);

const inr = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
function calculate() {
  $("#invoices-output").textContent = $("#monthly-invoices").value;
  $("#days-output").textContent = $("#billing-days").value;
  const result = billingModel({
    invoices: $("#monthly-invoices").valueAsNumber,
    value: $("#invoice-value").valueAsNumber,
    days: $("#billing-days").valueAsNumber,
    annualRate: $("#capital-rate").valueAsNumber,
  });
  if (!result || !$("#calculator-form").checkValidity()) {
    $("#capital-result").textContent = "—";
    $("#cost-result").textContent =
      "Enter valid values in every field to calculate.";
    $("#scenario-rows").replaceChildren();
    return;
  }
  $("#capital-result").textContent = inr(result.capital);
  $("#cost-result").textContent =
    `Illustrative annual carrying-cost equivalent: ${inr(result.cost)}`;
  const fragment = document.createDocumentFragment();
  result.scenarios.forEach((row) => {
    const tr = document.createElement("tr");
    const th = document.createElement("th");
    th.scope = "row";
    th.textContent = row.name;
    const days = document.createElement("td");
    days.textContent = String(row.days);
    const capital = document.createElement("td");
    capital.textContent = inr(row.capital);
    tr.append(th, days, capital);
    fragment.append(tr);
  });
  $("#scenario-rows").replaceChildren(fragment);
  ["low", "base", "high"].forEach((key, index) => {
    $(`#bar-${key}`).style.transform =
      `scaleY(${result.scenarios[index].days / 15})`;
  });
}
$("#calculator-form").addEventListener("input", calculate);
$("#calculator-form").addEventListener("submit", (event) =>
  event.preventDefault(),
);
$$(".xml-annotations button").forEach((button) =>
  button.addEventListener("click", () => {
    $$(".xml-annotations button").forEach((item) =>
      item.setAttribute("aria-pressed", String(item === button)),
    );
    $$("#xml-code [data-field]").forEach((line) =>
      line.classList.toggle(
        "xml-active",
        line.dataset.field === button.dataset.xml,
      ),
    );
  }),
);
async function copy(text) {
  try {
    await navigator.clipboard.writeText(text);
    announce("Copied. Nothing was sent.");
  } catch {
    announce(
      "Clipboard access is unavailable. Use the download button or select the visible text.",
    );
  }
}
function download(text, name, type = "text/plain;charset=utf-8") {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  announce("Download started. This is a local draft; nothing was sent.");
}
$("#copy-xml").addEventListener("click", () =>
  copy($("#xml-code").textContent),
);
$("#download-xml").addEventListener("click", () =>
  download(
    $("#xml-code").textContent,
    "evergreen-illustrative-voucher-excerpt.xml",
    "application/xml;charset=utf-8",
  ),
);
function currentBrief() {
  return buildBrief({
    mill: $("#brief-mill").value,
    role: $("#brief-role").value,
    goal: $("#brief-goal").value,
    direction: directions[state.direction].name,
    effect: state.effect,
  });
}
$("#brief-form").addEventListener("input", () => {
  $("#brief-preview").textContent = currentBrief();
});
$("#brief-form").addEventListener("submit", (event) => event.preventDefault());
$("#copy-brief").addEventListener("click", () => copy(currentBrief()));
$("#download-brief").addEventListener("click", () =>
  download(currentBrief(), "evergreen-demo-brief.txt"),
);
$("#guide-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const entry = findGuideEntry($("#guide-question").value);
  const paragraph = document.createElement("p");
  paragraph.textContent = entry.answer;
  const link = document.createElement("a");
  link.href = entry.section;
  link.textContent = entry.label;
  $("#guide-answer").replaceChildren(paragraph, link);
});
function reviewText() {
  return buildReview({
    direction: state.direction,
    effect: state.effect,
    motion: motionAllowed()
      ? "On"
      : media.matches
        ? "Reduced by device preference"
        : "Paused",
    notes: $("#review-notes").value,
  });
}
function showReview() {
  $("#review-summary").textContent = reviewText();
  openDialog($("#review-dialog"));
}
$("#review-open").addEventListener("click", showReview);
$("#review-footer").addEventListener("click", showReview);
$("#review-notes").addEventListener("input", () => {
  $("#review-summary").textContent = reviewText();
});
$("#copy-review").addEventListener("click", () => copy(reviewText()));
$("#download-review").addEventListener("click", () =>
  download(
    reviewText(),
    "evergreen-design-review.md",
    "text/markdown;charset=utf-8",
  ),
);

renderMotion();
renderFlow();
setRole("owner");
calculate();
$("#brief-preview").textContent = currentBrief();
const requestedDirection = new URL(location.href).searchParams.get("direction");
setDirection(
  Object.hasOwn(directions, requestedDirection || "")
    ? requestedDirection
    : "editorial",
);
window.addEventListener("pagehide", () => {
  stopFilm();
  webglController?.dispose();
  webglController = undefined;
  root.dataset.webgl = "fallback";
  clearTimeout(announcementTimer);
});
window.addEventListener("pageshow", (event) => {
  if (event.persisted && state.effect === "webgl") setEffect("webgl");
});
