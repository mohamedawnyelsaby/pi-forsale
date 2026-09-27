import { describe, expect, it } from "vitest";
import { MAX_PHOTO_BYTES, isAllowedPhoto, photoPath } from "./storage";

function fakeFile(type: string, size: number): File {
  return { type, size } as File;
}

describe("isAllowedPhoto", () => {
  it("accepts jpeg/png/webp under the size cap", () => {
    expect(isAllowedPhoto(fakeFile("image/jpeg", 500_000))).toBe(true);
    expect(isAllowedPhoto(fakeFile("image/png", MAX_PHOTO_BYTES))).toBe(true);
  });
  it("rejects other mime types", () => {
    expect(isAllowedPhoto(fakeFile("application/pdf", 1000))).toBe(false);
    expect(isAllowedPhoto(fakeFile("image/gif", 1000))).toBe(false);
  });
  it("rejects oversized or empty files", () => {
    expect(isAllowedPhoto(fakeFile("image/jpeg", MAX_PHOTO_BYTES + 1))).toBe(false);
    expect(isAllowedPhoto(fakeFile("image/jpeg", 0))).toBe(false);
  });
});

describe("photoPath", () => {
  it("namespaces paths by listing id and keeps a stable jpg extension", () => {
    expect(photoPath("abc-123", 0)).toBe("abc-123/0.jpg");
    expect(photoPath("abc-123", 3)).toBe("abc-123/3.jpg");
  });
});
