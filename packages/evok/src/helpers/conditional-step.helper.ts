import { type Step, type WorkflowEvent } from "@/index";
import { logManager, type Logger } from "@/logger";

export function createConditionalStep<State>(
  baseStep: Omit<Step<State>, "run">,
  condition: (state: State) => boolean,
  stepLogic: (
    state: State,
  ) => Promise<{ state: State; events?: WorkflowEvent[] }>,
  skipEvent?: WorkflowEvent,
): Step<State> {
  const logger: Logger = logManager.getLogger(
    `Evok:ConditionalStep:${baseStep.id}`,
  );
  return {
    ...baseStep,
    params: { ...baseStep.params, _conditional: true },

    async run(state: State) {
      if (!condition(state)) {
        logger.info(`⏭️  Skipping step ${this.id} - condition not met`);
        return {
          state,
          events: skipEvent
            ? [skipEvent]
            : [{ type: "step:skipped", payload: { stepId: this.id } }],
        };
      }

      logger.info(`✅ Condition met for step ${this.id} - executing`);
      return await stepLogic(state);
    },
  };
}
