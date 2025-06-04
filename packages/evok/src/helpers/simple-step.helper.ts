import { type Step, type WorkflowEvent } from "@/index";

export function createSimpleStep<State>(
  id: string,
  runFn: (state: State) => Promise<State>,
  events?: WorkflowEvent[],
): Step<State> {
  return {
    id,
    async run(state) {
      const newState = await runFn(state);
      return {
        state: newState,
        events: events || [{ type: `${id}:complete`, payload: {} }],
      };
    },
  };
}
