# Forensic Teardown: hex.tech (2026-07-11)

Reference extraction for rebuilding Threxa's landing at the same quality bar. Live inspection via Chrome (computed styles + full-page walk). We replicate the design system and section skeleton; all copy, product mocks, and brand marks in our build are Threxa's own.

## 1. First impression and positioning

Sub-2s read: "serious data tool with taste." Editorial-meets-drafting-table. One theme (trust) repeated in every section. The page sells credibility through real product UI embedded live, not marketing illustrations. Announcement ticker on top adds energy without noise.

## 2. Color system

| Token | Value | Usage |
|---|---|---|
| paper | #F5F3EF (warm off-white) | page canvas, with dot-grid/graph-paper texture |
| ink | rgb(20,20,28) #14141C | all text, borders, logo |
| ink-deep | rgb(1,1,27) | body copy in dense sections |
| pink-wash | ~#F9E8E8 | primary CTA fill, hover washes |
| coral | ~#E3B2B3 tones | tick marks, hand-drawn accents |
| hairline | rgba(20,20,28,.15) | 1px section frames, card borders |
| chart accents | viridis ramp (#440154→#FDE725) + purples #7C6BC4/#5B4B9E | product-UI data viz only |
| white | #FFFFFF | product mock panels |

Semantics: no semantic green/red on the marketing page; color restraint everywhere except inside product screenshots, which makes the screenshots read as the "live" element.

## 3. Typography

| Role | Font | Spec |
|---|---|---|
| Display serif (italic) | custom editorial serif | italic, ~90-100px hero line 1, tight leading |
| Display sans | "PP Formula SemiExtended" | 700, 51-64px, letter-spacing -1.5px, line 2 of hero |
| Body | "Cinetype" (mono-flavored sans) | 16-18px, ~1.6 line height |
| Eyebrow/labels | mono, uppercase | 12-13px, letterspaced, flanked by ⊣ ⊢ tick glyphs |
| Buttons | mono/sans | 14px |

Signature move: one headline mixes italic serif (line 1) with heavy semi-extended sans (line 2). Eyebrows are drafting-style measurement labels.

## 4. Layout and spacing

- Page canvas framed by 1px hairline border inset ~30px from viewport; sections divided by hairlines: blueprint feel.
- Content max-width ~1200-1440px, centered hero, generous 140-200px section padding.
- Alternating two-column feature rows (copy 40% / product mock 60%), each with an embedded customer quote.
- Announcement ticker: full-width marquee, mono 14px, separated items.
- Nav: links left, centered logo, actions right, boxed Get started with corner-bracket hover marks.

## 5. Components

| Component | Spec |
|---|---|
| Primary button | 0 radius, 0.8px ink border, pink fill, hard offset shadow (stamp look), corner brackets on hover |
| Secondary button | same geometry, paper fill |
| Eyebrow label | mono caps with ⊣ ⊢ ticks |
| Product mock panel | white, hairline border, browser-chrome header row, real UI inside |
| Quote block | serif italic quote + mono attribution (name, role) |
| Tab strip | mono labels, active tab boxed |
| Ticker | marquee with emoji-flagged items |
| FAQ | plain accordion rows, hairline dividers |
| Footer | line-art arcs illustration with nodes |

## 6. Hierarchy and flow

Ticker → nav → hero (label-less, straight to display type) → dual CTA → 3-panel product demo (notebook / conversational / data app) with mono captions → radial context diagram → logo wall → quote ticker → "workflows" tabbed sections x4 (observability, self-serve, data apps, notebooks), each: eyebrow + big head + body + text-link CTA + quote + full product mock → case study cards → G2 badge → integrations grid → "Getting started is easy" CTA pair → FAQ → footer.

## 7. Conversion psychology

- Dual-intent CTA everywhere: "Get started for free" (PLG) + "Request a demo" (sales), repeated at close.
- Proof density is the strategy: 10+ named quotes with roles, logo wall, case cards, review badge. Every feature claim is immediately followed by a human vouching for it.
- Product UI as hero art: nothing abstract, the actual tool is the visual.
- FAQ handles category objections (vs BI tools, vs ChatGPT) at the end.

## 8. Section-by-section

| # | Section | Pattern to reuse for Threxa |
|---|---|---|
| 0 | Ticker | data-incident facts + hackathon note |
| 1 | Nav | centered wordmark, boxed CTA |
| 2 | Hero | serif italic + extended sans mixed headline, sub, dual CTA |
| 3 | Product trio | PR verdict comment / blast-radius dashboard / DataHub write-back |
| 4 | Radial diagram | lineage context arcs (SVG) |
| 5 | Logo/proof wall | stack row: GitHub, DataHub, dbt, Snowflake, MCP |
| 6 | Feature rows x3 | parse → blast radius → write-back, each with mock |
| 7 | Case cards | scripted demo PR outcomes (real, from our runs) |
| 8 | Integrations | stack grid |
| 9 | CTA pair | dashboard + repo |
| 10 | FAQ | how it works, why not just CI, judges' questions |
| 11 | Footer | arc line-art, mono links |

## 9. What to steal (Tailwind tokens)

1. Paper + dot grid: `bg-[#F5F3EF]` + CSS radial-gradient dots at 14px spacing.
2. Hairline frames: `border border-ink/15` page inset frame; sections `border-t`.
3. Stamp buttons: `rounded-none border border-ink bg-[#F9E8E8] shadow-[3px_3px_0_0_#14141C]` hover translate.
4. Mixed headline: `font-serif italic` line + `font-sans font-extrabold tracking-tight` line.
5. Eyebrows: `font-mono uppercase tracking-[0.2em] text-xs` with `⊣ ⊢` pseudo ticks.
6. Mock panels: white cards with mono chrome header, hairline border.
7. Quote blocks under every feature.
8. Marquee ticker via CSS animation.
9. Corner brackets on interactive elements (pseudo-elements).
10. Arc/node footer illustration (single SVG).

## 10. Critical review

Strengths: unmistakable identity, restraint (two accents max), product-as-imagery, proof density, one repeated theme. Weaknesses we avoid: hero takes 7s to load its demo panels (we ship static mocks), scroll-jacking inside embedded demos frustrates (we don't embed live iframes), some sections lazy-load to blank on fast scroll (we render statically), body-wide mono hurts long-paragraph readability (we use mono only for labels/small text).
