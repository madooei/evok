# Retryable Step Helper

## Purpose

The `createRetryableStep` helper adds automatic retry logic to workflow steps, enabling resilient handling of transient failures with configurable retry attempts and delays.

## When to Use

Use `createRetryableStep` when dealing with:

- **Network operations**: API calls, database connections, or external services
- **Transient failures**: Operations that might fail temporarily but succeed on retry
- **Unreliable resources**: External dependencies with occasional availability issues
- **File operations**: Disk I/O that might fail due to temporary locks or permissions
- **Third-party integrations**: Services with intermittent reliability
- **Resource contention**: Operations competing for limited resources

## Key Benefits

- **Automatic retry logic**: Handles retry attempts without manual implementation
- **Configurable parameters**: Customize max attempts and delay between retries
- **Comprehensive logging**: Track retry attempts and failure details
- **Exponential backoff support**: Can be combined with custom delay strategies
- **Failure transparency**: Clear error messages after all retries exhausted

## Configuration Options

- **maxAttempts**: Maximum number of retry attempts (default: 3)
- **delay**: Milliseconds to wait between attempts (default: 1000ms)
- **stepLogic**: The actual step logic that might need retrying

## Retry Behavior

- First attempt executes immediately
- Failed attempts wait the specified delay before retry
- All attempts are logged with attempt numbers
- Final failure includes details about all attempts
- Step succeeds as soon as any attempt succeeds

## Example Use Cases

- HTTP API calls to external services
- Database connection establishment
- File upload/download operations
- Email sending with SMTP servers
- Cloud service integrations
- Payment processing operations
- Data synchronization tasks

This helper is essential for building robust workflows that gracefully handle temporary failures and improve overall system reliability.
