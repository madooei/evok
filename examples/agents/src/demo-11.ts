import { createWorkflow, type Workflow, type WorkflowEvent } from "@madooei/evok";
import {
  createConditionalStep,
  createTimeoutStep,
  createDependentStep,
  createBatchStep,
} from "@madooei/evok/helpers";

// =============================================================================
// DEMO: Using helpers together
// =============================================================================

interface DemoState {
  _completed: Set<string>;
  users: Array<{ id: string; email: string; isPremium: boolean }>;
  premiumUsers?: Array<{ id: string; email: string }>;
  emailResults?: Array<{ id: string; sent: boolean }>;
  reportGenerated?: boolean;
}

// Combine multiple patterns
const workflow: Workflow<DemoState> = createWorkflow<DemoState>({
  id: "demoWorkflow",
  start: "filterPremiumUsers",
  steps: {
    filterPremiumUsers: createConditionalStep<DemoState>(
      { id: "filterPremiumUsers" },
      (state) => state.users.length > 0,
      async (state) => ({
        state: {
          ...state,
          premiumUsers: state.users.filter((u) => u.isPremium),
          _completed: new Set([...state._completed, "filterPremiumUsers"]),
        },
        events: [{ type: "premium:filtered" }],
      }),
    ),

    sendPremiumEmails: createDependentStep<DemoState>(
      { id: "sendPremiumEmails" },
      ["filterPremiumUsers"],
      createBatchStep<DemoState>(
        { id: "sendPremiumEmails" },
        {
          getItems: (state) => state.premiumUsers || [],
          processItem: async (item: unknown) => {
            const user = item as { id: string; email: string };
            await new Promise((resolve) => setTimeout(resolve, 50));
            return { id: user.id, sent: true };
          },
          updateState: (state, results) => ({
            ...state,
            emailResults: results as Array<{ id: string; sent: boolean }>,
          }),
          batchSize: 3,
        },
      ).run,
    ),

    generateReport: createTimeoutStep<DemoState>(
      { id: "generateReport" },
      async (state) => ({
        state: { ...state, reportGenerated: true },
        events: [{ type: "report:generated" }],
      }),
      5000,
    ),
  },

  onEvent: async (event: WorkflowEvent) => {
    switch (event.type) {
      case "premium:filtered":
        return ["sendPremiumEmails"];
      case "batch:completed":
        return ["generateReport"];
      default:
        return [];
    }
  },
});

// Run the demo
const initialState: DemoState = {
  _completed: new Set(),
  users: [
    { id: "1", email: "user1@test.com", isPremium: true },
    { id: "2", email: "user2@test.com", isPremium: false },
    { id: "3", email: "user3@test.com", isPremium: true },
  ],
};

const result = await workflow.run(initialState);
console.log("Final result:", result);
