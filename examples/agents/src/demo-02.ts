import { createWorkflow, type Step, type Workflow } from "@madooei/evok";

// =============================================================================
// PATTERN 2: ROUTING
// DEMO: Routing based on query type
// =============================================================================

// =============================================================================
// Routing involves an initial LLM call that decides which model or call should
// be used next (sending easy tasks to Haiku and harder tasks to Sonnet, for
// example).
//
// This allows for dynamic decision-making about which processing path to follow.
// =============================================================================

interface RoutingState {
  userQuery?: string;
  queryType?: "simple" | "complex" | "technical";
  response?: string;
}

const classifyQueryStep: Step<RoutingState> = {
  id: "classifyQuery",
  async run(state) {
    const userQuery = "What is the capital of France?";

    console.log("🔍 Classifying query:", userQuery);
    await new Promise((resolve) => setTimeout(resolve, 300));

    // Simulate classification logic
    const queryType: "simple" | "complex" | "technical" = "simple";

    return {
      state: { ...state, userQuery, queryType },
      events: [{ type: "query:classified", payload: { queryType, userQuery } }],
    };
  },
};

const simpleResponseStep: Step<RoutingState> = {
  id: "simpleResponse",
  async run(state) {
    console.log("💡 Using simple model for quick response...");
    await new Promise((resolve) => setTimeout(resolve, 200));

    const response = "The capital of France is Paris.";

    return {
      state: { ...state, response },
      events: [{ type: "response:generated" }],
    };
  },
};

const complexResponseStep: Step<RoutingState> = {
  id: "complexResponse",
  async run(state) {
    console.log("🧠 Using advanced model for complex query...");
    await new Promise((resolve) => setTimeout(resolve, 800));

    const response =
      "This is a complex analysis requiring advanced reasoning...";

    return {
      state: { ...state, response },
      events: [{ type: "response:generated" }],
    };
  },
};

const technicalResponseStep: Step<RoutingState> = {
  id: "technicalResponse",
  async run(state) {
    console.log("⚙️ Using specialized technical model...");
    await new Promise((resolve) => setTimeout(resolve, 600));

    const response =
      "Technical analysis with code examples and documentation...";

    return {
      state: { ...state, response },
      events: [{ type: "response:generated" }],
    };
  },
};

const routingWorkflow: Workflow<RoutingState> = createWorkflow<RoutingState>({
  id: "routing",
  start: "classifyQuery",
  steps: {
    classifyQuery: classifyQueryStep,
    simpleResponse: simpleResponseStep,
    complexResponse: complexResponseStep,
    technicalResponse: technicalResponseStep,
  },
  onEvent: async (event) => {
    if (event.type === "query:classified") {
      const { queryType } = event.payload as { queryType: string };
      switch (queryType) {
        case "simple":
          return ["simpleResponse"];
        case "complex":
          return ["complexResponse"];
        case "technical":
          return ["technicalResponse"];
        default:
          return ["simpleResponse"];
      }
    }
    return [];
  },
  onComplete: async (state) => {
    console.log("✅ Routing Complete!");
    console.log(`Query: ${state.userQuery}`);
    console.log(`Type: ${state.queryType}`);
    console.log(`Response: ${state.response}`);
  },
});

await routingWorkflow.run({});
