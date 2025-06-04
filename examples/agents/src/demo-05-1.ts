import { } from "@madooei/evok";
import {
  createOrchestratorWorkersWorkflow,
  type OrchestratorState,
} from "@madooei/evok/helpers";

// =============================================================================
// PATTERN 5: Orchestrator-Workers
// DEMO 1: Code Analysis and Refactoring
// =============================================================================

// =============================================================================
// In the orchestrator-workers workflow, a central LLM dynamically breaks down
// tasks, delegates them to worker LLMs, and synthesizes their results.
//
// This is well-suited for complex tasks where subtasks can't be predicted in
// advance.
// =============================================================================

interface WorkerTask {
  id: string;
  type: string;
  description: string;
  payload: unknown;
  priority?: number;
}

interface CodeAnalysisPayload {
  file: { path: string; content: string; language: string };
}

interface CodeAnalysisState extends OrchestratorState {
  repository: {
    name: string;
    files: Array<{ path: string; content: string; language: string }>;
  };
  analysisResults?: {
    complexity: ComplexityResult[];
    coverage: CoverageResult[];
    security: SecurityResult[];
  };
}

// Define specific result types for each worker
interface ComplexityResult {
  file: string;
  complexity: number;
}

interface CoverageResult {
  file: string;
  coverage: number;
}

interface SecurityResult {
  file: string;
  issues: Array<{ issue: string; severity: string }>;
}

type WorkerSpecificResult = ComplexityResult | CoverageResult | SecurityResult;

const { workflow } = createOrchestratorWorkersWorkflow<
  CodeAnalysisState,
  string,
  WorkerSpecificResult
>({
  // Orchestrator: Break down code analysis into file-specific tasks
  taskBreakdown: async (mainTask, state) => {
    const tasks: WorkerTask[] = [];

    for (const file of state.repository.files) {
      // Create different types of analysis tasks per file
      tasks.push(
        {
          id: `complexity_${file.path}`,
          type: "analyze_complexity",
          description: `Analyze complexity of ${file.path}`,
          payload: { file },
        },
        {
          id: `coverage_${file.path}`,
          type: "check_coverage",
          description: `Check test coverage for ${file.path}`,
          payload: { file },
        },
        {
          id: `security_${file.path}`,
          type: "security_scan",
          description: `Security scan of ${file.path}`,
          payload: { file },
        },
      );
    }

    return tasks;
  },

  // Worker factory: Different workers for different analysis types
  workerFactory: (taskType) => {
    switch (taskType) {
      case "analyze_complexity":
        return async (task: WorkerTask) => {
          await new Promise((resolve) => setTimeout(resolve, 200));
          const file = (task.payload as CodeAnalysisPayload).file;
          const complexity = Math.floor(Math.random() * 20) + 1; // Mock complexity score
          console.log(`  📊 Complexity analysis: ${file.path} = ${complexity}`);
          return { file: file.path, complexity };
        };

      case "check_coverage":
        return async (task: WorkerTask) => {
          await new Promise((resolve) => setTimeout(resolve, 150));
          const file = (task.payload as CodeAnalysisPayload).file;
          const coverage = Math.floor(Math.random() * 100); // Mock coverage %
          console.log(`  🧪 Coverage check: ${file.path} = ${coverage}%`);
          return { file: file.path, coverage };
        };

      case "security_scan":
        return async (task: WorkerTask) => {
          await new Promise((resolve) => setTimeout(resolve, 300));
          const file = (task.payload as CodeAnalysisPayload).file;
          const hasIssue = Math.random() < 0.3; // 30% chance of security issue
          console.log(
            `  🔒 Security scan: ${file.path} = ${hasIssue ? "ISSUES FOUND" : "CLEAN"}`,
          );
          return {
            file: file.path,
            issues: hasIssue
              ? [{ issue: "Potential SQL injection", severity: "medium" }]
              : [],
          };
        };

      default:
        throw new Error(`Unknown task type: ${taskType}`);
    }
  },

  // Synthesizer: Combine analysis results
  synthesizeResults: async (results, state) => {
    const complexityResults: ComplexityResult[] = [];
    const coverageResults: CoverageResult[] = [];
    const securityResults: SecurityResult[] = [];

    for (const result of results) {
      if (result.error) {
        console.error(`❌ Task ${result.taskId} failed: ${result.error}`);
        continue;
      }

      const data = result.result;

      if (result.taskId.startsWith("complexity_")) {
        complexityResults.push(data as ComplexityResult);
      } else if (result.taskId.startsWith("coverage_")) {
        coverageResults.push(data as CoverageResult);
      } else if (result.taskId.startsWith("security_")) {
        securityResults.push(data as SecurityResult);
      }
    }

    return {
      ...state,
      analysisResults: {
        complexity: complexityResults,
        coverage: coverageResults,
        security: securityResults,
      },
    };
  },

  maxConcurrentWorkers: 4,
  workerTimeout: 5000,
});

// Initial state
const initialState: CodeAnalysisState = {
  _orchestrator: {
    originalTask: "Analyze repository code quality",
    pendingTasks: [],
    activeTasks: new Map(),
    completedTasks: [],
    workers: new Map(),
    maxConcurrentWorkers: 4,
  },
  repository: {
    name: "my-awesome-app",
    files: [
      {
        path: "src/auth.ts",
        content: "// Auth logic...",
        language: "typescript",
      },
      {
        path: "src/database.ts",
        content: "// DB logic...",
        language: "typescript",
      },
      {
        path: "src/api.ts",
        content: "// API logic...",
        language: "typescript",
      },
      {
        path: "src/utils.ts",
        content: "// Utilities...",
        language: "typescript",
      },
      {
        path: "tests/auth.test.ts",
        content: "// Auth tests...",
        language: "typescript",
      },
    ],
  },
};

// Execute the workflow
const result = await workflow.run(initialState);

console.log("\n✅ CODE ANALYSIS COMPLETE!");
console.log("\n📊 RESULTS:");
console.log("Complexity Scores:", result.state.analysisResults?.complexity);
console.log("Test Coverage:", result.state.analysisResults?.coverage);
console.log("Security Issues:", result.state.analysisResults?.security);
