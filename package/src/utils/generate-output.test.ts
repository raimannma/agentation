/**
 * @vitest-environment jsdom
 */
import { describe, it, expect } from "vitest";
import { generateOutput } from "./generate-output";
import type { Annotation } from "../types";

const annotation: Annotation = {
  id: "1",
  x: 50,
  y: 100,
  comment: "Looks off",
  element: "button.cta",
  elementPath: "body > button",
  timestamp: Date.now(),
};

describe("generateOutput appName", () => {
  it("omits the app name from the header when not provided", () => {
    const output = generateOutput([annotation], "/dashboard", "standard");
    expect(output).toContain("## Page Feedback: /dashboard");
    expect(output).not.toContain("—");
  });

  it("includes the app name in the header when provided", () => {
    const output = generateOutput(
      [annotation],
      "/dashboard",
      "standard",
      "Acme App",
    );
    expect(output).toContain("## Page Feedback: Acme App — /dashboard");
  });
});
