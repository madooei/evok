# Demo 09: Dependency Management Recipe

## Purpose

This demo shows a practical recipe for implementing step dependencies using the `createDependentStep` helper, demonstrating how to ensure proper execution order in complex workflows through state-based dependency tracking.

## What It Demonstrates

- **Dependency enforcement** preventing steps from running prematurely
- **State-based tracking** using `_completed` Set for dependency management
- **Clear error messages** when dependencies aren't satisfied
- **Automatic completion tracking** marking steps as completed after success
- **Flexible dependency scenarios** showing both success and failure cases

## The Dependency Management Recipe

### State Requirements

The state must extend the dependency tracking interface:

```typescript
interface PipelineState {
  _completed: Set<string>; // Tracks completed step IDs
  // ... your application state
}
```

### Dependency Declaration

```typescript
createDependentStep(
  { id: "cleanData" },
  ["fetchRawData"], // Dependencies that must complete first
  async (state) => {
    /* step logic */
  },
);
```

### Execution Scenarios

The demo shows two scenarios:

1. **Dependencies satisfied** - Step executes successfully
2. **Dependencies missing** - Step fails with clear error message

## Key Benefits

- **Workflow integrity** preventing execution order violations
- **Clear error messages** making debugging dependency issues easy
- **Automatic tracking** reducing manual dependency management
- **Type safety** ensuring state includes dependency tracking
- **Flexible dependency lists** supporting multiple prerequisites

## Dependency Patterns

### Simple Linear Dependencies

```typescript
// Step B depends on Step A
createDependentStep(stepB, ["stepA"], stepBLogic);
```

### Multiple Prerequisites

```typescript
// Step C depends on both A and B
createDependentStep(stepC, ["stepA", "stepB"], stepCLogic);
```

### Complex Dependency Chains

```typescript
// Build complex workflows with clear dependency relationships
["init"] -> ["validate", "prepare"] -> ["process"] -> ["finalize"]
```

## When to Use This Recipe

- **Data pipeline workflows** where each stage depends on previous results
- **Setup/initialization sequences** requiring specific order
- **Validation chains** where each step validates previous outputs
- **Complex business processes** with regulatory or logical prerequisites
- **Multi-stage computations** where later stages need earlier results
- **Resource preparation workflows** ensuring prerequisites are ready

## Real-World Applications

- ETL (Extract, Transform, Load) data pipelines
- Application initialization and configuration
- Multi-step form processing with validation
- Database migration scripts with dependencies
- Build and deployment pipelines
- User onboarding workflows with prerequisites
- Document approval processes with required stages
- Testing workflows with setup/teardown dependencies

## Best Practices

- **Clear dependency naming** using descriptive step IDs
- **Minimal dependencies** only declaring truly necessary prerequisites
- **Early validation** checking dependencies as early as possible
- **Comprehensive error messages** helping developers understand missing dependencies
- **State management** properly maintaining the `_completed` Set
- **Testing scenarios** verifying both success and failure dependency cases

## Error Handling

When dependencies aren't met, the step throws a descriptive error:

```
Step cleanData dependencies not satisfied: fetchRawData
```

This makes it easy to identify which prerequisites are missing and debug workflow execution issues.

This recipe provides a solid foundation for building workflows where execution order matters and provides safety guarantees against premature step execution.
