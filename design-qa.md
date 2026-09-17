# Design QA · portada Racó TIC-TAC

- Source image: `/var/folders/74/q1q7tp35509f8hnk93wlr6pw0000gn/T/TemporaryItems/NSIRD_screencaptureui_cEgtqa/Captura de pantalla 2026-09-17 a les 19.58.56.png`
- Implementation screenshot: `/Users/marc/Documents/projectes/TICE-EASEO/work/framed-desktop-final.jpg`
- Mobile screenshot: `/Users/marc/Documents/projectes/TICE-EASEO/work/framed-mobile-viewport-final.jpg`
- Viewports: desktop `1370 × 852`; mobile `390 × 844`
- Source pixels: `1370 × 852`
- Implementation pixels: desktop `1370 × 852`; mobile viewport `390 × 844`
- CSS viewport: desktop `1370 × 852`; mobile `390 × 844`
- Pixel density: browser screenshot at CSS-pixel density
- State captured: authenticated development preview with the three initial resources
- Full-view comparison evidence: `/Users/marc/Documents/projectes/TICE-EASEO/work/framed-qa-side-by-side.jpg`
- Focused-region evidence: not required; the full viewport exposes the complete hierarchy and all reference regions.

## Findings

- P0: none.
- P1: none.
- P2 resolved: the navy hero frame now measures `1035 × 390` at the source viewport and sits at the same horizontal and vertical coordinates as the reference.
- P2 resolved: hero typography switches to white while preserving the orange signature phrase and white search surface.
- P2 resolved: the violet note now includes a curved arrow from the existing icon library and remains inside the viewport.
- Responsive check: no horizontal page overflow at either viewport; the violet annotation hides on narrow screens and the topic rail remains horizontally scrollable by design.
- Responsive check: mobile headline and search placeholder were tightened for readable wrapping inside the framed surface.
- Interaction check: existing search, topic, resource and consultation behavior remains unchanged.

## Comparison history

1. Initial pass: framed the hero in navy and matched the source width, but the frame sat 13 px too high and the violet note caused horizontal overflow.
2. Final pass: matched the `1370 × 852` source geometry, added the requested curved violet arrow, removed overflow and verified the mobile breakpoint.

## Final result

**Passed.** No unresolved P0, P1 or P2 visual issues.
