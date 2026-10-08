# HMS PAGE-BY-PAGE UI REDESIGN PROMPT

You are modifying the UI of ONE specific page in my Hospital Management System at a time.

IMPORTANT:
I will tell you which page to modify at the end of this prompt.

The page to modify is:

[PAGE_NAME]

For example:
- Appointments.jsx
- AppointmentDetails.jsx
- AddAppointmentForm.jsx
- EditAppointment.jsx
- Patients.jsx
- PatientDetails.jsx
- Dashboard.jsx

==================================================
1. FIRST: READ THE REFERENCE
==================================================

Before modifying anything:

1. Read:
   HMS_Login_UI_Style_Reference.md

2. Read the COMPLETE source code of the page I specified.

3. If the page imports or depends on components/styles that are directly relevant to the visual effect, inspect those only as necessary.

4. Understand the current:
   - layout
   - spacing
   - colors
   - cards
   - buttons
   - forms
   - tables
   - navigation
   - state
   - API calls
   - event handlers
   - routing
   - existing animations
   - existing CSS/classes

Do NOT start editing before understanding the existing page.

==================================================
2. MAIN OBJECTIVE
==================================================

Redesign ONLY the visual appearance of the specified page so that it visually belongs to the same Hospital Management System design language as Login.jsx.

The target is:

"CURRENT PAGE + LOGIN-INSPIRED VISUAL EFFECTS"

NOT:

"CREATE A COMPLETELY NEW PAGE"

The existing page should remain recognizable.

Do not replace the existing UI with a completely different layout.

The goal is to make the HMS pages feel like they belong to one polished application.

==================================================
3. VERY IMPORTANT — MODIFY ONLY THE REQUESTED PAGE
==================================================

This is a PAGE-BY-PAGE workflow.

ONLY modify:

[PAGE_NAME]

Do NOT redesign other pages.

Do NOT modify:
- Login.jsx
- Register.jsx
- Dashboard.jsx
- other pages
- backend files
- database files
- API routes
- unrelated components
- unrelated CSS

unless a tiny shared-style change is absolutely required for the requested page to function visually.

If a shared component is used by many pages, DO NOT globally redesign that component just to modify this page.

Prefer page-local styling/effects.

==================================================
4. PRESERVE FUNCTIONALITY
==================================================

This is a UI modification task.

DO NOT change working functionality.

Preserve:
- API calls
- API endpoints
- authentication
- authorization
- tokens
- localStorage
- session handling
- state management
- form submission
- validation
- error handling
- loading states
- success states
- delete/update/create operations
- navigation
- routes
- query parameters
- IDs
- data structures
- backend logic
- database logic

Do not "clean up" or refactor working business logic unless it is absolutely necessary for the visual implementation.

Do not change API request payloads.

Do not change database queries.

Do not change backend code.

==================================================
5. PRESERVE THE EXISTING PAGE DESIGN
==================================================

Keep the current page's:

- layout structure
- content
- hierarchy
- existing colors
- button colors
- text colors
- table colors
- status colors
- spacing
- sizing
- important responsive behavior
- existing components

unless a small visual adjustment is necessary to integrate the Login-inspired effects.

IMPORTANT:

Do NOT replace the page's existing color palette with Login's blue palette.

The existing page colors are intentional.

Instead, use the Login page's visual language primarily for:

- atmospheric background effects
- subtle glow
- glass effect
- spotlight
- border highlight
- 3D movement
- shadows
- smooth transitions

==================================================
6. LOGIN PAGE IS THE VISUAL REFERENCE
==================================================

Use Login.jsx as the reference for the following effects:

- MedicalPlusBackground
- soft blurred background circles
- subtle blue/cyan/indigo atmospheric glow
- white/light glass surfaces
- backdrop blur
- cursor-following spotlight
- cursor-following border highlight
- subtle 3D card movement
- smooth hover transitions
- entrance animation
- floating elements where appropriate
- reduced-motion accessibility

However:

DO NOT copy the Login page's movement intensity directly.

Login.jsx uses approximately 5–6° movement.

For normal HMS pages, use:

3–4° maximum movement.

This should feel noticeably interactive but still professional and readable.

==================================================
7. 3D MOVEMENT — IMPORTANT
==================================================

For normal HMS pages:

Maximum rotateX:
approximately ±3° to ±4°

Maximum rotateY:
approximately ±3° to ±4°

Preferred default:
approximately ±3.5°

Do NOT use the Login page's ±5° / ±6° movement on normal HMS pages.

The movement should feel:

- subtle
- premium
- smooth
- professional
- controlled

It must NOT feel like the page/card is rotating aggressively.

For dense pages such as:
- tables
- appointment lists
- patient lists
- medical records
- dashboards with many cards

prefer the lower end:

approximately ±3°

For larger visual cards or detail panels, you may use up to:

approximately ±4°

Do not exceed ±4° unless explicitly requested.

==================================================
8. TRANSLATE Z
==================================================

Use only a subtle depth effect.

Recommended:

translateZ(4px) to translateZ(6px)

Do NOT use the Login page's stronger 10px depth effect by default.

The purpose is to create depth without making the card look like it is physically jumping toward the user.

==================================================
9. HOVER SPOTLIGHT — REDUCED DARKNESS
==================================================

The Login page's cursor spotlight is the visual reference.

However, HMS pages must use a slightly softer spotlight.

IMPORTANT:

If Login's spotlight visual intensity/darkness is considered 50%,

HMS pages should feel approximately 40% as strong.

In practical terms:

Make the HMS spotlight about 20% softer than Login.

Do NOT make it extremely faint.

It should still be clearly visible when the cursor moves over the card.

Target visual result:

Login:
stronger spotlight

HMS pages:
same effect, but approximately 40% intensity

The spotlight should remain:

- soft
- subtle
- premium
- blue/cyan influenced
- cursor-following

Avoid a dark circular "flashlight" appearance.

It should look like a soft light passing over the surface.

==================================================
10. SPOTLIGHT IMPLEMENTATION
==================================================

Use a radial-gradient similar to the Login page.

Example concept:

radial-gradient(
  circle at var(--spot-x) var(--spot-y),
  rgba(8, 103, 159, 0.03),
  transparent 40%
)

The exact opacity may be adjusted slightly depending on the existing page background.

The important requirement is:

HMS spotlight = approximately 40% visual intensity of Login spotlight.

Do not blindly copy Login's opacity if it makes the page too dark.

For lighter pages, prioritize readability.

==================================================
11. CURSOR BORDER HIGHLIGHT
==================================================

Use a subtle cursor-following border highlight inspired by Login.jsx.

It should:

- follow the cursor
- stay soft
- not create a strong glowing border
- not make the card look neon
- remain consistent with the page's existing colors

The border highlight should also be approximately 40% as visually strong as the Login version.

Do not overdo it.

==================================================
12. CARD SHADOW
==================================================

Use subtle elevation.

Normal state:
soft shadow

Hover state:
slightly stronger shadow

Do not use extremely dark shadows.

The card should feel elevated but still clean.

Avoid:

- huge shadows
- black shadows
- excessive glow
- neon effects

==================================================
13. GLASS / MORPHISM
==================================================

Use the Login page's glassmorphism language where appropriate.

Possible properties:

- bg-white/70
- bg-white/80
- backdrop-blur-xl
- border border-slate-200/80
- subtle transparency

BUT:

Do not blindly convert every element into glass.

Use glass effects mainly for:

- main cards
- detail panels
- modal panels
- major containers

Do not make:

- every button
- every text element
- every table row
- every small element

transparent/glassy.

The design should remain clean and readable.

==================================================
14. BACKGROUND ATMOSPHERE
==================================================

Use Login-inspired atmospheric effects where appropriate:

- soft blurred circles
- blue/cyan glow
- subtle indigo glow
- very light background gradient
- MedicalPlusBackground if already available

The background effect must remain subtle.

It should create depth without distracting from medical data.

Do not make the background dark.

Do not change the page into a dark theme.

==================================================
15. ENTRANCE ANIMATION
==================================================

Major page cards may use a subtle entrance animation inspired by Login:

- opacity: 0 → 1
- translateY: approximately 8–12px → 0
- scale: approximately 0.98 → 1

Duration:

approximately 350–450ms

Use a smooth easing curve.

Do NOT animate every element individually.

Avoid excessive animation on data-heavy pages.

==================================================
16. HOVER INTERACTIONS
==================================================

Use subtle hover effects.

Examples:

- slight elevation
- slight scale
- subtle border highlight
- cursor spotlight
- small icon movement
- button transition

Avoid:

- large scaling
- aggressive rotation
- bouncing
- excessive movement
- flashing
- continuous unnecessary animations

Buttons should remain professional.

==================================================
17. RESPONSIVE DESIGN
==================================================

Do not break responsive behavior.

The page must continue to work properly on:

- desktop
- laptop
- tablet
- smaller screens

3D effects should not cause:

- horizontal overflow
- clipped content
- layout shifting
- cards moving outside their containers

If necessary, reduce or disable intensive effects on small screens.

==================================================
18. REDUCED MOTION
==================================================

Respect:

prefers-reduced-motion: reduce

When reduced motion is enabled:

- disable 3D movement
- disable floating animations
- disable unnecessary entrance animation
- keep the page fully functional

Accessibility and usability are more important than visual effects.

==================================================
19. DO NOT OVER-ENGINEER
==================================================

Do not create a huge animation system.

Do not add unnecessary libraries.

Do not install packages unless absolutely required.

Prefer:

- existing React functionality
- existing Tailwind classes
- CSS
- small page-local helper logic

Keep the implementation maintainable.

==================================================
20. IMPORTANT: DO NOT DUPLICATE EFFECTS
==================================================

Before adding an effect:

Check whether the page already has:

- PageEffects
- MedicalPlusBackground
- spotlight logic
- mousemove logic
- 3D transform logic
- CSS variables
- animation classes

If an existing effect already performs the same job:

UPDATE or IMPROVE it.

Do not create duplicate systems.

For example, do not create:

handleMouseMove1
handleMouseMove2
handleMouseMove3

for the same card.

Keep the implementation clean.

==================================================
21. 3D EFFECT IMPLEMENTATION
==================================================

The movement should be based on the cursor position relative to the card.

Conceptually:

- cursor moves toward top → card tilts slightly
- cursor moves toward bottom → card tilts slightly
- cursor moves left → card rotates slightly
- cursor moves right → card rotates slightly

Maximum:

±3° to ±4°

Preferred:

±3.5°

Use smooth transitions when the cursor leaves the card.

Example concept:

transform:
rotateX(...)
rotateY(...)
translateZ(...)

Do not use fixed rotation values.

The effect must respond naturally to cursor position.

==================================================
22. DENSE DATA PAGES
==================================================

For pages containing:

- tables
- patient records
- appointment lists
- medical history
- invoices
- forms with many fields

prioritize readability.

Use:

approximately ±3° movement

rather than ±4°.

The spotlight should also remain subtle.

The content must always be easier to read than the animation is to notice.

==================================================
23. MODALS
==================================================

If the specified page contains a modal:

Apply the same visual language to the modal.

Use:

- glass effect
- subtle shadow
- subtle spotlight
- subtle 3D effect if appropriate
- smooth entrance

But do not make the modal movement excessive.

For modal/dialog content:

approximately ±2° to ±3° is preferred.

==================================================
24. FORMS
==================================================

Do not change:

- field names
- form state
- validation
- submit logic
- API payloads

Only improve visual presentation.

Inputs should remain easy to read.

Focus states should be subtle and consistent with the existing page colors.

==================================================
25. COLORS — VERY IMPORTANT
==================================================

Existing page colors must remain the primary colors.

Login-inspired colors may be used for atmospheric effects:

Primary Login reference:
#08679F

Supporting effects:
cyan
indigo
white
slate

Do NOT recolor the entire page to #08679F.

Do NOT replace existing status colors.

For example:

- success should remain success-colored
- warning should remain warning-colored
- error should remain error-colored
- appointment status colors should remain unchanged

Use Login colors primarily for:

- glow
- spotlight
- border highlight
- atmospheric background
- subtle depth

==================================================
26. CODE QUALITY
==================================================

After modification:

- remove unused imports
- remove unused state
- remove unused handlers
- avoid duplicate CSS
- avoid unnecessary dependencies
- keep naming clear
- keep the existing code structure where possible

Do not refactor unrelated code.

==================================================
27. FINAL VERIFICATION
==================================================

After editing the specified page:

Check that:

1. The page still loads.
2. Existing functionality still works.
3. Existing API calls are unchanged.
4. Existing routes are unchanged.
5. Existing form behavior is unchanged.
6. Existing colors are preserved.
7. Existing layout is preserved.
8. 3D movement is approximately ±3° to ±4°.
9. Dense pages preferably use approximately ±3°.
10. Spotlight is approximately 40% as visually strong as Login.
11. Border highlight is approximately 40% as visually strong as Login.
12. No excessive darkness was introduced.
13. No excessive glow was introduced.
14. No horizontal overflow was introduced.
15. Responsive behavior still works.
16. Reduced-motion support remains available.
17. No unrelated files were modified.

==================================================
28. MOST IMPORTANT RULE
==================================================

Do NOT redesign the entire HMS.

Modify ONLY the page I specify.

The desired result is:

Existing Page
+
Login-inspired visual effects
+
3–4° subtle 3D movement
+
40%-intensity spotlight
+
soft glassmorphism
+
smooth professional animation
=
Consistent HMS design

NOT:

New layout
+
new colors
+
new components
+
new functionality

==================================================
29. PAGE-SPECIFIC INSTRUCTION
==================================================

Now modify ONLY this page:

[PAGE_NAME]

Before editing, inspect the complete current implementation.

Then make the minimum necessary code changes to apply the visual system described above.

After completing the modification, report:

1. Which file was modified.
2. What visual effects were added/updated.
3. The maximum 3D movement used.
4. Spotlight intensity used relative to Login.
5. Whether any functionality/API/backend/database code was changed.

Do not modify any other page.