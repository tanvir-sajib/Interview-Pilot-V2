
Continue from Parts 01-04.

FIRST inspect the existing AI architecture, interview system, queues and database.

Implement the first production-grade AI evaluation pipeline.

Architecture:

Interview Answer
↓
Evaluation Job
↓
BullMQ
↓
LLM Worker
↓
LLM Provider Adapter
↓
Structured Evaluation
↓
Validation
↓
Database
↓
Realtime notification

Create an LLM provider interface.

Example conceptual interface:

ILLMProvider

Capabilities may include:

evaluateAnswer
generateFeedback
generateQuestion
summarizeSession

Do NOT couple business logic directly to one LLM vendor.

Create a provider adapter.

The provider can be configured through environment variables.

Evaluation should support structured results such as:

overall score
correctness
completeness
technical depth
structure
communication
strengths
weaknesses
missing concepts
improvement tips
confidence

Do not store only raw LLM text.

Store structured data.

Every evaluation should be traceable to:

provider
model
model version if available
prompt version
rubric version
evaluation version

This is required for future model changes and reproducibility.

Validate LLM output using strict schemas.

Reject malformed output.

Handle:

timeout
provider failure
malformed response
rate limit
retryable error
permanent error

Implement retry strategy through BullMQ where appropriate.

Avoid infinite retries.

Create:

llm.evaluate

job flow.

The API must not block waiting for a long LLM request.

Prepare WebSocket events for:

evaluation.started
evaluation.completed
evaluation.failed

Do not expose internal provider secrets.

Prepare AI usage tracking:

user
provider
model
input tokens if available
output tokens if available
latency
estimated cost
timestamp

Create tests for:

provider abstraction
successful evaluation
malformed AI response
provider failure
retry behavior
structured output validation
authorization

Use mocked providers for tests.

Do not make real paid AI calls during automated tests.

Run:

lint
type-check
tests
build

At the end report exactly what was implemented and what requires real API credentials.

Do not implement Python voice analysis yet.