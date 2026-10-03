# HMS UI/UX Rules & Master Plan

## 1. Project Design Direction

**Working design name:** HMS — Modern Clinical Workspace

**Design personality**
- Clean, clinical, simple, modern, calm, organized
- Slightly futuristic but student-project appropriate

**Avoid**
- Overly corporate/enterprise appearance
- Gaming-like visuals
- Excessive glassmorphism
- Excessive 3D/WebGL
- Excessive gradients
- Huge animations
- Too many colors
- Information overload
- Unnecessary decorative effects

**Core principle**

> One HMS → one design system → 25 pages → shared components → controlled effects → existing functionality preserved.

---

# 2. Scope Rule — UI/UX Only

During redesign, preserve:
- Existing backend
- Existing APIs
- Database structure
- Authentication and authorization
- Business logic
- Existing routes
- Existing working functionality
- Existing data-fetching behavior

Do not:
- Add unfinished functionality
- Change API behavior
- Change database logic
- Change authentication logic
- Change business rules
- Add fake buttons/features for appearance
- Change functionality unless explicitly requested

UI redesign changes **how the application looks and feels**, not what it does.

---

# 3. Complete Application Page Structure

## Authentication — 2 pages
1. Login — `/`
2. Register — `/register`

## Dashboard — 1 page
3. Dashboard — `/dashboard`

## Patients — 3 pages
4. Patients — `/patients`
5. Patient Details — `/patients/:id`
6. Edit Patient — `/patients/:id/edit`

Patient Details contains:
- Digital Patient Card
- Clinical Notes
- Medical History
- Stay/Ward History
- Patient AI Chat
- Patient AI Summary
- Raise Alert
- Patient-related actions

## Doctors — 3 pages
7. Doctors — `/doctors`
8. Doctor Details — `/doctors/:id`
9. Edit Doctor — `/doctors/:id/edit`

## Appointments — 3 pages
10. Appointments — `/appointments`
11. Appointment Details — `/appointments/:id`
12. Edit Appointment — `/appointments/:id/edit`

## Beds — 4 pages
13. Bed List — `/beds`
14. Add Bed — `/beds/add` 
15. Edit Bed — `/beds/edit/:id`
16. Bed Details — `/beds/:id`

## Admissions — 4 pages
17. Admissions — `/admissions`
18. Add Admission — `/admissions/add`
19. Admission Details — `/admissions/:id` 
20. Edit Admission — `/admissions/:id/edit`

## Pharmacy — 1 page
21. Pharmacy — `/pharmacy`

## Notifications — 1 page
22. Notifications — `/notifications`

Also keep the Navbar NotificationBell visually consistent with this page.

## Settings — 1 page
23. Settings — `/settings`

## Admin — 2 pages
24. User Management — `/users`
25. Prompt Management — `/prompts`

---

# 4. Global Visual System

## Color Palette

### Primary
- Primary Blue: `#08679F`
- Primary Dark: `#07557F`

Use for primary buttons, active navigation, important links, selected states, and main interactive elements.

### Surfaces
- Application Background: `#F6F8FC`
- White Surface: `#FFFFFF`
- Soft Surface: `#F8FAFC`

### Semantic Colors
- Success: `#10B981`
- Warning: `#F59E0B`
- Danger: `#F43F5E`
- Info: `#3B82F6`
- AI: `#6366F1`

### Meaning
| Color | Meaning |
|---|---|
| Blue | Main HMS interaction/information |
| Green | Success, available, completed, normal |
| Amber | Pending, attention, near capacity |
| Rose | Critical, emergency, cancelled |
| Indigo | AI-related functionality |

Do not use colors randomly for decoration.

---

# 5. Typography

**Primary font:** Inter

| Element | Size | Weight |
|---|---:|---:|
| Page title | 28–32px | 700 |
| Section title | 16–18px | 700 |
| Card title | 14–16px | 600–700 |
| Body | 13–14px | 400 |
| Secondary text | 11–12px | 400–500 |
| Labels | 10–11px | 600 |
| Dashboard numbers | 24–30px | 700–800 |

Do not make every number or heading oversized.

---

# 6. Spacing System

Use a predictable scale:

`4px, 8px, 12px, 16px, 20px, 24px, 32px, 40px, 48px`

Typical use:
- 4px → icon/text gap
- 8px → small internal gap
- 12px → compact component spacing
- 16px → normal component padding
- 20px → card padding
- 24px → section spacing
- 32px → major section spacing
- 40px → page-level separation

Avoid arbitrary spacing values throughout the application.

---

# 7. Border Radius

- Small controls: `8px`
- Inputs/buttons: `10–12px`
- Cards: `18–22px`
- Major containers: `20–24px`
- Pills/badges: `9999px`

Do not make every element a pill.

---

# 8. Shadow System

Use soft shadows:

```text
Small:    0 2px 8px rgba(15,23,42,0.04)
Card:     0 8px 30px rgba(15,23,42,0.04)
Elevated: 0 12px 35px rgba(15,23,42,0.07)
```

The goal is subtle separation, not exaggerated floating elements.

---

# 9. Glassmorphism Rules

Glassmorphism is an accent, not the entire application.

### Suitable for
- Navbar
- Sidebar selected states
- Modals
- Search overlays
- Login/Register cards
- Special AI panels
- Selected dashboard containers
- Floating action areas

### Avoid heavy glass on
- Patient tables
- Medical history
- Appointment tables
- Forms
- Pharmacy inventory
- Bed data
- Admissions data

Clinical information must remain highly readable.

---

# 10. Global Application Shell

Every authenticated page should share:

```text
┌─────────────────────────────────────────────────────┐
│                       NAVBAR                        │
├───────────────┬─────────────────────────────────────┤
│               │                                     │
│               │             PAGE CONTENT            │
│   SIDEBAR     │                                     │
│               │                                     │
└───────────────┴─────────────────────────────────────┘
```

Navbar and Sidebar must visually belong to every internal page.

---

# 11. Navbar Rules

- Height: `64–68px`
- White/slightly transparent
- Subtle backdrop blur
- Bottom border
- Minimal shadow
- One global search entry point
- NotificationBell
- User avatar/info
- Logout
- Existing admin-only controls remain unchanged

Do not duplicate search bars unnecessarily.

---

# 12. Sidebar Rules

- Dark navy background, approximately `#081B32`
- Width: `250–270px`
- Navigation item height: `42–46px`
- Active state: primary blue `#08679F`
- Rounded active item: `10–12px`
- Section labels: `10px`, uppercase, letter spacing

The sidebar should be compact and easy to scan.

---

# 13. Standard Page Layout

Most authenticated pages should follow:

```text
Page
│
├── Page Header
│   ├── Title
│   ├── Description
│   └── Actions
│
├── Filters / Search (if needed)
│
├── Main Content
│
└── Secondary Content / Pagination
```

Repetition of this structure is intentional and creates consistency.

---

# 14. Buttons

### Primary
- Height: `40px`
- Radius: `10px`
- Font: `13px / 600`
- Background: `#08679F`

### Secondary
- White background
- Border: `#E2E8F0`
- Text: `#475569`

### Danger
- Soft rose background
- Rose text
- Rose border

### Ghost
- Transparent/minimal background

### Button motion
Use small hover translation, subtle shadow, and tiny active scale. Target transition: `150–200ms`.

---

# 15. Inputs and Forms

### Input
- Height: `40–44px`
- Radius: `10px`
- Border: `#CBD5E1`
- Background: `#FFFFFF`
- Font: `13–14px`

### Focus
Primary blue border with a subtle focus ring.

### Labels
`12px`, weight `600`

Forms should be:
- Structured
- Easy to scan
- Grouped logically
- Consistent across Patients, Doctors, Appointments, Beds, and Admissions

---

# 16. Cards

Standard card:

```text
Background: #FFFFFF
Border: #E2E8F0
Radius: 18–22px
Padding: 20px
Shadow: subtle
```

All cards should share a common visual language.

Do not create many unrelated card styles.

---

# 17. Tables

Tables are central to HMS data.

- Header: `12px`, weight `600`
- Row: `44–52px`
- Hover: `#F8FAFC`
- Subtle borders
- Compact actions
- Semantic badges
- No glass rows
- No excessive shadows
- Avoid over-rounding individual cells

The data should visually dominate the table.

---

# 18. Badges

- Height: `24–28px`
- Radius: `9999px`

Use for existing statuses such as:
- Active
- Pending
- Completed
- Cancelled
- Available
- Occupied

Do not invent unsupported statuses purely for visual purposes.

---

# 19. Motion System

Animations should be subtle and purposeful.

- Standard: `150–200ms`
- Cards: `200–300ms`
- Larger transitions: `300–500ms`

Prefer:
- opacity
- translateY
- scale
- subtle hover effects

Avoid:
- constant bouncing
- excessive rotation
- rapid flashing
- large movement

The animation should be felt rather than noticed.

---

# 20. Loading, Empty and Error States

## Loading
Use consistent skeleton components rather than only `Loading...`.

## Empty
Example:

```text
[Small icon]

No appointments scheduled

There are no appointments for today.

[Existing action if applicable]
```

## Error
Use soft rose/red styling:

```text
⚠ Unable to load appointments.

Please try again.
```

Do not create unnecessarily aggressive error screens.

---

# 21. Authentication UI

## Login
Most visually polished authentication page.

Potential:
- Liquid Glass
- ShaderGradient
- Liquid Logo
- Optional subtle React Three Fiber visual

Keep the form simple and readable.

## Register
Same visual family as Login.

Do not make Register look like a separate application.

---

# 22. Dashboard UI Plan

The Dashboard establishes the design language for the rest of the application.

Structure:

```text
Page Header
↓
KPI Cards
↓
Patient Trend
↓
Today's Consultations
↓
Ward Capacity
↓
Upcoming Appointments
```

Keep all existing working functionality.

Only redesign:
- Visual consistency
- Card design
- Spacing
- Typography
- Chart appearance
- Animations
- Loading/empty/error states
- Responsive behavior

### Important
The Upcoming Appointments card must visually belong to the same card family as the other dashboard cards. If it keeps a special accent treatment, it must still use the same radius, spacing, typography, button treatment, and hierarchy.

---

# 23. Patients

## Patients List
- Page header
- Search
- Existing filters
- Add Patient action
- Clean data table

## Patient Details
Treat as a patient workspace:

```text
Patient Header
↓
Digital Patient Card
↓
Clinical Notes
↓
Medical History
↓
Stay/Ward History
↓
AI Features
```

### AI Chat
Use subtle indigo.

### AI Summary
Use subtle indigo.

### Raise Alert
Use rose/red.

AI must feel like an HMS feature, not a separate chatbot product.

## Edit Patient
Use the shared form system.

---

# 24. Doctors

## Doctors List
Use the same table system as Patients.

## Doctor Details
Use:
- Profile header
- Professional information
- Availability
- Existing appointment information
- Existing activity information

## Edit Doctor
Reuse the global form system.

---

# 25. Appointments

Appointments are operational data.

## List
Use:
- Search
- Existing filters
- Existing date controls if supported
- Status
- Primary action
- Data table

## Details
Show:
- Patient
- Doctor
- Date/time
- Status
- Notes
- Existing actions

## Edit
Use shared form components.

---

# 26. Beds

Beds should emphasize capacity and resource status.

## Bed List
Possible structure:

```text
Capacity Summary
↓
Filters
↓
Bed List / Table
```

Use semantic status colors only for existing statuses.

## Add/Edit Bed
Simple shared form.

## Bed Details
Show:
- Bed information
- Ward
- Type
- Status
- Current patient
- Existing admission information

---

# 27. Admissions

Admissions are clinical records.

## List
Clean operational table.

## Add
Group:
- Patient Information
- Admission Information
- Ward / Bed
- Additional Notes

## Details
Use a timeline/detail workspace where appropriate.

## Edit
Use shared form system.

---

# 28. Pharmacy

Pharmacy should look operational rather than decorative.

Use:

```text
Header
↓
Search / Existing Filters
↓
Inventory
```

Suggested semantic statuses only where supported:
- In Stock → Green
- Low Stock → Amber
- Out of Stock → Rose

Do not invent unsupported functionality.

---

# 29. Notifications

The Notifications page and Navbar NotificationBell must share the same visual language.

## Page
- Existing All/Unread controls
- Notification list
- Small type indicators
- Timestamp
- Read/unread distinction

## NotificationBell
Compact popover with the same notification style.

---

# 30. Settings

Keep Settings simple and functional.

Use:
- Page header
- Grouped settings
- Consistent controls
- Shared inputs/buttons

Do not add settings that do not exist just for visual completeness.

---

# 31. Admin

## User Management
Use the same table system as other HMS data pages.

## Prompt Management
Use the same HMS shell with a slightly more technical/AI-oriented presentation:
- HMS blue
- White surfaces
- Indigo AI accent

Do not create a separate admin theme.

---

# 32. AI Design System

AI features:
- Patient AI Chat
- Patient AI Summary
- Prompt Management

### AI palette
- Main: `#6366F1`
- Background: `#EEF2FF`
- Border: `#C7D2FE`

AI should feel:
- Modern
- Calm
- Clearly labeled
- Integrated into HMS

Avoid neon/futuristic AI styling.

---

# 33. Medical Data Priority

## Level 1 — Critical
- Emergency
- Critical alerts
- Dangerous capacity

Use rose/red.

## Level 2 — Important
- Pending
- Upcoming
- Needs attention

Use amber/blue.

## Level 3 — Normal
- Patient information
- Appointments
- History

Use neutral/primary styling.

## Level 4 — Supporting
- Descriptions
- Timestamps
- Secondary information

Use gray/secondary text.

---

# 34. Responsive Design

## Desktop
`≥1280px` — primary target.

## Tablet/Laptop
`768–1279px` — adapt sidebar/content layout.

## Mobile
`<768px`:
- Sidebar drawer
- Responsive cards
- Horizontal table scrolling where required
- Stacked page actions
- Responsive forms

Do not sacrifice readability to force every table column into a small screen.

---

# 35. Accessibility Rules

- Maintain readable text contrast.
- Do not use color as the only status indicator.
- Use text/icons alongside semantic colors where appropriate.
- Keep buttons keyboard accessible.
- Maintain visible focus states.
- Keep form labels clear.
- Preserve entered values when validation errors occur.
- Avoid overly small interactive targets.

---

# 36. Four Visual Libraries — Planned Usage

## React Three Fiber
**Priority: Low / Selective**

Possible:
- Login
- Dashboard decorative visual
- AI area
- Loading/empty visual

Avoid on:
- Tables
- Forms
- Patient records
- Appointments
- Pharmacy
- Beds
- Admissions

## liquid-glass-js
**Priority: High / Selective**

Possible:
- Navbar
- Modals
- Search overlay
- Authentication cards
- Selected navigation
- AI panels

Do not apply it to everything.

## ShaderGradient
**Priority: Medium**

Possible:
- Login
- Register
- Very subtle Dashboard ambient background
- AI area

Movement must be slow and unobtrusive.

## liquid-logo
**Priority: Low**

Possible:
- Login
- Register
- Optional application loading/splash

Do not use it continuously throughout the application.

---

# 37. Student Project Balance

The final application should look like:

> **A well-designed college HMS built by a student team.**

Not:

> **A giant enterprise hospital ERP.**

### Good
- Clean tables
- Good spacing
- Consistent cards
- Clear hierarchy
- Subtle glass
- Smooth hover states
- Good empty states
- Small modern effects

### Too much
- 3D hospital environments
- WebGL everywhere
- Particle systems
- Huge AI animations
- Many gradients
- Excessive glass
- Dozens of unrelated card styles

---

# 38. Page Design Intensity

| Page | Priority | Visual Intensity | Main Treatment |
|---|---:|---:|---|
| Login | High | High | Glass + gradient + branding |
| Register | High | High | Same auth family |
| Dashboard | High | Medium | Cards + charts + subtle glass |
| Patients | High | Low/Medium | Table + filters |
| Patient Details | Very High | Medium | Clinical workspace + AI |
| Edit Patient | High | Low | Structured form |
| Doctors | High | Low/Medium | Table + profiles |
| Doctor Details | Medium | Medium | Profile workspace |
| Edit Doctor | Medium | Low | Structured form |
| Appointments | High | Low/Medium | Operational table |
| Appointment Details | Medium | Medium | Detail card |
| Edit Appointment | Medium | Low | Form |
| Beds | High | Medium | Capacity + table |
| Add Bed | Medium | Low | Form |
| Edit Bed | Medium | Low | Form |
| Bed Details | Medium | Medium | Resource detail |
| Admissions | High | Medium | Clinical table |
| Add Admission | Medium | Low | Clinical form |
| Admission Details | High | Medium | Timeline |
| Edit Admission | Medium | Low | Form |
| Pharmacy | High | Low/Medium | Inventory |
| Notifications | Medium | Medium | Activity feed |
| Settings | Medium | Low | Settings layout |
| User Management | Medium | Low | Admin table |
| Prompt Management | Medium | Medium | AI/admin UI |

---

# 39. Implementation Order

## Phase 1 — Foundation
1. Global design tokens
2. Global font
3. Navbar
4. Sidebar
5. Buttons
6. Inputs
7. Cards
8. Badges
9. Tables
10. Modals
11. Loading states
12. Empty states
13. Error states

## Phase 2 — Authentication
14. Login
15. Register

Introduce:
- Liquid Glass
- ShaderGradient
- Optional Liquid Logo
- Optional subtle R3F visual

## Phase 3 — Dashboard
Complete Dashboard as the reference implementation.

## Phase 4 — Patients
- Patients
- Patient Details
- Edit Patient

## Phase 5 — Doctors
- Doctors
- Doctor Details
- Edit Doctor

## Phase 6 — Appointments
- Appointments
- Appointment Details
- Edit Appointment

## Phase 7 — Beds
- Bed List
- Add Bed
- Edit Bed
- Bed Details

## Phase 8 — Admissions
- Admissions
- Add Admission
- Admission Details
- Edit Admission

## Phase 9 — Pharmacy
- Pharmacy

## Phase 10 — Notifications + Settings
- Notifications
- Settings
- Navbar NotificationBell consistency

## Phase 11 — Admin
- User Management
- Prompt Management

## Phase 12 — Final Consistency Pass
Review all 25 pages for:
- Colors
- Typography
- Spacing
- Buttons
- Cards
- Tables
- Icons
- Animations
- Loading
- Empty states
- Error states
- Responsive behavior
- Cross-page visual consistency

---

# 40. Customization Strategy

The design should be centralized so future changes are easy.

Conceptually:

```js
const theme = {
  colors: {
    primary: "#08679F",
    primaryDark: "#07557F",
    background: "#F6F8FC",
    surface: "#FFFFFF",
    success: "#10B981",
    warning: "#F59E0B",
    danger: "#F43F5E",
    info: "#3B82F6",
    ai: "#6366F1",
  },

  radius: {
    sm: "8px",
    md: "12px",
    lg: "18px",
    xl: "22px",
  },

  spacing: {
    xs: "4px",
    sm: "8px",
    md: "16px",
    lg: "24px",
    xl: "32px",
  },
};
```

The exact implementation should match the project's existing Tailwind/CSS setup.

Avoid scattering design values randomly across 25 pages.

---

# 41. Design Decision Checklist

Before changing any page, ask:

1. What is the user trying to do?
2. What information is most important?
3. What action is most important?
4. What should be visually secondary?
5. What existing functionality must remain untouched?
6. Which shared HMS component should this page use?
7. Does this page still look like the same HMS?
8. Is the visual effect helping usability or only decoration?
9. Is the page still appropriate for a healthcare system?
10. Does it still look believable as a college project?

---

# 42. Golden Rule

> **One HMS → one design system → 25 pages → shared components → controlled effects → existing functionality preserved.**

The goal is not to make every page visually spectacular.

The goal is to make every page feel like it was designed by the **same student team with a clear UI/UX system**.

---

# 43. Final Visual Target

The overall application should feel like:

> **A light, calm, blue-based hospital management workspace with a dark navy navigation shell, white information surfaces, subtle glass effects, restrained gradients, readable clinical tables, small purposeful animations, and a limited indigo AI accent.**

Visual priority:

```text
Usability
↓
Readability
↓
Consistency
↓
Clinical information hierarchy
↓
Modern visual polish
↓
Decorative effects
```

This order should not be reversed.

---

# 44. Change Policy

This master plan is a living design document.

Any page can be customized later without breaking the overall system.

Examples:
- Increase glass effect on Patient Details
- Reduce animation on Dashboard
- Remove ShaderGradient from Login
- Change primary color
- Add a different AI accent
- Change card radius
- Modify spacing
- Adjust sidebar width
- Simplify a page

Changes should be evaluated against the global HMS design system before implementation.

---

# Final Rule

**Make the HMS attractive, but never let attractiveness interfere with understanding, navigation, or clinical information.**
