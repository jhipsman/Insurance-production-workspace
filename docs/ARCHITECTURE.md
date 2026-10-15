# Architecture and implementation plan

## Project structure

```text
src/
  components/       shared navigation and presentation primitives
  data/             IndexedDB, CSV mapping, backup, and local text parsing
  hooks/            workspace persistence lifecycle
  pages/            one module per primary workflow
  test/             test environment setup
  App.tsx            navigation, workflow orchestration, and backup controls
  sampleData.ts      explicitly fictional demonstration records
  types.ts           domain model and controlled status vocabularies
```

The UI depends on a typed `WorkspaceData` boundary. Storage and import adapters sit behind small functions so a future approved document-analysis service can produce reviewed domain records without changing page components.

## Data model

- `Prospect`: organization profile, dimensions, priority, optional CRM link, notes, and an explicit clearance state with rationale.
- `Submission`: account, stage, coverages, links, follow-up date, and user-editable checklist.
- `PlacementRequest`: account/submission, carrier, description, answer, supporting-document reference, source email, date, status, and a normalized shared key for future deduplication.
- `Activity`: small local audit-style feed for meaningful workspace events.
- `WorkspaceData`: versioned aggregate persisted atomically and exported in backups.

Clearance uses `Cleared | Needs Review | Restricted`. It is intentionally separate from prospect priority. Submission stage and placement status use controlled vocabularies, while checklist requirements remain fully editable.

## Browser and file limitations

- IndexedDB is not a regulated system of record, does not provide application-level encryption, and can be cleared by the user or policy. Storage quota varies by browser and device.
- A static app cannot guarantee safe concurrent edits across tabs or users. Phase 1 is a single-user workspace.
- Browsers cannot silently read local files or write back to an imported file. Every import/export requires explicit user action.
- CSV has no universal schema. Phase 1 reads text fields and does not execute content.
- PDF text may be image-only; ZIP can contain unsafe paths or decompression bombs; XLSX templates can contain formulas, macros, protected cells, and formatting that generic writers may damage. These formats require explicit size limits, validation, and template fixtures in later phases.
- Static files loaded via `file://` have inconsistent ES-module and IndexedDB behavior. An approved HTTPS static origin is the reliable deployment model.
- External links may expose navigation metadata and leave the local trust boundary. Links are optional and open only on a user click.
- Browser backup downloads are plain JSON. Users must place them only in approved storage.

## Phased plan

1. **Phase 1 — implemented:** shell, dashboard, prospect CSV mapping and list, CRM links, submission Kanban/checklists, placement-request review, IndexedDB, backup/restore, fictional data, and tests.
2. **Phase 2 — implemented:** authorized historical-bound analysis, explicit agency-rule configuration, CRM export reconciliation, transparent fit factors, and reversible duplicate review. See the Phase 2 model below.
3. **Phase 3:** approved Excel SOV template round-trip tests, verified carrier/BOR reference records, and application recommendation library.
4. **Phase 4:** approved local PDF/XLSX/ZIP analysis, historical comparisons, and evidence-linked underwriting guidance.

## Phase 2 model and decision boundaries

`WorkspaceData.research` is an additive optional field, preserving Phase 1 backup
compatibility. It contains immutable imported evidence batches, configurable agency
rules, explicit CRM identity decisions, and duplicate-review decisions. Each batch
records its filename, import time, export date, and row identifiers. Older or
conflicting sources remain visible until explicitly removed by the user.

`src/data/research.ts` owns import validation, candidate matching, contact decisions,
scoring, industry aggregation, and backup validation. `ProspectResearch.tsx` provides
the review UI. The existing prospect list uses the same contact-decision function
so screening status does not contradict the research view. Scores and clearance
are derived rather than stored, avoiding stale results after rule edits.

Name matching uses normalized bigram similarity with a conservative candidate
threshold, not an identity guarantee. All CRM identities require human confirmation.
Clearance requires current evidence, explicit no-relationship/no-restriction fields,
and an activity date outside the configured restriction window. Missing matches,
unknown activity, stale exports, or unresolved candidates require review; confirmed
restrictions take precedence. Existing restricted prospect records remain restricted.

Fit scoring totals 100 points: 25 for same-industry bound history, 20 for a similarly
sized bound account in that industry, 20 for preferred industry, 15 for revenue fit,
10 for employee fit, and 10 for territory fit. Size similarity means reported revenue
or employees within a factor of two. Historical premium is reported only as an
aggregate of known imported amounts; no win probability or opportunity value is
invented. Duplicate review marks same/different without destructive merging.

Current limits: single-user browser storage; no background CRM synchronization;
no automatic resolution of renamed or unrelated-name organizations; no automatic
merge; no prediction model; evidence imports limited to 5 MB / 5,000 rows.

## Network boundary

There is no network client in application code and no background transmission. Dependency delivery happens only during development/build. Production uses system fonts and bundled assets. Example external URLs use the reserved `.invalid` domain so demonstration data cannot accidentally open a real client system.
