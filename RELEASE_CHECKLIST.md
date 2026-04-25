# Release checklist

Use this list when preparing a deploy/release.

## Pre-flight

- [ ] `git status` is clean
- [ ] CI is green on `main`
- [ ] Backend env vars configured (see `backend/.env.example`)
- [ ] Frontend points to correct backend (proxy / base URL)

## Smoke test (happy path)

- [ ] Landing page loads (hero demo works)
- [ ] Register → Welcome → New interview flow works
- [ ] Create interview generates questions
- [ ] Submit at least one answer and get feedback
- [ ] Report page renders and PDF export works
- [ ] Share token creates share page and loads read-only report

## Compliance / UX

- [ ] Cookie banner displays once and can be accepted/declined
- [ ] Privacy + Terms pages accessible from footer
- [ ] Keyboard navigation: skip link, focus rings, carousels

## Post-release

- [ ] Monitor `/api/health`
- [ ] Check client error logs (if enabled)

