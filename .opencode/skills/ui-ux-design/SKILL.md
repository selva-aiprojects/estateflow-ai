---
name: ui-ux-design
description: Use when generating, building, editing, or reviewing any frontend code (web: Next.js/React/Tailwind, or mobile: Flutter) for EstateFlow. Provides mandatory UI/UX standards distilled from industry references so generated UI is never unstyled, never uses default borders, and never uses arbitrary color palettes. Also use for design system work, dashboard UI, forms, landing pages, and UI/UX reviews.
---

# EstateFlow UI/UX Standards

Every frontend deliverable MUST satisfy these rules. Do not generate unstyled layouts, default browser borders, or arbitrary color palettes. When asked for UI/UX work, first establish the design system for the context, then build.

Sources: UI UX Pro Max (nextlevelbuilder/ui-ux-pro-max-skill), Awesome AI Tools for UI (maxbogo/awesome-ai-tools-for-ui), hendurhance/ui-ux, SixArm UI/UX Design Guide, Microsoft VS Code UX wiki. See "References" at the end.

---

## 1. Design-System-First (Mandatory)

Before writing any UI code, define (or reuse an existing) design system for the screen being built:

1. **Layout pattern** — grid/structure for the page (e.g., dashboard, list-detail, marketing, form).
2. **Style direction** — pick a coherent style and apply it consistently (see §2).
3. **Color tokens** — semantic palette, never raw hex scattered in JSX (see §4).
4. **Typography** — font pair + type scale with defined roles (see §5).
5. **Spacing & shape** — consistent spacing scale, radii, borders, shadows (see §3).
6. **Motion & states** — hover/active/focus/disabled/loading behavior (see §6).
7. **Anti-patterns to avoid** — explicitly check off (§7).

EstateFlow default (unless the task says otherwise): **Enterprise SaaS — Minimalism/Swiss style** with **data-dense but calm** surfaces. Default breakpoints: 375px, 768px, 1024px, 1440px.

---

## 2. Style Direction

Match the style to the product surface:

| Context | Recommended style |
|---|---|
| EstateFlow dashboards (Management, Finance, Sales) | Minimalism & Swiss Style; data-dense, grid-disciplined |
| Inventory heat maps / live monitoring | Heat-map dashboards; high signal, restrained chrome |
| Customer portal / mobile customer app | Soft UI Evolution; warm, trustworthy, premium |
| Marketing / public landing pages | Hero-centric + social proof; conversion-optimized |
| AI chat interfaces (agents) | AI-Native UI; clear separation of human vs. AI messages, visible tool usage |

Adopt one style per screen and keep every element within it. Never mix Glassmorphism cards with Brutalist headings in one screen.

---

## 3. Layout, Spacing & Shape

- **Spacing scale:** 8-point system: 4, 8, 12, 16, 24, 32, 48, 64, 96. No arbitrary gap values.
- **Grid:** use a 12-column grid on desktop, 4-column on mobile. Align to the grid; nothing floats arbitrarily.
- **Whitespace:** generous padding (≥ 24px on card/pane padding for desktop). Density increases only for data tables and dashboards, never below 8px gutters.
- **Borders:** never use default/browser borders. Use `border-...` utilities from Tailwind tokens (`border-border`) or theme tokens. Hairlines (1px) at 20–30% opacity of text color. Hover uses shadow/background change, not thicker borders.
- **Radii:** use a token scale: `sm 6px`, `md 8px`, `lg 12px`, `xl 16px`. Cards: `md`–`lg`. Buttons/inputs: `md`. Pills: full.
- **Shadows:** layered and soft, not harsh drop-shadows. `sm`/`md`/`lg` from the token set; shadow elevation conveys stacking only.
- **Cards:** consistent internal padding (16–24px), consistent corner radius, defined hover state (subtle lift + shadow).

---

## 4. Color (No Arbitrary Palettes)

- Define **semantic tokens** and use them everywhere: `background`, `surface`, `surface-muted`, `border`, `text`, `text-muted`, `primary`, `primary-hover`, `secondary`, `accent`, `success`, `warning`, `danger`, `info`. Map to Tailwind theme or CSS custom properties.
- **Contrast:** body text vs. background ≥ 4.5:1 (WCAG AA). Large text (≥24px / 18.6px bold) ≥ 3:1. Test every palette.
- **Semantic status colors** (required for EstateFlow inventory/lifecycle):
  - Available = green (`#22c55e` family), Blocked = yellow (`#eab308`), Token Paid = blue (`#3b82f6`), Sold = red (`#ef4444`).
  - Danger/error, warning, success, info must be semantically consistent across the whole app.
- **Text color:** never pure black on pure white for body text; use a softened dark (`#1a1a1a`–`#2d3436`).
- **Dark mode:** design it deliberately with tokens; do not invert colors by hand. Do not ship dark mode by default for finance/enterprise unless requested (see anti-patterns).
- **Do NOT:** use random hex in components, use AI-purple/pink gradient defaults, or Tailwind's default blue/gray everywhere for no reason.

---

## 5. Typography

- **Choose a font pair** appropriate to the surface (display + body). EstateFlow defaults: a grotesque/sans for UI (e.g., Inter) with optional serif display for premium/marketing pages. Load via Google Fonts or self-hosted; never system-font-only for headings.
- **Type scale:** a defined scale with roles — `xs 12`, `sm 14`, `base 16`, `lg 18`, `xl 20`, `2xl 24`, `3xl 30`, `4xl 36`. Track size consistent with UI size; establish line-height (1.4–1.6 for body, tighter for headings).
- **Weight/emphasis:** use 1–2 weights per font; emphasize via size/weight, not color alone.
- **Numbers/data:** use tabular figures (font-variant-numeric) in tables, financial figures, and dashboards so columns align.
- **RUPEES:** Indian locale formatting — `₹1,25,00,000` (Indian digit grouping). Use a currency formatter; never hand-concatenate.

---

## 6. Motion, States & Micro-interactions

- **Transitions:** 150–300ms ease for hover/focus/state changes. Consistent across the app.
- **Hover states:** every interactive element has a defined hover (background tint or shadow lift) with smooth transition. Apply `cursor-pointer` to all clickable elements.
- **Focus states:** always visible for keyboard navigation (focus ring: 2–3px offset ring in `primary`). Never remove outlines without a replacement.
- **Loading:** skeleton loaders for content; spinners only for in-flight actions. Preserve layout (no layout shift).
- **Empty states:** every list/table/dashboard has a designed empty state (icon + title + hint/CTA), not a blank screen.
- **`prefers-reduced-motion`:** respect it — disable non-essential animation.
- **Micro-interactions:** affirm actions (button press, toast, checkmark) but keep them subtle. No infinite spin, no gratuitous bouncing.

---

## 7. Anti-Patterns (Hard Bans)

- Emojis used as icons — use SVG icon sets (Heroicons / Lucide / Lucide-style) with consistent stroke width.
- Default browser styling: default borders, default buttons, default focus outline, default selects — always custom.
- Random/unrelated colors, gradients with no purpose, neon on enterprise screens.
- "AI purple/pink gradient" or generic purple splash as the default look, especially for finance/banking/enterprise.
- Cookie-cutter layouts (centered hero + 3 columns + grey footer) for every page; match the content type.
- Layout shift from unloaded images/fonts; `lazy` non-critical images, set dimensions.
- Harsh animations, parallax on data-heavy screens, dark mode forced where it hurts readability.
- Dead controls: buttons/links that do nothing, disabled without explanation.

---

## 8. Accessibility (WCAG AA Baseline)

- Text contrast ≥ 4.5:1; large text ≥ 3:1 (§4).
- Full keyboard navigation; visible focus (§6); logical tab order.
- Semantic HTML (buttons for actions, links for navigation, `<label>` for inputs, proper heading hierarchy — one `h1` per page).
- Forms: labels visible or via `aria-label`, errors inline + announced, required indicators, helper microcopy.
- Color is never the only signal: pair status color with an icon/label (e.g., Sold = red + dot + text). Critical for the inventory heat map (color-blind users).
- Alt text for meaningful images; empty `alt=""` for decorative. Buttons with icon-only content get accessible names.
- Touch targets ≥ 44×44px on mobile (Flutter: ≥ 48 logical px per Material guidance).
- Run an a11y check (axe) before delivery on every new screen.

---

## 9. Responsive Behavior

- Test/design at: **375px (mobile), 768px (tablet), 1024px (laptop), 1440px (desktop)**.
- Mobile-first: content stacks; key actions thumb-reachable; tables become cards or horizontally scrollable with sticky first column.
- Sidebar → bottom-nav (mobile apps) or drawer. Dashboards reflow into stacked cards.
- Do not scale down desktop layouts via zoom; redesign the breakpoint.
- Flutter apps: use `LayoutBuilder`/`MediaQuery` breakpoints; follow Material 3 with the same semantic tokens.

---

## 10. EstateFlow-Specific Patterns

- **Inventory Heat Map:** units colored by status token (§4). Click = drill-down. Legend always visible. Tooltip with unit no, type, sqft, price. Status change animates gently; locks shown with countdown when a quote hold is active.
- **Dashboards:** KPI cards (value, delta, sparkline), charts with gridlines and tabular numerals, filters in a top bar, drill-down from charts. Avoid chart junk; label directly where possible.
- **Forms (quotations, bookings, DPR):** sectioned card groups, clear save/approve CTAs, inline validation, milestone/payment-schedule tables aligned with tabular figures.
- **AI chat (Sales/Customer agents):** human vs. AI bubbles distinguished, typing indicator, "tool used" disclosure, copy button, escalation to human clearly marked.
- **Approval flows (discounts >5%, BOQ overages):** banner + notification + approve/reject panel; no silent blocking.

---

## 11. Pre-Delivery Checklist

Before delivering any UI work, verify each item:

- [ ] No emojis as icons (SVG only).
- [ ] `cursor-pointer` on all clickable elements.
- [ ] Hover states with smooth transitions (150–300ms).
- [ ] Body text contrast ≥ 4.5:1 (light mode).
- [ ] Visible focus states for keyboard navigation.
- [ ] `prefers-reduced-motion` respected.
- [ ] Responsive check at 375 / 768 / 1024 / 1440.
- [ ] Semantic tokens used — no arbitrary hex.
- [ ] No default borders or default browser styling anywhere.
- [ ] Empty + loading + error states present.
- [ ] Indian rupee/date/locale formatting applied where relevant.
- [ ] Accessible names, labels, and heading hierarchy.

---

## References

- nextlevelbuilder/ui-ux-pro-max-skill — design system generation, 84 styles, 161 industry reasoning rules, pre-delivery checklist.
- maxbogo/awesome-ai-tools-for-ui — curated UI skills index (Anthropic Frontend Design, Taste, Swiss Design System, UserInterface.wiki).
- hendurhance/ui-ux — UI/UX fundamentals and learning path.
- SixArm/ui-ux-design-guide — glossary: Jakob's Ten Usability Heuristics, WCAG, cognitive load, information architecture, grids, typography, iconography.
- microsoft/vscode/wiki/UX — design process: research → low-fidelity concepts → prototypes → dogfood → iterate.
