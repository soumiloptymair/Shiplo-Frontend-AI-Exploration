# Replit Figma MCP Guardrails

## Purpose

Use this file as the operating contract for Replit when converting Figma designs into a working app prototype using the Figma MCP.

The goals are to:

- Preserve UI fidelity from Figma.
- Maintain a consistent and cohesive design system.
- Generate and update design tokens from every new Figma input.
- Produce clean, reusable, production-ready code that developers can use directly.
- Document assumptions, token changes, and implementation decisions clearly.

---

# 1. Figma Is the Source of Truth

Always treat the latest Figma file, frame, page, component, and variable data provided through the Figma MCP as the primary source of truth.

Use exact values from Figma wherever available, including:

- Layout dimensions
- Spacing
- Auto-layout behavior
- Color values
- Typography
- Border radius
- Shadows
- Stroke widths
- Component states
- Icon sizes
- Interaction patterns
- Responsive behavior
- Layer hierarchy
- Layer naming

Do not visually approximate UI unless a value is missing from Figma.

If a Figma value is unclear, missing, duplicated, or inconsistent, do not invent a new design language. Use the closest existing token or component pattern and document the assumption in the implementation notes.

---

# 2. Design Token Rules

Every time a new Figma file, page, frame, or component is added, inspect it for new or changed design values.

Create or update centralized design tokens for:

- Colors
- Typography
- Font sizes
- Font weights
- Line heights
- Letter spacing
- Spacing
- Border radius
- Elevation and shadows
- Z-index layers
- Stroke widths
- Component sizes
- Breakpoints
- Motion and transition durations
- Opacity values

Tokens must be stored centrally. Do not hardcode visual values directly inside components unless there is no reusable design value.

Recommended structure:

```txt
src/
  design-system/
    tokens/
      colors.ts
      typography.ts
      spacing.ts
      radius.ts
      shadows.ts
      motion.ts
      breakpoints.ts
      zIndex.ts
      opacity.ts
      index.ts
    components/
    theme/
```

Token names should be semantic wherever possible.

Preferred examples:

```ts
color.background.primary
color.background.secondary
color.text.primary
color.text.muted
color.border.default
color.action.primary
color.action.primaryHover
radius.card
spacing.4
shadow.modal
```

Avoid raw or unclear names:

```ts
blue500
gray17
figmaColor12
buttonColor2
```

Raw palette tokens are allowed only as a lower-level layer if semantic tokens reference them.

---

# 3. Token Update Guardrails

When processing a new Figma input:

1. Compare new values against existing tokens.
2. Reuse an existing token if the value matches.
3. Create a new token only if the value represents a distinct design decision.
4. Do not create duplicate tokens for the same value.
5. Do not rename existing tokens unless necessary.
6. If a token value changes, update all components using that token.
7. Add a changelog entry for token additions, removals, or value changes.

Create or update:

```txt
src/design-system/tokens/CHANGELOG.md
```

Changelog format:

```md
## Token Update - YYYY-MM-DD

### Added
- color.action.secondary
- spacing.18

### Changed
- radius.card from 12px to 16px

### Removed
- color.buttonBlue, replaced by color.action.primary

### Notes
- Document any assumptions or normalization decisions here.
```

---

# 4. Component Fidelity Rules

For every Figma component, create or reuse a matching code component.

Each component must preserve:

- Layout
- Spacing
- Sizing
- Alignment
- Visual hierarchy
- States
- Variants
- Disabled states
- Hover states
- Focus states
- Error states
- Empty states
- Loading states
- Responsive behavior

Component variants in Figma should map to component props in code.

Example:

```tsx
<Button variant="primary" size="md" state="default" />
<Button variant="secondary" size="sm" disabled />
<Input state="error" helperText="Required field" />
```

Do not create one-off UI unless the design is truly unique.

---

# 5. Consistency and Cohesion Rules

Before creating any new component, check whether an existing component or token already solves the need.

Use the existing design system first.

Do not introduce:

- New colors outside the token system
- New spacing values outside the token system
- New font sizes outside the typography scale
- New button styles without a Figma-backed variant
- Inline CSS that duplicates tokenized styles
- Multiple versions of the same component

If Figma contains inconsistent values, normalize to the nearest existing token and document the deviation.

Example note:

```md
Figma used 15px vertical padding in this frame, but the existing spacing scale uses 16px. Used spacing.4 for consistency.
```

---

# 6. Layout Implementation Rules

Use modern, maintainable layout techniques.

Prefer:

- Flexbox for one-dimensional layouts
- CSS Grid for complex page layouts
- Container-based responsive behavior
- Reusable layout primitives
- Auto-layout equivalents from Figma

Avoid:

- Absolute positioning unless Figma requires it
- Magic numbers
- Pixel-perfect hacks
- Deeply nested layout wrappers
- Hardcoded viewport assumptions

If Figma uses auto layout, translate it directly into flex or grid behavior.

---

# 7. Responsive Behavior Rules

Do not assume the desktop Figma frame is the only required layout.

For each screen, define responsive behavior for:

- Desktop
- Tablet
- Mobile

Use design tokens for breakpoints.

If mobile or tablet frames are provided in Figma, implement them exactly.

If only desktop is provided, infer responsive behavior conservatively:

- Preserve hierarchy.
- Stack columns vertically on smaller screens.
- Maintain minimum touch target sizes.
- Avoid horizontal scrolling unless intentionally designed.
- Keep navigation and primary actions accessible.

Document any inferred responsive decisions.

---

# 8. Code Quality Rules

Produce clean, production-ready code that developers can review, extend, and use directly.

Code must be:

- Modular
- Typed
- Reusable
- Readable
- Accessible
- Testable
- Consistent with the existing project architecture

Use TypeScript where applicable.

Every component should have:

- Clear prop types
- Default behavior
- Variant support where needed
- No unnecessary dependencies
- No duplicated styling logic
- No unused imports
- No dead code

Avoid generating overly large files. Split components logically.

Recommended structure:

```txt
src/
  components/
    ui/
      Button/
        Button.tsx
        Button.types.ts
        Button.test.tsx
        index.ts
      Input/
      Card/
    layout/
    feature/
  design-system/
  hooks/
  utils/
  pages/
```

---

# 9. Styling Rules

Use the project's established styling approach consistently.

## If the project uses Tailwind

- Map Figma values to Tailwind theme tokens.
- Extend Tailwind config only through design tokens.
- Avoid arbitrary values unless absolutely necessary.
- Avoid long unreadable class strings by extracting reusable variants.

## If the project uses CSS Modules, SCSS, or styled-components

- Use token imports instead of raw values.
- Keep styles colocated but reusable.
- Avoid global style leakage.

No component should contain raw visual values like:

```tsx
style={{ color: "#246BFE", padding: "13px" }}
```

Use tokens instead:

```tsx
style={{ color: tokens.color.action.primary }}
```

Or use framework-native token classes that are mapped to design tokens.

---

# 10. Accessibility Rules

Every generated screen and component must meet basic accessibility standards.

Ensure:

- Semantic HTML
- Keyboard navigation
- Visible focus states
- Correct ARIA attributes only when needed
- Sufficient color contrast
- Form labels connected to inputs
- Buttons are buttons, not clickable divs
- Images include meaningful alt text or empty alt text when decorative
- Modals trap focus
- Menus and dropdowns are keyboard accessible
- Touch targets are large enough

Do not sacrifice accessibility for visual matching.

---

# 11. Interaction and State Rules

Implement all states shown or implied in Figma.

For interactive components, include:

- Default
- Hover
- Active
- Focus
- Disabled
- Loading
- Error
- Success
- Empty state

For screens, include realistic state handling:

- Loading state
- Empty state
- Error state
- Success state
- Data-populated state

Do not leave placeholder interactions unless explicitly marked as prototype-only.

---

# 12. Production Readiness Rules

The output should be suitable for developer handoff and production hardening.

Before finishing any task, verify:

- The app builds successfully.
- There are no TypeScript errors.
- There are no lint errors.
- There are no broken imports.
- There are no unused files.
- There are no console errors.
- Components are reusable.
- Tokens are centralized.
- UI matches Figma closely.
- Responsive behavior works.
- Accessibility basics are covered.

Do not claim the code is production-ready unless these checks pass.

---

# 13. Developer Handoff Rules

For every generated feature or screen, produce a short implementation summary.

Use this format:

```md
## Implementation Summary

### Built
- Screen/component names
- Key interactions
- Responsive behavior

### Design Tokens Updated
- Added tokens
- Changed tokens
- Reused tokens

### Files Changed
- List of modified files

### Known Assumptions
- Any inferred behavior not explicitly defined in Figma

### Developer Notes
- Integration requirements
- API placeholders
- Testing notes
```

Do not hide assumptions. Developers should be able to understand exactly what was generated and why.

---

# 14. Figma Component Mapping Rules

When a Figma component maps to an existing code component, reuse the code component.

Maintain a component mapping file:

```txt
src/design-system/component-map.md
```

Example:

```md
# Figma to Code Component Map

| Figma Component | Code Component | Notes |
|---|---|---|
| Button / Primary / Large | Button variant="primary" size="lg" | Uses action.primary token |
| Input / Error | TextInput state="error" | Includes helper text |
| Modal / Confirm | ConfirmModal | Uses Dialog primitive |
```

When a new Figma component is introduced, update this map.

---

# 15. Data and API Rules

If Figma contains realistic data, use it only as mock data.

Keep mock data separate from production logic.

Recommended structure:

```txt
src/
  mocks/
  services/
  types/
```

Do not hardcode business data inside UI components.

Components should receive data through props or service layers.

Preferred:

```tsx
<UserCard user={user} />
```

Avoid hardcoded business data in reusable components:

```tsx
<h2>John Smith</h2>
```

unless it is clearly static content from the product design.

---

# 16. File and Architecture Guardrails

Do not create messy or duplicate architecture.

Before creating files:

1. Inspect the existing project structure.
2. Reuse existing folders and patterns.
3. Add files only where they belong.
4. Keep naming consistent.
5. Avoid duplicate utilities.
6. Avoid duplicate components.
7. Avoid introducing new libraries unless necessary.

Do not install dependencies without explaining why.

Prefer native browser APIs and existing project dependencies.

---

# 17. Visual QA Rules

After implementing from Figma, perform a visual review against the design.

Check:

- Spacing
- Alignment
- Typography
- Colors
- Radius
- Shadows
- Icon size
- Component states
- Layout responsiveness
- Scroll behavior
- Overflow behavior

If there are differences, fix them before finalizing.

If a difference is intentional or unavoidable, document it.

---

# 18. Testing Rules

Add tests where useful and practical.

At minimum:

- Unit tests for reusable components
- Interaction tests for complex UI
- Accessibility checks for forms, modals, menus, and navigation
- Snapshot or visual regression tests if the project supports them

Do not write brittle tests that depend on irrelevant implementation details.

Test behavior, not just rendering.

---

# 19. Security and Safety Rules

Never expose secrets, API keys, tokens, or environment variables in code.

Use:

```txt
.env.example
```

for required environment variables.

Do not commit real secrets.

Do not connect generated UI directly to destructive production operations.

For destructive actions, require explicit confirmation in the UI and in code.

Do not delete databases, wipe directories, remove major files, or rewrite architecture without explicit instruction and a rollback path.

---

# 20. Final Response Requirements for Replit

At the end of every Figma-to-code task, provide:

```md
## Done

### What Was Implemented
- ...

### Figma Fidelity Notes
- ...

### Tokens Updated
- ...

### Components Created or Reused
- ...

### Files Changed
- ...

### Assumptions
- ...

### Recommended Developer Review
- ...
```

Never respond only with "done." Always provide a useful developer handoff summary.

---

# Pasteable Master Instruction for Replit

Use this as the main instruction for Replit Agent:

```md
You are building a production-quality working prototype from Figma files using the Figma MCP. Figma is the source of truth. Use exact design values from Figma wherever available, including layout, spacing, typography, colors, border radius, shadows, strokes, icons, component variants, and interaction states.

Every time I provide a new Figma file, frame, page, or component, inspect it for design tokens. Create or update centralized tokens for colors, typography, spacing, radius, shadows, motion, breakpoints, opacity, stroke widths, and z-index. Reuse existing tokens when values match. Do not create duplicate tokens. Do not hardcode visual values inside components unless no token exists and the value is truly unique. Document all token changes in src/design-system/tokens/CHANGELOG.md.

Create reusable components that map cleanly to Figma components and variants. Figma variants should become component props. Reuse existing components before creating new ones. Maintain src/design-system/component-map.md to show how Figma components map to code components.

Keep styling consistent and cohesive across the entire app. Use the existing styling system. Do not introduce random colors, spacing values, font sizes, shadows, or component styles outside the design token system. If Figma contains inconsistent values, normalize to the nearest existing token and document the assumption.

Implement layouts using clean flexbox, grid, and responsive patterns. Translate Figma auto-layout behavior into code accurately. Avoid absolute positioning, magic numbers, and pixel hacks unless the design explicitly requires them.

Produce clean, production-ready TypeScript code. Code must be modular, typed, reusable, accessible, testable, and easy for developers to extend. Avoid dead code, unused imports, duplicate utilities, and oversized files. Follow the existing project architecture.

Ensure accessibility by using semantic HTML, keyboard navigation, visible focus states, proper labels, sufficient contrast, correct button/input semantics, and appropriate ARIA only when needed.

Implement all relevant UI states: default, hover, active, focus, disabled, loading, error, success, and empty states. Do not leave placeholder interactions unless clearly marked as prototype-only.

Keep mock data separate from UI components. Do not hardcode business data inside reusable components. Components should receive data through props or service layers.

Before finishing, verify that the app builds, TypeScript passes, linting passes, imports work, there are no console errors, tokens are centralized, the UI matches Figma, responsive behavior works, and accessibility basics are covered.

Do not perform destructive actions such as deleting databases, wiping directories, removing major files, or rewriting architecture without explicit instruction and a rollback path.

At the end of every task, provide a developer handoff summary with:
- What was implemented
- Figma fidelity notes
- Tokens added, changed, or reused
- Components created or reused
- Files changed
- Assumptions made
- Recommended developer review items

Prioritize production-quality code over quick visual approximation.
```

---

# Quick Checklist for Every Figma Import

Use this checklist after each new Figma input:

- [ ] Read the Figma structure through MCP.
- [ ] Identify new colors, typography, spacing, radius, shadows, and motion values.
- [ ] Reuse existing tokens where possible.
- [ ] Add only necessary new tokens.
- [ ] Update the token changelog.
- [ ] Map Figma components to existing code components.
- [ ] Create new reusable components only when needed.
- [ ] Match layout, spacing, typography, colors, and states.
- [ ] Implement responsive behavior.
- [ ] Use semantic HTML and accessible interactions.
- [ ] Keep mock data separate from components.
- [ ] Avoid hardcoded styles and magic numbers.
- [ ] Run build, typecheck, lint, and tests where available.
- [ ] Provide a developer handoff summary.

---

# Non-Negotiables

Replit must not:

- Hardcode design values when tokens are available.
- Create duplicate components for the same Figma pattern.
- Introduce unapproved styling systems.
- Ignore Figma variants or states.
- Skip token updates when new values appear.
- Use inaccessible clickable divs instead of semantic controls.
- Bury business data inside UI components.
- Delete or rewrite major files without explicit instruction.
- Claim production readiness without build, type, lint, and visual checks.

Replit must always:

- Treat Figma as the source of truth.
- Centralize and maintain tokens.
- Reuse existing components and architecture.
- Generate clean, typed, reusable code.
- Document assumptions and deviations.
- Provide clear developer handoff notes.
