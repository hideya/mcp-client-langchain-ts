# Simple CLI MCP Client to Explore MCP Servers [![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://github.com/hideya/mcp-langchain-client-ts/blob/main/LICENSE)

> Quickly test and explore MCP servers from the command line

A simple, text-based CLI client for [Model Context Protocol (MCP)](https://modelcontextprotocol.io/) servers built with LangChain and TypeScript. Suitable for testing MCP servers, exploring their capabilities, and prototyping integrations.

## Prerequisites

- Node.js 18+
- [optional] [`uv` (`uvx`)](https://docs.astral.sh/uv/getting-started/installation/)
  installed to run Python-based local (stdio) MCP servers
- API keys from [Anthropic](https://console.anthropic.com/settings/keys),
  [OpenAI](https://platform.openai.com/api-keys), and/or
  [Google GenAI](https://aistudio.google.com/apikey)
  as needed

## Quick Start

- Setup API keys
  ```bash
  echo "ANTHROPIC_API_KEY=sk-ant-...                                       
  OPENAI_API_KEY=sk-proj-...
  GOOGLE_API_KEY=AI..." > .env
  
  code .env
  ```

- Configure LLM and MCP Servers settings
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
      // "model": "gemini-2.0-flash",
    },

    "mcp_servers": {
      "weather": {
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
- Run directly with npx (no installation needed)
  ```bash
  npx @h1deya/mcp-try-cli

  # Or install globally
  npm install -g @h1deya/mcp-try-cli
  mcp-try-cli
  ```

## Building from Source

See [README_DEV.md](https://github.com/hideya/mcp-client-langchain-ts/blob/main/README_DEV.md)

## Features

- **Zero setup**: Works out of the box with popular MCP servers
- **Flexible configuration**: JSON5 config with environment variable support
- **Multiple LLM providers**: OpenAI, Anthropic, Google Gemini
- **Command & URL servers**: Support for both local and remote MCP servers
- **Real-time logging**: Live stdio MCP server logs with customizable log directory
- **Interactive testing**: Example queries for the convenience of repeated testing

## Usage

### Basic Usage

```bash
npx @h1deya/mcp-try-cli
```

### With Options

```bash
# Specify the config file to use
npx @h1deya/mcp-try-cli --config my-config.json5

# Store local (stdio) MCP server logs in specific directory
npx @h1deya/mcp-try-cli --log-dir ./logs

# Enable verbose logging
npx @h1deya/mcp-try-cli --verbose

# Show help
npx @h1deya/mcp-try-cli --help
```

## Supported LLM Providers

- **OpenAI**: `gpt-4o`, `gpt-4o-mini`, etc.
- **Anthropic**: `claude-sonnet-4-0`, `claude-3-5-haiku-latest`, etc.
- **Google (GenAI)**: `gemini-2.0-flash`, `gemini-1.5-pro`, etc.

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
    "model": "gpt-4o-mini",
    // model: "o4-mini",
  },
  
  // "llm": {
  //   "model_provider": "anthropic",
  //   "model": "claude-3-5-haiku-latest",
  //   // "model": "claude-sonnet-4-0",
  // },

  // "llm": {
  //   "model_provider": "google_genai",
  //   "model": "gemini-2.0-flash",
  //   // "model": "gemini-2.5-pro-preview-06-05",
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

### Common Issues

1. **Missing API key**: Make sure your `.env` file contains the required API key
2. **Server not found**: Ensure MCP server packages are available via npx
3. **Permission errors**: Check file permissions for log directory

### Getting Help

- Check the logs in your specified log directory
- Use `--verbose` flag for detailed output
- Refer to [MCP documentation](https://modelcontextprotocol.io/)

## Development

This tool is built with:
- [Model Context Protocol (MCP)](https://modelcontextprotocol.io/)
- [LangChain](https://langchain.com/) for LLM integration
- [TypeScript](https://www.typescriptlang.org/) for type safety
- [Yargs](https://yargs.js.org/) for CLI parsing

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Contributing

Issues and pull requests welcome! This tool aims to make MCP server testing as simple as possible.
