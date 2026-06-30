import { describe, it, expect, afterEach } from "vitest";
import {
  getElementPath,
  hasDirectTextContent,
  resolvePierceTarget,
  type PierceCandidate,
} from "./element-identification";

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

describe("hasDirectTextContent", () => {
  it("is true for an element with its own text node", () => {
    document.body.innerHTML = `<button>Get Started</button>`;
    expect(hasDirectTextContent(document.querySelector("button")!)).toBe(true);
  });

  it("is false for a wrapper whose text lives in a child", () => {
    document.body.innerHTML = `<div><button>Get Started</button></div>`;
    expect(hasDirectTextContent(document.querySelector("div")!)).toBe(false);
  });

  it("is false for an empty element", () => {
    document.body.innerHTML = `<div></div>`;
    expect(hasDirectTextContent(document.querySelector("div")!)).toBe(false);
  });

  it("ignores whitespace-only text nodes", () => {
    document.body.innerHTML = `<div>\n   <span>x</span>\n</div>`;
    expect(hasDirectTextContent(document.querySelector("div")!)).toBe(false);
  });
});

describe("resolvePierceTarget", () => {
  const el = (tag: string) => document.createElement(tag);

  const candidate = (
    element: HTMLElement,
    over: Partial<Omit<PierceCandidate, "element">> = {},
  ): PierceCandidate => ({
    element,
    hasText: false,
    visible: true,
    area: 100,
    ...over,
  });

  it("returns null for an empty stack", () => {
    expect(resolvePierceTarget([])).toBeNull();
  });

  it("skips an invisible overlay and selects the content with text underneath", () => {
    const overlay = el("div");
    const button = el("button");
    const result = resolvePierceTarget([
      candidate(overlay, { visible: false, area: 5000 }),
      candidate(button, { hasText: true, area: 400 }),
    ]);
    expect(result).toBe(button);
  });

  it("prefers the topmost text element over a deeper text element", () => {
    const top = el("a");
    const deeper = el("span");
    const result = resolvePierceTarget([
      candidate(top, { hasText: true, area: 300 }),
      candidate(deeper, { hasText: true, area: 80 }),
    ]);
    expect(result).toBe(top);
  });

  it("falls back to the smallest visible box when no element has text", () => {
    const wrapper = el("div");
    const swatch = el("span");
    const result = resolvePierceTarget([
      candidate(wrapper, { area: 5000 }),
      candidate(swatch, { area: 120 }),
    ]);
    expect(result).toBe(swatch);
  });

  it("ignores zero-area nodes when picking the smallest box", () => {
    const wrapper = el("div");
    const collapsed = el("span");
    const bar = el("i");
    const result = resolvePierceTarget([
      candidate(wrapper, { area: 5000 }),
      candidate(collapsed, { area: 0 }),
      candidate(bar, { area: 200 }),
    ]);
    expect(result).toBe(bar);
  });

  it("returns the topmost candidate when every candidate is invisible", () => {
    const top = el("div");
    const next = el("div");
    const result = resolvePierceTarget([
      candidate(top, { visible: false }),
      candidate(next, { visible: false }),
    ]);
    expect(result).toBe(top);
  });

  it("skips an invisible text element in favor of a visible text element", () => {
    const ghost = el("span");
    const real = el("button");
    const result = resolvePierceTarget([
      candidate(ghost, { hasText: true, visible: false, area: 400 }),
      candidate(real, { hasText: true, area: 400 }),
    ]);
    expect(result).toBe(real);
  });
});
