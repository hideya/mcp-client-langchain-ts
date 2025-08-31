#!/usr/bin/env node

import "dotenv/config";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { MemorySaver } from "@langchain/langgraph";
import { HumanMessage } from "@langchain/core/messages";
import { convertMcpToLangchainTools, McpServerCleanupFn, LlmProvider } from "@h1deya/langchain-mcp-tools";
import { initChatModel } from "./init-chat-model.js";
import { loadConfig, Config } from "./load-config.js";
import readline from "readline";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

// NOTE: without the following, I got this error:
//   ReferenceError: WebSocket is not defined
//     at <anonymous> (.../node_modules/@modelcontextprotocol/sdk/src/client/websocket.ts:29:26)
import WebSocket from 'ws';
global.WebSocket = WebSocket as any;

// // Remote server connection testing
// // Uncomment the following code snippet and add the configuration below to the configuration file.
// //        weather: {
// //            "url": "http://localhost:${SSE_SERVER_PORT}/sse"
// //        },
// // This leverages the Supergateway to make the Weather Studio MCP Server accessible as an SSE server.
// import { startRemoteMcpServerLocally } from "./remote-server-utils.js";
// const [sseServerProcess, sseServerPort] = await startRemoteMcpServerLocally(
//   "SSE",  "npx -y @h1deya/mcp-server-weather");
// process.env.SSE_SERVER_PORT = `${sseServerPort}`;

// Constants
const COLORS = {
  YELLOW: "\x1b[33m",
  CYAN: "\x1b[36m",
  GREEN: "\x1b[32m",
  RESET: "\x1b[0m"
} as const;

// Version helper function
const getPackageVersion = (): string => {
  try {
    // Get the directory of the current module
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);

    // Read package.json from the project root
    const packageJsonPath = path.join(__dirname, "..", "package.json");
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8"));
    return packageJson.version || "unknown";
  } catch (error) {
    console.warn("Could not read version from package.json:", error);
    return "unknown";
  }
};

// CLI argument setup
interface Arguments {
  config: string;
  verbose: boolean;
  logDir: string;
  [key: string]: unknown;
}

const parseArguments = (): Arguments => {
  return yargs(hideBin(process.argv))
    .version(getPackageVersion())
    .options({
      config: {
        type: "string",
        description: "Path to config file",
        demandOption: false,
        default: "llm_mcp_config.json5",
        alias: "c",
      },
      verbose: {
        type: "boolean",
        description: "Run with verbose logging",
        demandOption: false,
        default: false,
        alias: "v",
      },
      logDir: {
        type: "string",
        description: "Directory to store MCP server log files",
        demandOption: false,
        default: ".",
        alias: "l",
      },
    })
    .help()
    .alias("help", "h")
    .parseSync() as Arguments;
};

// Input handling
const createReadlineInterface = () => {
  return readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
};

const getInput = (rl: readline.Interface, prompt: string): Promise<string> => {
  return new Promise((resolve) => rl.question(prompt, resolve));
};

async function getUserQuery(
  rl: readline.Interface,
  remainingQueries: string[]
): Promise<string | undefined> {
  const input = await getInput(rl, `${COLORS.YELLOW}Query: `);
  process.stdout.write(COLORS.RESET);
  const query = input.trim();

  if (query.toLowerCase() === "quit" || query.toLowerCase() === "q") {
    rl.close();
    return undefined;
  }

  if (query === "") {
    const exampleQuery = remainingQueries.shift();
    if (!exampleQuery) {
      console.log("\nPlease type a query, or 'quit' or 'q' to exit\n");
      return await getUserQuery(rl, remainingQueries);
    }
    process.stdout.write("\x1b[1A\x1b[2K"); // Move up and clear the line
    console.log(`${COLORS.YELLOW}Example Query: ${exampleQuery}${COLORS.RESET}`);
    return exampleQuery;
  }

  return query;
}

// Conversation loop
async function handleConversation(
  agent: ReturnType<typeof createReactAgent>,
  remainingQueries: string[]
): Promise<void> {
  console.log("\nConversation started. Type 'quit' or 'q to end the conversation.\n");
  if (remainingQueries && remainingQueries.length > 0) {
    console.log("Exaample Queries (just type Enter to supply them one by one):");
    remainingQueries.forEach(query => console.log(`- ${query}`));
    console.log();
  }

  const rl = createReadlineInterface();

  while (true) {
    const query = await getUserQuery(rl, remainingQueries);
    console.log();

    if (!query) {
      console.log(`${COLORS.CYAN}Goodbye!${COLORS.RESET}\n`);
      return;
    }

    const agentFinalState = await agent.invoke(
      { messages: [new HumanMessage(query)] },
      { configurable: { thread_id: "test-thread" } }
    );

    // the last message is an AIMessage
    const result = agentFinalState.messages[agentFinalState.messages.length - 1].content;
    const messageOneBefore = agentFinalState.messages[agentFinalState.messages.length - 2]
    if (messageOneBefore.constructor.name === "ToolMessage") {
      console.log(); // new line after tool call output
    }

    console.log(`${COLORS.CYAN}${result}${COLORS.RESET}\n`);
  }
}
    
function addLogFileWatcher(logPath: string, serverName: string) {
  const stats = fs.statSync(logPath);
  let lastSize = stats.size;

  const watcher = fs.watch(logPath, (eventType: string, filename: unknown) => {
    if (eventType === 'change') {
      const stats = fs.statSync(logPath);
      const currentSize = stats.size;
      if (currentSize > lastSize) {
        const buffer = Buffer.alloc(currentSize - lastSize);
        const fd = fs.openSync(logPath, 'r');
        fs.readSync(fd, buffer, 0, buffer.length, lastSize);
        fs.closeSync(fd);
        const newContent = buffer.toString();
        console.log(
          `${COLORS.GREEN}[MCP Server Log: "${serverName}"]${COLORS.RESET}`,
          newContent.trim());
        lastSize = currentSize;
      }
    }
  });
  return watcher;
}

// Application initialization
async function initializeReactAgent(config: Config, verbose: boolean, logDir: string) {
  const llmApiProvider = config.llm.provider as LlmProvider;

  console.log("Initializing model...", config.llm, "\n");
  const llmConfig = {
    modelProvider: llmApiProvider,
    model: config.llm.model,
    temperature: config.llm.temperature,
    maxTokens: config.llm.max_tokens,
  }
  const llm = initChatModel(llmConfig);

  console.log(`Initializing ${Object.keys(config.mcp_servers).length} MCP server(s)...\n`);

  // Ensure log directory exists
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
    console.log(`Created log directory: ${logDir}`);
  }

  // Set a file descriptor to which MCP server's stderr is redirected
  const openedLogFiles: { [serverName: string]: { fd: number, watcher: fs.FSWatcher } } = {};
  Object.keys(config.mcp_servers).forEach(serverName => {
    if (config.mcp_servers[serverName].command) {
      const logPath = path.join(logDir, `mcp-server-${serverName}.log`);
      console.log(`Writing MCP server log file: ${logPath}`);
      const logFd = fs.openSync(logPath, "w");
      config.mcp_servers[serverName].stderr = logFd;
      const watcher = addLogFileWatcher(logPath, serverName);
      openedLogFiles[logPath] = { fd: logFd, watcher };
    }
  });

  const schemaTransformations = config.schema_transformations ?? true;

  const llmProvider = schemaTransformations && (llmApiProvider === "openai" || 
    llmApiProvider === "google_gemini" ||  llmApiProvider === "google_genai" ||
    llmApiProvider === "anthropic" ||  llmApiProvider === "xai")
    ? llmApiProvider : "none" as LlmProvider;

  const toolsAndCleanup = await convertMcpToLangchainTools(
    config.mcp_servers,
    { llmProvider, logLevel: verbose ? "debug" : "info" }
  );
  const tools = toolsAndCleanup.tools;
  const mcpCleanup = toolsAndCleanup.cleanup;

  const agent = createReactAgent({
    llm,
    tools,
    checkpointSaver: new MemorySaver(),
  });

  async function cleanup() {
    await mcpCleanup();

    // close log files and their watchers
    Object.keys(openedLogFiles).forEach(logPath => {
      try {
        openedLogFiles[logPath].watcher.close();
        fs.closeSync(openedLogFiles[logPath].fd);
      } catch (error) {
        console.error(`Error closing log file: ${logPath}:`, error);
      }
    });
  }

  return { agent, cleanup };
}

// Main
async function main(): Promise<void> {
  let mcpCleanup: McpServerCleanupFn | undefined;

  const argv = parseArguments();
  try {
    const config = loadConfig(argv.config);

    const { agent, cleanup } = await initializeReactAgent(config, argv.verbose, argv.logDir);
    mcpCleanup = cleanup;

    await handleConversation(agent, config.example_queries ?? []);

  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes("Failed to load configuration")) {
        console.error(error.message);
        if (error.message.includes("ENOENT")) {
          console.error(`Make sure the config file "${argv.config}" is available`);
          console.error("Use the --config option to specify which JSON5 configuration file to read");
        }
      } else if (error.message.includes("Failed to initialize chat model")) {
        console.error(error.message);
        console.error("Check the .env file for the API key settings");
      } else {
        console.error(error.message);
      }
      return;
    }
    throw error;

  } finally {
    await mcpCleanup?.();
  }
}

// Application entry point with error handling
main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
