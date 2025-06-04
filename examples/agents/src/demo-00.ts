import { createWorkflow, setLogLevel, type Step, type Workflow } from "@madooei/evok";
import { LogManagerImpl, type Logger } from "@coursebook/simple-logger";

setLogLevel("trace"); // Log level for the core library

// 0. Create logger
const logManager = LogManagerImpl.getInstance();
logManager.setLogLevel("demo:*", "trace");

// 1. Define State
interface State {
  data: {
    greeting?: string;
  };
}

// 2. Define Steps
const createGreetingStep: Step<State> = {
  id: "createGreeting",
  async run() {
    const logger: Logger = logManager.getLogger("demo:createGreetingStep:run");
    logger.trace("Creating greeting");
    const greeting = "Hello, World!";
    return {
      state: { data: { greeting } },
      events: [{ type: "greeting:created", payload: { greeting } }],
    };
  },
  async onStart() {
    const logger: Logger = logManager.getLogger(
      "demo:createGreetingStep:onStart",
    );
    logger.info("Starting");
  },
  async onComplete() {
    const logger: Logger = logManager.getLogger(
      "demo:createGreetingStep:onComplete",
    );
    logger.info("Completed");
  },
  async onError(error) {
    const logger: Logger = logManager.getLogger(
      "demo:createGreetingStep:onError",
    );
    logger.info("Error:", error);
  },
};

const printGreetingStep: Step<State> = {
  id: "printGreeting",
  async run(state) {
    const logger: Logger = logManager.getLogger("demo:printGreetingStep:run");
    logger.trace("Printing greeting", state, this.params);
    const prefix = this.params?.prefix || "";
    const postfix = this.params?.postfix || "";
    console.log(prefix, state.data.greeting, postfix);
    return { state };
  },
  params: { prefix: "🎉🎉🎉", postfix: "🎉🎉🎉" },
  async onStart() {
    const logger: Logger = logManager.getLogger(
      "demo:printGreetingStep:onStart",
    );
    logger.info("Starting");
  },
  async onComplete() {
    const logger: Logger = logManager.getLogger(
      "demo:printGreetingStep:onComplete",
    );
    logger.info("Completed");
  },
  async onError(error) {
    const logger: Logger = logManager.getLogger(
      "demo:printGreetingStep:onError",
    );
    logger.info("Error:", error);
  },
};

// 3. Define Workflow
const helloFlow: Workflow<State> = createWorkflow<State>({
  id: "helloFlow",
  start: "createGreeting",
  steps: {
    createGreeting: createGreetingStep,
    printGreeting: printGreetingStep,
  },
  onEvent: async (event) => {
    const logger: Logger = logManager.getLogger("demo:helloFlow:onEvent");
    logger.trace("Graph Received event:", event);
    if (event.type === "greeting:created") {
      logger.trace(
        "Received greeting:created event, returning printGreeting node ",
      );
      return ["printGreeting"];
    }
    return [];
  },
  async onStart() {
    const logger: Logger = logManager.getLogger("demo:helloFlow:onStart");
    logger.info("Starting");
  },
  async onComplete() {
    const logger: Logger = logManager.getLogger("demo:helloFlow:onComplete");
    logger.info("Completed");
  },
  async onError(error) {
    const logger: Logger = logManager.getLogger("demo:helloFlow:onError");
    logger.info("Error:", error);
  },
});

// 4. Execute
await helloFlow.run({ data: {} });
