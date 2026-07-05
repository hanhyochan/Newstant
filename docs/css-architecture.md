# CSS Architecture

This project intentionally separates CSS by property responsibility, not by class name ownership alone. The same class name may appear in more than one CSS file when each file owns a different kind of property.

## File Responsibilities

### `reset.css`
Global reset and browser normalization only.

Use for:
- box sizing defaults
- base element reset
- inherited typography reset
- browser default cleanup

Do not use for component, page, theme, or layout rules.

### `common-layout.css`
Structural layout rules.

Use for:
- `display`
- `position`
- `inset`, `top`, `right`, `bottom`, `left`
- `width`, `height`, `min-*`, `max-*`
- `padding`, `margin`, `gap`
- `flex`, `grid`
- `overflow`
- `z-index`
- scroll containment and layout-only selectors

Do not use for color, background, shadow, border color, theme, or visual state styling.

### `appearance.css`
Visual appearance and theme rules.

Use for:
- `color`
- `background`
- `border-color`
- `box-shadow`
- `opacity`
- theme tokens
- dark mode overrides
- visual state that does not change layout

Do not use for spacing, flex/grid layout, width, height, or positioning.

### `components.css`
Reusable component visual contracts.

Use for:
- button base styles
- input and textarea base styles
- chips, cards, toggles, dropdowns
- component state selectors
- reusable component-level visual conventions

Component classes may still have layout-related companion rules in `common-layout.css` when the rule controls structure rather than visual identity.

### `utilities.css`
Single-purpose utilities with the `u_` prefix.

Use for narrow, reusable one-purpose helpers only. Do not add broad component-like utility classes here.

## Same Class Across Files

A class can appear in multiple CSS files when the properties are separated by responsibility.

Example:
- `common-layout.css` owns layout for `.btn_primary`.
- `appearance.css` owns color/theme for `.btn_primary`.
- `components.css` owns reusable button visual contract for `.btn_primary`.

This is allowed. It should not be collapsed into one file unless the project intentionally changes its CSS architecture.

## Override Rules

Overrides must make their purpose clear from the selector context.

Prefer:
- component base style in `components.css`
- page/layout adjustment in `common-layout.css`
- visual theme adjustment in `appearance.css`

Avoid:
- temporary migration comments
- unexplained one-off overrides
- mixing unrelated selectors into one group only because they share one property
- adding color rules to layout files
- adding layout rules to appearance files

## Refactoring Rule

CSS refactoring must preserve the rendered UI. Do not change values, selector specificity, or grouping when the visual result could change, unless the task explicitly includes a design change.