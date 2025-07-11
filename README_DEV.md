# Simple CLI MCP Client Using LangChain / TypeScript [![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://github.com/hideya/mcp-langchain-client-ts/blob/main/LICENSE)

This is a simple [Model Context Protocol (MCP)](https://modelcontextprotocol.io/) client
that is intended for trying out MCP servers via a command-line interface.

When testing LLM and MCP servers, their settings can be conveniently configured via a configuration file, such as the following:

```json5
{
    "llm": {
        "model_provider": "openai",
        "model": "gpt-4o-mini",
        // "model_provider": "anthropic",
        // "model": "claude-3-5-haiku-latest",
        // "model_provider": "google_genai",
        // "model": "gemini-2.0-flash",
    },

    "mcp_servers": {
        "fetch": {
            "command": "uvx",
            "args": [ "mcp-server-fetch" ]
        },

        "weather": {
            "command": "npx",
            "args": [ "-y", "@h1deya/mcp-server-weather" ]
        },

        // Auto-detection: tries Streamable HTTP first, falls back to SSE
        "remote-mcp-server": {
            "url": "https://${SERVER_HOST}:${SERVER_PORT}/..."
        },

        // Example of authentication via Authorization header
        "github": {
            "type": "http",  // recommended to specify the protocol explicitly when authentication is used
            "url": "https://api.githubcopilot.com/mcp/",
            "headers": {
                "Authorization": "Bearer ${GITHUB_PERSONAL_ACCESS_TOKEN}"
            }
        },
    }
}
```

It leverages  [LangChain ReAct Agent](https://github.com/langchain-ai/react-agent-js) and
a utility function `convertMcpToLangchainTools()` from [`@h1deya/langchain-mcp-tools`](https://www.npmjs.com/package/@h1deya/langchain-mcp-tools).
This function handles parallel initialization of specified multiple MCP servers
and converts their available tools into an array of LangChain-compatible tools
([`StructuredTool[]`](https://api.js.langchain.com/classes/_langchain_core.tools.StructuredTool.html)).

This client supports both local (stdio) MCP servers as well as
remote (Streamable HTTP / SSE / WebSocket) MCP servers
which are accessible via a simple URL and optional headers for authentication and other purposes.

This client only supports text results of MCP tool calls and disregards other result types.

For the convenience of debugging MCP servers, this client prints local (stdio) MCP server logs to the console.

LLMs from Anthropic, OpenAI and Google (GenAI) are currently supported.

A Python version of this MCP client is available
[here](https://github.com/hideya/mcp-client-langchain-py)

## Prerequisites

- Node.js 18+
- npm 7+ (`npx`) to run Node.js-based MCP servers
- [optional] [`uv` (`uvx`)](https://docs.astral.sh/uv/getting-started/installation/)
  installed to run Python-based MCP servers
- API keys from [Anthropic](https://console.anthropic.com/settings/keys),
  [OpenAI](https://platform.openai.com/api-keys), and/or
  [Google GenAI](https://aistudio.google.com/apikey)
  as needed.

## Setup
1. Clone the repository:
    ```bash
    git clone https://github.com/hideya/mcp-client-langchain-ts.git
    cd mcp-client-langchain-ts
    ```

2. Install dependencies:
    ```bash
    npm install
    ```

3. Setup API keys:
    ```bash
    cp .env.template .env
    ```
    - Update `.env` as needed.
    - `.gitignore` is configured to ignore `.env`
      to prevent accidental commits of the credentials.

4. Configure LLM and MCP Servers settings `llm_mcp_config.json5` as needed.

    - [The configuration file format](https://github.com/hideya/mcp-client-langchain-ts/blob/main/llm_mcp_config.json5)
      for MCP servers follows the same structure as
      [Claude for Desktop](https://modelcontextprotocol.io/quickstart/user),
      with one difference: the key name `mcpServers` has been changed
      to `mcp_servers` to follow the snake_case convention
      commonly used in JSON configuration files.
    - The file format is [JSON5](https://json5.org/),
      where comments and trailing commas are allowed.
    - The format is further extended to replace `${...}` notations
      with the values of corresponding environment variables.
    - Keep all the credentials and private info in the `.env` file
      and refer to them with `${...}` notation as needed.


## Usage

Run the app:
```bash
npm start
```

Run in verbose mode:
```bash
npm run start:v
```

See commandline options:
```bash
npm run start:h
```
