# Public portfolio redesign

## Audit and direction

Scope: all public routes, shared navigation/footer, portfolio cards, forms and team pages. Preserve all video source files and usages, including the home WebM as a side visual. Admin and printable CVs have separate presentation requirements.

Observed source issues: black/near-black surfaces, white text at 20–40% opacity, 9–10px labels, overly tracked uppercase buttons, repeated full-height heroes, text-heavy process cards, and a Tech Stack video spanning the entire page rather than its hero. Contact copy used technical jargon. Existing project mockups can illustrate services without stock imagery.

Direction: professional digital studio, navy base (#142344), elevated blue panels (#24385d), restrained purple accents, pale blue/lavender headings, white primary text and readable secondary copy (#cbd7ef). Keep the local Sora/Outfit fonts; use Sora for hierarchy and Outfit for comfortable reading. Primary action: explore work, then start a project.

Implementation: public-only theme via `.studio-site`; shared rounded controls, stronger form fields, video readability overlays and compact inner-page heroes. Project images retain their real content. A four-stage delivery ladder explains outcomes, the technology diagram explains relationships, and portfolio bars count actual loaded project records (not invented business results). Charts have visible numeric labels and semantic lists.

Verification targets: build and typecheck; public routes at 390, 768 and 1440px; overflow, images, video readiness, portfolio filtering, contact navigation, menu open/close, reduced motion and keyboard focus. Backend submissions are outside this visual check.
