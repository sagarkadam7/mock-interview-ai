import { captureSignupAttribution, getAttributionBannerLabel, isSafeInternalPath } from "./signupAttribution";

describe("signupAttribution", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test("captures track and plan from search params", () => {
    const params = new URLSearchParams("track=campus&plan=pro");
    const captured = captureSignupAttribution(params);
    expect(captured).toMatchObject({ track: "campus", plan: "pro" });
  });

  test("maps track to banner label", () => {
    expect(getAttributionBannerLabel({ track: "campus" })).toBe("Campus prep track");
    expect(getAttributionBannerLabel({ plan: "pro" })).toBe("Pro plan interest");
  });
});

describe("isSafeInternalPath", () => {
  test("allows internal app paths", () => {
    expect(isSafeInternalPath("/dashboard")).toBe(true);
    expect(isSafeInternalPath("/interview/abc123")).toBe(true);
  });

  test("rejects external URLs", () => {
    expect(isSafeInternalPath("https://evil.test")).toBe(false);
    expect(isSafeInternalPath("//evil.test")).toBe(false);
  });
});
