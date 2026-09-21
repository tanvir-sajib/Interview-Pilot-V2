Continue from the completed backend and AI platform.

FIRST inspect all APIs and existing frontend/mobile implementation.

Build production-quality user-facing applications.

Technology:

Next.js
React
TypeScript
Tailwind CSS
shadcn/ui
React Hook Form
Zod
TanStack Query

Use Tailwind as the primary styling system.

Bootstrap may be used selectively where genuinely useful, but do NOT mix Tailwind and Bootstrap unnecessarily inside the same component.

Implement:

landing page
registration
login
onboarding
dashboard
interview configuration
interview screen
answer submission
evaluation/feedback
session history
performance analytics
profile

Prepare route structure for:

/admin
/billing

but do not implement full billing/admin functionality yet if it belongs to Part 08.

Technology:

Flutter
Dart
Riverpod
Dio
GoRouter
Drift/SQLite where appropriate

Use feature-first clean architecture.

Structure concept:

presentation
application
domain
data

Do NOT place business logic directly inside widgets.

Implement:

splash
onboarding
authentication
home
interview setup
interview
text answer
voice recording foundation
feedback
session summary
history
profile

Keep API communication centralized.

Use typed request/response models.

Handle:

token refresh
network failure
timeout
server error
loading
empty state

Provide:

loading states
error states
empty states
responsive layouts
accessibility-conscious UI
clear interview progress

Do not create fake data for production screens if real APIs are available.

Web:

type-check
lint
unit/component tests where appropriate
Playwright E2E for critical flows

Flutter:

flutter analyze
unit tests
widget tests for critical screens
integration tests for critical flows where practical

Fix all errors caused by implementation.

At the end report:

web routes
mobile screens
API integration
tests
known limitations

Do not implement payment/admin business logic yet.