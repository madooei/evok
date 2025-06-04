# Demo 10: Timeout Control Recipe

## Purpose

This demo shows a practical recipe for implementing timeout controls using the `createTimeoutStep` helper, demonstrating how to prevent workflows from hanging indefinitely with variable processing times and proper timeout handling.

## What It Demonstrates

- **Timeout protection** preventing indefinite execution
- **Variable processing times** showing realistic scenarios
- **Multiple test scenarios** (fast, slow, empty data)
- **Clear timeout errors** with descriptive failure messages
- **Processing time calculation** based on data characteristics

## The Timeout Control Recipe

### Configuration

- **2-second timeout** balancing responsiveness with reasonable processing time
- **Variable processing times** based on data values (500ms per unit)
- **Three test scenarios** covering different timeout behaviors
- **Comprehensive error handling** for both timeouts and data issues

### Processing Logic

The demo simulates realistic processing where:

- Each data item takes `value * 500ms` to process
- Small values (1-2) process quickly within timeout
- Large values (5-10) exceed timeout and trigger failure
- Empty datasets are handled gracefully with immediate errors

### Timeout Scenarios

#### Scenario 1: Success (Fast Processing)

- Data: `[{id: "1", value: 1}, {id: "2", value: 2}, {id: "3", value: 1}]`
- Total time: ~2000ms (within 2-second timeout)
- Result: Successful completion

#### Scenario 2: Timeout (Slow Processing)

- Data: `[{id: "1", value: 5}, {id: "2", value: 8}, {id: "3", value: 10}]`
- Total time: ~11,500ms (exceeds 2-second timeout)
- Result: Timeout error

#### Scenario 3: Immediate Error (No Data)

- Data: `[]`
- Result: Immediate error before timeout consideration

## Key Benefits

- **Guaranteed termination** preventing resource exhaustion
- **Predictable response times** for user-facing operations
- **Resource protection** limiting execution time
- **Clear error messages** distinguishing timeouts from other failures
- **Flexible timeout values** configurable per operation type

## Timeout Configuration Guidelines

### User-Facing Operations (1-5 seconds)

- **Web API responses** requiring immediate feedback
- **Interactive features** where users expect quick responses
- **Real-time notifications** and updates

### Background Processing (30-300 seconds)

- **Data processing tasks** that can take longer
- **File operations** like uploads or transformations
- **External API calls** that may be slower

### Batch Operations (minutes to hours)

- **Large data imports** and exports
- **Comprehensive analysis tasks**
- **System maintenance operations**

## When to Use This Recipe

- **External API calls** that might hang or be very slow
- **File processing operations** with unpredictable sizes
- **Database queries** that could become expensive
- **User-facing operations** requiring guaranteed response times
- **Resource-intensive computations** that need bounds
- **Network operations** subject to connectivity issues

## Real-World Applications

- Web API endpoint handlers
- File upload and processing services
- Database migration scripts
- Image and video processing pipelines
- Machine learning model inference
- Report generation systems
- External service integrations
- Batch data processing jobs

## Best Practices

- **Appropriate timeout values** based on operation characteristics
- **User communication** about long-running operations
- **Graceful degradation** when timeouts occur
- **Monitoring and alerting** for frequent timeouts
- **Retry strategies** combined with timeout controls
- **Resource cleanup** after timeout failures

## Error Messages

The timeout error provides clear context:

```
Step processData timed out after 2000ms
```

This makes it easy to identify timeout issues and adjust configuration as needed.

This recipe provides essential protection against runaway operations while maintaining system responsiveness and resource efficiency.
