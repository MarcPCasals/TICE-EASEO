# Design QA · editor de publicacions

- Source visual truth: `/Users/marc/.codex/generated_images/01a0aedf-10b3-74a3-95c1-031476eb39ec/exec-8e1e9448-1b5f-43c5-b1e4-cba9fab2c6a8.png`
- Implementation screenshot: `/Users/marc/Documents/projectes/TICE-EASEO/work/admin-publication-desktop-final.jpg`
- Mobile screenshots: `/Users/marc/Documents/projectes/TICE-EASEO/work/admin-publication-mobile-final.jpg` and `/Users/marc/Documents/projectes/TICE-EASEO/work/admin-publication-mobile-preview.jpg`
- Viewports: desktop `1440 × 1024`; mobile `390 × 844`
- Source pixels: `1487 × 1058`, normalized to `1440 × 1024`
- Implementation pixels: `1440 × 1024`; CSS viewport `1440 × 1024`; browser density `1×`
- State: authenticated administrator, Prompt selected, realistic content entered, live preview visible.
- Full-view comparison: `/Users/marc/Documents/projectes/TICE-EASEO/work/admin-publication-qa-side-by-side.jpg`
- Focused form comparison: `/Users/marc/Documents/projectes/TICE-EASEO/work/admin-publication-qa-form.jpg`
- Focused preview comparison: `/Users/marc/Documents/projectes/TICE-EASEO/work/admin-publication-qa-preview.jpg`

## Findings

- P0: none.
- P1: none.
- P2: none unresolved.
- Fonts and typography: Newsreader, Libre Caslon Display and DM Sans reproduce the editorial hierarchy and readable product text from the source.
- Spacing and layout rhythm: the editor/preview proportion, double navy rule, field rhythm, format selector and first-screen actions match the selected composition.
- Colors and tokens: the implementation reuses the product navy, orange, violet, cream paper and thin rule system without introducing gradients or generic dashboard styling.
- Image and asset fidelity: the existing logo and generated real paper texture are reused; all interface symbols use the installed Phosphor icon system.
- Copy and content: labels follow the Catalan source; titles and preview text intentionally use the real planned rubric resource rather than the mock’s inconsistent authentication example.
- Responsive behavior: the mobile view has no page-level horizontal overflow; the format choices scroll within their own rail and the preview moves beneath the editor.
- Accessibility: controls have labels, selected-state semantics, focus styling and sufficient contrast.
- Interactions: type switching changes contextual labels; live preview updates; draft and publish actions complete; a published resource appears on the public page and in search.
- Console: no browser errors observed during the tested flow.

## Comparison history

1. First pass: P2 — required-field markers created extra rows, pushing publication actions too far below the source position. Fixed by grouping labels and markers inline and tightening the field rhythm.
2. Mobile pass: P2 — the format fieldset expanded the document to `594 px` inside a `390 px` viewport. Fixed by constraining the fieldset and making only its format rail horizontally scrollable; verified page width is now `390 px`.
3. Final pass: the primary buttons are visible at the bottom of the target desktop frame, the preview fills the right newspaper column, and no P0/P1/P2 mismatch remains.

## Follow-up polish

- P3: the generated concept uses longer example copy than the real rubric resource, so the real preview is intentionally less dense.

final result: passed

---

# Design QA · fitxa de videotutorial i consulta contextual

- Source visual truth: `/var/folders/74/q1q7tp35509f8hnk93wlr6pw0000gn/T/TemporaryItems/NSIRD_screencaptureui_YSH7Pi/Captura de pantalla 2026-09-17 a les 22.39.36.png`
- Implementation screenshots: `/Users/marc/Documents/projectes/TICE-EASEO/work/video-modal-desktop.png` and `/Users/marc/Documents/projectes/TICE-EASEO/work/video-modal-mobile.png`
- Viewports: desktop `1843 × 1290`; mobile `390 × 844`
- Source pixels: `1824 × 1294`; implementation pixels: `1836 × 1290` and `390 × 844`
- State: authenticated educator, authentication videotutorial open, contextual consultation form visible and successfully submitted.
- Full comparison: `/Users/marc/Documents/projectes/TICE-EASEO/work/video-modal-comparison.png`
- Comparison scope: the supplied screenshot documents the former vertical split; QA verifies the requested horizontal composition and the added per-resource consultation flow.

## Findings

- P0: none.
- P1: none.
- P2: none unresolved.
- Layout: the video now occupies the full dialog width in a 16:9 frame; title, summary and supporting copy form a readable column beneath it.
- Contextual consultation: every resource dialog includes a compact question box before the usefulness controls, with the resource and signed-in Educand email attached automatically.
- Feedback: successful submission replaces the form with an explicit confirmation naming the resource; the administrator notification also shows the sender and resource title.
- Responsive behavior: at `390 px`, the video, explanation, confirmation and usefulness controls stack without horizontal overflow.
- Accessibility: the textarea has a resource-specific accessible label; submit, close and usefulness actions retain explicit names and keyboard focus styles.
- Visual system: the new box uses the existing navy, violet, cream and editorial type system without adding a competing visual language.
- Console/build: production build completed; no browser error appeared during the tested submission flow.

## Comparison history

1. Baseline: the video and explanation shared two narrow vertical columns, making the video too small; there was no visible resource-specific question input.
2. Desktop pass: changed to a single-column dialog with the 16:9 player above the explanation and added the contextual question box.
3. Functional pass: submitted a test question and verified both the success state and the new-consultation notification with the resource title.
4. Mobile pass: verified the complete stack at `390 × 844` with no clipping or page-level horizontal overflow.

final result: passed

---

# Design QA · gestor de recordatoris

- Source visual truth: `/var/folders/74/q1q7tp35509f8hnk93wlr6pw0000gn/T/TemporaryItems/NSIRD_screencaptureui_cEgtqa/Captura de pantalla 2026-09-17 a les 19.58.56.png`
- Implementation screenshot: `/Users/marc/Documents/projectes/TICE-EASEO/work/reminder-board-desktop-final.png`
- Mobile screenshot: `/Users/marc/Documents/projectes/TICE-EASEO/work/reminder-board-mobile-final.png`
- Viewports: desktop `1370 × 852`; mobile `390 × 844`
- Source pixels: `1370 × 852`; implementation pixels: `1370 × 852`; CSS viewport `1370 × 852`; browser density `2×` with browser-normalized screenshot output.
- State: authenticated administrator, private reminder tab selected, two realistic pending reminders visible.
- Full-view comparison: `/Users/marc/Documents/projectes/TICE-EASEO/work/reminder-board-qa-side-by-side.jpg`
- Comparison scope: the approved homepage is the source of truth for the shared visual system rather than an exact layout mock for this new private screen.
- Focused comparison: not required; typography, palette, rules, texture and controls remain clearly readable in the full-width paired image.

## Findings

- P0: none.
- P1: none.
- P2: none unresolved.
- Fonts and typography: Newsreader and Libre Caslon Display preserve the editorial headline hierarchy; DM Sans keeps form labels and metadata compact and legible.
- Spacing and layout rhythm: the creation form and review list form two clear columns on desktop and a single uninterrupted flow on mobile.
- Colors and tokens: navy, orange, violet, cream paper and thin/double rules map directly to the approved Racó palette.
- Image and asset fidelity: the supplied brand logo and existing real newsprint texture are reused; all interface icons come from the installed Phosphor library.
- Copy and content: labels are concise Catalan and the examples reflect the first real TICE resources.
- Responsive behavior: verified at `390 px`; document width equals viewport width (`390 px`) with no page-level horizontal overflow.
- Accessibility: every field has a label, filters expose text labels, completion buttons have action-specific accessible names, and focus states remain present.
- Interactions tested: opened the private workspace, selected Recordatoris, created a reminder, changed priority, marked it complete, and found it under Fets.
- Console: a fresh browser tab completed the tested flow with no errors.

## Comparison history

1. First visual pass: no actionable P0/P1/P2 mismatch in the shared design surfaces.
2. Functional polish: the list heading was made responsive to the selected filter (`Per fer`, `Fets` or `Tots`).
3. Mobile pass: layout stacks correctly and has no horizontal overflow.

## Follow-up polish

- P3: if the reminder list grows substantially, a text search can be added later without changing this composition.

final result: passed
