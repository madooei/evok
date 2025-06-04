# Dependent Step Helper

## Purpose

The `createDependentStep` helper ensures steps only execute after their prerequisite steps have completed successfully. It enforces execution order and dependencies within workflows.

## When to Use

Use `createDependentStep` when you need:

- **Ordered execution**: Ensure critical steps complete before dependent ones
- **Data dependencies**: Steps that require outputs from previous steps
- **Resource preparation**: Steps that need setup or initialization first
- **Validation chains**: Each step validates the previous step's output
- **Complex workflows**: Multiple interconnected steps with dependencies
- **Safety guarantees**: Prevent steps from running with incomplete data

## Key Benefits

- **Dependency enforcement**: Automatic validation of prerequisite completion
- **Clear error messages**: Helpful feedback when dependencies aren't satisfied
- **State tracking**: Built-in completed steps tracking
- **Workflow integrity**: Prevents execution order issues
- **Type safety**: Ensures state includes dependency tracking

## Configuration Requirements

- **State type**: Must extend `{ _completed?: Set<string> }` for tracking
- **dependencies**: Array of step IDs that must complete first
- **stepLogic**: The actual step logic to execute after dependencies are met

## Important Notes

- Dependencies are tracked in `state._completed` Set
- Step automatically marks itself as completed after successful execution
- Throws clear errors when dependencies aren't satisfied
- Works best with workflows that properly maintain completion state

## Example Use Cases

- Database setup before data operations
- Authentication before protected operations
- File validation before processing
- Configuration loading before service initialization
- Multi-stage data transformations
- Sequential API calls with data dependencies

This helper is crucial for workflows where execution order matters and steps have clear prerequisites that must be satisfied.
