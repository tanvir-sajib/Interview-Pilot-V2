# Architecture Overview

This document provides a high‑level view of the Interview Coach platform architecture, outlining the key modules, data flows, and technology choices. 

- **Monorepo Layout** – Central source repository containing all services, libraries, and tooling.
- **Backend** – NestJS monolith with clear module boundaries. 
- **Web** – Next.js SPA providing the user interface.
- **Mobile** – Flutter application for iOS/Android.
- **AI Service** – FastAPI micro‑service handling AI‑related logic.
- **Workers** – BullMQ-backed workers for background jobs.
- **Infrastructure** – Docker Compose definitions, Nginx reverse proxy.
- **Docs** – Further details in *api*, *database*, *ai* sub‑folders.
