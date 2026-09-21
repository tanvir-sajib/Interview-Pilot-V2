
Continue from the existing system.

FIRST inspect all existing backend, queue, storage and AI code.

Implement the voice-interview processing pipeline and Python AI service.

Create or improve:

apps/ai-service/

Use:

Python
FastAPI
Pydantic

Keep this service focused on AI/audio/data intelligence.

Do NOT move normal CRUD/business backend logic from NestJS into Python.

Flow:

Flutter/Web
↓
Audio upload
↓
Object storage
↓
STT job
↓
Speech-to-text provider
↓
Transcript
↓
LLM evaluation
↓
Python delivery analysis
↓
Evaluation aggregation

Audio files must NOT be stored directly inside PostgreSQL.

Use S3-compatible object storage abstraction.

Prepare:

IStorageProvider

Use signed upload/download URLs where appropriate.

Create:

ISTTProvider

Keep the STT provider replaceable.

Support Whisper/provider adapter architecture.

Do not hard-code one provider throughout the application.

Python service should be prepared to calculate metrics such as:

speech duration
speaking rate
pause duration
long pauses
filler frequency
speech consistency

Keep the implementation modular.

Future support should be possible for:

pitch
energy
pronunciation
prosody
advanced speech features

Do not fake metrics.

If a metric cannot be reliably calculated yet, explicitly represent that limitation.

Prepare jobs:

stt.process
delivery.analyze

Workers must be retry-safe and idempotent where possible.

Implement:

file type validation
size validation
signed URLs
safe filenames
upload authorization
access control

Test:

audio upload authorization
storage abstraction
STT provider abstraction
queue behavior
Python API validation
delivery metric calculation where deterministic
failure handling

Run all relevant:

TypeScript lint
TypeScript type-check
backend tests
Python tests
builds

At the end report:

Python service architecture
endpoints
workers
storage design
audio pipeline
limitations
verification results

Do not implement subscription/payment yet.