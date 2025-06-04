import { createWorkflow, type Workflow } from "@madooei/evok";
import { createBatchStep } from "@madooei/evok/helpers";

// =============================================================================
// Recipe 2: Batch Processing Example
// =============================================================================

interface UserState {
  users: Array<{ id: string; email: string }>;
  emailResults: Array<{ id: string; sent: boolean; error?: string }>;
}

const sendEmailsInBatches = createBatchStep<UserState>(
  { id: "sendEmails" },
  {
    getItems: (state) => state.users,
    processItem: async (item: unknown) => {
      const user = item as { id: string; email: string };
      // Simulate email sending
      await new Promise((resolve) => setTimeout(resolve, 100));
      const success = Math.random() > 0.1; // 90% success rate
      return {
        id: user.id,
        sent: success,
        error: success ? undefined : "SMTP error",
      };
    },
    updateState: (state, results) => ({
      ...state,
      emailResults: results as Array<{
        id: string;
        sent: boolean;
        error?: string;
      }>,
    }),
    batchSize: 2,
  },
);

const workflow: Workflow<UserState> = createWorkflow<UserState>({
  id: "sendEmailsWorkflow",
  start: "sendEmails",
  steps: {
    sendEmails: sendEmailsInBatches,
  },
});

await workflow.run({
  users: [
    { id: "1", email: "user1@example.com" },
    { id: "2", email: "user2@example.com" },
    { id: "3", email: "user3@example.com" },
    { id: "4", email: "user4@example.com" },
    { id: "5", email: "user5@example.com" },
  ],
  emailResults: [],
});
