import { describe, it, expect } from "vitest";
import { mergeCreatedAnnotation } from "./sync";
import type { Annotation } from "../types";

function makeAnnotation(id: string, overrides: Partial<Annotation> = {}): Annotation {
  return {
    id,
    x: 0,
    y: 0,
    comment: "",
    element: "div",
    elementPath: "div",
    timestamp: 0,
    ...overrides,
  };
}

describe("mergeCreatedAnnotation", () => {
  it("appends a remote annotation that is not present locally", () => {
    const current = [makeAnnotation("a")];
    const incoming = makeAnnotation("b");
    const result = mergeCreatedAnnotation(current, incoming);
    expect(result).toHaveLength(2);
    expect(result.map((a) => a.id)).toEqual(["a", "b"]);
  });

  it("does not double-add an annotation we already have (own optimistic create)", () => {
    const current = [makeAnnotation("server-1", { comment: "mine" })];
    const incoming = makeAnnotation("server-1", { comment: "echo" });
    const result = mergeCreatedAnnotation(current, incoming);
    expect(result).toHaveLength(1);
    expect(result[0].comment).toBe("mine");
  });

  it("returns the same array reference when deduped (so callers can skip re-render)", () => {
    const current = [makeAnnotation("a")];
    const result = mergeCreatedAnnotation(current, makeAnnotation("a"));
    expect(result).toBe(current);
  });
});
