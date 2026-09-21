
Continue from Parts 01 and 02.

FIRST inspect the existing implementation.

Do not duplicate existing functionality.

Implement production-grade authentication and authorization.

Technology:

NestJS
TypeScript
PostgreSQL
Prisma
JWT

Implement:

registration
login
logout
access token
refresh token
refresh token rotation where appropriate
password hashing
password verification
password change
account status

Use secure password hashing.

Do not store plaintext passwords.

Implement:

user profile
profile update
account status
user preferences where appropriate

Implement role-based access control.

At minimum support:

USER
ADMIN

Design the authorization layer so additional roles can be introduced later.

Use NestJS guards/decorators appropriately.

Implement protection against:

unauthorized access
invalid tokens
expired tokens
brute-force login attempts
unsafe input
privilege escalation

Do not expose sensitive user information.

Create clean endpoints under:

/api/v1/auth
/api/v1/users

Use DTOs and validation.

Document APIs with Swagger.

Create unit/integration tests for:

registration
login
invalid credentials
token refresh
protected endpoint
role authorization
password change

Run:

lint
type-check
tests
build

Fix all errors.

At the end provide:

authentication architecture
endpoint list
security decisions
files changed
test results
remaining work

Do not implement interview functionality yet.