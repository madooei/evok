import { type Step, type WorkflowEvent } from "@/index";
import { logManager, type Logger } from "@/logger";

export function createDependentStep<State extends { _completed?: Set<string> }>(
  baseStep: Omit<Step<State>, "run">,
  dependencies: string[],
  stepLogic: (
    state: State,
  ) => Promise<{ state: State; events?: WorkflowEvent[] }>,
): Step<State> {
  const logger: Logger = logManager.getLogger(
    `Evok:DependentStep:${baseStep.id}`,
  );

  return {
    ...baseStep,
    params: { ...baseStep.params, _dependencies: dependencies },

    async run(state: State) {
      // Simple check: look for completed steps in state
      const completedSteps = state._completed || new Set<string>();

      const unsatisfiedDeps = dependencies.filter(
        (dep) => !completedSteps.has?.(dep),
      );

      if (unsatisfiedDeps.length > 0) {
        throw new Error(
          `Step ${this.id} dependencies not satisfied: ${unsatisfiedDeps.join(", ")}`,
        );
      }

      logger.info(`✅ All dependencies satisfied for step ${this.id}`);
      const result = await stepLogic(state);

      // Mark this step as completed
      if (completedSteps.add) {
        completedSteps.add(this.id);
      }

      return result;
    },
  };
}
