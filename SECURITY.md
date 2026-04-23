# 🛡️ Security Policy & Architecture Guidelines

Welcome to the central security policy for the **Deep Dey | Cinematic Portfolio & System Architecture**. Security, privacy, and system integrity are fundamental to the "Dark-Amber" ecosystem. This document outlines our vulnerability reporting protocols, supported versions, and architectural security standards.

---

## 🔒 Supported Versions

We actively maintain and provide security updates for the current production architecture. Legacy versions (V1) are kept for archival purposes but do not receive active security patches.

| Version Pipeline | Status | Maintenance Phase |
| :--- | :--- | :--- |
| **v2.x (Current - React/Vite)** | ✅ Actively Supported | Maintained with automated dependency scanning |
| **v1.x (Legacy HTML/JS)** | ❌ Unsupported | Deprecated / Archival only |

---

## 🚨 Reporting a Vulnerability

**DO NOT report security vulnerabilities via public GitHub Issues.**

If you discover a security vulnerability within the portfolio ecosystem (including QuickLink routing, Transparent Clock API references, or Vercel edge configurations), please report it responsibly so we can patch it before public disclosure.

### Contact Protocol:
1. Send an email to the dedicated security node: **a@qlynk.me** or **team.deepdey@gmail.com**.
2. Subject Line: `[SECURITY REPORT] <Brief Description of Vulnerability>`
3. Please include:
   - The exact URL or component where the vulnerability exists.
   - A step-by-step description or Proof of Concept (PoC) to reproduce the issue.
   - Your system environment details (Browser, OS).

### Response Timeline:
- **Acknowledgment:** Within 48 hours of your report.
- **Triage & Assessment:** Within 7 days.
- **Patch Deployment:** As per the severity matrix (Critical patches deployed within 24 hours).

---

## 🏗️ Architectural Security Posture

As a stateless, client-side application built on React 18 and Vite, the attack surface is intentionally minimized. 

1. **Backend APIs with Minimal Data Surface:** Journal/category data is stored in MongoDB; contact routing and dashboard image upload operate through constrained API routes with strict input validation.
2. **Edge Security (Vercel):** All deployments are shielded by Vercel's Edge Network, providing automatic DDoS mitigation, global HTTPS enforcement, and strict TLS configurations.
3. **Dependency Scanning:** We utilize `npm audit` and GitHub Dependabot to ensure all third-party libraries (e.g., Motion, react-pdf) are free from known CVEs.
4. **Credential Isolation:** `SPACE_PASSWORD` for static image uploads remains server-side in API routes and is never exposed in client bundles.
4. **Content Security Policy (CSP):** The application relies on external CDNs only for verified SVG assets and heavily sandbox-restricted iframes (e.g., Spotify widgets using `sandbox="allow-scripts allow-same-origin"`).

---

## 🛑 Out of Scope

The following domains and assets are managed by third parties and are **out of scope** for this vulnerability program:
- `vercel.app` infrastructure vulnerabilities (Report directly to Vercel).
- Issues within the underlying `react-pdf` web worker architecture (Unless it directly compromises this specific deployment).
- Third-party widgets (e.g., 6klabs Spotify tracker, SimpleIcons CDN).
- Social engineering, phishing, or physical security attacks against the author.

---

## 📜 Safe Harbor

We strongly support the open-source security community. If you conduct your research in good faith and adhere to this policy, we will consider your actions authorized. We will not initiate legal action or ask law enforcement to investigate you regarding activities that comply with these guidelines.

*Note: Due to the current academic hiatus (JEE Advanced 2027 Target), non-critical bug bounties or immediate structural overhauls are paused, but critical security disclosures will be prioritized and addressed immediately.*
