# Demo 00: Basic Hello World Workflow

## Purpose

This demo shows the fundamental structure of an Evok workflow with two sequential steps that demonstrate basic event-driven coordination and comprehensive logging.

## What It Demonstrates

- **Basic workflow setup** using `createWorkflow`
- **Sequential step execution** with event-based triggering
- **Step parameters** configuration and usage
- **Lifecycle hooks** for monitoring step execution
- **Comprehensive logging** at multiple levels (trace, info, error)
- **Event handling** for workflow orchestration

## Key Concepts Illustrated

### State Management

- Simple state structure with a greeting message
- State transformation between steps

### Event-Driven Flow

- First step emits `greeting:created` event
- Workflow's `onEvent` handler routes to next step
- Clean separation between step logic and flow control

### Logging Integration

- Multiple logger instances for different components
- Structured logging with trace, info, and error levels
- Lifecycle hook logging for debugging and monitoring

### Step Configuration

- Step parameters for customizable behavior (prefix/postfix)
- Lifecycle hooks (onStart, onComplete, onError) for each step

## Learning Value

This is the perfect starting point for understanding Evok workflows. It demonstrates all the core concepts without complexity, showing how steps coordinate through events rather than direct calls. The extensive logging helps you understand the execution flow and provides a template for debugging workflows.
