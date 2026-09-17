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
