---
name: NourishTogether Design System
colors:
  surface: '#f9f9ff'
  surface-dim: '#cfdaf2'
  surface-bright: '#f9f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f0f3ff'
  surface-container: '#e7eeff'
  surface-container-high: '#dee8ff'
  surface-container-highest: '#d8e3fb'
  on-surface: '#111c2d'
  on-surface-variant: '#414940'
  inverse-surface: '#263143'
  inverse-on-surface: '#ecf1ff'
  outline: '#71796f'
  outline-variant: '#c1c9bd'
  surface-tint: '#36693d'
  primary: '#013a13'
  on-primary: '#ffffff'
  primary-container: '#1e5128'
  on-primary-container: '#8cc38f'
  inverse-primary: '#9cd49e'
  secondary: '#904d00'
  on-secondary: '#ffffff'
  secondary-container: '#fe932c'
  on-secondary-container: '#663500'
  tertiary: '#002a78'
  on-tertiary: '#ffffff'
  tertiary-container: '#003ea9'
  on-tertiary-container: '#9bb3ff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#b8f1b9'
  primary-fixed-dim: '#9cd49e'
  on-primary-fixed: '#002108'
  on-primary-fixed-variant: '#1e5128'
  secondary-fixed: '#ffdcc3'
  secondary-fixed-dim: '#ffb77d'
  on-secondary-fixed: '#2f1500'
  on-secondary-fixed-variant: '#6e3900'
  tertiary-fixed: '#dbe1ff'
  tertiary-fixed-dim: '#b4c5ff'
  on-tertiary-fixed: '#00174b'
  on-tertiary-fixed-variant: '#003ea8'
  background: '#f9f9ff'
  on-background: '#111c2d'
  surface-variant: '#d8e3fb'
typography:
  headline-xl:
    fontFamily: Plus Jakarta Sans
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
  headline-xl-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 30px
    fontWeight: '700'
    lineHeight: 38px
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 22px
    fontWeight: '600'
    lineHeight: 28px
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 22px
  label-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 18px
  label-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '700'
    lineHeight: 16px
    letterSpacing: 0.5px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-tablet: 1.5rem
  gutter-desktop: 2rem
  margin: 1rem
  margin-tablet: 2rem
  margin-desktop: 3rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
---

## Brand & Style

This design system is crafted to anchor community food sovereignty, direct mutual aid, and government benefits access (SNAP/WIC) within an atmosphere of unconditional dignity, warmth, and structural clarity. The visual language dismantles the clinical, stigmatizing tropes of traditional bureaucratic public assistance, replacing them with the hospitality, reliability, and visual vibrancy of a modern community service.

The target audience spans two core cohorts operating in high-trust synergy:
1. **Community Neighbors**: Individuals and families seeking immediate food distribution sites, drive-thru pantries, and SNAP benefit pre-screeners. Their experience prioritizes zero cognitive strain, immediate language accessibility, and affirming privacy.
2. **Volunteer Drivers & Site Organizers**: Active community stewards coordinating vehicle logistics, shift claims, bulk delivery drop-offs, and verification workflows. Their interface prioritizes decisive utility, task dispatch efficiency, and real-time route execution.

### Design Movement
**Warm Humanist / Tactile Modernism**: Grounded in high-contrast organic palettes, soft and inviting surfaces, generous physical touch boundaries, and unmistakable affordances. By pairing rich botanical tones with warm harvest ambers, the design instills hope and community ownership while exceeding WCAG 2.2 AAA legibility standards for users navigating stressful environments, varied lighting conditions, and diverse digital literacy levels.

## Colors

The color palette centers on earth-bound abundance, clear visual wayfinding, and distinct mode separation between food assistance services and volunteer logistics.

### Palette Architecture
- **Primary (`#1E5128` - Forest Canopy)**: Represents security, health, and grounded community care. Used for core navigation, critical actions, active primary CTAs, and primary titles. Achieves 7.8:1 contrast over background surfaces for pristine AAA readability.
- **Secondary (`#D97706` - Harvest Amber)**: Evokes nourishment, warmth, and urgency without distress. Applied to highlight SNAP application milestones, active pantry hours, and crucial resource highlights.
- **Tertiary (`#2563EB` - Dispatch Indigo)**: Dedicated operational accent for the Volunteer Driver portal. Distinctly shifts context for route assignment, navigation cues, shift check-ins, and delivery progress tracking.
- **Neutral Core (`#1E293B` - Deep Slate)**: High-contrast typography base providing crisp textual integrity on light backgrounds.

### Functional Tint & Surface Strategy
- **App Canvas (`#F4F7F4` - Pale Sage)**: Soft, non-glare background tone that softens harsh outdoor glare and reduces visual fatigue compared to pure clinical white.
- **Surface Elevation 1 (`#FFFFFF` - Pure Card Surface)**: High-contrast containment blocks for pantry listings, delivery tickets, and multi-step forms.
- **Surface Elevation 2 (`#E8EFE9` - Sage Mist)**: Neutral container for secondary groupings, form inputs, disabled states, and table headers.
- **Semantic Signals**:
  - Success/Open: `#15803D` (Deep Green)
  - Attention/Notice: `#B45309` (Warm Ochre)
  - Critical/Urgent: `#B91C1C` (Crimson)
  - Operational/Info: `#1D4ED8` (Cobalt)

## Typography

The typography uses **Plus Jakarta Sans** across all hierarchies. Its open counters, humanistic geometry, and wide apertures maximize legibility on budget mobile displays, small viewports, and under bright outdoor ambient light at pantry drive-thru queues.

### Application Rules
- **No Text Below 12px**: Absolute system floor is set to `label-sm` (12px), reserved exclusively for compact, high-contrast, all-caps metadata badges (e.g., "NO ID REQUIRED").
- **Prominent Line-Heights**: Body text maintains a relaxed 1.5x minimum line height to accommodate older adults, screen readers, and low-vision community members.
- **Scannable Weighting**: Headings prioritize weights 600 and 700 to establish an immediate vertical visual hierarchy across long directory lists and multi-step SNAP application questionnaires.

## Layout & Spacing

The layout philosophy utilizes an **Adaptive Fluid Column Structure** anchored by a strict 4px/8px incremental spatial rhythm. Because this platform is mobile-first, layouts respect one-handed thumb interaction zones and accommodate accessibility scaling up to 200% font sizing without layout truncation.

### Responsive Breakpoints & Canvas Behaviors
- **Mobile (< 640px)**: 4-column fluid layout with `1rem` (16px) outer canvas margins. Elements stretch edge-to-edge within cards. Key actionable elements sit anchored to the lower screen hemisphere.
- **Tablet (640px – 1024px)**: 8-column layout with `1.5rem` (24px) gutters. Pantry detail views and volunteer route queues split into two-pane master-detail views.
- **Desktop / Kiosk (> 1024px)**: 12-column layout max-width constrained to `1200px` centered canvas with `2rem` (32px) gutters. Ideal for community center staff intake dashboards and food hub dispatch desks.

### Touch Target Mandate
All interactive components must sustain a minimum bounding box of 48×48px. Form controls, tab bar buttons, and list row triggers enforce internal padding to guarantee reliable single-tap accuracy for individuals with motor challenges or delivery drivers wearing operational gloves.

## Elevation & Depth

This design system communicates visual hierarchy through **Tonal Layering** accompanied by soft, organic **Ambient Shadows**. Harsh drop shadows and heavy geometric outlines are avoided to preserve a gentle, non-institutional ambiance.

### Elevation Architecture
- **Layer 0 (Canvas Base)**: `#F4F7F4` (Pale Sage). Passive background.
- **Layer 1 (Card & Content Blocks)**: `#FFFFFF` (Pure White) elevated with `0 2px 8px -2px rgba(30, 41, 59, 0.06), 0 1px 3px -1px rgba(30, 41, 59, 0.04)` and framed by an ultra-subtle border: `1px solid rgba(30, 81, 40, 0.08)`.
- **Layer 2 (Floating Action Trays & Map Controls)**: `#FFFFFF` elevated with `0 8px 24px -4px rgba(30, 81, 40, 0.12), 0 4px 8px -2px rgba(30, 41, 59, 0.04)`.
- **Layer 3 (Modals, Assistance Drawers, Bottom Sheets)**: Supported by a warm backdrop overlay of `rgba(30, 41, 59, 0.60)` accompanied by `0 20px 32px -8px rgba(30, 41, 59, 0.20)`.

### Operational Lighting Tint
When operating inside the Volunteer Driver portal, elevation layers subtly blend with a cool cobalt wash (`rgba(37, 99, 235, 0.06)`) rather than an earth-toned wash, reinforcing the active shift context without altering foundational layer physics.

## Shapes

The design system implements a **Rounded Geometry** profile (`roundedness: 2`). This shape choice balances the friendly, welcoming energy of rounded contours with the structural reliability necessary for official social service delivery and application intake.

### Shape Distribution
- **Cards, Sheets & Containers**: `1rem` (16px, `rounded-lg`) border radius. Promotes visual softness and clean grouping of sensitive personal food intake details.
- **Interactive Pill Elements**: Buttons, resource tags, chips, and segment switchers use full pill shapes (`9999px`) to invite confident, welcoming touch interaction.
- **Form Inputs & Checkboxes**: Inputs use `0.5rem` (8px, `rounded-md`) corner radii to maintain crisp textual baseline alignment. Checkbox controls use `0.375rem` (6px) rounded corners to balance soft aesthetics with clear, unambiguous affordance.

## Components

### Buttons
- **Primary (Action/Community)**: Pill-shaped (`rounded-full`), `#1E5128` background with `#FFFFFF` text. Minimum height of 52px for primary flows. Includes 16px horizontal icon spacing. Active state scales to `98%` with a background darkening to `#14381B`.
- **Driver Primary (Operational)**: Pill-shaped (`rounded-full`), `#2563EB` background with `#FFFFFF` text. Used for "Accept Route", "Navigate to Pantry", and "Confirm Delivery".
- **Secondary (Support)**: Outlined pill with a 1.5px border of `#1E5128`, transparent background, and `#1E5128` text.
- **Affirming Tertiary**: Text button with an underline offset of 4px and `#1E5128` coloring, paired with helpful helper icons (e.g., "Need help with this question?").

### Chips & Dignified Status Badges
Badges communicate eligibility and access parameters instantly with reassuring, high-contrast, and non-judgmental language:
- **'Drive-Thru Friendly'**: Deep Sage background (`#E8EFE9`), `#1E5128` bold text, paired with vehicle silhouette icon.
- **'No ID Required'**: Harvest Tint background (`#FEF3C7`), `#92400E` text, reinforcing unconditional access.
- **'Delivery Available'**: Fresh Green background (`#DCFCE7`), `#166534` text.
- **'Shift Open' (Driver Portal)**: Electric Navy Tint (`#DBEAFE`), `#1E40AF` text, featuring a pulsating indicator dot.
- *Styling*: Full pill geometry (`rounded-full`), `space-xs` (4px) vertical by `space-sm` (10px) horizontal padding, `label-sm` typography.

### Input Fields
- Built for accessible high-visibility input with a minimum touch height of 52px.
- Background: `#FFFFFF`; Idle Border: 1.5px `#CBD5E1`; Focus Border: 2px `#1E5128` with an offset ring of 2px `#E8EFE9`.
- Floating labels using `label-md` transition smoothly to `label-sm`.
- Every input requires permanent, high-contrast helper copy directly beneath the field (e.g., *"We never share your personal information with immigration or state agencies"*).

### Cards
- **Pantry Listing Card**: Clean white container (`#FFFFFF`), `rounded-lg` (16px), padded with `space-md` (16px) or `space-lg` (24px). Displays resource badges grouped at top, followed by `headline-sm` pantry title, operating hours, real-time vehicle queue length estimate, and directional trigger.
- **Driver Delivery Task Card**: Left-bordered with a 6px accent strip in `#2563EB`. Contains delivery window time, safe drop instructions, and a one-tap phone-masking contact trigger.

### Checkboxes & Radio Buttons
- 24×24px minimum hit targets with a 48×48px transparent interactive touch boundary.
- Active Selection: `#1E5128` filled box with a clean white tick mark.
- Focus Indicator: 3px outer ring in `#F59E0B` to accommodate keyboard and screen magnification navigation.

### Reassuring Micro-Copy Banners
- Informational callouts placed throughout the SNAP pre-screener.
- Background: `#FEF3C7` (Harvest Warmth); Left Border: 4px solid `#D97706`.
- Typography: `body-sm` in `#1E293B`, paired with a warm sun/heart icon to eliminate anxiety around eligibility assessments.