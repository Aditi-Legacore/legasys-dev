# TODO: Add Role Field to User Creation

## Steps:
1. Update src/app/api/admin/users/route.ts: Accept role in request, validate it against allowed values ("Super Admin", "Legacore User", "Customer"), and use in user creation.
2. Update src/components/users/AddUserModal.tsx: Add role state, import Select, add dropdown after password, include role in API call.
3. Test the user creation flow.

## Status:
- [x] Step 1: Update API route
- [x] Step 2: Update modal component
- [ ] Step 3: Test
