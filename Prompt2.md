Continue from the existing project.

Do NOT rebuild the project from scratch.

FIRST inspect the current repository and Part 01 implementation.

==================================================
OBJECTIVE
=========

Build the production-grade backend foundation.

Technology:

* NestJS
* TypeScript
* Prisma
* PostgreSQL
* Redis
* BullMQ

==================================================
DATABASE
========

Design the PostgreSQL schema for the AI Interview Coach platform.

Core entities should include appropriate relationships for:

* User
* UserProfile
* Role
* Question
* QuestionVersion
* InterviewSession
* SessionQuestion
* Answer
* Evaluation
* DeliveryMetrics
* SessionSummary
* Subscription
* Payment
* UsageRecord
* AIJob
* Notification
* AuditLog

Do NOT blindly create every table if the current repository already contains equivalent models.

Inspect existing schema first.

Use:

* proper primary keys
* foreign keys
* indexes
* unique constraints
* timestamps
* soft-delete strategy where appropriate
* enum types where appropriate

Design for future extensibility.

==================================================
PRISMA
======

Configure Prisma correctly.

Create:

* schema
* migrations
* seed strategy

Do not use destructive migration commands against existing data unless explicitly required.

==================================================
NESTJS MODULE STRUCTURE
=======================

Prepare modules such as:

auth
users
questions
interviews
answers
evaluations
subscriptions
payments
notifications
admin
ai
health

Do not implement all business functionality yet.

Establish clean module boundaries.

==================================================
REDIS + BULLMQ
==============

Configure Redis.

Prepare BullMQ infrastructure.

Create queue abstractions for future jobs such as:

stt.process
llm.evaluate
delivery.analyze
session.summarize
notification.send

Do not implement complex workers yet.

==================================================
API FOUNDATION
==============

Implement:

* API prefix
* versioning
* validation
* serialization
* exception handling
* logging
* health endpoint
* Swagger/OpenAPI
* request correlation ID if appropriate

==================================================
SECURITY
========

Prepare:

* CORS configuration
* security headers
* request validation
* rate-limit foundation
* safe environment configuration

==================================================
VERIFICATION
============

Run:

* Prisma validation
* migration checks
* lint
* type-check
* tests
* build

Fix all issues.

At the end report:

* database schema
* modules
* queues
* APIs created
* files changed
* verification results
* remaining work

Do not implement Part 03 authentication yet.
