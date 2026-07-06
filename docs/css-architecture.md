# CSS Architecture

This project now keeps only true globals in the app root and loads NewsRoll UI styling through a scoped CSS Module.

## File Responsibilities

### `tokens.css`
Global design tokens only.

Use for:
- CSS custom properties under `:root`
- color, typography, radius, spacing, and motion tokens shared by reset and modules

Do not use for component selectors, page selectors, or layout rules.

### `reset.css`
Global reset and browser normalization only.

Use for:
- box sizing defaults
- base element reset
- inherited typography reset
- browser default cleanup

Do not use for component, page, theme, or layout rules.

### `utilities.css`
Single-purpose global utilities with the `u_` prefix.

Use for narrow, reusable one-purpose helpers only. Do not add broad component-like utility classes here.

### `newsroll.module.css`
Scoped NewsRoll UI rules loaded by `NewsHomeScreen`.

The file uses a local `newsrollScope` class on the route shell and keeps existing rendered class names inside `:global(...)` selectors. This is an intentional transition step: it moves app UI CSS out of root global imports while preserving the current DOM and visual output.

Inside this module, keep the old responsibility boundaries as sections:
- appearance/theme section: color, background, border color, shadow, opacity, dark mode, visual state
- layout section: display, position, dimensions, spacing, flex/grid, overflow, z-index, scroll containment
- component section: reusable button, input, chip, card, toggle, dropdown, skeleton, and component state contracts

## Same Class Across Sections

The same rendered class can still appear in more than one section when each section owns a different kind of property.

Example:
- layout section owns layout for `.btn_primary`
- appearance section owns color/theme for `.btn_primary`
- component section owns reusable button visual contract for `.btn_primary`

This is allowed. Do not collapse unrelated responsibilities only because the rendered class name is the same.

## CSS Module Migration Rule

Current stage:
- root layout imports only `tokens.css`, `reset.css`, and `utilities.css`
- NewsRoll UI CSS is scoped by `newsroll.module.css`
- existing rendered class names are preserved to avoid UI drift

Next stage:
- convert stable design-system components from global rendered class strings to local `styles.foo` imports one component at a time
- after a component is converted, remove the matching `:global(...)` rules from `newsroll.module.css` only when visual/e2e coverage confirms no drift

## Override Rules

Overrides must make their purpose clear from selector context.

Prefer:
- component base style in the component section or component-owned module
- page/layout adjustment in the layout section or page-owned module
- visual theme adjustment in the appearance section or theme-owned module

Avoid:
- temporary migration comments
- unexplained one-off overrides
- mixing unrelated selectors into one group only because they share one property
- adding color rules to layout sections
- adding layout rules to appearance sections

## Refactoring Rule

CSS refactoring must preserve the rendered UI. Do not change values, selector specificity, grouping, DOM structure, or interaction behavior unless the task explicitly includes a design change.
