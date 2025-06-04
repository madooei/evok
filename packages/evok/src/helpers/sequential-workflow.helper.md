# Sequential Workflow Helper

## Purpose

The `createSequentialWorkflow` helper creates workflows where steps execute in a strict linear order, with each step automatically triggering the next one upon completion.

## When to Use

Use `createSequentialWorkflow` when you need:

- **Linear processing**: Steps that must execute one after another
- **Simple pipelines**: Straightforward data transformation chains
- **Ordered operations**: Steps with implicit dependencies on previous steps
- **Beginner-friendly workflows**: Easy-to-understand execution patterns
- **Data pipelines**: ETL processes with clear sequential stages
- **Setup/teardown sequences**: Initialization or cleanup operations

## Key Benefits

- **Simplified orchestration**: No need to manually define event routing
- **Automatic progression**: Each step automatically triggers the next
- **Clear execution order**: Steps execute in the exact order provided
- **Reduced complexity**: Eliminates complex event handling logic
- **Type safety**: Full TypeScript support for step definitions

## Configuration Requirements

- **id**: Unique identifier for the workflow
- **steps**: Array of steps in execution order
- **Automatic routing**: Uses step completion events to trigger next step

## Execution Flow

1. Workflow starts with the first step in the array
2. Each step emits a `{stepId}:complete` event when finished
3. Event handler automatically triggers the next step in sequence
4. Process continues until all steps complete
5. Workflow ends when the last step finishes

## Example Use Cases

- User onboarding workflows
- Document processing pipelines
- Data validation and transformation
- Application deployment sequences
- Backup and restore operations
- Report generation processes
- Multi-step form processing

## Limitations

- No parallel execution within the workflow
- No conditional branching or skipping
- All steps must complete for workflow to succeed
- No complex event routing or loops

This helper is perfect for straightforward workflows where the execution path is predictable and linear, making it ideal for common pipeline patterns.
