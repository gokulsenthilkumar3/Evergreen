import {
  defaultContacts,
  safeContacts,
  faults,
  stages,
  narrativeSteps,
  arithmetic,
  makeBrief,
  voucherLines,
} from "./authored-model.js";
const $ = (selector) => document.querySelector(selector),
  $$ = (selector) => [...document.querySelectorAll(selector)];
const root = document.documentElement,
  reduced = matchMedia("(prefers-reduced-motion: reduce)"),
  desktop = matchMedia("(min-width: 961px)"),
  fine = matchMedia("(pointer:fine)");
let motion = true,
  images = true,
  currentStep = -1,
  layer = "material",
  fault = "gate",
  narrativeVisible = false,
  scrollFrame = 0,
  hall,
  hallModule,
  hallVisible = false,
  lastFocus,
  audio;
const lowPower =
  (navigator.deviceMemory && navigator.deviceMemory <= 4) ||
  (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4);
try {
  motion = localStorage.getItem("evergreen-spec-motion") !== "off";
  images = localStorage.getItem("evergreen-spec-images") !== "off";
} catch {
  /* Preferences can remain visit-only. */
}
root.dataset.enhanced = "true";
root.dataset.lowPower = String(!!lowPower);
function animateAllowed() {
  return motion && !reduced.matches && !document.hidden;
}
function syncPreferences() {
  root.dataset.motion = motion && !reduced.matches ? "on" : "off";
  root.dataset.images = images ? "on" : "off";
  root.dataset.pageVisible = String(!document.hidden);
  $("#motion-toggle").textContent = reduced.matches
    ? "Motion: device reduced"
    : motion
      ? "Motion: on"
      : "Motion: paused";
  $("#motion-toggle").setAttribute(
    "aria-pressed",
    String(!motion || reduced.matches),
  );
  $("#motion-toggle").disabled = reduced.matches;
  $("#images-toggle").textContent = images ? "Text view" : "Figures on";
  $("#images-toggle").setAttribute("aria-pressed", String(!images));
  const running = animateAllowed() && hallVisible && images && !lowPower;
  hall?.setRunning(running);
  root.dataset.hallRunning = String(!!hall && running);
  if (!animateAllowed()) {
    cancelAnimationFrame(scrollFrame);
    scrollFrame = 0;
    audio?.silence();
  }
  if (!animateAllowed() && audio) {
    audio.silence();
    $("#sound-toggle").textContent = "Sound: off";
    $("#sound-toggle").setAttribute("aria-pressed", "false");
  }
}
$("#motion-toggle").addEventListener("click", () => {
  motion = !motion;
  try {
    localStorage.setItem("evergreen-spec-motion", motion ? "on" : "off");
  } catch {}
  syncPreferences();
});
$("#images-toggle").addEventListener("click", () => {
  images = !images;
  try {
    localStorage.setItem("evergreen-spec-images", images ? "on" : "off");
  } catch {}
  syncPreferences();
});
$("#print-spec").addEventListener("click", () => window.print());
reduced.addEventListener("change", syncPreferences);
desktop.addEventListener("change", syncPreferences);
document.addEventListener("visibilitychange", syncPreferences);

function chapterEntry(section) {
  if (section.dataset.entered) return;
  section.dataset.entered = "true";
  if (animateAllowed()) section.classList.add("chapter-enter");
}
if ("IntersectionObserver" in window) {
  const chapters = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          chapterEntry(entry.target);
          $("#section-position").textContent =
            `Section ${entry.target.dataset.section} of 6`;
          $$(".contents a").forEach((a) => {
            if (a.hash === `#${entry.target.id}`)
              a.setAttribute("aria-current", "location");
            else a.removeAttribute("aria-current");
          });
        }
      }
    },
    { rootMargin: "-15% 0px -55% 0px", threshold: 0 },
  );
  $$(".document-section").forEach((section) => chapters.observe(section));
  const narrativeObserver = new IntersectionObserver(
    (entries) => {
      narrativeVisible = entries[0].isIntersecting;
      if (narrativeVisible) queueScroll();
    },
    { threshold: 0 },
  );
  narrativeObserver.observe($("#record-narrative"));
  const hallObserver = new IntersectionObserver(
    (entries) => {
      hallVisible = entries[0].isIntersecting;
      syncPreferences();
    },
    { threshold: 0.04 },
  );
  hallObserver.observe($("#mill-hall"));
} else {
  chapterEntry($("#cover"));
}

const descriptions = {
  material: [
    "Cotton enters stores",
    "Fibre becomes yarn",
    "Stock awaits its next step",
    "A challan leaves the mill",
    "Goods are handed over",
    "Invoice, payment and export",
  ],
  data: [
    "Receipt and lot reference",
    "Consumption, output and waste",
    "Movement and location",
    "Issue, return and outstanding",
    "Order and dispatch reference",
    "Saved invoice and voucher file",
  ],
  value: [
    "A purchase becomes stock",
    "Conversion cost is committed",
    "Capital is held in material",
    "Material remains with a partner",
    "Stock becomes a customer commitment",
    "Receivable and collected cash",
  ],
};
function setLayer(next) {
  layer = next;
  $$(".layer-controls button").forEach((button) => {
    const active = button.dataset.layer === layer;
    button.setAttribute("aria-selected", String(active));
    button.tabIndex = active ? 0 : -1;
  });
  $("#flow-panel").setAttribute("aria-labelledby", `layer-${layer}`);
  $$(".record-node").forEach(
    (node, index) =>
      (node.querySelector("small").textContent = descriptions[layer][index]),
  );
}
$$(".layer-controls button").forEach((button) =>
  button.addEventListener("click", () => setLayer(button.dataset.layer)),
);
$(".layer-controls").addEventListener("keydown", (event) => {
  const buttons = $$(".layer-controls button"),
    current = buttons.indexOf(document.activeElement);
  if (
    current < 0 ||
    !["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)
  )
    return;
  event.preventDefault();
  const next =
    event.key === "Home"
      ? 0
      : event.key === "End"
        ? buttons.length - 1
        : (current + (event.key === "ArrowRight" ? 1 : -1) + buttons.length) %
          buttons.length;
  buttons[next].focus();
  buttons[next].click();
});
function setFault(next) {
  fault = next;
  const example = faults[fault];
  $$(".record-node").forEach((node, index) => {
    const affected = !!example?.nodes.includes(node.dataset.node);
    node.dataset.fault = String(affected);
    node.dataset.cascade = "false";
    node.style.animationDelay = `${index * 70}ms`;
    if (affected && animateAllowed())
      requestAnimationFrame(() => {
        node.dataset.cascade = "true";
      });
  });
  $("#fault-consequence").textContent =
    example?.consequence ||
    "No missing record is highlighted. This is still an illustrative diagram, not a verified integration chain.";
  for (const [id, key] of [
    ["fault-owner", "owner"],
    ["fault-accountant", "accountant"],
    ["fault-floor", "floor"],
  ])
    $(`#${id}`).textContent =
      example?.[key] ||
      "Check the actual saved record and the next handoff before relying on it.";
  const voices = $(".voices");
  voices.dataset.unfold = "false";
  if (animateAllowed())
    requestAnimationFrame(() => (voices.dataset.unfold = "true"));
}
$$("input[name=fault]").forEach((input) =>
  input.addEventListener("change", () => {
    if (input.checked) setFault(input.value);
  }),
);

const dialog = $("#record-dialog");
function closeRecord() {
  dialog.close();
  lastFocus?.focus({ preventScroll: true });
}
$(".dialog-close").addEventListener("click", (event) => {
  event.preventDefault();
  closeRecord();
});
dialog.addEventListener("cancel", () =>
  queueMicrotask(() => lastFocus?.focus({ preventScroll: true })),
);
function showRecord(title, fields, isVoucher = false) {
  lastFocus = document.activeElement;
  $("#dialog-title").textContent = title;
  const fragment = document.createDocumentFragment();
  fields.forEach(([name, value, url]) => {
    const dt = document.createElement("dt");
    dt.textContent = name;
    const dd = document.createElement("dd");
    if (url) {
      const a = document.createElement("a");
      a.href = url;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      a.textContent = value;
      dd.append(a);
    } else dd.textContent = value;
    fragment.append(dt, dd);
  });
  $("#dialog-fields").replaceChildren(fragment);
  $("#voucher-detail").hidden = !isVoucher;
  dialog.showModal();
}
$$(".record-node").forEach((button) =>
  button.addEventListener("click", () => {
    const stage = stages[button.dataset.node];
    showRecord(
      stage.title,
      [
        ["Physical", stage.physical],
        ["Recorded", stage.recorded],
        ["Missing → consequence", stage.missing],
        ["Reference", stage.reference, stage.url],
      ],
      button.dataset.node === "account",
    );
  }),
);
const xml = () => voucherLines.map((line) => line[0]).join("\n");
const xmlFragment = document.createDocumentFragment();
voucherLines.forEach(([tag, meaning]) => {
  const li = document.createElement("li"),
    code = document.createElement("code"),
    span = document.createElement("span");
  code.textContent = tag;
  span.textContent = meaning;
  li.append(code, span);
  xmlFragment.append(li);
});
$("#voucher-lines").replaceChildren(xmlFragment);
async function copyText(text, status, button) {
  button.disabled = true;
  button.dataset.feedback = "pending";
  try {
    await navigator.clipboard.writeText(text);
    status.textContent = "Copied. Nothing has been sent.";
    button.dataset.feedback = "success";
    audio?.play("success");
  } catch {
    status.textContent =
      "Clipboard access is unavailable. Select the visible text or use Download.";
    button.dataset.feedback = "error";
  } finally {
    button.disabled = false;
  }
}
function download(text, name, type, status, button) {
  button.dataset.feedback = "pending";
  const url = URL.createObjectURL(new Blob([text], { type })),
    link = document.createElement("a");
  link.href = url;
  link.download = name;
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  button.dataset.feedback = "success";
  status.textContent =
    "Download started. This is a local file; nothing has been sent.";
  audio?.play("success");
}
$("#copy-xml").addEventListener("click", () =>
  copyText(xml(), $("#xml-status"), $("#copy-xml")),
);
$("#download-xml").addEventListener("click", () =>
  download(
    xml(),
    "evergreen-sales-voucher-excerpt.xml",
    "application/xml;charset=utf-8",
    $("#xml-status"),
    $("#download-xml"),
  ),
);

function renderStep(index) {
  const bounded = Math.max(0, Math.min(narrativeSteps.length - 1, index));
  if (bounded === currentStep) return;
  currentStep = bounded;
  const step = narrativeSteps[currentStep];
  $("#ticket-title").textContent = step.record;
  $("#narrative-title").textContent = step.title;
  $("#narrative-body").textContent = step.body;
  $("#narrative-index").textContent =
    `${currentStep + 1} / ${narrativeSteps.length}`;
  $("#ticket-fields").replaceChildren(
    ...step.fields.map((text) => {
      const li = document.createElement("li");
      li.textContent = text;
      return li;
    }),
  );
  $("#ticket-stamp").textContent =
    currentStep === 3
      ? "Partial return must be compared"
      : currentStep === 6
        ? "File exported ≠ import verified"
        : "Reference retained";
  $("#step-prev").disabled = currentStep === 0;
  $("#step-next").disabled = currentStep === narrativeSteps.length - 1;
  $$("[data-step]").forEach((button) => {
    if (Number(button.dataset.step) === currentStep)
      button.setAttribute("aria-current", "step");
    else button.removeAttribute("aria-current");
  });
  $(".record-ticket").dataset.change = "false";
  if (animateAllowed())
    requestAnimationFrame(() => ($(".record-ticket").dataset.change = "true"));
}
$("#step-prev").addEventListener("click", () => renderStep(currentStep - 1));
$("#step-next").addEventListener("click", () => renderStep(currentStep + 1));
$$("[data-step]").forEach((button) =>
  button.addEventListener("click", () =>
    renderStep(Number(button.dataset.step)),
  ),
);
function updateScroll() {
  scrollFrame = 0;
  if (!narrativeVisible || !animateAllowed() || !desktop.matches) return;
  const node = $("#record-narrative"),
    bounds = node.getBoundingClientRect(),
    distance = node.offsetHeight - window.innerHeight,
    progress = Math.max(0, Math.min(1, -bounds.top / Math.max(1, distance)));
  renderStep(Math.min(6, Math.floor(progress * 7)));
  const track = $(".ticket-track");
  $("#ticket-pulse").style.setProperty(
    "--ticket-travel",
    `${progress * track.clientWidth}px`,
  );
}
function queueScroll() {
  if (narrativeVisible && animateAllowed() && desktop.matches && !scrollFrame)
    scrollFrame = requestAnimationFrame(updateScroll);
}
window.addEventListener("scroll", queueScroll, { passive: true });

const money = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
function calculate() {
  const inputs = {
      invoices: $("#invoice-count").valueAsNumber,
      value: $("#average-value").valueAsNumber,
      days: $("#days-reduced").valueAsNumber,
      rate: $("#cost-of-capital").valueAsNumber,
    },
    result = arithmetic(inputs);
  if (!result || !$("#arithmetic-form").checkValidity()) {
    $("#arithmetic-error").textContent =
      "Enter a valid non-negative value in every field.";
    $("#worked-lines").replaceChildren();
    $("#sensitivity").textContent = "No estimate until the inputs are valid.";
    return;
  }
  $("#arithmetic-error").textContent = "";
  const lines = [
    `${inputs.invoices.toLocaleString("en-IN")} invoices/month`,
    `× ${money(inputs.value)} average`,
    `× ${inputs.days} days reduced ÷ 30`,
    `= ${money(result.capital)} working capital released`,
    `× ${inputs.rate}% annual cost of capital`,
    `= ${money(result.cost)}/year carrying-cost equivalent`,
  ];
  $("#worked-lines").replaceChildren(
    ...lines.map((text, index) => {
      const li = document.createElement("li");
      li.textContent = text;
      if (index === 3 || index === 5) li.className = "sum";
      return li;
    }),
  );
  $("#sensitivity").textContent =
    `At ${result.sensitivity.map((row) => row.days).join(" / ")} days: ${result.sensitivity.map((row) => money(row.capital)).join(" / ")} capital.`;
}
$("#arithmetic-form").addEventListener("input", calculate);
$("#arithmetic-form").addEventListener("submit", (event) =>
  event.preventDefault(),
);
function currentBrief() {
  return makeBrief({
    mill: $("#brief-mill").value,
    role: $("#brief-role").value,
    goal: $("#brief-goal").value,
    context: $("#brief-extra").value,
  });
}
$("#brief-form").addEventListener("input", () => {
  $("#brief-preview").textContent = currentBrief();
  $("#prepared-for").textContent = $("#brief-mill").value.trim() || "Your mill";
  $("#brief-status").textContent =
    "Nothing has been sent. This draft is yours.";
});
$("#brief-form").addEventListener("submit", (event) => event.preventDefault());
$("#copy-brief").addEventListener("click", () =>
  copyText(currentBrief(), $("#brief-status"), $("#copy-brief")),
);
$("#download-brief").addEventListener("click", () =>
  download(
    currentBrief(),
    "evergreen-specification-brief.txt",
    "text/plain;charset=utf-8",
    $("#brief-status"),
    $("#download-brief"),
  ),
);

function applyContacts(input, loaded = false) {
  const contacts = safeContacts(input);
  $$("[data-contact]").forEach((a) => {
    a.textContent = contacts[a.dataset.contact];
    a.href = `mailto:${encodeURIComponent(contacts[a.dataset.contact]).replace(/%40/g, "@")}`;
  });
  $$("[data-hours]").forEach(
    (el) => (el.textContent = `${contacts.opensAt}–${contacts.closesAt} IST`),
  );
  $("#contact-source").textContent = loaded
    ? "Published contact details from owner Marketing settings."
    : "Published defaults. These details can be edited by the owner in Marketing settings.";
}
async function loadContacts() {
  try {
    const response = await fetch("/marketing-api/site-settings", {
      credentials: "omit",
      cache: "no-store",
      signal: AbortSignal.timeout(4000),
    });
    if (!response.ok) return;
    applyContacts(await response.json(), true);
  } catch {
    /* The user-approved defaults remain available offline. */
  }
}

const svgNs = "http://www.w3.org/2000/svg";
for (let index = 0; index < 60; index++) {
  const row = Math.floor(index / 15),
    column = index % 15,
    use = document.createElementNS(svgNs, "use");
  use.setAttribute("href", "#bobbin-symbol");
  use.setAttribute(
    "transform",
    `translate(${115 + column * 29 + row * 115} ${301 - column * 15 + row * 32})`,
  );
  if ($("#hall-positions").children.length < 60)
    $("#hall-positions").append(use);
  if (index) {
    const option = document.createElement("option");
    option.value = String(index);
    option.textContent = `H${String(index + 1).padStart(2, "0")}`;
    $("#hall-select").append(option);
  }
}
function inspectHall(index) {
  const id = `H${String(index + 1).padStart(2, "0")}`;
  $("#hall-select").value = String(index);
  showRecord(`Example position ${id}`, [
    ["Physical", "A bobbin position in the illustrative hall layout."],
    [
      "Recorded",
      "No live machine record is connected. This selection identifies a position in the drawing only.",
    ],
    [
      "Missing → consequence",
      "A real production record would need its machine, shift, input and output references.",
    ],
    [
      "Reference",
      "CottonWorks spinning education; geometry is an original procedural study.",
      "https://cottonworks.com/learning-hub/yarn-manufacturing/fiber-preparation-for-spinning/",
    ],
  ]);
}
$("#hall-inspect").addEventListener("click", () =>
  inspectHall(Number($("#hall-select").value)),
);
$("#hall-select").addEventListener("change", () =>
  hall?.select(Number($("#hall-select").value)),
);
$("#hall-enable").addEventListener("click", async () => {
  if (reduced.matches || lowPower || !images) {
    $("#hall-status").textContent =
      "Static view retained for reduced motion, low-power mode or text view. The record selector still works.";
    return;
  }
  $("#hall-enable").disabled = true;
  $("#hall-status").textContent = "Loading the local 3D renderer...";
  try {
    hallModule ||= import("./mill-hall.js");
    const module = await hallModule;
    hall ||= module.createMillHall($("#hall-canvas"), inspectHall, () => {
      hall?.dispose();
      hall = undefined;
      root.dataset.hall = "fallback";
      root.dataset.hallRunning = "false";
      $("#hall-enable").disabled = false;
      $("#hall-status").textContent =
        "3D context lost. The static hall and record selector remain available.";
    });
    root.dataset.hall = "ready";
    $("#hall-status").textContent =
      "Procedural 3D study. No live machine data. Drawing is capped at 30 updates/second and pauses offscreen.";
    syncPreferences();
    hall.draw();
  } catch {
    root.dataset.hall = "fallback";
    $("#hall-status").textContent =
      "WebGL is unavailable. The static drawing and record selector remain available.";
    $("#hall-enable").disabled = false;
  }
});
$("#spec-sheet").addEventListener("pointermove", (event) => {
  if (!animateAllowed() || lowPower || !fine.matches) return;
  const bounds = $("#spec-sheet").getBoundingClientRect();
  $("#spec-sheet").style.setProperty(
    "--sheet-x",
    `${(0.5 - (event.clientY - bounds.top) / bounds.height) * 4}deg`,
  );
  $("#spec-sheet").style.setProperty(
    "--sheet-y",
    `${((event.clientX - bounds.left) / bounds.width - 0.5) * 4}deg`,
  );
});
$("#spec-sheet").addEventListener("pointerleave", () => {
  $("#spec-sheet").style.setProperty("--sheet-x", "0deg");
  $("#spec-sheet").style.setProperty("--sheet-y", "0deg");
});
$("#sound-toggle").addEventListener("click", async () => {
  if (reduced.matches) {
    $("#sound-toggle").textContent = "Sound: reduced mode";
    return;
  }
  try {
    const module = await import("./sound.js");
    audio ||= module.createSound();
    const enabled = await audio.toggle();
    $("#sound-toggle").textContent = enabled ? "Sound: on" : "Sound: off";
    $("#sound-toggle").setAttribute("aria-pressed", String(enabled));
  } catch {
    $("#sound-toggle").textContent = "Sound unavailable";
  }
});
document.addEventListener("click", (event) => {
  if (event.target.closest("button,summary") && animateAllowed())
    audio?.play("tick");
});
window.addEventListener("pageshow", () => {
  if (!hall) {
    root.dataset.hall = "fallback";
    root.dataset.hallRunning = "false";
    $("#hall-enable").disabled = false;
  }
  syncPreferences();
});
window.addEventListener("pagehide", () => {
  hall?.dispose();
  hall = undefined;
  audio?.silence();
  cancelAnimationFrame(scrollFrame);
});
syncPreferences();
setLayer("material");
setFault("gate");
renderStep(0);
calculate();
$("#brief-preview").textContent = currentBrief();
applyContacts(defaultContacts);
void loadContacts();
