# Evok Helpers

This directory contains helper functions that extend Evok's core workflow capabilities with common patterns and behaviors. These helpers make it easier to build robust, scalable workflows without writing repetitive boilerplate code.

## Overview

Evok helpers fall into several categories:

### Basic Step Helpers

- **[simple-step.helper](./simple-step.helper.md)** - Create basic steps from simple transformation functions
- **[conditional-step.helper](./conditional-step.helper.md)** - Add conditional execution logic based on state
- **[dependent-step.helper](./dependent-step.helper.md)** - Enforce step dependencies and execution order

### Resilience Helpers

- **[retryable-step.helper](./retryable-step.helper.md)** - Add automatic retry logic for transient failures
- **[timeout-step.helper](./timeout-step.helper.md)** - Prevent steps from running indefinitely with timeouts

### Processing Helpers

- **[batch-step.helper](./batch-step.helper.md)** - Process collections in parallel batches with controlled concurrency

### Workflow Helpers

- **[sequential-workflow.helper](./sequential-workflow.helper.md)** - Create linear workflows with automatic step progression
- **[orchestrator-workers.helper](./orchestrator-workers.helper.md)** - Implement complex task decomposition and parallel processing patterns

## Design Philosophy

All helpers follow these principles:

- **Composable**: Helpers can be combined to create sophisticated step behaviors
- **Non-invasive**: They extend existing step definitions without changing core interfaces
- **Type-safe**: Full TypeScript support with proper type inference
- **Logging-enabled**: Built-in structured logging for debugging and monitoring
- **Configuration-driven**: Flexible configuration options for different use cases

## Usage Patterns

### Single Helper Usage

```ts
const step = createRetryableStep(baseStep, stepLogic, {
  maxAttempts: 5,
  delay: 2000,
});
```

### Combining Helpers

```ts
const resilientStep = createTimeoutStep(
  createRetryableStep(baseStep, stepLogic, { maxAttempts: 3, delay: 1000 }),
  actualStepLogic,
  30000, // 30 second timeout
);
```

### Workflow Composition

```ts
const pipeline = createSequentialWorkflow("data-pipeline", [
  createSimpleStep("validate", validateData),
  createBatchStep(baseStep, batchConfig),
  createConditionalStep(baseStep, condition, processLogic),
]);
```

## Helper Selection Guide

| Need                  | Helper                              | Use Case                   |
| --------------------- | ----------------------------------- | -------------------------- |
| Simple transformation | `createSimpleStep`                  | Basic data processing      |
| Conditional logic     | `createConditionalStep`             | Branching workflows        |
| Retry failures        | `createRetryableStep`               | Network/external calls     |
| Time limits           | `createTimeoutStep`                 | Prevent hanging operations |
| Process collections   | `createBatchStep`                   | Bulk operations            |
| Enforce order         | `createDependentStep`               | Complex dependencies       |
| Linear flow           | `createSequentialWorkflow`          | Simple pipelines           |
| Parallel processing   | `createOrchestratorWorkersWorkflow` | Complex decomposition      |

## Getting Started

1. Start with `createSimpleStep` for basic operations
2. Add resilience with `createRetryableStep` and `createTimeoutStep`
3. Use `createSequentialWorkflow` for linear processes
4. Scale up to `createOrchestratorWorkersWorkflow` for complex parallel work

Each helper is designed to be intuitive and well-documented, making it easy to build sophisticated workflows incrementally.
