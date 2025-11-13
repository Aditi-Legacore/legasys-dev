# TODO: Fix File Upload Error on Vercel Server

## Steps to Complete
- [x] Add @vercel/blob dependency to package.json
- [x] Update POST method in src/app/api/intake/[id]/documents/route.ts to use Vercel Blob for file uploads
- [x] Update DELETE method in src/app/api/intake/[id]/documents/route.ts to use Vercel Blob for file deletions
- [x] Run npm install to install the new dependency
- [ ] Deploy to Vercel and test file uploads
