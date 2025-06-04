import { type Step, type Workflow, createWorkflow } from "@/index";

export function createSequentialWorkflow<State>(
  id: string,
  steps: Step<State>[],
): Workflow<State> {
  const stepsRecord = steps.reduce(
    (acc, step) => {
      acc[step.id] = step;
      return acc;
    },
    {} as Record<string, Step<State>>,
  );

  return createWorkflow({
    id,
    steps: stepsRecord,
    start: steps[0].id,
    onEvent: async (event) => {
      // Simple sequential: each step triggers the next
      const currentIndex = steps.findIndex(
        (step) => event.type === `${step.id}:complete`,
      );
      if (currentIndex >= 0 && currentIndex < steps.length - 1) {
        return [steps[currentIndex + 1].id];
      }
      return [];
    },
  });
}
