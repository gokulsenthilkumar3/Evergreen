import { safeContacts } from "../authored-model.js";
const $ = (s) => document.querySelector(s),
  reduced = matchMedia("(prefers-reduced-motion: reduce)");
const chapters = [
  [
    "01 / CAMPUS",
    "A wider view.\nA clearer next step.",
    "Bring material, production and dispatch into the same conversation.",
    "Material inward",
    "Start with a traceable receipt",
    ["Supplier reference", "Lot identity", "Received quantity"],
  ],
  [
    "02 / FLOOR",
    "Every handoff\nhas a history.",
    "Follow the input, output and stock record across the floor.",
    "Production record",
    "Keep the shift’s context together",
    ["Input consumption", "Output and waste", "Stock movement"],
  ],
  [
    "03 / DECISION",
    "The right question.\nThe right record.",
    "Review what is outstanding before the next dispatch or invoice.",
    "Dispatch review",
    "Close the loop with evidence",
    ["Customer reference", "Dispatch quantity", "Invoice and export"],
  ],
];
let position = 0,
  playing = false,
  frame = 0,
  last = 0,
  chapter = -1;
function render() {
  const next = Math.min(2, Math.floor(position / 8));
  $("#scrub").value = String(position);
  $("#time").textContent =
    `00:${String(Math.floor(position)).padStart(2, "0")} / 00:24`;
  if (next === chapter) return;
  chapter = next;
  const c = chapters[next];
  $(".stage").dataset.chapter = String(next);
  for (const [id, value] of [
    ["chapter-number", c[0]],
    ["scene-title", c[1]],
    ["scene-copy", c[2]],
    ["record-title", c[3]],
    ["record-subtitle", c[4]],
  ])
    $("#" + id).textContent = value;
  $("#record-list").replaceChildren(
    ...c[5].map((text) => {
      const li = document.createElement("li");
      li.textContent = text;
      return li;
    }),
  );
  document
    .querySelectorAll(".chapters button")
    .forEach((button, index) =>
      button.setAttribute("aria-pressed", String(index === next)),
    );
}
function stop() {
  playing = false;
  cancelAnimationFrame(frame);
  last = 0;
  $(".cinema").classList.remove("playing");
  $("#play").textContent = "▶";
  $("#play").setAttribute("aria-label", "Play presentation");
}
function tick(now) {
  if (!playing) return;
  if (last) position = Math.min(24, position + (now - last) / 1000);
  last = now;
  render();
  if (position >= 24) {
    stop();
    $("#player-status").textContent =
      "Presentation complete. Replay or explore the specification.";
  } else frame = requestAnimationFrame(tick);
}
function play() {
  if (reduced.matches) {
    $("#player-status").textContent =
      "Reduced motion is enabled. Choose a chapter or use the timeline to explore.";
    return;
  }
  if (position >= 24) position = 0;
  playing = true;
  last = 0;
  $(".cinema").classList.add("playing");
  $("#play").textContent = "Ⅱ";
  $("#play").setAttribute("aria-label", "Pause presentation");
  $("#player-status").textContent = "Playing the illustrative platform story.";
  frame = requestAnimationFrame(tick);
}
$("#play").addEventListener("click", () => (playing ? stop() : play()));
$("#watch").addEventListener("click", () => {
  $("#story").scrollIntoView({ behavior: reduced.matches ? "auto" : "smooth" });
  if (!playing) play();
});
$("#restart").addEventListener("click", () => {
  stop();
  position = 0;
  render();
});
$("#scrub").addEventListener("input", (event) => {
  stop();
  position = Number(event.target.value);
  render();
});
document.querySelectorAll(".chapters button").forEach((button) =>
  button.addEventListener("click", () => {
    stop();
    position = Number(button.dataset.chapter) * 8;
    render();
  }),
);
$("#fullscreen").addEventListener("click", async () => {
  try {
    if (document.fullscreenElement) await document.exitFullscreen();
    else await $("#story").requestFullscreen();
  } catch {
    $("#player-status").textContent =
      "Fullscreen is unavailable. The presentation remains usable here.";
  }
});
document.addEventListener("fullscreenchange", () =>
  $("#fullscreen").setAttribute(
    "aria-label",
    document.fullscreenElement
      ? "Exit fullscreen presentation"
      : "Enter fullscreen presentation",
  ),
);
document.addEventListener("visibilitychange", () => {
  if (document.hidden) stop();
});
reduced.addEventListener("change", () => {
  if (reduced.matches) stop();
});
if ("IntersectionObserver" in window)
  new IntersectionObserver((entries) => {
    if (!entries[0].isIntersecting) stop();
  }).observe($("#story"));
window.addEventListener("pagehide", stop);
render();
fetch("/marketing-api/site-settings", {
  credentials: "omit",
  signal: AbortSignal.timeout(4000),
})
  .then(async (response) => {
    if (!response.ok) return;
    const contacts = safeContacts(await response.json());
    $("#sales").textContent = contacts.salesEmail;
    $("#sales").href =
      "mailto:" + encodeURIComponent(contacts.salesEmail).replace(/%40/g, "@");
    $("#hours").textContent = `${contacts.opensAt}–${contacts.closesAt} IST`;
  })
  .catch(() => {});
