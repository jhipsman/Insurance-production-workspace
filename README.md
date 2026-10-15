# Northstar Insurance Producer Workspace

A local-first productivity workspace for a commercial insurance Client Executive serving nonprofit and human-services organizations. It complements—not replaces—the agency CRM. All included accounts, emails, links, and values are fictional.

## Phase 1 capabilities

- Dashboard for priorities, active submissions, missing items, and follow-ups
- Searchable Prospecting Desk with priority and contact-clearance states
- Client-side CSV import with detected columns, field mapping, and preview
- One-click prospect-to-submission workflow
- Submission Kanban with editable starter checklists
- Placement Request Tracker with locally parsed, manually reviewed email text
- IndexedDB persistence and portable JSON backup/restore
- Responsive, static frontend with no backend, telemetry, or automatic upload

SOV Builder, BOR Eligibility, and the Submission Knowledge Library are deliberately presented as later-phase modules. The application does not claim carrier access, underwriting insight, or document analysis that has not been verified.

## Development

Prerequisites: Node.js 22+ and npm 10+. No administrator rights are needed if Node is already available.

```bash
npm ci
npm run dev
```

Open the local URL printed by Vite. Run quality checks with:

```bash
npm test
npm run build
```

The production output is written to `dist/`. Vite uses relative asset URLs so the build can be placed under an approved static host or subdirectory.

## Browser demo on GitHub Pages

In the repository's Settings → Pages, select **GitHub Actions** as the source.
Then run **Publish demo to GitHub Pages** from the Actions tab. Future pushes to
`main` run tests, build the static app, and deploy automatically. The workflow's
deployment result provides the live URL. The demo starts with fictional data;
do not use the public demo for client records. No backend is deployed.

## Restricted Windows testing checklist

1. Build on an approved development machine with `npm ci && npm run build`.
2. Copy only the `dist` folder to the Windows test computer using an approved method.
3. Prefer an agency-approved static file host. If Node is allowed without elevation, `npx vite preview` can be used for controlled testing; it is not required in deployment.
4. Test in the agency-supported Edge or Chrome version. Verify CSV import, reload persistence, JSON backup download, restore, and approved external links.
5. Confirm browser policy permits IndexedDB and file downloads. InPrivate/Incognito sessions and browser-data cleanup can erase local records.
6. Store backup files only in approved encrypted locations. The app does not encrypt records itself.

Opening `dist/index.html` directly with a `file://` URL is browser-dependent because browsers restrict module scripts and storage for local files. Use an approved static host for reliable deployment and validate the exact corporate browser policy.

## Privacy and operating boundaries

- Imported data remains in the current browser’s IndexedDB unless the user explicitly downloads a backup or clicks an external link.
- No CRM, Outlook, OneDrive, Indio, Tailwind, cloud database, analytics, or paid API integration is present.
- Missing CRM activity never means an organization is cleared to contact. Imported prospects default to **Needs Review**.
- CSV is implemented in Phase 1. PDF, XLSX, and ZIP import need vetted client-side parsers and are reserved for the document/SOV phases.
- Browser storage is origin- and profile-specific, quota-limited, and subject to user or corporate-policy clearing. Backups are essential.
- External links navigate to another site and are governed by that site and corporate policy.

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for the data model, security limitations, and phased plan.
