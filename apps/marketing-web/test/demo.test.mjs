import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { gzipSync } from "node:zlib";
import { JSDOM } from "jsdom";
import {
  billingModel,
  buildBrief,
  buildReview,
  findGuideEntry,
} from "../public/demo/model.js";

const directory = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../public/demo",
);
const html = fs.readFileSync(path.join(directory, "index.html"), "utf8");
const wait = () => new Promise((resolve) => setTimeout(resolve, 20));
test("calculator uses visible arithmetic and handles zero, invalid and extreme values", () => {
  const base = billingModel({
    invoices: 40,
    value: 50000,
    days: 3,
    annualRate: 12,
  });
  assert.equal(base.capital, 200000);
  assert.equal(base.cost, 24000);
  assert.deepEqual(
    base.scenarios.map((row) => row.capital),
    [100000, 200000, 300000],
  );
  assert.equal(
    billingModel({ invoices: 40, value: 0, days: 0, annualRate: 0 }).capital,
    0,
  );
  for (const bad of [
    { invoices: NaN },
    { value: Infinity },
    { days: -1 },
    { annualRate: 41 },
    { invoices: 1.5 },
    { value: 10000001 },
  ])
    assert.equal(
      billingModel({
        invoices: 40,
        value: 50000,
        days: 3,
        annualRate: 12,
        ...bad,
      }),
      null,
    );
});
test("brief and review exports describe the selected choices without claiming transmission or publication", () => {
  const brief = buildBrief({
    mill: "<script>alert(1)</script>",
    goal: "Review dispatch",
    direction: "The Ledger",
    effect: "blueprint",
  });
  assert.match(brief, /Review dispatch/);
  assert.match(brief, /No message sent/);
  assert.match(brief, /blueprint/);
  const review = buildReview({
    direction: "cinematic",
    effect: "sequence",
    motion: "Paused",
    notes: "Use calmer pacing",
  });
  assert.match(review, /The Thread/);
  assert.match(review, /Use calmer pacing/);
  assert.match(review, /No publishing/);
  assert.match(
    buildReview({ direction: "__proto__", effect: "blueprint" }),
    /The Ledger/,
  );
});
test("local guide cites its own sections and does not invent an answer outside its knowledge", () => {
  assert.equal(
    findGuideEntry("How does Tally export work?").section,
    "#integrations",
  );
  assert.equal(findGuideEntry("Can it work offline?").section, "#evidence");
  assert.match(
    findGuideEntry("Tell me my bank balance").answer,
    /no verified answer/i,
  );
  assert.match(findGuideEntry("Is the AI private?").answer, /not a live model/);
});
test("demo has no runtime CDN, inline executable code, form destination or missing local asset", () => {
  const dom = new JSDOM(html);
  const document = dom.window.document;
  assert.equal(document.querySelectorAll("h1").length, 1);
  assert.ok(
    document
      .querySelector('meta[http-equiv="Content-Security-Policy"]')
      .content.includes("connect-src 'none'"),
  );
  assert.equal(
    document.querySelector('meta[name="robots"]').content,
    "noindex,nofollow",
  );
  for (const element of document.querySelectorAll("*")) {
    assert.ok(
      ![...element.attributes].some((attribute) => /^on/i.test(attribute.name)),
      `Inline handler on ${element.tagName}`,
    );
    for (const name of ["src", "href"]) {
      const value = element.getAttribute(name);
      if (!value || element.tagName === "A") continue;
      assert.ok(!/^https?:|^\/\//.test(value), `External resource ${value}`);
      assert.ok(fs.existsSync(path.join(directory, value)), `Missing ${value}`);
    }
  }
  for (const script of document.querySelectorAll("script"))
    assert.ok(script.src && !script.textContent.trim());
  for (const form of document.forms)
    assert.equal(form.getAttribute("action"), null);
  for (const element of document.querySelectorAll('a[href^="#"]'))
    assert.ok(
      document.getElementById(element.hash.slice(1)),
      `Missing anchor ${element.hash}`,
    );
  dom.window.close();
});
test("default route remains below the documented code and page-weight budgets", () => {
  const read = (name) => fs.readFileSync(path.join(directory, name));
  const js = ["demo.js", "model.js"].reduce(
    (sum, name) => sum + gzipSync(read(name)).length,
    0,
  );
  assert.ok(js < 45000, `Initial JS gzip ${js}`);
  assert.ok(gzipSync(read("demo.css")).length < 18000);
  assert.ok(
    ["index.html", "demo.css", "demo.js", "model.js", "assets/mark.svg"].reduce(
      (sum, name) => sum + read(name).length,
      0,
    ) < 350000,
  );
  assert.ok(
    !read("demo.js")
      .toString()
      .match(
        /\bfetch\s*\(|XMLHttpRequest|sendBeacon|innerHTML|\.innerHTML|document\.write/,
      ),
  );
});
test("design directions, keyboard tabs, diagrams, motion, fallbacks and safe drafts work through the actual DOM", async () => {
  const dom = new JSDOM(html, {
    url: "http://localhost:3300/demo/",
    pretendToBeVisual: true,
  });
  const window = dom.window;
  const listeners = new Map();
  const media = {
    matches: false,
    addEventListener: (name, callback) => listeners.set(name, callback),
  };
  const previous = new Map();
  const assign = (key, value) => {
    previous.set(key, Object.getOwnPropertyDescriptor(globalThis, key));
    Object.defineProperty(globalThis, key, {
      configurable: true,
      writable: true,
      value,
    });
  };
  for (const [key, value] of Object.entries({
    window,
    document: window.document,
    location: window.location,
    history: window.history,
    localStorage: window.localStorage,
    navigator: window.navigator,
    matchMedia: () => media,
    requestAnimationFrame: window.requestAnimationFrame.bind(window),
    cancelAnimationFrame: window.cancelAnimationFrame.bind(window),
  }))
    assign(key, value);
  window.HTMLCanvasElement.prototype.getContext = () => null;
  window.HTMLElement.prototype.scrollIntoView = () => {};
  window.HTMLDialogElement.prototype.showModal = function () {
    this.setAttribute("open", "");
    this.querySelector("button")?.focus();
  };
  window.HTMLDialogElement.prototype.close = function () {
    this.removeAttribute("open");
  };
  let attemptedNetwork = false;
  assign("fetch", () => {
    attemptedNetwork = true;
    throw Error("Unexpected network call");
  });
  try {
    await import(
      pathToFileURL(path.join(directory, "demo.js")).href + "?test=dom"
    );
    const $ = (selector) => window.document.querySelector(selector);
    assert.equal($("#capital-result").textContent, "₹2,00,000");
    $("#tab-editorial").focus();
    $("#tab-editorial").dispatchEvent(
      new window.KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }),
    );
    assert.equal(
      window.document.documentElement.dataset.direction,
      "dimensional",
    );
    assert.equal($("#tab-dimensional").getAttribute("aria-selected"), "true");
    await wait();
    assert.equal(window.document.documentElement.dataset.webgl, "fallback");
    assert.match($("#motion-note").textContent, /unavailable/);
    $("#tab-cinematic").click();
    assert.equal($("#film-controls").hidden, false);
    $("#film-scrub").value = "100";
    $("#film-scrub").dispatchEvent(
      new window.Event("input", { bubbles: true }),
    );
    assert.match($("#film-frame-time").textContent, /480 \/ 480/);
    assert.equal($(".film-word").style.opacity, "1");
    $("#motion-toggle").click();
    assert.equal(window.document.documentElement.dataset.motion, "off");
    media.matches = true;
    listeners.get("change")();
    assert.equal($("#motion-toggle").disabled, true);
    $("#section-toggle").click();
    assert.equal(window.document.documentElement.dataset.section, "true");
    $("#layer-data").click();
    assert.equal(
      $(".node-detail").textContent,
      "Receipt, supplier and quantity",
    );
    $("#fault-toggle").checked = true;
    $("#fault-toggle").dispatchEvent(new window.Event("change"));
    assert.match($("#flow-caption").textContent, /missing receipt/i);
    $('[data-node="production"]').click();
    assert.equal($("#node-dialog").open, true);
    assert.match($("#node-content").textContent, /carding/);
    $('[data-close="node-dialog"]').click();
    assert.equal($("#node-dialog").open, false);
    $("#brief-mill").value = "<img src=x onerror=alert(1)>";
    $("#brief-form").dispatchEvent(
      new window.Event("input", { bubbles: true }),
    );
    assert.match($("#brief-preview").textContent, /<img/);
    assert.equal($("#brief-preview").querySelector("img"), null);
    assert.match($("#brief-preview").textContent, /The Thread/);
    $("#review-open").click();
    assert.match($("#review-summary").textContent, /The Thread/);
    assert.match($("#review-summary").textContent, /sequence/);
    assert.equal(attemptedNetwork, false);
  } finally {
    window.dispatchEvent(new window.Event("pagehide"));
    window.close();
    for (const [key, descriptor] of previous) {
      if (descriptor) Object.defineProperty(globalThis, key, descriptor);
      else delete globalThis[key];
    }
  }
});
