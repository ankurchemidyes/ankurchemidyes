import { describe, it, expect } from "vitest";
import { extractVideoId } from "./youtube";
describe("YouTube link validation", () => {
  it.each([
    "https://www.youtube.com/watch?v=gxpAlDUWIOQ&si=abc",
    "https://youtu.be/gxpAlDUWIOQ?si=abc",
    "https://www.youtube.com/embed/gxpAlDUWIOQ?si=abc",
    "https://youtube.com/shorts/gxpAlDUWIOQ",
    "https://m.youtube.com/live/gxpAlDUWIOQ",
  ])("accepts supported URL %s", url => expect(extractVideoId(url)).toBe("gxpAlDUWIOQ"));
  it.each([
    "https://youtube.com.evil.test/watch?v=gxpAlDUWIOQ", "javascript:alert(1)",
    "https://youtube.com/watch?v=bad", "https://example.com/gxpAlDUWIOQ",
    "https://youtube.com/embed/gxpAlDUWIOQ/extra", "ftp://youtube.com/watch?v=gxpAlDUWIOQ",
  ])("rejects invalid URL %s", url => expect(extractVideoId(url)).toBeNull());
});
