# Workflow simplification — October 15, 2026

## Public product research

Reviewed [Frappe CRM's public README](https://github.com/frappe/crm/blob/develop/README.md)
via its official repository. Its Key Features section describes:

- One lead/deal page bringing together details, notes, tasks, and actions.
- A Kanban view for tracking stages.
- Custom views using filters, sorting, and columns to reach the same records.

These documented concepts support a shared account workspace with alternate list,
pipeline, and work-queue views. This implementation uses original React components,
copy, styles, and insurance-specific domain logic. No Frappe source, assets, logos,
or product copy were incorporated. Frappe's server stack and integrations were not
adopted; this app continues to work entirely in browser storage.

AgencyZoom's public website and Pipedrive's contact-management page were also
attempted, but access returned HTTP 403 in this environment. Their current contents
were not verified and were not used as evidence for the design.

## Decisions implemented

| Previous friction | Current workflow |
| --- | --- |
| Two prospect lists | One sortable list with fit scores, availability, search and filters |
| Import/configuration controls always visible | Tools opens imports, historical analysis, duplicate review and agency rules |
| Separate prospect and submission editors | Shared account panel with details, submission work, carrier requests and contact review |
| Repeated account names drift between views | Explicit account saves update linked prospect, submissions and placement-request labels |
| Placement requests separated from accounts | Requests entered within an account; Outstanding items shows the same records across accounts |
| Dashboard repeats pipeline and static activity | Today focuses on due follow-ups, unmet requirements and unanswered carrier questions |
| Placeholder modules in main navigation | Four working destinations; later modules hidden |

## Data preservation

There is no destructive migration or reset. Existing IDs, prospect links, coverage
selections, checklist progress, review evidence, and carrier requests are preserved.
Existing source-name differences are not silently overwritten on load. A submission
opened from the pipeline retains its existing name; saving account details explicitly
synchronizes linked records. Submissions without a linked prospect store their own
optional accountDetails, included in JSON backups. They do not create duplicate
prospects automatically. Identity edits still invalidate prior CRM/duplicate decisions.

Notes and contact edits require Save account; switching account-panel tabs retains
the draft. Stages, coverage selections, checklists and carrier-request edits continue
to save automatically. Existing origin/profile storage and backup practices still apply.
