import { createWorkflow, type Workflow } from "@madooei/evok";
import { createConditionalStep } from "@madooei/evok/helpers";

// =============================================================================
// Recipe 3: Conditional Processing Example
// =============================================================================

interface OrderState {
  order: { total: number; isPremium: boolean };
  discountApplied?: boolean;
  finalTotal?: number;
}

const applyPremiumDiscount = createConditionalStep<OrderState>(
  { id: "applyDiscount" },
  (state) => state.order.isPremium && state.order.total > 100,
  async (state) => {
    const discount = state.order.total * 0.1; // 10% discount
    const finalTotal = state.order.total - discount;

    return {
      state: {
        ...state,
        discountApplied: true,
        finalTotal,
      },
      events: [{ type: "discount:applied", payload: { discount, finalTotal } }],
    };
  },
  { type: "discount:skipped", payload: { reason: "Not eligible" } },
);

const workflow: Workflow<OrderState> = createWorkflow<OrderState>({
  id: "orderWorkflow",
  start: "applyDiscount",
  steps: {
    applyDiscount: applyPremiumDiscount,
  },
});

await workflow.run({
  order: { total: 150, isPremium: true },
});
