---
name: updated-sessionstatus-service
description: Updated references from SessionStatus to InterviewStatus and added missing domain extraction logic.
metadata:
  type: project
---

- Updated `interviews.service.ts` to import `InterviewStatus` from `@prisma/client` and replaced all uses of the non‑existent `SessionStatus` enum.
- Added extraction of the email domain in `auth.service.ts` and corrected role assignment logic to support admin registration (`admin.example.com`).
- Adjusted `package.json` to keep Nest 10.x packages and `@nestjs/config@2.3.0`. Users should run `npm install --legacy-peer-deps` (or `--force`) to resolve peer conflicts.
