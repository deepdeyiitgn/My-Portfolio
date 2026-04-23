# 🛡️ Security Policy

This document describes the security policy, supported versions, vulnerability reporting process, and architectural security posture for the **Deep Dey Portfolio & System Architecture** project.

---

## 🔒 Supported Versions

| Version | Status | Notes |
| :--- | :---: | :--- |
| **v3.x** (React 19 + Vite 6) | ✅ Actively Supported | Current production branch — receives all security patches |
| **v2.x** (React 18 + Vite 5) | ⚠️ Limited | Critical patches only; migration to v3 recommended |
| **v1.x** (Vanilla HTML/JS) | ❌ Unsupported | Deprecated and archived — no patches issued |

---

## 🚨 Reporting a Vulnerability

> **⚠️ DO NOT open a public GitHub Issue for security vulnerabilities.**

Public disclosure before a patch is available puts all users at risk. Use the private reporting process below.

### Reporting Steps

1. **Email** the security contact:
   - Primary: **a@qlynk.me**
   - Secondary: **team.deepdey@gmail.com**

2. **Subject line format:**
   ```
   [SECURITY REPORT] <Short description> — <Severity: Critical/High/Medium/Low>
   ```

3. **Include in your report:**
   - Affected URL, route, component, or API endpoint
   - Step-by-step reproduction instructions (or a minimal PoC)
   - Expected vs actual behavior
   - Your environment (Browser, OS, Node version if applicable)
   - CVSS score estimate if available (optional but appreciated)
   - Any screenshots, logs, or HTTP request/response captures

### Response Timeline

| Phase | SLA |
| :--- | :--- |
| **Acknowledgment** | ≤ 48 hours |
| **Triage & Severity Assessment** | ≤ 7 days |
| **Patch (Critical — CVSS ≥ 9.0)** | ≤ 24 hours after triage |
| **Patch (High — CVSS 7.0–8.9)** | ≤ 7 days after triage |
| **Patch (Medium/Low — CVSS < 7.0)** | Next scheduled maintenance window |
| **Public Disclosure** | After patch is deployed and verified |

---

## 🏗️ Architectural Security Posture

### Attack Surface

This is primarily a **stateless, client-side React SPA** with a small number of Vercel serverless API routes. The attack surface is intentionally minimal by design.

### Key Security Controls

| Control | Implementation |
| :--- | :--- |
| **Authentication** | Cookie-based session (`dd_auth`) validated on every API write operation |
| **Credential Isolation** | `SPACE_PASSWORD` and `MONGODB_URI` are server-side environment variables, never bundled in client code |
| **Input Validation** | All image URLs validated via `sanitizeImageUrl()` (allowlist: `static.qlynk.me/f/`, `.png`, `.jpg`, `.jpeg`) |
| **Base64 Validation** | Strict `[A-Za-z0-9+/=\n]+` regex for data URL decoding in upload proxy |
| **CDN Error Handling** | Upload proxy detects CDN-level `status: "error"` responses even when HTTP status is 200 |
| **Edge Security** | Vercel Edge Network provides automatic DDoS mitigation, global HTTPS enforcement, and TLS 1.3 |
| **Dependency Scanning** | `npm audit` and GitHub Dependabot for known CVE detection |
| **iframe Sandboxing** | Third-party embeds use strict `sandbox` attributes (`allow-scripts allow-same-origin`) |
| **Slug Uniqueness** | Upload slugs include 6-char random hex suffix to prevent enumeration and 409 collisions |

### Data Storage

- **Journal & Category data:** MongoDB Atlas with connection string stored only in Vercel environment.
- **Images:** Uploaded to `static.qlynk.me` via a server-side proxy. Raw `SPACE_PASSWORD` never reaches the browser.
- **No PII stored client-side.** Session state uses session storage only for per-session like/view tracking.

---

## 🛑 Out of Scope

The following are **not** in scope for this security program:

- `vercel.app` infrastructure vulnerabilities → report to [Vercel Security](https://vercel.com/security)
- Issues within `react-pdf` web worker internals (unless directly exploitable in this deployment)
- Third-party widget vulnerabilities (Spotify, SimpleIcons CDN)
- Social engineering, phishing, or physical attacks targeting the author
- Rate limiting / brute-force on public read-only endpoints

---

## 📜 Safe Harbor

If you conduct research in good faith and in accordance with this policy, we consider your actions authorized. We will not initiate legal action or involve law enforcement for research that complies with these guidelines.

*Note: Due to the current academic hiatus (JEE Advanced 2027), non-critical bounties and structural overhauls are paused, but all security disclosures — regardless of severity — are prioritized and will receive a timely response.*
