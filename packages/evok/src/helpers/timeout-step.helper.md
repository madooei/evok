# Timeout Step Helper

## Purpose

The `createTimeoutStep` helper adds time-based execution limits to workflow steps, preventing steps from running indefinitely and ensuring workflow responsiveness.

## When to Use

Use `createTimeoutStep` when you need to:

- **Prevent hanging operations**: Stop steps that might run indefinitely
- **Enforce SLA requirements**: Meet specific response time guarantees
- **Resource protection**: Prevent long-running operations from consuming resources
- **User experience**: Ensure responsive applications with predictable timing
- **External service calls**: Limit time spent waiting for third-party responses
- **Batch processing**: Control maximum processing time for individual items

## Key Benefits

- **Guaranteed termination**: Steps will never run longer than specified timeout
- **Clear timeout errors**: Descriptive error messages when timeouts occur
- **Configurable duration**: Set appropriate timeouts for different step types
- **Non-blocking design**: Uses Promise.race for efficient timeout handling
- **Comprehensive logging**: Track timeout durations and step execution

## Configuration Options

- **timeoutMs**: Maximum execution time in milliseconds (default: 30000ms)
- **stepLogic**: The actual step logic to execute with timeout protection

## Timeout Behavior

- Timer starts when step execution begins
- Step succeeds if it completes before timeout
- Timeout triggers immediate step failure with descriptive error
- Original step promise continues but result is ignored after timeout
- Logging shows both timeout duration and step execution status

## Example Use Cases

- API calls to external services
- Database queries with complex joins
- File processing operations
- Image or video processing
- Machine learning model inference
- Data export/import operations
- Network operations with unpredictable latency

## Best Practices

- Set timeouts based on expected operation duration plus buffer
- Consider combining with retry logic for better resilience
- Use shorter timeouts for user-facing operations
- Monitor timeout frequency to identify performance issues

This helper is crucial for maintaining workflow predictability and preventing resource exhaustion in production systems.
