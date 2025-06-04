# Evok: Minimal Event-Driven Workflow Framework

## Overview

Evok is a minimalist TypeScript library for building event-driven workflows using composable steps and declarative orchestration logic. It is designed to coordinate logic across tasks, AI agents, or microservices, while remaining unopinionated and easy to extend

## Goals

- Simplicity and composability
- Typed shared state
- Decoupled control flow using events
- Support for branching, parallel, and batch processing

## Core Concepts

### State

The workflow operates on a shared state object (store). You define its shape using TypeScript types:

```ts
interface State {
  data: {
    greeting?: string;
  };
}
```

> [!NOTE]
> You may use runtime schema validators like Zod if you want optional validation.

### WorkflowEvent

Steps emit events to signal transitions. Events contain a `type` and optional `payload`:

```ts
interface WorkflowEvent {
  type: string;
  payload?: Record<string, unknown>;
}
```

### Lifecycle Hooks

A shared interface for lifecycle callbacks used to trace or control execution stages:

```ts
interface LifecycleHooks<State> {
  onStart?: (state: State) => Promise<void>;
  onComplete?: (state: State) => Promise<void>;
  onError?: (error: unknown, state: State) => Promise<void>;
}
```

### Step

Each step performs a unit of work:

- Accepts a shared `state` and optional `params`
- Returns a new state and optionally emits events
- Stores static `params` configuration if needed

```ts
interface Step<State> extends LifecycleHooks<State> {
  id: string; // unique identifier for the step
  // main logic to run, returning new state and optional events
  run: (state: State) => Promise<{ state: State; events?: WorkflowEvent[] }>;
  params?: Record<string, unknown>; // optional static config per step
}
```

### Workflow

A workflow contains steps and orchestrates their execution via emitted events:

- A registry of steps by ID
- A starting step ID
- An optional global `onEvent` handler to determine routing based on emitted events
- Extends Step interface, making workflows composable as steps in other workflows

```ts
interface Workflow<State> extends Step<State> {
  steps: Record<string, Step<State>>; // map of step IDs to Step instances for fast lookup
  start: string; // ID of the starting step
  // receives events and can return an array of step IDs to activate next
  onEvent?: (event: WorkflowEvent, state: State) => Promise<string[]>;
}
```

### Event Bus

A basic event fan-out mechanism:

- Events are emitted by steps
- Event bus receives events and routes them to the workflow's `onEvent` handler

```ts
class EventBus {
  private listeners: ((event: WorkflowEvent) => void)[] = [];
  private logger: Logger = logManager.getLogger("Evok:EventBus");

  subscribe(listener: (event: WorkflowEvent) => void) {
    this.logger.trace("Subscribing listener", listener);
    this.listeners.push(listener);
  }

  emit(event: WorkflowEvent) {
    this.logger.trace("Emitting event", event);
    for (const listener of this.listeners) {
      listener(event);
    }
  }
}
```

This implementation is intentionally minimal and synchronous. It can be replaced with a more robust message broker or event queue (e.g. Kafka, NATS, Redis Streams) to support distributed processing, durability, and more complex routing scenarios.

### Execution Engine

- A runner starts from the `start` node
- Each node can emit events
- Events are routed via `graph.onEvent` to one or more next nodes
- Execution continues until there are no more active nodes to process

```ts
async function runWorkflow<State>(
  workflow: Workflow<State>,
  initialState: State,
): Promise<State> {
  let state = initialState;
  const activeStepIds: string[] = [workflow.start];
  const eventBus = new EventBus();
  const logger: Logger = logManager.getLogger(
    `Evok:runWorkflow:${workflow.id}`,
  );

  let isRunning = false;
  let shouldRunAgain = false;

  try {
    await workflow.onStart?.(state);
  } catch (err) {
    await workflow.onError?.(err, state);
    throw err;
  }

  // Queue step IDs based on events
  eventBus.subscribe(async (event: WorkflowEvent) => {
    logger.trace("Event received:", event);

    if (workflow.onEvent) {
      const nextIds = await workflow.onEvent(event, state);
      activeStepIds.push(...nextIds);
      if (isRunning) {
        shouldRunAgain = true;
      } else {
        runLoop(); // DO NOT await - fire-and-forget
      }
    }
  });

  async function runLoop() {
    if (isRunning) {
      shouldRunAgain = true;
      return;
    }

    isRunning = true;
    do {
      shouldRunAgain = false;
      while (activeStepIds.length > 0) {
        const currentStepId = activeStepIds.shift();
        if (!currentStepId) continue;
        const step = workflow.steps[currentStepId];
        try {
          await step.onStart?.(state);
          const result = await step.run(state);
          logger.trace("Step result:", result);
          state = result.state;
          await step.onComplete?.(state);

          if (result.events) {
            for (const event of result.events) {
              eventBus.emit(event);
            }
          }
        } catch (err) {
          await step.onError?.(err, state);
          await workflow.onError?.(err, state);
          throw err;
        }
      }
    } while (shouldRunAgain);
    isRunning = false;
    await workflow.onComplete?.(state);
  }

  await runLoop();
  return state;
}
```

## Capabilities

- **Sequential Execution**: by chaining events to the next step
- **Branching Logic**: using `onEvent` to route based on event types
- **Parallel Fan-Out**: one event may trigger multiple nodes
- **Batch & Loop Support**: implemented at the node level
- **Lifecycle Hooks**: `onStart`, `onComplete`, and `onError` for tracing and control

## Principles

- Keep steps stateless and pure where possible
- Let the workflow.onEvent orchestrate flow — steps should not know successors
- Events are the only way to move the workflow forward

### createWorkflow Helper

The `createWorkflow` function provides a convenient way to create workflows that can be used as composable steps:

```ts
export function createWorkflow<State>(
  config: Omit<Workflow<State>, "run">,
): Workflow<State>;
```

This function takes a workflow configuration (without the `run` method) and returns a complete workflow that implements the Step interface, making it composable within other workflows.

### Logging

Evok includes built-in logging functionality through the `logManager`:

```ts
import { setLogLevel } from "evok";

// Set log level to control verbosity
setLogLevel("trace"); // 'trace', 'debug', 'info', 'warn', 'error'
```

Logging is automatically enabled for:

- Event bus operations (subscribing, emitting)
- Workflow execution (event handling, step results)
- Step lifecycle events

The logger uses structured logging with contextual information to help with debugging and monitoring workflow execution.

## Future Extensions

- Event replay or durable queues
- Visual graph introspection

## Example Usage

```ts
// 1. Define State
interface State {
  data: {
    greeting?: string;
  };
}

// 2. Define Steps
const createGreetingStep: Step<State> = {
  id: "createGreeting",
  async run() {
    const greeting = "Hello, World!";
    return {
      state: { data: { greeting } },
      events: [{ type: "greeting:created", payload: greeting }],
    };
  },
  onStart: async () => console.log("Starting createGreetingStep"),
  onComplete: async () => console.log("Completed createGreetingStep"),
  onError: async (error) =>
    console.error("Error in createGreetingStep:", error),
};

const printGreetingStep: Step<State> = {
  id: "printGreeting",
  async run(state) {
    const prefix = this.params?.prefix || "";
    const postfix = this.params?.postfix || "";
    console.log(prefix, state.data.greeting, postfix);
    return { state };
  },
  params: { prefix: "🎉🎉🎉", postfix: "🎉🎉🎉" },
  onStart: async () => console.log("Starting printGreetingStep"),
  onComplete: async () => console.log("Completed printGreetingStep"),
  onError: async (error) => console.error("Error in printGreetingStep:", error),
};

// 3. Define Workflow
const helloFlow = createWorkflow<State>({
  id: "helloFlow",
  start: "createGreeting",
  steps: {
    createGreeting: createGreetingStep,
    printGreeting: printGreetingStep,
  },
  onEvent: async (event) => {
    if (event.type === "greeting:created") {
      return ["printGreeting"];
    }
    return [];
  },
  onStart: async () => console.log("Starting helloFlow"),
  onComplete: async () => console.log("Completed helloFlow"),
  onError: async (error) => console.error("Error in helloFlow:", error),
});

// 4. Execute
await helloFlow.run({ data: {} });
```

## Installation

### Installing from NPM (After Publishing)

Once published to NPM, the package can be installed using:

```bash
npm install @madooei/evok
```

### Local Development (Without Publishing to NPM)

There are three ways to use this package locally:

#### Option 1: Using npm link

1. Clone this repository, install dependencies, build the package, and create a global symlink:

   ```bash
   git clone <repository-url>
   cd evok/packages/evok
   # Install dependencies and build the package
   npm install
   npm run build
   # Create a global symlink
   npm link
   ```

   Note: You can unlink the package later using `npm unlink`.

2. In your other project where you want to use this package:

   ```bash
   npm link @madooei/evok
   ```

3. Import the package in your project:

   ```typescript
   import { createWorkflow, setLogLevel, type Step, type Workflow } from '@madooei/evok';
   ```

#### Option 2: Using local path

In your other project's `package.json`, add this package as a dependency using the local path:

```json
{
  "dependencies": {
    "@madooei/evok": "file:/path/to/evok"
  }
}
```

You can use absolute or relative paths with the `file:` protocol.

Then run `npm install` in your project.

Now you can import the package in your project as usual.

#### Option 3: Using a local tarball (npm pack)

1. Follow option 1 but instead of using `npm link`, create a tarball of the package:

   ```bash
   npm pack
   ```

   This will generate a file like `madooei-evok-1.0.0.tgz`. (Or whatever version you have.)
   You can find the tarball in the same directory as your `package.json`.

2. In your other project, install the tarball:

   ```bash
   npm install /absolute/path/to/evok/madooei-evok-1.0.0.tgz
   ```

   Or, if you copy the tarball into your project directory:

   ```bash
   npm install ./madooei-evok-1.0.0.tgz
   ```

This method installs the package exactly as it would be published to npm, making it ideal for final testing. After this installation, you must have the package in your `node_modules` directory, and you can import it as usual. You will also see the package in your `package.json` file as a dependency:

```json
{
  "dependencies": {
    "@madooei/evok": "file:madooei-evok-1.0.0.tgz"
  }
}
```
