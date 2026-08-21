# Design Standards — CertificateIQ

## Design System: Nymbus Joy

All UI components must follow the **Nymbus Joy Design System**: https://nymbus-joy.nymbus.com/design-system

### Key Principles
- Use Nymbus Joy components as the foundation for all member-facing and admin UI
- Follow Nymbus Joy spacing, typography, color tokens, and component patterns
- The Decision Hub and all embedded widgets must feel native within the Nymbus digital banking platform
- Theming must be compatible with FI-level brand customization (colors, typography)

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
