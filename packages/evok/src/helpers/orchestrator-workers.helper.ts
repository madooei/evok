import {
  type Step,
  type WorkflowEvent,
  type Workflow,
  createWorkflow,
} from "@/index";
import { logManager, type Logger } from "@/logger";

// =============================================================================
// Helpers: ORCHESTRATOR-WORKERS PATTERN
// =============================================================================

// Types for orchestrator-workers pattern
export interface WorkerTask<P = unknown> {
  id: string;
  type: string;
  description: string;
  payload: P;
  priority?: number;
}

export interface WorkerResult<R = unknown> {
  taskId: string;
  workerId: string;
  result: R;
  error?: string;
  completedAt: Date;
}

export interface OrchestratorState {
  // Core orchestrator tracking
  _orchestrator: {
    originalTask: string;
    pendingTasks: Array<WorkerTask<unknown>>; // Use unknown for generic storage
    activeTasks: Map<string, WorkerTask<unknown>>; // Use unknown for generic storage
    completedTasks: Array<WorkerResult<unknown>>; // Use unknown for generic storage
    workers: Map<string, "idle" | "busy">;
    maxConcurrentWorkers: number;
  };
  // User's custom state
  [key: string]: unknown;
}

// Configuration for creating orchestrator-workers workflow
export interface OrchestratorConfig<
  State extends OrchestratorState,
  MainTaskType = string,
  WorkerSpecificResult = unknown,
> {
  taskBreakdown: (
    mainTask: MainTaskType,
    state: State,
  ) => Promise<Array<WorkerTask<unknown>>>;

  workerFactory: (
    taskType: string,
  ) => (
    task: WorkerTask<unknown>,
    state: State,
  ) => Promise<WorkerSpecificResult>;

  synthesizeResults: (
    results: Array<WorkerResult<WorkerSpecificResult>>,
    state: State,
  ) => Promise<State>;

  maxConcurrentWorkers?: number;
  workerTimeout?: number;
}

// Factory function to create orchestrator-workers workflow
export function createOrchestratorWorkersWorkflow<
  State extends OrchestratorState,
  MainTaskType = string,
  WorkerSpecificResult = unknown,
>(
  config: OrchestratorConfig<State, MainTaskType, WorkerSpecificResult>,
): {
  orchestratorStep: Step<State>;
  workerStep: Step<State>;
  synthesizerStep: Step<State>;
  workflow: Workflow<State>;
} {
  const logger: Logger = logManager.getLogger("Evok:OrchestratorWorkers");

  // ORCHESTRATOR STEP: Breaks down main task
  const orchestratorStep: Step<State> = {
    id: "orchestrator",

    async run(state: State) {
      logger.info("🎯 Orchestrator: Analyzing main task...");

      const mainTask = state._orchestrator.originalTask as MainTaskType; // Assume originalTask is compatible
      const subtasks = await config.taskBreakdown(mainTask, state); // subtasks are Array<WorkerTask<unknown>>

      logger.info(
        `📋 Orchestrator: Broke down task into ${subtasks.length} subtasks`,
      );

      const newState: State = {
        ...state,
        _orchestrator: {
          ...state._orchestrator,
          pendingTasks: subtasks,
          activeTasks: new Map<string, WorkerTask<unknown>>(),
          completedTasks: [],
          workers: new Map(),
          maxConcurrentWorkers: config.maxConcurrentWorkers || 3,
        },
      };

      return {
        state: newState,
        events: [
          {
            type: "orchestrator:breakdown_complete",
            payload: { subtaskCount: subtasks.length },
          },
        ],
      };
    },
  };

  // WORKER STEP: Processes individual subtasks
  const workerStep: Step<State> = {
    id: "worker",

    async run(state: State) {
      const orchestrator = state._orchestrator;
      const availableWorkers =
        orchestrator.maxConcurrentWorkers - orchestrator.activeTasks.size;

      if (availableWorkers <= 0 || orchestrator.pendingTasks.length === 0) {
        logger.info("⏸️  Worker: No capacity or no pending tasks");
        return { state };
      }

      const tasksToProcess: Array<WorkerTask<unknown>> =
        orchestrator.pendingTasks.splice(
          0,
          Math.min(availableWorkers, orchestrator.pendingTasks.length),
        );

      logger.info(
        `👷 Worker: Processing ${tasksToProcess.length} tasks in parallel`,
      );

      const workerPromises = tasksToProcess.map(
        async (task: WorkerTask<unknown>, index) => {
          const workerId = `worker_${Date.now()}_${index}`;

          try {
            logger.trace(
              `🔄 Worker ${workerId}: Starting task ${task.id} (${task.type})`,
            );

            orchestrator.activeTasks.set(task.id, task);
            orchestrator.workers.set(workerId, "busy");

            const workerFn = config.workerFactory(task.type);

            let result: WorkerSpecificResult;
            if (config.workerTimeout) {
              const timeoutPromise = new Promise<never>((_, reject) => {
                setTimeout(
                  () =>
                    reject(
                      new Error(
                        `Worker timeout after ${config.workerTimeout}ms`,
                      ),
                    ),
                  config.workerTimeout,
                );
              });
              result = await Promise.race([
                workerFn(task, state), // task is WorkerTask<unknown>
                timeoutPromise,
              ]);
            } else {
              result = await workerFn(task, state); // task is WorkerTask<unknown>
            }

            logger.info(`✅ Worker ${workerId}: Completed task ${task.id}`);

            return {
              taskId: task.id,
              workerId,
              result, // result is WorkerSpecificResult
              completedAt: new Date(),
            } as WorkerResult<WorkerSpecificResult>;
          } catch (error) {
            logger.error(
              `❌ Worker ${workerId}: Failed task ${task.id}:`,
              error,
            );

            return {
              taskId: task.id,
              workerId,
              result: null as unknown as WorkerSpecificResult, // Ensure type compatibility for error cases
              error: error instanceof Error ? error.message : String(error),
              completedAt: new Date(),
            } as WorkerResult<WorkerSpecificResult>;
          } finally {
            orchestrator.activeTasks.delete(task.id);
            orchestrator.workers.set(workerId, "idle");
          }
        },
      );

      const results = (await Promise.all(workerPromises)) as Array<
        WorkerResult<WorkerSpecificResult>
      >; // Cast the array of results

      const newState: State = {
        ...state,
        _orchestrator: {
          ...orchestrator,
          completedTasks: [...orchestrator.completedTasks, ...results],
          pendingTasks: orchestrator.pendingTasks,
        },
      };

      const events: WorkflowEvent[] = [];
      if (orchestrator.pendingTasks.length > 0) {
        events.push({
          type: "worker:continue",
          payload: { remaining: orchestrator.pendingTasks.length },
        });
      }
      if (
        orchestrator.pendingTasks.length === 0 &&
        orchestrator.activeTasks.size === 0
      ) {
        events.push({
          type: "worker:all_complete",
          payload: {
            totalResults: newState._orchestrator.completedTasks.length,
          },
        });
      }

      return { state: newState, events };
    },
  };

  // SYNTHESIZER STEP: Combines all worker results
  const synthesizerStep: Step<State> = {
    id: "synthesizer",

    async run(state: State) {
      logger.info("🔄 Synthesizer: Combining all worker results...");

      const results = state._orchestrator.completedTasks as Array<
        WorkerResult<WorkerSpecificResult>
      >; // Cast for synthesizeResults
      const successfulResults = results.filter((r) => !r.error);
      const failedResults = results.filter((r) => r.error);

      logger.info(
        `📊 Synthesizer: ${successfulResults.length} successful, ${failedResults.length} failed`,
      );

      if (failedResults.length > 0) {
        logger.warn(
          "⚠️  Some tasks failed:",
          failedResults.map((r) => `${r.taskId}: ${r.error}`),
        );
      }

      const finalState = await config.synthesizeResults(results, state);

      return {
        state: finalState,
        events: [
          {
            type: "orchestrator:complete",
            payload: {
              totalTasks: results.length,
              successful: successfulResults.length,
              failed: failedResults.length,
            },
          },
        ],
      };
    },
  };

  // COMPLETE WORKFLOW
  const workflow: Workflow<State> = createWorkflow<State>({
    id: "orchestrator-workers",
    start: "orchestrator",
    steps: {
      orchestrator: orchestratorStep,
      worker: workerStep,
      synthesizer: synthesizerStep,
    },

    onEvent: async (event) => {
      switch (event.type) {
        case "orchestrator:breakdown_complete":
          return ["worker"];
        case "worker:continue":
          return ["worker"]; // Continue processing remaining tasks
        case "worker:all_complete":
          return ["synthesizer"];
        default:
          return [];
      }
    },
  });

  return {
    orchestratorStep,
    workerStep,
    synthesizerStep,
    workflow,
  };
}
