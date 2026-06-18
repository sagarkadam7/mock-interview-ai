import { getApiErrorMessage } from "./apiError";

describe("getApiErrorMessage", () => {
  test("sanitizes raw GoogleGenerativeAI quota errors from API body", () => {
    const err = {
      response: {
        data: {
          message:
            "[GoogleGenerativeAI Error]: Error fetching from https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent: [429 ] You exceeded your current quota Please retry in 9.24s",
        },
      },
    };
    const msg = getApiErrorMessage(err);
    expect(msg).toMatch(/AI quota is temporarily exceeded/i);
    expect(msg).not.toMatch(/GoogleGenerativeAI Error/i);
    expect(msg).toMatch(/10 seconds/);
  });

  test("sanitizes raw error from err.message when no response body", () => {
    const err = {
      message: "[GoogleGenerativeAI Error]: [429] quota exceeded Please retry in 5.1s",
    };
    const msg = getApiErrorMessage(err);
    expect(msg).toMatch(/AI quota is temporarily exceeded/i);
    expect(msg).not.toMatch(/GoogleGenerativeAI/i);
  });
});
