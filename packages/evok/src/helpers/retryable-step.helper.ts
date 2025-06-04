import { type Step, type WorkflowEvent } from "@/index";
import { logManager, type Logger } from "@/logger";

export function createRetryableStep<State>(
  baseStep: Omit<Step<State>, "run">,
  stepLogic: (
    state: State,
  ) => Promise<{ state: State; events?: WorkflowEvent[] }>,
  retryConfig: { maxAttempts: number; delay: number } = {
    maxAttempts: 3,
    delay: 1000,
  },
): Step<State> {
  const logger: Logger = logManager.getLogger(
    `Evok:RetryableStep:${baseStep.id}`,
  );

  return {
    ...baseStep,
    params: { ...baseStep.params, _retry: retryConfig },

    async run(state: State) {
      const { maxAttempts, delay } = retryConfig;
      let lastError: unknown;

      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
          logger.info(
            `🔄 Attempt ${attempt}/${maxAttempts} for step ${this.id}`,
          );
          return await stepLogic(state);
        } catch (error) {
          lastError = error;
          logger.warn(`❌ Attempt ${attempt} failed:`, error);

          if (attempt < maxAttempts) {
            logger.info(`⏳ Waiting ${delay}ms before retry...`);
            await new Promise((resolve) => setTimeout(resolve, delay));
          }
        }
      }

      throw new Error(
        `Step ${this.id} failed after ${maxAttempts} attempts: ${lastError}`,
      );
    },
  };
}
