# Simple MCP Client to Explore MCP Servers / TypeScript [![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://github.com/hideya/mcp-langchain-client-ts/blob/main/LICENSE) [![npm version](https://img.shields.io/npm/v/@h1deya/mcp-client-cli.svg)](https://www.npmjs.com/package/@h1deya/mcp-client-cli)


**Quickly test and explore MCP servers from the command line!**

A simple, text-based CLI client for [Model Context Protocol (MCP)](https://modelcontextprotocol.io/) servers built with LangChain and TypeScript.  
This tool automatically adjusts the schema for LLM compatibility, which can help some failing MCP servers run successfully.  
Suitable for testing MCP servers, exploring their capabilities, and prototyping integrations.

Internally it uses  [LangChain ReAct Agent](https://github.com/langchain-ai/react-agent-js) and
a utility function `convertMcpToLangchainTools()` from
[`@h1deya/langchain-mcp-tools`](https://www.npmjs.com/package/@h1deya/langchain-mcp-tools).
This function performs the aforementioned MCP tools schema transformations for LLM compatibility.
See [this page](https://github.com/hideya/langchain-mcp-tools-ts/blob/main/README.md#llm-provider-schema-compatibility)
for details.

A Python equivalent of this utility is available [here](https://pypi.org/project/mcp-chat/)

## Prerequisites

- Node.js 18+
- [optional] [`uv` (`uvx`)](https://docs.astral.sh/uv/getting-started/installation/)
  installed to run Python-based local (stdio) MCP servers
- LLM API keys from
  [OpenAI](https://platform.openai.com/api-keys),
  [Anthropic](https://console.anthropic.com/settings/keys),
  and/or
  [Google AI Studio (for GenAI/Gemini)](https://aistudio.google.com/apikey)
  as needed

## Quick Start

- Install `mcp-client-cli` tool.
  This can take up to a few minutes to complete:
  ```bash
  npm install -g @h1deya/mcp-client-cli
  ```

- Configure LLM and MCP Servers settings via the configuration file, `llm_mcp_config.json5`
  ```bash
  code llm_mcp_config.json5
  ```

  The following is a simple configuration for quick testing:
  ```json5
  {
    "llm": {
      "model_provider": "openai",
      "model": "gpt-4o-mini",
      // "model_provider": "anthropic",
      // "model": "claude-3-5-haiku-latest",
      // "model_provider": "google_genai",
      // "model": "gemini-2.5-flash",
    },

    "mcp_servers": {
      "us-weather": {  // US weather only
        "command": "npx", 
        "args": ["-y", "@h1deya/mcp-server-weather"]
      },
    },

    "example_queries": [
      "Tell me how LLMs work in a few sentences",
      "Are there any weather alerts in California?",
    ],
  }
  ```

- Set up API keys
  ```bash
  echo "ANTHROPIC_API_KEY=sk-ant-...                                       
  OPENAI_API_KEY=sk-proj-...
  GOOGLE_API_KEY=AI..." > .env
  
  code .env
  ```

- Run the tool
  ```bash
  mcp-client-cli
  ```
  By default, it reads the configuration file, `llm_mcp_config.json5`, from the current directory.  
  Then, it applies the environment variables specified in the `.env` file,
  as well as the ones that are already defined.

## Building from Source

See [README_DEV.md](https://github.com/hideya/mcp-client-langchain-ts/blob/main/README_DEV.md) for details.

## Features

- **Easy setup**: Works out of the box with popular MCP servers
- **Flexible configuration**: JSON5 config with environment variable support
- **Multiple LLM providers**: OpenAI, Anthropic, Google (GenAI)
- **Schema Compatibility Support**: Automatically adjusts tools schema for LLM compatibility, which can help some failing MCP servers run successfully. 
  See [this page](https://github.com/hideya/langchain-mcp-tools-ts/blob/main/README.md#llm-provider-schema-compatibility)
for details.
- **Command & URL servers**: Support for both local and remote MCP servers
- **Real-time logging**: Live stdio MCP server logs with customizable log directory
- **Interactive testing**: Example queries for the convenience of repeated testing

## Limitations

- **Tool Return Types**: Currently, only text results of tool calls are supported.
It uses LangChain's `response_format: 'content'` (the default) internally, which only supports text strings.
While MCP tools can return multiple content types (text, images, etc.), this library currently filters and uses only text content.
- **MCP Features**: Only MCP [Tools](https://modelcontextprotocol.io/docs/concepts/tools) are supported. Other MCP features like Resources, Prompts, and Sampling are not implemented.

## Usage

### Basic Usage

```bash
mcp-client-cli
```

By default, it reads the configuration file, `llm_mcp_config.json5`, from the current directory.  
Then, it applies the environment variables specified in the `.env` file,
as well as the ones that are already defined.  
It outputs local MCP server logs to the current directory.

### With Options

```bash
# Specify the config file to use
mcp-client-cli --config my-config.json5

# Store local (stdio) MCP server logs in specific directory
mcp-client-cli --log-dir ./logs

# Enable verbose logging
mcp-client-cli --verbose

# Show help
mcp-client-cli --help
```

## Supported LLM Providers

- **OpenAI**: `o4-mini`, `gpt-4o-mini`, etc.
- **Anthropic**: `claude-sonnet-4-0`, `claude-3-5-haiku-latest`, etc.
- **Google (GenAI)**: `gemini-2.5-pro`, `gemini-2.5-flash`, etc.

## Configuration

Create a `llm_mcp_config.json5` file:

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
  and refer to them with `${...}` notation as needed

```json5
{
  "llm": {
    "model_provider": "openai",
    "model": "gpt-4.1-nano",
    // model: "o4-mini",
  },
  
  // "llm": {
  //   "model_provider": "anthropic",
  //   "model": "claude-3-5-haiku-latest",
  //   // "model": "claude-sonnet-4-0",
  // },

  // "llm": {
  //   "model_provider": "google_genai",
  //   "model": "gemini-2.5-flash",
  //   // "model": "gemini-2.5-pro",
  // }

  "example_queries": [
    "Tell me how LLMs work in a few sentences",
    "Are there any weather alerts in California?",
    "Read the news headlines on bbc.com",
  ],

  "mcp_servers": {
    // Local MCP server that uses `npx`
    "weather": {
      "command": "npx", 
      "args": [ "-y", "@h1deya/mcp-server-weather" ]
    },

    // Another local server that uses `uvx`
    "fetch": {
      "command": "uvx",
      "args": [ "mcp-server-fetch" ]
    },

    "brave-search": {
      "command": "npx",
      "args": [ "-y", "@modelcontextprotocol/server-brave-search" ],
      "env": { "BRAVE_API_KEY": "${BRAVE_API_KEY}" }
    },

    // Remote MCP server via URL
    // Auto-detection: tries Streamable HTTP first, falls back to SSE
    "remote-mcp-server": {
      "url": "https://api.example.com/..."
    },

    // Server with authentication
    "github": {
      "type": "http",  // recommended to specify the protocol explicitly when authentication is used
      "url": "https://api.githubcopilot.com/mcp/",
      "headers": {
        "Authorization": "Bearer ${GITHUB_PERSONAL_ACCESS_TOKEN}"
      }
    }
  }
}
```

### Environment Variables

Create a `.env` file for API keys:

```bash
OPENAI_API_KEY=sk-ant-...
ANTHROPIC_API_KEY=sk-proj-...
GOOGLE_API_KEY=AI...

# Other services as needed
GITHUB_PERSONAL_ACCESS_TOKEN=github_pat_...
BRAVE_API_KEY=BSA...
```

## Popular MCP Servers to Try

There are quite a few useful MCP servers already available:

- [MCP Server Listing on the Official Site](https://github.com/modelcontextprotocol/servers?tab=readme-ov-file#model-context-protocol-servers)

## Troubleshooting

- Make sure your configuration and .env files are correct, especially the spelling of the API keys
- Check the local MCP server logs
- Use `--verbose` flag to view the detailed logs
- Refer to [Debugging Section in MCP documentation](https://modelcontextprotocol.io/docs/tools/debugging)

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Contributing

Issues and pull requests welcome! This tool aims to make MCP server testing as simple as possible.
