import { createWorkflow, type Step, type Workflow } from "@madooei/evok";

// =============================================================================
// PATTERN 1: PROMPT CHAINING
// DEMO: Text Analysis Pipeline
// =============================================================================

// =============================================================================
// Prompt chaining decomposes a task into a sequence of steps, where each LLM
// call processes the output of the previous one. You can add programmatic
// checks (see "gate" in the diagram below) on any intermediate steps to ensure
// that the process is still on track.
//
// This pattern is ideal when tasks can be cleanly decomposed into fixed
// subtasks, trading latency for higher accuracy.
// =============================================================================

interface ChainState {
  originalText?: string;
  summary?: string;
  translation?: string;
  keywords?: string[];
}

const analyzeTextStep: Step<ChainState> = {
  id: "analyzeText",
  async run(state) {
    // Simulate LLM call to analyze text
    const originalText =
      "The quick brown fox jumps over the lazy dog. This is a sample text for demonstration.";

    console.log("📝 Analyzing text...");
    await new Promise((resolve) => setTimeout(resolve, 500)); // Simulate API call

    return {
      state: { ...state, originalText },
      events: [{ type: "text:analyzed", payload: { originalText } }],
    };
  },
};

const summarizeStep: Step<ChainState> = {
  id: "summarize",
  async run(state) {
    console.log("📋 Summarizing text...");
    await new Promise((resolve) => setTimeout(resolve, 500));

    const summary = "A sample text about a fox and a dog.";

    return {
      state: { ...state, summary },
      events: [{ type: "text:summarized", payload: { summary } }],
    };
  },
};

const translateStep: Step<ChainState> = {
  id: "translate",
  async run(state) {
    console.log("🌍 Translating to Spanish...");
    await new Promise((resolve) => setTimeout(resolve, 500));

    const translation = "Un texto de muestra sobre un zorro y un perro.";

    return {
      state: { ...state, translation },
      events: [{ type: "text:translated", payload: { translation } }],
    };
  },
};

const extractKeywordsStep: Step<ChainState> = {
  id: "extractKeywords",
  async run(state) {
    console.log("🔑 Extracting keywords...");
    await new Promise((resolve) => setTimeout(resolve, 500));

    const keywords = ["fox", "dog", "sample", "text"];

    return {
      state: { ...state, keywords },
      events: [{ type: "keywords:extracted", payload: { keywords } }],
    };
  },
};

const promptChainingWorkflow: Workflow<ChainState> = createWorkflow<ChainState>(
  {
    id: "promptChaining",
    start: "analyzeText",
    steps: {
      analyzeText: analyzeTextStep,
      summarize: summarizeStep,
      translate: translateStep,
      extractKeywords: extractKeywordsStep,
    },
    onEvent: async (event) => {
      switch (event.type) {
        case "text:analyzed":
          return ["summarize"];
        case "text:summarized":
          return ["translate"];
        case "text:translated":
          return ["extractKeywords"];
        default:
          return [];
      }
    },
    onComplete: async (state) => {
      console.log("✅ Prompt Chaining Complete!");
      console.log("Final state:", JSON.stringify(state, null, 2));
    },
  },
);

await promptChainingWorkflow.run({});
