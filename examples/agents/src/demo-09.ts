import { createWorkflow, type Workflow } from "@madooei/evok";
import { createDependentStep } from "@madooei/evok/helpers";

// =============================================================================
// Recipe 4: Dependency Pattern (using state tracking)
// =============================================================================

interface PipelineState<T = number> {
  _completed: Set<string>; // Track completed steps
  rawData?: T[];
  cleanedData?: T[];
  processedData?: T[];
}

// Usage example of dependency pattern
const cleanDataStep = createDependentStep<PipelineState<number>>(
  { id: "cleanData" },
  ["fetchRawData"], // Depends on fetchRawData
  async (state) => ({
    state: {
      ...state,
      cleanedData: state.rawData?.filter((x) => x != null),
    },
    events: [{ type: "data:cleaned" }],
  }),
);

const workflow: Workflow<PipelineState<number>> = createWorkflow<
  PipelineState<number>
>({
  id: "pipelineWorkflow",
  start: "cleanData",
  steps: {
    cleanData: cleanDataStep,
  },
});

// change the _completed to see the different behavior
await workflow.run({
  _completed: new Set<string>(["fetchRawData"]), // will run the step because dependency is met
  // _completed: new Set<string>(), // will not run the step becase dependency is not met
  rawData: [1, 2, 3, 4, 5],
  cleanedData: [],
  processedData: [],
});
