import { describe, it, expect, afterEach } from "vitest";
import { getElementPath } from "./element-identification";

afterEach(() => {
  document.body.innerHTML = "";
});

describe("getElementPath data-* locators", () => {
  it("appends a data-testid to the element identifier", () => {
    document.body.innerHTML = `<div><button data-testid="submit">Go</button></div>`;
    const button = document.querySelector("button") as HTMLElement;
    expect(getElementPath(button)).toBe('div > button[data-testid="submit"]');
  });

  it("prefers known stable hooks over other data-* attributes", () => {
    document.body.innerHTML = `<button data-state="open" data-cy="checkout">Go</button>`;
    const button = document.querySelector("button") as HTMLElement;
    expect(getElementPath(button)).toBe('button[data-cy="checkout"]');
  });

  it("falls back to the first meaningful data-* attribute", () => {
    document.body.innerHTML = `<section data-section="hero">x</section>`;
    const section = document.querySelector("section") as HTMLElement;
    expect(getElementPath(section)).toBe('section[data-section="hero"]');
  });

  it("ignores noisy framework data-* attributes", () => {
    document.body.innerHTML = `<div data-reactid="3" data-v-1a2b3c="">x</div>`;
    const div = document.querySelector("div") as HTMLElement;
    expect(getElementPath(div)).toBe("div");
  });

  it("appends the locator alongside an id", () => {
    document.body.innerHTML = `<div id="card" data-testid="card-1">x</div>`;
    const div = document.querySelector("div") as HTMLElement;
    expect(getElementPath(div)).toBe('#card[data-testid="card-1"]');
  });
});
