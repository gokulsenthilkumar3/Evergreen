const root = document.documentElement;
document.querySelectorAll("[data-palette]").forEach((button) =>
  button.addEventListener("click", () => {
    root.dataset.palette = button.dataset.palette;
    document
      .querySelectorAll("button[data-palette]")
      .forEach((item) =>
        item.setAttribute("aria-pressed", String(item === button)),
      );
  }),
);
const button = document.querySelector("#spool-enable"),
  canvas = document.querySelector("#hero-spool"),
  status = document.querySelector("#spool-status");
let spool,
  visible = true;
const reduced = matchMedia("(prefers-reduced-motion: reduce)");
function sync() {
  spool?.setRunning(
    visible &&
      !document.hidden &&
      !reduced.matches &&
      root.dataset.motion !== "off" &&
      root.dataset.images !== "off",
  );
}
button.addEventListener("click", async () => {
  button.disabled = true;
  try {
    const { createSpool } = await import("./webgl.js");
    spool = createSpool(canvas, () => {
      canvas.parentElement.dataset.ready = "false";
      status.textContent =
        "Static material illustration retained: 3D context unavailable.";
      spool?.dispose();
      spool = undefined;
      button.disabled = false;
    });
    canvas.parentElement.dataset.ready = "true";
    window.dispatchEvent(new Event("resize"));
    spool.draw();
    sync();
    status.textContent =
      "3D yarn package · move your pointer to inspect the surface";
    button.hidden = true;
  } catch {
    status.textContent =
      "3D unavailable on this device. The material illustration remains available.";
    button.disabled = false;
  }
});
canvas.addEventListener("pointermove", (event) => {
  if (reduced.matches || root.dataset.motion === "off") return;
  const bounds = canvas.getBoundingClientRect();
  spool?.setPointer(
    (event.clientX - bounds.left) / bounds.width - 0.5,
    (event.clientY - bounds.top) / bounds.height - 0.5,
  );
});
new MutationObserver(sync).observe(root, {
  attributes: true,
  attributeFilter: ["data-motion", "data-images"],
});
if ("IntersectionObserver" in window)
  new IntersectionObserver((entries) => {
    visible = entries[0].isIntersecting;
    sync();
  }).observe(canvas.parentElement);
document.addEventListener("visibilitychange", sync);
reduced.addEventListener("change", sync);
window.addEventListener("pagehide", () => {
  spool?.dispose();
  spool = undefined;
});
