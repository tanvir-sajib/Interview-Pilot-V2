Continue from the existing project.

FIRST inspect all existing billing, user, role and admin code.

Implement the business and administration layer.

Implement:

plans
subscription status
start date
expiry
usage limits
feature access
upgrade
downgrade
cancellation
expiry handling

Use a usage ledger rather than relying only on a mutable counter.

Track feature usage such as:

interviews
AI evaluations
voice analysis
other metered features

Create:

IPaymentProvider

Payment business logic must not depend directly on a single gateway.

Prepare architecture for multiple gateways.

Implement:

payment creation
transaction tracking
payment status
webhook handling
webhook verification
subscription activation after verified payment

Never trust client-side payment success alone.

Implement admin functionality for:

users
questions
question versions
interviews
subscriptions
payments
AI usage
system health
audit logs

Protect admin APIs with RBAC.

Important admin actions must create audit records.

Track:

actor
action
entity
entity ID
timestamp
relevant metadata

Do not store sensitive secrets in audit metadata.

Implement admin and billing pages in Next.js.

Use the existing design system.

Test:

subscription lifecycle
usage limits
payment lifecycle
webhook verification
duplicate webhook handling
admin authorization
audit logging

Use mocked payment providers for automated tests.

Do not use real payment credentials in tests.

Run all relevant checks.

At the end report:

billing architecture
provider abstraction
admin modules
APIs
tests
security considerations

Do not start production deployment yet.