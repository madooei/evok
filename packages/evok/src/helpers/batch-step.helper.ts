import { type Step } from "@/index";
import { logManager, type Logger } from "@/logger";

export function createBatchStep<State>(
  baseStep: Omit<Step<State>, "run">,
  config: {
    getItems: (state: State) => unknown[];
    processItem: (item: unknown, state: State) => Promise<unknown>;
    updateState: (state: State, results: unknown[], items: unknown[]) => State;
    batchSize: number;
  },
): Step<State> {
  const logger: Logger = logManager.getLogger(`Evok:BatchStep:${baseStep.id}`);

  return {
    ...baseStep,
    params: { ...baseStep.params, _batch: config },

    async run(state: State) {
      const { getItems, processItem, updateState, batchSize } = config;
      const items = getItems(state);
      const allResults: unknown[] = [];

      logger.info(
        `📦 Processing ${items.length} items in batches of ${batchSize}`,
      );

      for (let i = 0; i < items.length; i += batchSize) {
        const batch = items.slice(i, i + batchSize);
        logger.trace(
          `🔄 Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(items.length / batchSize)}`,
        );

        const batchResults = await Promise.all(
          batch.map((item) => processItem(item, state)),
        );

        allResults.push(...batchResults);
      }

      const newState = updateState(state, allResults, items);

      return {
        state: newState,
        events: [
          { type: "batch:completed", payload: { totalItems: items.length } },
        ],
      };
    },
  };
}
