# OwlTokenGuard Express Integration 🦉🛡️

A complete, production-ready backend authentication flow demonstrating how to integrate the [@restingowlorg/owltokenguard](https://www.npmjs.com/package/@restingowlorg/owltokenguard) Node.js library with an Express.js application. 

This project implements a secure Token Management system aligned with OWASP best practices, featuring Access/Refresh JWT issuance, Refresh Token Rotation (RTR), session revocation, and security-event freshness controls.

## ✨ Features

* **JWT Issuance:** Generates Access and Refresh tokens using `HS256` signatures.
* **Refresh Token Rotation (RTR):** Implements one-time-use refresh tokens to prevent replay attacks.
* **Fail-Shut Verification:** Signature-first checks, temporal validation (`exp`, `nbf`), and `reauth_at` freshness enforcement.
* **In-Memory Store:** Uses a mocked database (`Map`) to demonstrate stateful refresh token persistence using salted digests.
* **Automated Testing:** Includes a built-in Node.js client script to test the complete token lifecycle.

## 📂 Project Structure

```text
owl-token-auth/
├── src/
│   ├── config/
│   │   └── tokenManager.ts   # Core OwlTokenGuard configuration & hooks
│   ├── db/
│   │   └── mockStore.ts      # In-memory maps for tokens and security events
│   ├── routes/
│   │   └── authRoutes.ts     # Express endpoints for login, refresh, logout, etc.
│   └── app.ts                # Express server entry point
├── test-client.js            # Automated script to test the API lifecycle
├── tsconfig.json             # TypeScript configuration
└── package.json