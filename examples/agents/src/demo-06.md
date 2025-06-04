# Demo 06: Retry Pattern Recipe

## Purpose

This demo shows a practical recipe for implementing reliable API calls using the `createRetryableStep` helper, demonstrating how to handle transient failures gracefully with automatic retry logic.

## What It Demonstrates

- **Automatic retry logic** for unreliable operations
- **Configurable retry parameters** (attempts and delays)
- **Realistic failure simulation** with probabilistic errors
- **Clean success/failure handling** with proper error messages
- **Helper function usage** for common resilience patterns

## The Retry Recipe

### Configuration

- **3 maximum attempts** balancing persistence with efficiency
- **1-second delay** between attempts allowing time for recovery
- **70% failure rate** in simulation to demonstrate retry behavior

### Error Handling

- Each failure is logged with attempt number
- Delays between retries allow transient issues to resolve
- Final failure includes comprehensive error information
- Success on any attempt immediately completes the operation

## Key Benefits

- **Improved reliability** for network and external service calls
- **Transparent error recovery** without manual intervention
- **Configurable behavior** for different failure scenarios
- **Clean API** that abstracts retry complexity
- **Comprehensive logging** for debugging and monitoring

## When to Use This Recipe

- **API calls to external services** that may be temporarily unavailable
- **Network operations** subject to intermittent connectivity issues
- **Database connections** that might fail due to connection pool limits
- **File operations** that could fail due to temporary locks
- **Any operation** where transient failures are expected and retry makes sense

## Configuration Guidelines

### Conservative Settings

- **2-3 attempts** for operations where failures are rare
- **Short delays (500-1000ms)** for fast recovery scenarios

### Aggressive Settings

- **5+ attempts** for critical operations that must succeed
- **Exponential backoff** for systems that might be overloaded

### Quick Fail Settings

- **1-2 attempts** for user-facing operations requiring fast response
- **Very short delays** to maintain responsiveness

## Real-World Applications

- Payment processing with banking APIs
- Email delivery through SMTP services
- Cloud storage upload/download operations
- Third-party service integrations
- Database operations during high load
- Microservice communication in distributed systems

This recipe provides a solid foundation for building resilient workflows that gracefully handle the inevitable transient failures in distributed systems.
