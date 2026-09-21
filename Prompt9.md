Continue from the complete implementation.

At this stage act as a Senior QA Engineer + Security Engineer + Site Reliability Engineer.

Do NOT add random features.

Prepare the complete platform for production.

Audit all applications.

Backend:

unit tests
integration tests
API tests
database tests
queue tests

Web:

unit/component tests
Playwright E2E

Flutter:

unit tests
widget tests
integration tests where practical

Python:

unit tests
API tests

Verify:

Registration
Login
Authentication
Interview creation
Question selection
Answer submission
AI evaluation
Voice processing
Delivery analysis
Session completion
Dashboard result
Subscription
Payment webhook
Admin operation

Review:

authentication
authorization
RBAC
JWT handling
refresh token security
password hashing
input validation
SQL/ORM safety
XSS
CSRF where applicable
CORS
rate limiting
file upload security
webhook security
secrets
logging of sensitive data
IDOR/access control
privilege escalation

Do not expose:

API keys
passwords
tokens
payment secrets
private audio URLs

Implement or verify:

structured logging
request IDs
error tracking
health checks
queue monitoring
useful metrics

Track useful operational metrics such as:

API latency
AI latency
STT latency
queue depth
failed jobs
AI usage
token usage where available
estimated AI cost
payment failures

Identify:

N+1 database queries
missing indexes
unnecessary API calls
slow endpoints
inefficient queue processing
excessive frontend rendering
memory-heavy operations

Do not prematurely optimize without evidence.

Prepare basic load tests for critical APIs.

Use a suitable tool such as k6 if already planned.

Run:

lint
type-check
unit tests
integration tests
E2E tests
build
Python tests
Flutter analyze/tests

Fix issues caused by the project implementation.

Create a production-readiness report containing:

passed checks
failed checks
security findings
performance findings
remaining risks
recommended fixes

Do NOT deploy yet.