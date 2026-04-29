function getAuthCookieName(env = process.env) {
  return String(env.AUTH_COOKIE_NAME || "token").trim() || "token";
}

function getAuthCookieOptions(env = process.env) {
  const secure =
    String(env.SESSION_COOKIE_SECURE || "").toLowerCase() === "true" ||
    String(env.NODE_ENV || "").toLowerCase() === "production";

  const maxAgeMs = 7 * 24 * 60 * 60 * 1000;

  return {
    httpOnly: true,
    secure,
    sameSite: "lax",
    path: "/",
    maxAge: maxAgeMs,
  };
}

function setAuthCookie(res, token, env = process.env) {
  const name = getAuthCookieName(env);
  res.cookie(name, token, getAuthCookieOptions(env));
}

function clearAuthCookie(res, env = process.env) {
  const name = getAuthCookieName(env);
  const opts = getAuthCookieOptions(env);
  res.clearCookie(name, { path: opts.path, sameSite: opts.sameSite, secure: opts.secure });
}

module.exports = {
  getAuthCookieName,
  getAuthCookieOptions,
  setAuthCookie,
  clearAuthCookie,
};
