import { createWorkflow, type Workflow } from "@madooei/evok";
import { createRetryableStep } from "@madooei/evok/helpers";

// =============================================================================
// Recipe 1: Simple Retry Example
// =============================================================================

interface ApiState {
  data?: { message: string };
  retryCount?: number;
}

const fetchDataWithRetry = createRetryableStep<ApiState>(
  { id: "fetchData" },
  async (state) => {
    // Simulate API call that might fail
    if (Math.random() < 0.7) {
      // 70% failure rate for demo
      throw new Error("API temporarily unavailable");
    }

    return {
      state: { ...state, data: { message: "Data fetched successfully!" } },
      events: [{ type: "data:fetched" }],
    };
  },
  { maxAttempts: 3, delay: 1000 },
);

const workflow: Workflow<ApiState> = createWorkflow<ApiState>({
  id: "fetchDataWorkflow",
  start: "fetchData",
  steps: {
    fetchData: fetchDataWithRetry,
  },
});

await workflow.run({});
