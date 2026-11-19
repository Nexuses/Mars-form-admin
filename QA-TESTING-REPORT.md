# MARS Application Form — QA Testing Report

**Verdict:** Pass — everything tested is working properly  
**Date:** 19 November 2026  
**App:** Healthcare candidate application (Next.js 16.4.6)  
**Environment:** Local `http://localhost:3000` with `.env.local`

---

## Executive summary

The multi-step candidate application was smoke-tested end-to-end on desktop, re-checked on mobile viewports, and validated through an automated S3/API e2e script. All exercised paths passed. Live UI submit issued reference **MARS-20261119-ENZP**; API e2e issued **MARS-20261119-FVJB**.

| Metric | Result |
|--------|--------|
| Form steps | 6/6 Pass |
| Live UI submits | 2 successful |
| API e2e checks | 100% Pass |
| Open blockers | 0 |

---

## 1. Scope

- Step navigation and Continue/Submit gating  
- Client-side validation and live error tips  
- File upload to S3 (presigned URL)  
- `POST /api/apply` and MongoDB attachment URLs  
- Thank-you screen and recruiter/thank-you email logging  
- Responsive layout (desktop, 390×844, 320×568)

---

## 2. Form UI (desktop)

| Area | Result | Evidence |
|------|--------|----------|
| Step 1 — Your details | Pass | Required fields gate Continue; phone/email/ZIP/SSN/date validation and tips |
| Step 2 — Eligibility | Pass | Yes/No radios, conditionals, interview availability |
| Step 3 — Experience | Pass | Profession, education, EMR, prior-client questions |
| Step 4 — Skills checklist | Pass | Specialty select; “not listed” path continues without file |
| Step 5 — References | Pass | Two complete references required |
| Step 6 — Documents & submit | Pass | License + life-support upload, consent, signature → success |

**UI submit evidence**

- Candidate: Alex Rivera (`alex.rivera.qa@example.com`)  
- Reference: `MARS-20261119-ENZP`  
- Success UI: “Application received”  
- Server logged thank-you email for that reference  

---

## 3. API / S3 e2e

**Script:** `scripts/e2e-apply-s3.mjs`  
**Reference:** `MARS-20261119-FVJB`  
**Exit code:** 0

| Check | Result |
|-------|--------|
| Presigned upload URL | Pass |
| Direct S3 PUT | Pass |
| >50 MB rejected (HTTP 400) | Pass |
| `POST /api/apply` | Pass |
| MongoDB stores S3 URLs only (no raw file bytes) | Pass |
| Test data cleanup | Pass |

---

## 4. Devices & browsers

| Target | Result | Notes |
|--------|--------|-------|
| Desktop (Chromium) | Pass | Full 6-step flow + submit |
| Mobile 390×844 | Pass | Progress bar, single column, 48px taps, no horizontal scroll |
| Narrow 320×568 | Pass | Layout holds; live ZIP/email errors readable |
| Viewport / safe-area | Pass | `viewport-fit=cover`; safe-area padding on chrome |
| S3 browser CORS | Pass | Bucket allows PUT; browser upload completed in UI test |

**Coverage note:** Automation used Chromium. Responsive CSS, 16px inputs (avoids iOS zoom), native date controls, and `viewport-fit=cover` were audited for Safari/iOS and other engines. Dedicated Safari/Firefox device-farm runs were not part of this session.

---

## 5. Fixes applied during QA

| Item | Change |
|------|--------|
| iPhone safe areas | Added `export const viewport` with `viewportFit: "cover"` |
| Date fields on iOS/Safari | Restored native `appearance` for `input[type=date]` |
| Submit busy styling | Added `.is-busy` class (does not rely only on `:has()`) |
| Honeypot / autofill | Only website-like honeypot values block submit; autofill junk ignored |

---

## 6. Sign-off

All exercised paths **passed**. The application form is working properly for the desktop and mobile layouts covered in this report, including document upload and submission.

**QA testing by:** Nexuses  
**Product:** MARS Solutions Group — Healthcare candidate application
