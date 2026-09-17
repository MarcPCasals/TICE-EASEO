# Design QA · portada Racó TIC-TAC

- Source image: `/Users/marc/.codex/generated_images/01a0aedf-10b3-74a3-95c1-031476eb39ec/exec-4af3e1a0-18bb-451b-a64e-f22ca1aa9458.png`
- Implementation screenshot: `/Users/marc/Documents/projectes/TICE-EASEO/work/implementation-desktop-final.png`
- Mobile screenshot: `/Users/marc/Documents/projectes/TICE-EASEO/work/implementation-mobile-final.png`
- Viewports: desktop `1440 × 1024`; mobile `390 × 844`
- Source pixels: `1487 × 1058`
- Implementation pixels: desktop `1440 × 1144`; mobile `390 × 2169`
- CSS viewport: desktop `1440 × 1024`; mobile `390 × 844`
- Pixel density: browser screenshot at CSS-pixel density
- State captured: authenticated development preview with the three initial resources
- Full-view comparison evidence: `/Users/marc/Documents/projectes/TICE-EASEO/work/qa-side-by-side.png`
- Focused-region evidence: not required; the full viewport exposes the complete hierarchy and all reference regions.

## Findings

- P0: none.
- P1: none.
- P2 resolved: the source SVG kept a square intrinsic canvas that made the header too tall. The displayed brand is now cropped through its container and the header matches the reference proportions.
- P2 resolved: the featured-resource columns and title scale were refined so the editorial balance stays close to the reference while preserving readable responsive wrapping.
- Intentional difference: “MarcBook” is replaced by “Dispositius electrònics”, following the product decision.
- Intentional difference: dates use the current 2026 launch context rather than the illustrative dates in the mockup.
- Responsive check: no horizontal page overflow at 390 px; the topic rail remains horizontally scrollable by design.
- Interaction check: topic search, empty state, resource opening and consultation dialog all respond correctly.

## Comparison history

1. Initial pass: detected oversized header caused by the SVG canvas and a wider-than-reference featured heading.
2. Final pass: tightened the logo crop, header and featured-resource typography; desktop and mobile layouts re-captured and verified.

## Final result

**Passed.** No unresolved P0, P1 or P2 visual issues.
