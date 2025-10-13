# Task: Update Login Form UI to Match Provided Image

## Steps to Complete

### 1. Install Missing shadcn/ui Components
- [x] Run `npx shadcn@latest add card label` to add Card and Label components for form structure. (Card added; Label skipped as exists)

### 2. Create Background Illustration Asset
- [ ] Create `public/login-bg.svg` with simple vector approximation of the image (woman on bench, clouds, lamp, plant). (Failed; alternative: Use CSS gradient + existing SVGs for approximation in component)

### 3. Update LoginForm.tsx
- [ ] Restructure layout: Split left (bg illustration approx.) and right (form card).
- [ ] Add header: ":Legacore Account" and subtitle.
- [ ] Update inputs: Add labels, set placeholders, optional icons.
- [ ] Update login button: "Login", blue styling.
- [ ] Add Google sign-in button.
- [ ] Add "Don't have an account? Sign up" link.
- [ ] Apply responsive Tailwind classes for blue theme.

### 4. Update login/page.tsx
- [ ] Add metadata for page title.

### 5. Update globals.css (if needed)
- [ ] Add custom classes for gradients/shadows.

### 6. Testing and Verification
- [ ] Run `npm run dev`.
- [ ] Navigate to /login, verify layout matches image (responsiveness, colors, functionality).
- [ ] Test form submission (credentials and Google).

Progress: Step 1 complete. Skipping SVG file; using CSS approx. for step 2. Proceeding to step 3.
