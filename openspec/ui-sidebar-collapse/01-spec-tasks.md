# Spec: Collapsible Sidebar

## Architecture

1. **Signal**: `LayoutComponent` gets `readonly isCollapsed = signal(false)` (next to `isMobile` at line 321). A `toggleCollapse()` method flips it: `this.isCollapsed.update(v => !v)`.

2. **Toggle button** in `.sidenav-header` (line 47), placed after `.sidenav-brand`. Uses `<button mat-icon-button>` with:
   - **Icon swap** (state indicator): `menu_open` when expanded, `menu` when collapsed — `{{ isCollapsed() ? 'menu' : 'menu_open' }}`.
   - **Dynamic `aria-label`**: `isCollapsed() ? 'Expandir menú' : 'Contraer menú'`.
   - **`aria-expanded`**: bound to `!isCollapsed()`.

3. **Collapsed class** on `<mat-sidenav>` (line 39): `[class.sidenav-collapsed]="isCollapsed() && !isMobile()"`. The `&& !isMobile()` guard means: if a user collapses on desktop then resizes to mobile, `isCollapsed` stays `true` but the visual collapsed state is suppressed — the drawer reopens in `over` mode normally. No extra code needed for viewport rotation; the binding handles it.

4. **CSS rules** for `.sidenav-collapsed` (inline `styles` array, line 130+):
   - `.layout-sidenav` width: `270px` → `80px` via `transition: width 0.3s ease`.
   - Text elements (`.sidenav-brand`, `.sidenav-user__info`, `.mdc-list-item__primary-text`, `.logout-item span[matListItemTitle]`) get `opacity: 0; width: 0; overflow: hidden; transition: opacity 0.2s ease, width 0.3s ease`.
   - `.sidenav-header`: keeps logo + toggle visible; brand text collapses with the transition above. Padding reduces when collapsed to fit both elements within 80px (logo 32px + toggle 40px + gap). `justify-content: center` when collapsed.
   - `.sidenav-user`: icon stays centered, info text hides.
   - Nav items: icons stay centered, text hides. Active-link state preserved.

5. **Tooltips** on nav `<a>` elements (line 56) and logout `<a>` (line 78):
   - Binding: `[matTooltip]="isCollapsed() && !isMobile() ? item.label : ''"`.
   - **`matTooltipPosition="after"` is REQUIRED** — default `"below"` overlaps the sidebar edge.
   - Tooltips are desktop-only (mobile drawer doesn't use collapsed UX).

6. **Reduced motion**: global `prefers-reduced-motion` rule in `client/src/styles.scss:340-348` already disables transitions site-wide. No additional handling needed in this component.

### Accessibility Notes

- Toggle button MUST have dynamic `aria-label` and `aria-expanded` so screen readers announce state changes.
- `<mat-sidenav>` already has `role="navigation"` and `aria-label="Menu principal"` (lines 44-45) — unchanged.
- `matTooltip` renders with `role="tooltip"` and proper ARIA automatically (Material 21 MDC).

## Tasks

- [x] 1. **Add `isCollapsed` signal and `toggleCollapse()` method** to `LayoutComponent`. Signal: `readonly isCollapsed = signal(false)`. Method: `toggleCollapse(): void { this.isCollapsed.update(v => !v); }`. Place near `isMobile` signal (line 321).

- [x] 2. **Add collapse toggle button** to `.sidenav-header` (after `<span class="sidenav-brand">`, line 49). Markup:
  ```html
  <button mat-icon-button
          (click)="toggleCollapse()"
          [attr.aria-label]="isCollapsed() ? 'Expandir menú' : 'Contraer menú'"
          [attr.aria-expanded]="!isCollapsed()">
    <mat-icon>{{ isCollapsed() ? 'menu' : 'menu_open' }}</mat-icon>
  </button>
  ```
  Icon swaps to reflect state: `menu_open` when expanded, `menu` when collapsed.

- [x] 3. **Apply `[class.sidenav-collapsed]`** to `<mat-sidenav>` at line 39:
  ```html
  [class.sidenav-collapsed]="isCollapsed() && !isMobile()"
  ```

- [x] 4. **Add `[matTooltip]` to nav and logout `<a>` elements.** On nav items (line 56-63):
  ```html
  [matTooltip]="isCollapsed() && !isMobile() ? item.label : ''"
  matTooltipPosition="after"
  ```
  On logout item (line 78): `[matTooltip]="isCollapsed() && !isMobile() ? 'Cerrar Sesión' : ''" matTooltipPosition="after"`. `matTooltipPosition="after"` is mandatory — default `"below"` overlaps sidebar.

- [x] 5. **Implement CSS transitions** in `styles` array (line 130+). Add/modify:
  - `.layout-sidenav { transition: width 0.3s ease; }` (add to existing rule at line 135).
  - `.layout-sidenav.sidenav-collapsed { width: 80px; }`.
  - `.sidenav-collapsed .sidenav-brand, .sidenav-collapsed .sidenav-user__info, .sidenav-collapsed .mdc-list-item__primary-text, .sidenav-collapsed .logout-item span[matListItemTitle] { opacity: 0; width: 0; overflow: hidden; transition: opacity 0.2s ease, width 0.3s ease; }`.
  - `.sidenav-collapsed .sidenav-header { justify-content: center; padding: 28px 8px 24px; }` — reduced padding to fit logo (32px) + toggle (40px) within 80px.
  - `.sidenav-collapsed .sidenav-nav .mat-mdc-list-item, .sidenav-collapsed .sidenav-user { justify-content: center; }` — center icons.
  - `.sidenav-collapsed .sidenav-logo { /* no change needed, stays visible */ }`.
