import {
  createOrchestratorWorkersWorkflow,
  type OrchestratorState,
  type WorkerTask,
} from "@madooei/evok/helpers";

// =============================================================================
// PATTERN 5: Orchestrator-Workers
// DEMO 2: E-commerce Order Fulfillment
// =============================================================================

// =============================================================================
// In the orchestrator-workers workflow, a central LLM dynamically breaks down
// tasks, delegates them to worker LLMs, and synthesizes their results.
//
// This is well-suited for complex tasks where subtasks can't be predicted in
// advance.
// =============================================================================

interface OrderFulfillmentPayload {
  item?: { sku: string; quantity: number };
  order?: {
    id: string;
    items: Array<{ sku: string; quantity: number }>;
    shippingAddress: string;
    priority: string;
  };
}

interface OrderFulfillmentState extends OrchestratorState {
  order: {
    id: string;
    items: Array<{ sku: string; quantity: number; warehouse?: string }>;
    shippingAddress: string;
    priority: "standard" | "express";
  };
  fulfillmentResults?: {
    inventoryChecks: InventoryResult[];
    reservations: InventoryResult[];
    pickingTasks: Array<{ sku: string; picked: boolean; location: string }>;
    packingResult?: PackingResult;
    shippingLabel?: ShippingResult;
  };
}

// Define specific result types for each worker
interface InventoryResult {
  sku: string;
  available: boolean;
  warehouse: string | null;
  reserved?: boolean;
  reservationId?: string;
}

interface PackingResult {
  packageId: string;
  weight: number;
  dimensions: string;
}

interface ShippingResult {
  trackingNumber: string;
  carrier: string;
  estimatedDelivery: string;
}

type WorkerSpecificResult = InventoryResult | PackingResult | ShippingResult;

const { workflow } = createOrchestratorWorkersWorkflow<
  OrderFulfillmentState,
  string,
  WorkerSpecificResult
>({
  // Orchestrator: Break order into fulfillment tasks
  taskBreakdown: async (mainTask, state) => {
    const tasks: WorkerTask[] = [];

    // Create inventory check tasks for each item
    for (const item of state.order.items) {
      tasks.push({
        id: `inventory_${item.sku}`,
        type: "check_inventory",
        description: `Check inventory for ${item.sku}`,
        payload: { item },
        priority: 1,
      });
    }

    // Create a packing task (depends on all items being available)
    tasks.push({
      id: `pack_order_${state.order.id}`,
      type: "pack_order",
      description: `Pack order ${state.order.id}`,
      payload: { order: state.order },
      priority: 2,
    });

    // Create shipping task
    tasks.push({
      id: `ship_order_${state.order.id}`,
      type: "create_shipping_label",
      description: `Create shipping label for order ${state.order.id}`,
      payload: { order: state.order },
      priority: 3,
    });

    return tasks;
  },

  // Worker factory for different fulfillment operations
  workerFactory: (taskType) => {
    switch (taskType) {
      case "check_inventory":
        return async (task: WorkerTask) => {
          await new Promise((resolve) => setTimeout(resolve, 100));
          const item = (task.payload as OrderFulfillmentPayload).item!;
          const available = Math.random() > 0.1; // 90% availability
          const warehouse = ["WH_EAST", "WH_WEST", "WH_CENTRAL"][
            Math.floor(Math.random() * 3)
          ];

          console.log(
            `  📦 Inventory check: ${item.sku} = ${available ? "AVAILABLE" : "OUT OF STOCK"} at ${warehouse}`,
          );

          if (available) {
            // Also reserve the item
            console.log(
              `  🔒 Reserving ${item.quantity}x ${item.sku} at ${warehouse}`,
            );
            return {
              sku: item.sku,
              available: true,
              warehouse,
              reserved: true,
              reservationId: `RES_${Date.now()}_${item.sku}`,
            };
          }

          return { sku: item.sku, available: false, warehouse: null };
        };

      case "pack_order":
        return async (task: WorkerTask) => {
          await new Promise((resolve) => setTimeout(resolve, 500)); // Packing takes longer
          const order = (task.payload as OrderFulfillmentPayload).order!;

          console.log(`  📦 Packing order ${order.id}...`);

          return {
            packageId: `PKG_${Date.now()}`,
            weight: Math.random() * 5 + 0.5, // 0.5-5.5 kg
            dimensions: "30x20x15cm",
          };
        };

      case "create_shipping_label":
        return async (task: WorkerTask) => {
          await new Promise((resolve) => setTimeout(resolve, 200));
          const order = (task.payload as OrderFulfillmentPayload).order!;
          const carriers = ["UPS", "FedEx", "DHL"];
          const carrier = carriers[Math.floor(Math.random() * carriers.length)];

          console.log(`  🚚 Creating shipping label with ${carrier}...`);

          const deliveryDays = order.priority === "express" ? 1 : 3;
          const estimatedDelivery = new Date();
          estimatedDelivery.setDate(estimatedDelivery.getDate() + deliveryDays);

          return {
            trackingNumber: `${carrier}_${Date.now()}`,
            carrier,
            estimatedDelivery: estimatedDelivery.toDateString(),
          };
        };

      default:
        throw new Error(`Unknown task type: ${taskType}`);
    }
  },

  // Synthesizer: Combine fulfillment results
  synthesizeResults: async (results, state) => {
    const inventoryChecks: InventoryResult[] = [];
    const reservations: InventoryResult[] = [];
    let packingResult: PackingResult | undefined = undefined;
    let shippingLabel: ShippingResult | undefined = undefined;

    for (const result of results) {
      if (result.error) {
        console.error(`❌ Task ${result.taskId} failed: ${result.error}`);
        continue;
      }

      const data = result.result;

      if (result.taskId.startsWith("inventory_")) {
        inventoryChecks.push(data as InventoryResult);
        if ((data as InventoryResult).reserved) {
          reservations.push(data as InventoryResult);
        }
      } else if (result.taskId.startsWith("pack_order_")) {
        packingResult = data as PackingResult;
      } else if (result.taskId.startsWith("ship_order_")) {
        shippingLabel = data as ShippingResult;
      }
    }

    return {
      ...state,
      fulfillmentResults: {
        inventoryChecks,
        reservations,
        pickingTasks: [], // Would be generated from reservations
        packingResult,
        shippingLabel,
      },
    };
  },

  maxConcurrentWorkers: 5,
  workerTimeout: 10000,
});

// Initial state
const initialState: OrderFulfillmentState = {
  _orchestrator: {
    originalTask: "Fulfill customer order",
    pendingTasks: [],
    activeTasks: new Map(),
    completedTasks: [],
    workers: new Map(),
    maxConcurrentWorkers: 5,
  },
  order: {
    id: "ORD_123456",
    items: [
      { sku: "LAPTOP_001", quantity: 1 },
      { sku: "MOUSE_002", quantity: 2 },
      { sku: "KEYBOARD_003", quantity: 1 },
    ],
    shippingAddress: "123 Main St, Anytown, USA",
    priority: "express",
  },
};

// Execute the workflow
const result = await workflow.run(initialState);

console.log("\n✅ ORDER FULFILLMENT COMPLETE!");
console.log("\n📋 FULFILLMENT SUMMARY:");
console.log(
  "Inventory Status:",
  result.state.fulfillmentResults?.inventoryChecks,
);
console.log("Reservations:", result.state.fulfillmentResults?.reservations);
console.log("Package Info:", result.state.fulfillmentResults?.packingResult);
console.log(
  "Shipping Details:",
  result.state.fulfillmentResults?.shippingLabel,
);
