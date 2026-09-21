This is the final productionization phase.

FIRST inspect the entire project and all previous implementations.

Do not rewrite stable application logic unless required for deployment correctness.

Prepare the complete AI Interview Coach platform for production deployment.

Create production-ready Docker configurations for:

NestJS API
workers
Python AI service
Next.js web

Use multi-stage builds where appropriate.

Do not ship development dependencies unnecessarily.

Provide development/staging infrastructure for:

PostgreSQL
Redis
object storage if required
API
workers
Python AI service
web

Keep secrets outside source control.

Configure reverse proxy for:

web
API
WebSocket

Configure:

HTTPS-ready structure
security headers
request size limits
WebSocket forwarding
reasonable timeouts

Create GitHub Actions pipelines.

At minimum:

Pull Request:

install
lint
type-check
tests
build

Main branch:

full validation
production build
deployment-ready artifact

Do not put secrets directly into workflow files.

Production database process must include:

migrations
backup strategy
restore strategy
migration safety

Never use destructive reset commands in production.

Prepare:

.env.example

Document required variables for:

PostgreSQL
Redis
JWT
LLM provider
STT provider
storage
payment
Sentry/observability
application URLs

Never commit actual secrets.

Prepare deployment documentation for a VPS/cloud environment.

Include:

server prerequisites
environment setup
database setup
Redis setup
object storage
application deployment
migrations
reverse proxy
HTTPS
health checks
logs
backups
rollback procedure

After deployment configuration is ready, verify locally using production-like configuration.

Test:

web
API
authentication
interview
AI evaluation
voice pipeline
dashboard
subscription
payment webhook
admin
WebSocket
health checks

Update:

README.md

docs/architecture/
docs/api/
docs/database/
docs/ai/
docs/deployment/

Create:

PRODUCTION_CHECKLIST.md

Include:

infrastructure
security
database
backups
monitoring
deployment
rollback
secrets
domains
SSL
payment
AI providers

At the end provide:

Final architecture
Complete repository structure
Applications/services
Database summary
API summary
AI architecture
Voice architecture
Web architecture
Flutter architecture
Infrastructure architecture
CI/CD architecture
Security status
Test status
Known limitations
Production deployment steps
Future extension points

Do not claim the system is production-ready unless all relevant checks actually pass.

If something is incomplete, clearly identify it.