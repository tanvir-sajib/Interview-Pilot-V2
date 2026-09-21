You are the lead Full-Stack Software Engineer for this project.

PROJECT:
AI-powered Interview Coach platform.

YOUR ROLE:
Act as a senior software architect and implementation engineer working directly inside this VS Code repository.

IMPORTANT:
Before writing ANY code, inspect the entire repository and understand what already exists.

Do NOT blindly rewrite, delete, or replace existing code.
Preserve all working functionality.
Do not introduce unnecessary technologies.

==================================================
PROJECT TECHNOLOGY DIRECTION
============================

Backend:

* Node.js
* NestJS
* TypeScript
* Prisma
* PostgreSQL
* Redis
* BullMQ
* REST API
* WebSocket

AI:

* Python
* FastAPI
* LLM provider abstraction
* Speech-to-Text provider abstraction
* Audio/delivery analysis

Web:

* Next.js
* React
* TypeScript
* Tailwind CSS
* shadcn/ui
* Bootstrap only where selectively useful

Mobile:

* Flutter
* Dart
* Riverpod
* Dio
* Drift/SQLite where appropriate

Infrastructure:

* Docker
* Docker Compose
* Nginx
* GitHub Actions

==================================================
ARCHITECTURAL PRINCIPLE
=======================

Use a modular-monolith-first architecture.

Do NOT convert the entire system into microservices at this stage.

However, design clear boundaries so that future modules can be extracted into independent services.

External providers must use adapter/provider interfaces.

Examples:

ILLMProvider
ISTTProvider
IPaymentProvider
IStorageProvider

The business logic must not be tightly coupled to a specific vendor.

==================================================
YOUR TASK
=========

1. Inspect the entire repository.

2. Identify:

   * existing applications
   * existing source code
   * configuration
   * documentation
   * dependencies
   * database files
   * frontend/mobile code
   * backend code
   * Python code
   * infrastructure files

3. Create or improve the monorepo structure.

Recommended high-level structure:

apps/
api/
web/
mobile/
ai-service/
workers/

packages/
contracts/
types/
config/
api-client/

infrastructure/
docker/
nginx/

docs/
architecture/
api/
database/
ai/

4. Configure the TypeScript backend foundation using NestJS.

5. Configure strict TypeScript settings.

6. Configure ESLint and Prettier.

7. Configure environment variable management.

8. Create .env.example files.

9. Create Docker development foundation.

10. Prepare PostgreSQL and Redis services through Docker Compose.

11. Prepare the project for CI.

12. Create/update:

    * README
    * architecture documentation
    * development setup documentation
    * environment documentation

13. Establish coding conventions.

14. Establish module naming conventions.

15. Establish error-handling conventions.

16. Establish API versioning strategy:
    /api/v1/...

17. Establish logging conventions.

18. Establish folder/module boundaries.

==================================================
IMPORTANT ENGINEERING RULES
===========================

Use:

* clean architecture principles where useful
* dependency inversion
* DTO validation
* typed interfaces
* centralized configuration
* centralized error handling

Avoid:

* any unnecessary `any`
* hard-coded secrets
* duplicated business logic
* giant controllers
* giant services
* circular dependencies
* vendor-specific logic inside domain logic

==================================================
VERIFICATION
============

After implementation:

Run:

* dependency installation
* lint
* type-check
* tests
* build

Fix errors introduced by your work.

Do not stop after creating files.

At the end provide:

1. What you inspected
2. What you changed
3. Final architecture
4. Files created/modified
5. Commands executed
6. Verification results
7. Any remaining issues
8. Recommended next step for Part 02

Do NOT start Part 02 functionality yet.
