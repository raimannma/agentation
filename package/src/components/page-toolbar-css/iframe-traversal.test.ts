import { describe, it, expect, afterEach } from "vitest";
import {
  isSameOriginIframe,
  getAllSameOriginIframes,
  querySelectorAllWithIframes,
} from "./index";

afterEach(() => {
  document.body.innerHTML = "";
});

function makeIframe(html: string): HTMLIFrameElement {
  const iframe = document.createElement("iframe");
  document.body.appendChild(iframe);
  iframe.contentDocument!.body.innerHTML = html;
  return iframe;
}

function makeCrossOriginIframe(): HTMLIFrameElement {
  const iframe = document.createElement("iframe");
  Object.defineProperty(iframe, "contentDocument", {
    get() {
      throw new Error("SecurityError: blocked a frame with a different origin");
    },
    configurable: true,
  });
  document.body.appendChild(iframe);
  return iframe;
}

describe("same-origin iframe traversal", () => {
  it("treats an attached same-origin iframe as accessible", () => {
    const iframe = makeIframe("<button id='inner'>Click</button>");
    expect(isSameOriginIframe(iframe)).toBe(true);
  });

  it("returns false when contentDocument access throws (cross-origin)", () => {
    const iframe = makeCrossOriginIframe();
    expect(isSameOriginIframe(iframe)).toBe(false);
  });

  it("returns false for an iframe whose contentDocument is null", () => {
    const iframe = document.createElement("iframe");
    Object.defineProperty(iframe, "contentDocument", {
      value: null,
      configurable: true,
    });
    expect(isSameOriginIframe(iframe)).toBe(false);
  });

  it("finds elements inside same-origin iframes", () => {
    document.body.innerHTML = "<button id='top'>top</button>";
    makeIframe("<button class='inner-btn'>inner</button>");

    const labels = querySelectorAllWithIframes("button").map(
      (b) => b.id || b.className,
    );
    expect(labels).toContain("top");
    expect(labels).toContain("inner-btn");
  });

  it("skips cross-origin iframes when collecting", () => {
    makeIframe("<p>same-origin</p>");
    const crossOrigin = makeCrossOriginIframe();

    const frames = getAllSameOriginIframes();
    expect(frames).not.toContain(crossOrigin);
    expect(frames.length).toBeGreaterThan(0);
  });
});
