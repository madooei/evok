import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

describe("Hello world!", () => {
  beforeEach(() => {
    // Setup code before each test
    console.log("Setting up before each test");
  });

  afterEach(() => {
    // Cleanup code after each test
    console.log("Cleaning up after each test");
  });

  it("should pass a basic test", () => {
    expect(true).toBe(true);
  });

  it("should mock a function", () => {
    const mockFn = vi.fn();
    mockFn();
    expect(mockFn).toHaveBeenCalled();
  });
});
