# Simple Step Helper

## Purpose

The `createSimpleStep` helper creates a basic workflow step from a simple function. It's designed for straightforward operations where you just need to transform state without complex logic, dependencies, or error handling.

## When to Use

Use `createSimpleStep` when you have:

- **Simple transformations**: Operations that just modify the state and continue
- **Pure functions**: Logic that doesn't require complex error handling or retries
- **Quick prototyping**: When you want to rapidly create steps without boilerplate
- **Linear workflows**: Steps that always emit a completion event and move forward

## Key Benefits

- **Minimal boilerplate**: Just provide an ID and transformation function
- **Auto-completion events**: Automatically emits `{id}:complete` events
- **Custom events**: Optionally specify custom events to emit
- **Type safety**: Full TypeScript support for state transformations

## Example Use Cases

- Data transformation and validation
- Simple calculations or data enrichment
- API calls with straightforward responses
- File operations with predictable outcomes
- Setting default values or initializing state

This helper is perfect for the majority of workflow steps that don't need special behavior like retries, timeouts, or conditional execution.
