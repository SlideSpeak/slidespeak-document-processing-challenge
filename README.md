# AI Presentation Analyzer - Coding Challenge

## Overview

Build a high-performance document processing service that analyzes documents using AI, handles concurrency efficiently, and provides real-time progress updates to clients. This service will form a critical component of our AI presentation generation platform.

## Core Requirements

Your service should:

1. **Process Multiple Documents Concurrently**

   - Handle multiple document uploads simultaneously
   - Process larger documents in parallel chunks
   - Maintain responsiveness during heavy processing

2. **Integrate with Mock AI Services**

   - Use the provided mock AI services for text extraction and analysis
   - Handle the unpredictable response times of these services
   - Deal with occasional failures from these services

3. **Provide Real-time Updates**

   - Implement WebSocket connections for live progress reporting
   - Maintain connection stability during long-running processes
   - Ensure updates are delivered in correct order

4. **Implement Resource Management**

   - Create a task queue for managing document processing
   - Implement rate limiting to avoid overwhelming the system
   - Add prioritization for different document types or sizes

5. **Handle Errors and Recovery**
   - Implement retry logic for failed AI service calls
   - Resume partial processing after failures
   - Properly report errors to clients

## Technical Constraints

- Use FastAPI as your web framework
- Use best practices around threading, async, parallel processing
- Your solution must handle at least 10 simultaneous document uploads
- Processing should be resilient to intermittent AI service failures

## Provided Components

We provide:

- Mock AI services with realistic latency and occasional failures
- Basic API schemas
- Tests for evaluating your implementation

You are **not** given:

- Implementation of the document processing pipeline
- WebSocket handling logic
- Task queuing or rate limiting implementation
- Error recovery mechanisms

## Getting Started

The repository contains:

- `backend/app/services/ai_service.py` - The mock AI services (do not modify)
- `backend/app/models/schemas.py` - Data models
- `backend/tests/` - Test cases for your implementation

There are intentionally no implementation files for the document processor, task queue, or WebSocket handlers. You will need to design and implement these components based on the requirements.

```bash
# Install dependencies
pip install -r requirements.txt

# Run tests
pytest

# Start the server when ready
uvicorn app.main:app --reload
```

## Very nice-to-have Goals

If you complete the core requirements:

- Implement document caching to avoid reprocessing
- Add a dashboard for monitoring system performance
- Create an admin API for managing a task queue
