# TODO: Update Note Creation to Include User Details

## Steps to Complete

- [x] Edit `prisma/schema.prisma` to add relation between `Note` and `User` models for `createdBy`.
- [x] Edit `src/app/api/intake/[id]/notes/route.ts` GET method to include `createdByUser` with `firstName` and `lastName`.
- [x] Run `npx prisma generate` to update the Prisma client.
- [x] Test the API to ensure notes include user first name and last name.
