# Contributing to Garden of Little Lights

Thanks for taking the time to improve the garden.

## Before opening an issue

- Search existing issues for the same bug or request.
- Include the platform, browser/device, app version, and clear reproduction steps.
- For visual issues, attach a screenshot when possible.
- Do not include save files containing private information or real signing credentials.

## Development workflow

1. Fork the repository and create a focused branch.
2. Run `npm install`.
3. Make the smallest coherent change.
4. Run `npm run build`.
5. If the change affects board interaction, run the Playwright verification script against a local preview server.
6. Open a pull request describing the behavior changed and how it was tested.

## UI and artwork

- Keep the existing handcrafted, low-angle garden direction.
- Use original artwork or assets with a compatible license.
- Check both English and Simplified Chinese layouts.
- Verify a narrow mobile viewport and a desktop viewport.
- Respect the reduced-motion setting.

## Commits and pull requests

- Use descriptive commit messages.
- Keep unrelated formatting or refactoring out of feature pull requests.
- Update documentation when behavior or setup changes.
- By submitting a contribution, you agree that it may be distributed under the repository's MIT License.

## Security

Do not report signing keys, credentials, or exploitable security issues in a
public issue. Follow [SECURITY.md](./SECURITY.md) instead.
