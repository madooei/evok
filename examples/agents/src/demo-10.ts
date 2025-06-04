import { createWorkflow, type Workflow } from "@madooei/evok";
import { createTimeoutStep } from "@madooei/evok/helpers";

// =============================================================================
// Recipe 4: Dependency Pattern (using state tracking)
// =============================================================================

interface TimeoutState {
  data?: Array<{ id: string; value: number }>;
  processedData?: Array<{ id: string; value: number; processed: boolean }>;
  timeoutOccurred?: boolean;
  error?: string;
}

// Combine multiple patterns
const timeoutStep = createTimeoutStep<TimeoutState>(
  { id: "processData" },
  async (state) => {
    if (!state.data?.length) {
      return {
        state: { ...state, error: "No data to process" },
        events: [{ type: "error:no_data" }],
      };
    }

    console.log(`Processing ${state.data.length} items...`);
    const processedData: Array<{
      id: string;
      value: number;
      processed: boolean;
    }> = [];

    for (const item of state.data) {
      // Simulate processing time that varies with the value
      const processingTime = item.value * 500; // 500ms per unit of value
      console.log(
        `Processing item ${item.id} (will take ${processingTime}ms)...`,
      );

      await new Promise((resolve) => setTimeout(resolve, processingTime));
      processedData.push({ ...item, processed: true });
    }

    return {
      state: { ...state, processedData },
      events: [
        { type: "data:processed", payload: { count: processedData.length } },
      ],
    };
  },
  2000, // timeout after 2 seconds
);

const workflow: Workflow<TimeoutState> = createWorkflow<TimeoutState>({
  id: "timeoutWorkflow",
  start: "processData",
  steps: {
    processData: timeoutStep,
  },
  onEvent: async (event) => {
    if (event.type === "error:timeout") {
      console.log("⚠️ Processing timed out - some items may be incomplete");
    }
    return [];
  },
});

// Run with different data scenarios
console.log("\nScenario 1: Small dataset (should complete)");
await workflow.run({
  data: [
    { id: "1", value: 1 },
    { id: "2", value: 2 },
    { id: "3", value: 1 },
  ],
});

console.log("\nScenario 2: Large dataset (should timeout)");
await workflow.run({
  data: [
    { id: "1", value: 5 },
    { id: "2", value: 8 },
    { id: "3", value: 10 },
  ],
});

console.log("\nScenario 3: Empty dataset");
await workflow.run({
  data: [],
});
