# Interview Coach Platform

A full‑stack solution for AI‑powered interview coaching.

## Monorepo Layout
```
apps/
  api/        # Backend (NestJS)
  web/        # Web (Next.js)
  mobile/     # Mobile (Flutter)
  ai-service/ # AI micro‑service (FastAPI)
packages/
  contracts/  # Shared interfaces & contracts
  types/      # Generic TypeScript types
  config/     # Centralized config utilities
  api-client/ # Future API client library
workers/        # BullMQ workers
infrastructure/
  docker/       # Docker Compose & service Dockerfiles
  nginx/        # Nginx reverse‑proxy config

docs/          # High‑level documentation
```

## Getting Started
1. **Clone the repo** and navigate to the project root.
2. **Install dependencies** for each app and service:
   ```bash
   # At the root (works with npm workspaces)
   npm install
   ```
3. **Run services via Docker**:
   ```bash
   cd infrastructure/docker
   docker compose up
   ```
4. Open a browser at the appropriate ports:
   - API: http://localhost:3000
   - Web: http://localhost:3001
   - AI: http://localhost:8000

## Next Steps
- Finish the NestJS module structure and DTOs.
- Generate Prisma schema and migrations.
- Implement AI endpoints in FastAPI.
- Build the mobile Flutter app.
- Add CI pipelines in `.github/workflows`.
