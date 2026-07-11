# Security Policy

## Reporting a vulnerability

Please report vulnerabilities privately via [GitHub Security Advisories](https://github.com/mystiquemide/threxa/security/advisories/new) rather than opening a public issue. Reports are read and acknowledged as quickly as possible.

## Scope

Things we care about most:

- Webhook signature bypass (`/api/webhooks/github` accepting forged payloads)
- Injection through pull request content (titles, diffs, file paths) into comments, the database, or DataHub write-backs
- Secrets leaking into logs, comments, or catalog write-backs
- Server-side request forgery through configurable endpoints

## Design notes for researchers

- The dashboard and read APIs are intentionally public and read-only; there is no authentication surface there by design.
- The webhook endpoint verifies GitHub HMAC signatures with a timing-safe comparison and rejects everything else.
- The app holds tokens for GitHub, Groq, DataHub, and Postgres via environment variables; none are ever written to the database or the catalog.
