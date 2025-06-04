import { createWorkflow, type Step, type Workflow } from "@madooei/evok";

// =============================================================================
// PATTERN 4: EVALUATOR-OPTIMIZER
// DEMO: Generating and evaluating code iteratively
// =============================================================================

// =============================================================================
// In the evaluator-optimizer workflow, one LLM call generates a response while
// another provides evaluation and feedback in a loop. This workflow can be
// particularly effective when it uses clear evaluation criteria, and when
// iterative refinement after evaluation provides measurable value.
// =============================================================================

interface EvaluatorState {
  prompt?: string;
  currentCode?: string;
  evaluation?: { score: number; feedback: string; approved: boolean };
  iteration?: number;
  finalCode?: string;
}

const generateCodeStep: Step<EvaluatorState> = {
  id: "generateCode",
  async run(state) {
    const iteration = (state.iteration || 0) + 1;
    const prompt =
      state.prompt || "Write a function to calculate fibonacci numbers";

    console.log(`💻 Generating code (iteration ${iteration})...`);
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Simulate iterative improvement
    const codes = [
      "function fib(n) { return n <= 1 ? n : fib(n-1) + fib(n-2); }", // Inefficient
      "function fib(n) { const memo = {}; function helper(x) { if (x in memo) return memo[x]; return memo[x] = x <= 1 ? x : helper(x-1) + helper(x-2); } return helper(n); }", // Better
      "function fib(n) { if (n <= 1) return n; let a = 0, b = 1; for (let i = 2; i <= n; i++) { [a, b] = [b, a + b]; } return b; }", // Optimal
    ];

    const currentCode = codes[Math.min(iteration - 1, codes.length - 1)];

    return {
      state: { ...state, prompt, currentCode, iteration },
      events: [
        { type: "code:generated", payload: { code: currentCode, iteration } },
      ],
    };
  },
};

const evaluateCodeStep: Step<EvaluatorState> = {
  id: "evaluateCode",
  async run(state) {
    console.log("🔍 Evaluating code quality...");
    await new Promise((resolve) => setTimeout(resolve, 400));

    const iteration = state.iteration || 1;

    // Simulate evaluation improving over iterations
    const evaluations = [
      {
        score: 3,
        feedback:
          "Code works but is inefficient due to exponential time complexity. Use memoization or iteration.",
        approved: false,
      },
      {
        score: 7,
        feedback:
          "Much better with memoization! Could be more readable and efficient with iterative approach.",
        approved: false,
      },
      {
        score: 9,
        feedback:
          "Excellent! Optimal time and space complexity with clear, readable code.",
        approved: true,
      },
    ];

    const evaluation =
      evaluations[Math.min(iteration - 1, evaluations.length - 1)];

    return {
      state: { ...state, evaluation },
      events: [
        {
          type: evaluation.approved ? "code:approved" : "code:needsImprovement",
          payload: evaluation,
        },
      ],
    };
  },
};

const finalizeCodeStep: Step<EvaluatorState> = {
  id: "finalizeCode",
  async run(state) {
    console.log("✨ Finalizing approved code...");

    return {
      state: { ...state, finalCode: state.currentCode },
      events: [{ type: "code:finalized" }],
    };
  },
};

const evaluatorOptimizerWorkflow: Workflow<EvaluatorState> =
  createWorkflow<EvaluatorState>({
    id: "evaluatorOptimizer",
    start: "generateCode",
    steps: {
      generateCode: generateCodeStep,
      evaluateCode: evaluateCodeStep,
      finalizeCode: finalizeCodeStep,
    },
    onEvent: async (event) => {
      switch (event.type) {
        case "code:generated":
          return ["evaluateCode"];
        case "code:needsImprovement":
          // Continue the loop with feedback
          return ["generateCode"];
        case "code:approved":
          return ["finalizeCode"];
        default:
          return [];
      }
    },
    onComplete: async (state) => {
      console.log("✅ Evaluator-Optimizer Complete!");
      console.log(`Final code after ${state.iteration} iterations:`);
      console.log(state.finalCode);
      console.log("Final evaluation:", state.evaluation);
    },
  });

await evaluatorOptimizerWorkflow.run({});
