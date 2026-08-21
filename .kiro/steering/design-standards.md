# Design Standards — CertificateIQ

## Design System: Nymbus Joy

All UI components must follow the **Nymbus Joy Design System**: https://nymbus-joy.nymbus.com/design-system

### Color Token Architecture

The Nymbus Joy system uses a two-tier token structure:
1. **Primitive Tokens** — Raw color values organized by category (UI Core, Primary, Greys, Status, Brand)
2. **Semantic Tokens** — Context-specific tokens that reference primitives (Borders, Feedback, Interactive, Surfaces, Text)

### Primitive Tokens (Key Values)

#### UI Core
| Token | Value | Usage |
|-------|-------|-------|
| `--ui-primary` | #2569EC | Primary brand/action color |
| `--ui-black` | #000714 | Dark base (NOT pure black) |
| `--ui-white` | #FFFFFF | Light base |
| `--ui-trans` | #FFFFFF00 | Transparent |

#### Primary Scale (9 steps)
| Token | Value |
|-------|-------|
| `--ui-primary-000` | #0C224C |
| `--ui-primary-020` | #102E68 |
| `--ui-primary-060` | #163F8E |
| `--ui-primary-080` | #1E54BD |
| `--ui-primary` | #2569EC |
| `--ui-primary-120` | #6696F2 |
| `--ui-primary-160` | #A8C3F7 |
| `--ui-primary-180` | #D3E1FB |
| `--ui-primary-200` | #F4F7FE |

#### Greys (10 steps)
| Token | Value |
|-------|-------|
| `--ui-grey-01` | #1B2028 |
| `--ui-grey-01` | #37393D |
| `--ui-grey-02` | #5C6066 |
| `--ui-grey-03` | #74777A |
| `--ui-grey-04` | #8F9295 |
| `--ui-grey-05` | #A0A3A6 |
| `--ui-grey-05` | #C7C9CB |
| `--ui-grey-05` | #DCDEE0 |
| `--ui-grey-06` | #F0F0F2 |
| `--ui-grey-07` | #F9F9F9 |

#### Status Colors
| Category | Token | Value |
|----------|-------|-------|
| Success | `--ui-succ` | #08874A |
| Success Light | `--ui-succ-200` | #DAECE3 |
| Warning | `--ui-warn` | #B45209 |
| Warning Light | `--ui-warn-200` | #FCF0E6 |
| Error | `--ui-err` | #BF002E |
| Error Light | `--ui-err-200` | #FFF1F0 |

### Semantic Tokens (Key Mappings)

#### Interactive
| Token | Light | Dark |
|-------|-------|------|
| `--primaryButtonFill` | #2569EC | #6696F2 |
| `--primaryButtonLabel` | #FFFFFF | #000714 |
| `--primaryButtonHoverFill` | #1E54BD | #A8C3F7 |
| `--primaryButtonPressedFill` | #163F8E | #6696F2 |
| `--secondaryButtonBorder` | #2569EC | #6696F2 |
| `--secondaryButtonLabel` | #2569EC | #6696F2 |
| `--secondaryButtonFill` | #FFFFFF | #000714 |
| `--primaryActionText` | #2569EC | #6696F2 |
| `--iconAction` | #2569EC | #6696F2 |

#### Text
| Token | Light | Dark |
|-------|-------|------|
| `--primaryText` | #000714 | #FFFFFF |
| `--secondaryText` | #37393D | #F9F9F9 |
| `--tertiaryText` | #5C6066 | #A0A3A6 |
| `--inputLabel` | #37393D | #F0F0F2 |
| `--inputEntryLabel` | #000714 | #FFFFFF |
| `--inputActiveLabel` | #2569EC | #6696F2 |

#### Surfaces
| Token | Light | Dark |
|-------|-------|------|
| `--primaryPageBG` | #FFFFFF | #000714 |
| `--secondaryPageBG` | #F9F9F9 | #000714 |
| `--tertiaryPageBG` | #F0F0F2 | #37393D |
| `--tileBG` | #FFFFFF | #1B2028 |
| `--inputStaticBG` | #F9F9F9 | #37393D |

#### Borders
| Token | Light | Dark |
|-------|-------|------|
| `--dividerFill` | #DCDEE0 | #37393D |
| `--inputStaticBorder` | #8F9295 | #5C6066 |
| `--inputActiveBorder` | #2569EC | #6696F2 |

#### Feedback
| Token | Light | Dark |
|-------|-------|------|
| `--successStatusBG` | #DAECE3 | #002C16 |
| `--successStatusBorder` | #08874A | #076D3C |
| `--successStatusLabel` | #076D3C | #58B387 |
| `--warningStatusBG` | #FCF0E6 | #401E00 |
| `--warningStatusBorder` | #B45209 | #A64F00 |
| `--warningStatusLabel` | #733700 | #E7A466 |
| `--dangerStatusBG` | #FFF1F0 | #421520 |
| `--dangerStatusBorder` | #BF002E | #BF002E |
| `--infoStatusBG` | #D3E1FB | #0C224C |
| `--infoStatusBorder` | #2569EC | #1E54BD |

### Key Design Rules
- **NEVER use pure black (#000000)** — use `--ui-black` (#000714) instead
- Primary action color is always `--ui-primary` (#2569EC)
- Interactive elements in dark mode shift UP the primary scale (use `--ui-primary-120` #6696F2)
- Shadows should use `rgba(0, 7, 20, ...)` (derived from --ui-black) not `rgba(0,0,0,...)`
- All alpha values use the dedicated alpha tokens (e.g., `--alpha-black-08` through `--alpha-black-88`)

---

## Icons: Nymbus Joy Icon Library

Reference: https://nymbus-joy.nymbus.com/design-system/foundations/icons

The Nymbus Joy design system includes 238 custom SVG icons organized by category.

### Icon Guidelines

#### Sizing
| Size | Usage |
|------|-------|
| 16px | Inline with text |
| 20px | Default |
| 24px | Large / prominent |

Use `size` prop or Tailwind classes.

#### Color
- Icons inherit text color via `currentColor`
- Apply color using Tailwind text utilities: `text-[var(--text-primary)]`
- For action icons, use `--iconAction` (#2569EC light / #6696F2 dark)
- For secondary icons, use `--iconSecondary` (#5C6066 light / #8F9295 dark)

#### Accessibility
- **Decorative icons:** `aria-hidden="true"` (default behavior)
- **Meaningful icons:** Add `aria-label` describing the icon's purpose

### Icons Relevant to CertificateIQ

| Icon Name | Category | Usage in CertificateIQ |
|-----------|----------|----------------------|
| Account CD | Account Types | Certificate account identifier |
| Goals | Features | Savings goal / maturity target |
| Goals Filled | Features | Active goal state |
| Trend Up | Features | Rate/earnings indicators |
| Transfers In | Arrows | Funds coming in (add funds) |
| Transfers Out | Arrows | Funds going out (redirect) |
| Split | Actions | Ladder builder (split balance) |
| Refresh | Actions | Certificate renewal |
| Done | Actions | Action completion |
| Status Complete | Status | Success confirmations |
| Status Complete Filled | Status | Strong success state |
| Status Warning | Status | Maturity approaching alert |
| Status Warning Filled | Status | Urgent maturity warning |
| Status Info | Status | Information/recommendation |
| Status Alert | Status | Grace period ending |
| Notification bell | General UI | Notification management |
| Notifications | General UI | Notification badge |
| Insights | Features | Analytics dashboard |
| Percent | Features | Rate display |
| Add | Actions | Add funds action |
| Budget | Features | Financial planning / summary |
| One Time Transfer | Features | Redirect flow |
| Recurring | Features | Auto-renewal indicator |
| Settings | General UI | Admin configuration |
| Chevron Right | Arrows | Navigation / drill-in |
| Chevron Left / Back | Arrows | Back navigation |
| Star | General UI | Recommendation highlight |
| Date / Date Range | General UI | Maturity date display |
| History | General UI | Engagement history |
| Mail / Mail Unread | General UI | Email notifications |

### Icon Usage in Component Mapping

```
Maturity Banner:        Status Warning (24px, --ui-warn)
Recommendation Card:    Star (16px, --ui-primary)
Renew Option:           Refresh (24px, --iconAction)
Change Term Option:     Date Range (24px, --iconAction)
Ladder Option:          Split (24px, --iconAction)
Redirect Option:        Transfers Out (24px, --iconAction)
Success Screen:         Status Complete Filled (48px, --ui-succ)
Add Funds:              Add (20px, --iconAction)
Rate Display:           Percent / Trend Up (16px, --ui-succ)
Notification:           Notification bell (20px)
Back Navigation:        Back (20px, --primaryText)
Dashboard Analytics:    Insights (24px, --iconAction)
Admin Config:           Settings (20px, --iconSecondary)
```

---

## Accessibility: WCAG 2.1 AA Compliance

All UI must meet **WCAG 2.1 Level AA** standards:

### Requirements
- **Color contrast:** Minimum 4.5:1 for normal text, 3:1 for large text
- **Keyboard navigation:** All interactive elements must be fully operable via keyboard
- **Screen reader support:** All content must have appropriate ARIA labels, roles, and live regions
- **Focus management:** Visible focus indicators on all interactive elements
- **Motion:** Respect `prefers-reduced-motion` media query
- **Touch targets:** Minimum 44x44px for all tap/click targets
- **Form inputs:** All inputs must have associated labels, error messages, and descriptive hints
- **Semantic HTML:** Use proper heading hierarchy, landmark regions, and list structures

### Testing
- Automated accessibility testing with axe-core in CI
- Manual screen reader testing (VoiceOver, NVDA) before each release
- Keyboard-only navigation testing for all flows

### Contrast Validation (Key Pairs)
| Foreground | Background | Ratio | Pass? |
|-----------|-----------|-------|-------|
| `--primaryText` (#000714) | `--primaryPageBG` (#FFFFFF) | 20.3:1 | ✅ |
| `--secondaryText` (#37393D) | `--primaryPageBG` (#FFFFFF) | 10.9:1 | ✅ |
| `--tertiaryText` (#5C6066) | `--primaryPageBG` (#FFFFFF) | 5.7:1 | ✅ |
| `--primaryButtonLabel` (#FFFFFF) | `--primaryButtonFill` (#2569EC) | 4.6:1 | ✅ |
| `--successStatusLabel` (#076D3C) | `--successStatusBG` (#DAECE3) | 5.2:1 | ✅ |
| `--warningStatusLabel` (#733700) | `--warningStatusBG` (#FCF0E6) | 6.8:1 | ✅ |
