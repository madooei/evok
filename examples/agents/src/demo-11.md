# Demo 11: Combining Multiple Helpers

## Purpose

This demo shows how to combine multiple Evok helpers to create sophisticated workflows that leverage conditional logic, dependency management, batch processing, and timeout controls together in a single cohesive system.

## What It Demonstrates

- **Helper composition** using multiple patterns in one workflow
- **Complex step coordination** with dependencies and conditional logic
- **Nested helper usage** showing how helpers can wrap other helpers
- **Event-driven orchestration** coordinating different helper types
- **Real-world complexity** simulating premium user email campaigns

## The Combined Pattern Architecture

### Step 1: Conditional Filtering (`createConditionalStep`)

- **Condition**: Only proceed if users exist in the system
- **Logic**: Filter users to find premium customers
- **Dependency tracking**: Marks itself as completed for downstream steps

### Step 2: Dependent Batch Processing

```typescript
createDependentStep(
  { id: "sendPremiumEmails" },
  ["filterPremiumUsers"], // Dependency on filtering
  createBatchStep(...).run // Nested batch processing
)
```

### Step 3: Timeout-Protected Reporting (`createTimeoutStep`)

- **Timeout**: 5-second limit for report generation
- **Logic**: Generate final campaign report
- **Protection**: Prevents indefinite reporting operations

## Helper Composition Benefits

- **Layered functionality** where each helper adds specific capabilities
- **Reusable patterns** that can be combined in different ways
- **Clear separation of concerns** with each helper handling one aspect
- **Composable reliability** where reliability features stack
- **Type safety** maintained across helper combinations

## Event Flow Coordination

```
premium:filtered -> sendPremiumEmails -> batch:completed -> generateReport
```

The workflow uses different event types to coordinate between helper types:

- **Conditional events** from filtering logic
- **Batch events** from processing completion
- **Final events** from report generation

## Key Design Patterns

### Nested Helper Composition

```typescript
createDependentStep(
  baseStep,
  dependencies,
  createBatchStep(config).run, // Nest batch logic inside dependency
);
```

### Event-Based Coordination

Different helpers emit different event types, allowing fine-grained workflow control based on which helper completed.

### State Management

Each helper properly maintains state while adding its own concerns:

- **Conditional**: Adds filtered data
- **Dependent**: Tracks completion status
- **Batch**: Adds processing results
- **Timeout**: Preserves state with time bounds

## When to Use Combined Helpers

- **Complex business workflows** requiring multiple reliability patterns
- **Production systems** where multiple failure modes need handling
- **User-facing features** requiring conditional logic and performance guarantees
- **Data processing pipelines** with dependencies and batch requirements
- **Campaign systems** with eligibility, processing, and reporting phases

## Real-World Applications

- **Marketing automation** with user segmentation, batch sending, and reporting
- **Order processing** with validation, fulfillment, and notification
- **Content moderation** with filtering, batch analysis, and decision reporting
- **Data migration** with validation, batch processing, and completion tracking
- **User onboarding** with conditional steps, dependency tracking, and timeout protection

## Best Practices for Helper Composition

### Start Simple

- Begin with individual helpers
- Add complexity gradually
- Test each layer independently

### Clear Event Naming

- Use descriptive event types
- Distinguish between helper-specific events
- Maintain event payload consistency

### State Design

- Plan state structure to support all helpers
- Use clear property naming
- Maintain immutability where possible

### Error Handling

- Each helper handles its own error scenarios
- Composed helpers inherit error handling from all layers
- Plan for cascading failure scenarios

## Testing Strategy

Test helper combinations by:

- **Unit testing** individual helpers in isolation
- **Integration testing** helper combinations
- **Scenario testing** different data and condition combinations
- **Failure testing** error conditions at each helper layer

This demo shows that Evok helpers are designed to compose naturally, allowing you to build sophisticated, reliable workflows by combining simple, focused building blocks.
