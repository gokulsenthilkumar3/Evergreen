import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { JSDOM } from "jsdom";
import {
  arithmetic,
  defaultContacts,
  safeContacts,
} from "../public/demo/authored-model.js";
const html = fs.readFileSync(
  new URL("../public/demo/ThemeAuthored/index.html", import.meta.url),
  "utf8",
);
test("confirmed contacts, safe public projection and bounded arithmetic", () => {
  assert.equal(defaultContacts.supportEmail, "support@evergreen.com");
  assert.equal(defaultContacts.closesAt, "18:00");
  assert.deepEqual(
    safeContacts({
      supportEmail: "javascript:alert(1)",
      opensAt: "20:00",
      closesAt: "03:00",
      secret: "x",
    }),
    defaultContacts,
  );
  assert.equal(
    arithmetic({ invoices: 40, value: 50000, days: 3, rate: 12 }).capital,
    200000,
  );
  assert.equal(arithmetic({ invoices: 0, value: 0, days: 0, rate: 0 }).cost, 0);
  assert.equal(arithmetic({ invoices: NaN, value: 0, days: 0, rate: 0 }), null);
});
test("six authored chapters, local assets, native fallbacks and valid anchors", () => {
  const dom = new JSDOM(html),
    d = dom.window.document;
  assert.equal(d.querySelectorAll("section.document-section").length, 6);
  assert.equal(d.querySelectorAll("dialog").length, 1);
  assert.equal(d.querySelectorAll("#hall-positions use").length, 60);
  assert.equal(d.querySelectorAll("h2 em").length, 0);
  for (const a of d.querySelectorAll('a[href^="#"]'))
    assert.ok(d.getElementById(a.hash.slice(1)), a.hash);
  for (const el of d.querySelectorAll("[src],link[href]")) {
    const value = el.getAttribute("src") || el.getAttribute("href");
    assert.ok(!value.startsWith("http"));
    assert.ok(
      fs.existsSync(new URL("../public/demo/ThemeAuthored/" + value, import.meta.url)),
      value,
    );
  }
  for (const el of d.querySelectorAll("*"))
    assert.ok(![...el.attributes].some((a) => /^on/i.test(a.name)));
  const css = fs.readFileSync(
    new URL("../public/demo/authored.css", import.meta.url),
    "utf8",
  );
  for (const pattern of [
    /prefers-reduced-motion/,
    /prefers-contrast/,
    /@media print/,
    /size: A4/,
  ])
    assert.match(css, pattern);
  dom.window.close();
});
test("interactive failures, keyboard tabs, exact draft, settings fetch and WebGL fallback", async () => {
  const dom = new JSDOM(html, {
      url: "http://localhost:3300/demo/",
      pretendToBeVisual: true,
    }),
    w = dom.window,
    previous = new Map(),
    calls = [];
  const globals = {
    window: w,
    MutationObserver: w.MutationObserver,
    document: w.document,
    navigator: w.navigator,
    localStorage: w.localStorage,
    matchMedia: () => ({ matches: false, addEventListener() {} }),
    requestAnimationFrame: w.requestAnimationFrame.bind(w),
    cancelAnimationFrame: w.cancelAnimationFrame.bind(w),
    fetch: async (url, options) => {
      calls.push([url, options]);
      return {
        ok: true,
        json: async () => ({
          ...defaultContacts,
          salesEmail: "new-sales@evergreen.com",
        }),
      };
    },
  };
  for (const [key, value] of Object.entries(globals)) {
    previous.set(key, Object.getOwnPropertyDescriptor(globalThis, key));
    Object.defineProperty(globalThis, key, {
      value,
      configurable: true,
      writable: true,
    });
  }
  w.HTMLDialogElement.prototype.showModal = function () {
    this.setAttribute("open", "");
  };
  w.HTMLDialogElement.prototype.close = function () {
    this.removeAttribute("open");
  };
  w.HTMLCanvasElement.prototype.getContext = () => null;
  try {
    await import("../public/demo/authored.js?dom-test");
    await new Promise((r) => setTimeout(r, 25));
    const $ = (s) => w.document.querySelector(s);
    await import("../public/demo/textile-studio.js?dom-test");
    $("button[data-palette=indigo]").click();
    assert.equal(w.document.documentElement.dataset.palette,"indigo");
    $("#spool-enable").click();
    await new Promise(r=>setTimeout(r,30));
    assert.match($("#spool-status").textContent,/unavailable/);
    assert.equal(calls.length, 1);
    assert.equal(calls[0][0], "/marketing-api/site-settings");
    assert.equal(calls[0][1].credentials, "omit");
    assert.equal(
      $("[data-contact=salesEmail]").textContent,
      "new-sales@evergreen.com",
    );
    $("#layer-material").focus();
    $(".layer-controls").dispatchEvent(
      new w.KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }),
    );
    assert.equal($("#layer-data").getAttribute("aria-selected"), "true");
    for (const value of ["jobwork", "invoice", "gate"]) {
      const radio = $("input[value=" + value + "]");
      radio.checked = true;
      radio.dispatchEvent(new w.Event("change"));
      assert.ok($("#fault-owner").textContent.length > 20);
      assert.ok($("#fault-accountant").textContent.length > 20);
      assert.ok($("#fault-floor").textContent.length > 20);
    }
    $("[data-node=account]").click();
    assert.ok($("#record-dialog").open);
    assert.equal($("#voucher-detail").hidden, false);
    $(".dialog-close").click();
    $("#step-next").click();
    assert.match($("#narrative-index").textContent, /2 \/ 7/);
    $("#brief-mill").value = "<img src=x onerror=alert(1)>";
    $("#brief-mill").dispatchEvent(new w.Event("input", { bubbles: true }));
    assert.match($("#brief-preview").textContent, /<img/);
    assert.equal($("#brief-preview img"), null);
    $("#invoice-count").value = "";
    $("#invoice-count").dispatchEvent(new w.Event("input", { bubbles: true }));
    assert.match($("#arithmetic-error").textContent, /valid/);
    $("#hall-enable").click();
    await new Promise((r) => setTimeout(r, 30));
    assert.match($("#hall-status").textContent, /unavailable/);
    assert.equal($("#hall-select").options.length, 60);
    $("#motion-toggle").click();
    assert.equal(w.document.documentElement.dataset.motion, "off");
    $("#images-toggle").click();
    assert.equal(w.document.documentElement.dataset.images, "off");
    assert.equal($("#sound-toggle").textContent.trim(), "Sound: off");
  } finally {
    w.dispatchEvent(new w.Event("pagehide"));
    w.close();
    for (const [key, value] of previous) {
      if (value) Object.defineProperty(globalThis, key, value);
      else delete globalThis[key];
    }
  }
});
