import { logManager, type Logger } from "@/logger";

export interface WorkflowEvent {
  type: string;
  payload?: Record<string, unknown>;
}

export interface LifecycleHooks<State> {
  onStart?: (state: State) => Promise<void>;
  onComplete?: (state: State) => Promise<void>;
  onError?: (error: unknown, state: State) => Promise<void>;
}

export interface Step<State> extends LifecycleHooks<State> {
  id: string; // unique identifier for the step
  run: (state: State) => Promise<{ state: State; events?: WorkflowEvent[] }>;
  params?: Record<string, unknown>; // optional static config per step
}

export interface Workflow<State> extends Step<State> {
  steps: Record<string, Step<State>>; // map of step IDs to Step instances for fast lookup
  start: string; // ID of the starting step
  // receives events and can return an array of step IDs to activate next
  onEvent?: (event: WorkflowEvent, state: State) => Promise<string[]>;
}

export class EventBus {
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

  // Queue node IDs based on events
  eventBus.subscribe(async (event: WorkflowEvent) => {
    logger.trace("Event received:", event);

    if (workflow.onEvent) {
      const nextIds = await workflow.onEvent(event, state);
      activeStepIds.push(...nextIds);
      if (isRunning) {
        shouldRunAgain = true;
      } else {
        // @eslint-ignore
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

export function createWorkflow<State>(
  config: Omit<Workflow<State>, "run">,
): Workflow<State> {
  return {
    id: config.id,
    steps: config.steps,
    start: config.start,
    onEvent: config.onEvent,
    params: config.params,
    onStart: config.onStart,
    onComplete: config.onComplete,
    onError: config.onError,

    // Implementation of Step.run() - this is where the magic happens
    async run(
      state: State,
    ): Promise<{ state: State; events?: WorkflowEvent[] }> {
      return await runWorkflow(this, state).then((finalState) => ({
        state: finalState,
      }));
    },
  };
}

export { setLogLevel } from "@/logger";
