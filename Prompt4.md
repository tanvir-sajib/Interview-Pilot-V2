
Continue from the existing implementation.

FIRST inspect the repository, database and existing APIs.

Build the core Interview Engine and Question Engine.

Implement question management supporting:

role
seniority
category
difficulty
tags
expected concepts
rubric
language
version
status

Support:

create
update
review
publish
archive
retrieve

Ensure question versioning is preserved.

Do not overwrite historical question versions used in completed interviews.

Implement:

create interview session
select track
select seniority
configure interview
start interview
retrieve current question
submit answer
move to next question
complete interview
session state management

Support technical and HR/behavioral interview categories.

Design explicit session states.

Example:

CREATED
READY
IN_PROGRESS
PROCESSING
COMPLETED
CANCELLED
FAILED

Do not rely on ambiguous boolean flags.

Support:

text answers
voice-answer metadata
answer timestamps
question association
session association

Prepare architecture for asynchronous AI evaluation.

Create a question-selection abstraction.

It should support future:

adaptive difficulty
personalized question selection
company-specific questions
AI-generated questions

Do not hard-code future logic now.

Create clean APIs under:

/api/v1/questions
/api/v1/interviews
/api/v1/answers

Test:

question CRUD
question versioning
session creation
session lifecycle
answer submission
authorization
invalid state transitions

Run:

lint
type-check
tests
build

Fix all errors.

At the end report architecture, APIs, database changes, tests and remaining work.

Do not implement LLM evaluation yet.