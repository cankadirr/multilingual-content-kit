import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { defineLocales, fallbackChain, isLocale } from "../src/locales.js";
import { locales } from "./fixtures.js";

describe("defineLocales", () => {
  it("rejects a default locale that is not listed", () => {
    assert.throws(() => defineLocales({ locales: ["tr"], defaultLocale: "en" as "tr", fallbacks: {} }), /not listed/);
  });

  it("rejects a locale that falls back to itself", () => {
    assert.throws(() => defineLocales({ locales: ["tr", "en"], defaultLocale: "tr", fallbacks: { en: ["en"] } }), /itself/);
  });
});

describe("fallbackChain", () => {
  it("puts the requested locale first and ends at the default", () => {
    assert.deepEqual(fallbackChain(locales, "ku"), ["ku", "tr"]);
  });

  it("does not repeat the default locale", () => {
    assert.deepEqual(fallbackChain(locales, "tr"), ["tr"]);
  });
});

describe("isLocale", () => {
  it("narrows known locales and rejects unknown ones", () => {
    assert.equal(isLocale(locales, "en"), true);
    assert.equal(isLocale(locales, "de"), false);
  });
});
