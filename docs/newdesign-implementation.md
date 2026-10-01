# Humanistic modernization

Brief: `../../newdesign.md` in the workspace root (relative to this document) (the app-local `newdesign.md` is empty).

The implementation keeps the black/electric-blue direction, local Sora and Outfit fonts, existing public routes, project data, named team, and inquiry endpoints.

## Implemented

- A shared readable typography and color system, quieter buttons, visible blue focus rings, and mobile spacing.
- A homepage organized around client problems, four featured projects, collaborative delivery, qualitative standards, and one studio note. Removed unqualified conversion, uptime, and launch-count claims.
- Sentence-case navigation, Work at the existing `/portfolio` URL, a single Start a project action, company profile access, and a three-column footer.
- Mobile menu focus containment, Escape dismissal, active route semantics, and focus restoration.
- About copy grounded in the existing founder, founding year, and location; six skills per team card. Removed the spinning manifesto badge and unsupported project count.
- Simpler portfolio cards, visible selected filters, accessible result count, and project detail summaries drawn from existing brief, contribution, role, and delivery fields. Gallery focus remains in the dialog.
- Consistent outcome-led service descriptions, scoped proposals in place of unqualified package prices, and a scope planner with an inquiry/email handoff. Custom service records and CMS media remain supported.
- Technology explained through decisions and trade-offs; an explicitly illustrative commerce architecture. Live technology records remain available without proficiency or certification badges.
- Contact links, labeled fields, native validation, autofill, useful errors, privacy link, and distinct sent-message/email-draft states.
- A Type → Goals → Contact planner with explicit Continue/Back actions, a Not sure yet choice, a summary, and preserved answers in the contact form.
- A nine-question FAQ with button/panel semantics, arrow/Home/End navigation, visible focus, and reduced-motion support. Adapted from [ddoemonn's Accordion](https://21st.dev/@ddoemonn/components/accordion), retrieved through 21st MCP.
- Studio notes deduplicated by slug, author metadata, lazy images, and removal of inert trending tags and load-more control.
- Careers inquiries linked to email; candidates are asked to confirm current status and role terms rather than seeing invented compensation.
- Static readable titles, calmer reveals and backgrounds, removal of the flashing WhatsApp notification, and a static technology strip without implied provider partnerships.
- Updated public metadata and a default social-preview image.

## Verification

Run `npm.cmd run lint`, `npm.cmd run build`, `npm.cmd run test`, and `npm.cmd run verify:performance`.

Browser regression checks are in `scripts/verify-public-design.mjs`. Pass the installed agent-browser executable path and optional preview URL. The script checks 14 public routes at desktop, tablet, and phone widths, one H1, metadata, horizontal overflow, planner handoff, FAQ keyboard controls, mobile menu focus, and reduced-motion visibility. Results are saved to `docs/public-design-verification.json`.

The existing automated test suite covers four backend/schema/image checks; it is not a full accessibility audit. Browser verification uses the static production preview and existing fallback content. It does not send inquiries, create bookings, or validate production database availability.

## Content still needed from the studio

- Actual early-project stories, lessons, and one sentence about each person's working style.
- Approved business pricing ranges, scope exclusions, timelines, and support terms before showing a numerical estimate.
- Project engagement classification (shipped, concept, maintenance, partial), ownership boundaries, before/after screens, and measurement sources for numerical outcomes. Existing data is displayed without inventing missing history or results.
- Additional original articles if the studio wants to expand Notes into a maintained journal.
- Confirmed hiring status, full role briefs, compensation ranges, and timezone requirements.
- Verification of claims in CMS-authored project descriptions, articles, testimonials, and technology records. This change does not rewrite production database content or the downloadable company-profile PDF.

Full slow-network, 200% browser zoom, production inquiry delivery, and exhaustive contrast checks across CMS images still need a separate pass. Nothing has been deployed.
