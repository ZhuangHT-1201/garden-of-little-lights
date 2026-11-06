# Security Policy

## Reporting a vulnerability

Please report security issues privately through GitHub's
[Security Advisories](https://github.com/ZhuangHT-1201/garden-of-little-lights/security/advisories/new)
page.

Include:

- A concise description of the issue.
- Steps to reproduce.
- The affected platform and version.
- Any suggested mitigation.

Please do not open a public issue for active vulnerabilities.

## Secrets

Android signing credentials belong in the ignored `.env.android` file. Never
commit keystores, passwords, API tokens, or private environment files.
