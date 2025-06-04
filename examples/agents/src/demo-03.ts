import { createWorkflow, type Step, type Workflow } from "@madooei/evok";

// =============================================================================
// PATTERN 3: PARALLELIZATION
// DEMO: Parallel processing of document pages
// =============================================================================

// =============================================================================
// This pattern breaks tasks into parallel components that can be processed
// simultaneously, such as running image-to-text on multiple document pages at
// once or using voting mechanisms across multiple processes.
// =============================================================================

interface ParallelState {
  document?: string;
  pages?: string[];
  pageAnalyses?: { page: number; analysis: string }[];
  finalSummary?: string;
}

const splitDocumentStep: Step<ParallelState> = {
  id: "splitDocument",
  async run(state) {
    console.log("📄 Splitting document into pages...");

    const document =
      "This is a multi-page document with important information...";
    const pages = [
      "Page 1: Introduction and overview",
      "Page 2: Detailed analysis and findings",
      "Page 3: Conclusions and recommendations",
    ];

    return {
      state: { ...state, document, pages },
      events: [
        { type: "document:split", payload: { pageCount: pages.length } },
      ],
    };
  },
};

const analyzePage1Step: Step<ParallelState> = {
  id: "analyzePage1",
  async run(state) {
    console.log("📖 Analyzing page 1...");
    await new Promise((resolve) => setTimeout(resolve, 400));

    const analysis = "Page 1 contains introductory material and key concepts.";

    return {
      state: {
        ...state,
        pageAnalyses: [...(state.pageAnalyses || []), { page: 1, analysis }],
      },
      events: [{ type: "page:analyzed", payload: { page: 1, analysis } }],
    };
  },
};

const analyzePage2Step: Step<ParallelState> = {
  id: "analyzePage2",
  async run(state) {
    console.log("📖 Analyzing page 2...");
    await new Promise((resolve) => setTimeout(resolve, 600));

    const analysis = "Page 2 provides detailed analysis with supporting data.";

    return {
      state: {
        ...state,
        pageAnalyses: [...(state.pageAnalyses || []), { page: 2, analysis }],
      },
      events: [{ type: "page:analyzed", payload: { page: 2, analysis } }],
    };
  },
};

const analyzePage3Step: Step<ParallelState> = {
  id: "analyzePage3",
  async run(state) {
    console.log("📖 Analyzing page 3...");
    await new Promise((resolve) => setTimeout(resolve, 300));

    const analysis =
      "Page 3 summarizes findings and provides actionable recommendations.";

    return {
      state: {
        ...state,
        pageAnalyses: [...(state.pageAnalyses || []), { page: 3, analysis }],
      },
      events: [{ type: "page:analyzed", payload: { page: 3, analysis } }],
    };
  },
};

const synthesizeResultsStep: Step<ParallelState> = {
  id: "synthesizeResults",
  async run(state) {
    console.log("🔄 Synthesizing all page analyses...");
    await new Promise((resolve) => setTimeout(resolve, 400));

    const finalSummary = `Document Summary: Combined insights from ${state.pageAnalyses?.length} pages revealing comprehensive analysis of the topic.`;

    return {
      state: { ...state, finalSummary },
      events: [{ type: "synthesis:complete" }],
    };
  },
};

const parallelizationWorkflow: Workflow<ParallelState> =
  createWorkflow<ParallelState>({
    id: "parallelization",
    start: "splitDocument",
    steps: {
      splitDocument: splitDocumentStep,
      analyzePage1: analyzePage1Step,
      analyzePage2: analyzePage2Step,
      analyzePage3: analyzePage3Step,
      synthesizeResults: synthesizeResultsStep,
    },
    onEvent: async (event, state) => {
      if (event.type === "document:split") {
        // Trigger all page analyses in parallel
        return ["analyzePage1", "analyzePage2", "analyzePage3"];
      }

      if (event.type === "page:analyzed") {
        // Check if all pages are analyzed
        const expectedPages = 3;
        const analyzedPages = state.pageAnalyses?.length || 0;

        if (analyzedPages === expectedPages) {
          return ["synthesizeResults"];
        }
      }

      return [];
    },
    onComplete: async (state) => {
      console.log("✅ Parallelization Complete!");
      console.log("Final Summary:", state.finalSummary);
      console.log("Page Analyses:", state.pageAnalyses);
    },
  });

await parallelizationWorkflow.run({ pageAnalyses: [] });
