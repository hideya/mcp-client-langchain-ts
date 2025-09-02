# Simple MCP Client to Explore MCP Servers [![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://github.com/hideya/mcp-langchain-client-ts/blob/main/LICENSE) [![npm version](https://img.shields.io/npm/v/@h1deya/mcp-client-cli.svg)](https://www.npmjs.com/package/@h1deya/mcp-client-cli)


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
- LLM API key(s) from
  [OpenAI](https://platform.openai.com/api-keys),
  [Anthropic](https://console.anthropic.com/settings/keys),
  [Google AI Studio (for GenAI/Gemini)](https://aistudio.google.com/apikey),
  [xAI](https://console.x.ai/),
  [Cerebras](https://cloud.cerebras.ai),
  and/or
  [Groq](https://console.groq.com/keys),
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
      "provider": "openai",       "model": "gpt-5-mini"
      // "provider": "anthropic",    "model": "claude-3-5-haiku-latest"
      // "provider": "google_genai", "model": "gemini-2.5-flash"
      // "provider": "xai",          "model": "grok-3-mini"
      // "provider": "cerebras",     "model": "gpt-oss-120b"
      // "provider": "groq",         "model": "openai/gpt-oss-20b"
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
  GOOGLE_API_KEY=AI...
  XAI_API_KEY=xai-...
  CEREBRAS_API_KEY=csk-...
  GROQ_API_KEY=gsk_..." > .env
  
  code .env
  ```

- Run the tool
  ```bash
  mcp-client-cli
  ```
  By default, it reads the configuration file, `llm_mcp_config.json5`, from the current directory.  
  Then, it applies the environment variables specified in the `.env` file,
  as well as the ones that are already defined.

## Features

- **Easy setup**: Works out of the box with popular MCP servers
- **Flexible configuration**: JSON5 config with environment variable support
- **Multiple LLM providers**: OpenAI, Anthropic, Google (GenAI)
- **Schema Compatibility Support**: Automatically adjusts tools schema for LLM compatibility, which can help some failing MCP servers run successfully. 
  See [this page](https://github.com/hideya/langchain-mcp-tools-ts/blob/main/README.md#llm-provider-schema-compatibility)
for details.  
If you want to disable the schema trnaformations, add `"schema_transformations": false,` to the top level of the config file.
- **Command & URL servers**: Support for both local and remote MCP servers.  
  Use `mcp-remote` to connect to remote servers with OAuth (see the end of the configuration example below).
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

- **OpenAI**: `gpt-5-mini`, `gpt-4.1-nano`, etc.
- **Anthropic**: `claude-sonnet-4-0`, `claude-3-5-haiku-latest`, etc.
- **Google (GenAI)**: `gemini-2.5-flash`, `gemini-2.5-pro`, etc.
- **xAI**: `grok-3-mini`, `grok-4`, etc.
- **Cerebras**: `gpt-oss-120b`, etc.
- **Groq**: `openai/gpt-oss-20b`, `openai/gpt-oss-120b`, etc.

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
    "provider": "openai",       "model": "gpt-5-mini",
    // "provider": "anthropic",    "model": "claude-3-5-haiku-latest",
    // "provider": "google_genai", "model": "gemini-2.5-flash",
    // "provider": "xai",          "model": "grok-3-mini",
    // "provider": "cerebras",     "model": "gpt-oss-120b",
    // "provider": "groq",         "model": "openai/gpt-oss-20b",
  },

  // To disable the automatic schema transformations, uncomment the following line.
  // See this for details about the schema transformations:
  //   https://github.com/hideya/langchain-mcp-tools-ts/blob/main/README.md#llm-provider-schema-compatibility
  // 
  // "schema_transformations": false,

  "example_queries": [
    "Tell me how LLMs work in a few sentences",
    "Are there any weather alerts in California?",
    "Read the news headlines on bbc.com",
    // "Tell me about my GitHub profile"",
    // "What's the news from Tokyo today?",
    // "Open the webpage at bbc.com",
    // "Tell me about my Notion account",
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

    // Embedding the value of an environment variable 
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
    },

    // For fMCP servers that require OAuth, consider using "mcp-remote"
    "notion": {
      "command": "npx",
      "args": ["-y", "mcp-remote", "https://mcp.notion.com/mcp"],
    },
  }
}
```

### Environment Variables

Create a `.env` file for API keys:

```bash
OPENAI_API_KEY=sk-ant-...
ANTHROPIC_API_KEY=sk-proj-...
GOOGLE_API_KEY=AI...
CEREBRAS_API_KEY=csk-...
GROQ_API_KEY=gsk_...

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

## Change Log

Can be found [here](https://github.com/hideya/mcp-client-langchain-ts/blob/main/CHANGELOG.md)

## Building from Source

See [README_DEV.md](https://github.com/hideya/mcp-client-langchain-ts/blob/main/README_DEV.md) for details.

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Contributing

Issues and pull requests welcome! This tool aims to make MCP server testing as simple as possible.
