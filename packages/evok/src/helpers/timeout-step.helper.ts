import { type Step, type WorkflowEvent } from "@/index";
import { logManager, type Logger } from "@/logger";

export function createTimeoutStep<State>(
  baseStep: Omit<Step<State>, "run">,
  stepLogic: (
    state: State,
  ) => Promise<{ state: State; events?: WorkflowEvent[] }>,
  timeoutMs: number = 30000,
): Step<State> {
  const logger: Logger = logManager.getLogger(
    `Evok:TimeoutStep:${baseStep.id}`,
  );

  return {
    ...baseStep,
    params: { ...baseStep.params, _timeout: timeoutMs },

    async run(state: State) {
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(
          () =>
            reject(new Error(`Step ${this.id} timed out after ${timeoutMs}ms`)),
          timeoutMs,
        );
      });

      logger.info(`⏰ Running step ${this.id} with ${timeoutMs}ms timeout`);
      return await Promise.race([stepLogic(state), timeoutPromise]);
    },
  };
}
