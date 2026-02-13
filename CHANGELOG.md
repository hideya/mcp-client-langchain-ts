# Change Log

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/)
and this project adheres to [Semantic Versioning](http://semver.org/).


## [Unreleased]


## [0.4.2] - 2026-02-13

### Changed
- Update json5 example file to use 2 space for tabs
- Refine examples in README.md


## [0.4.1] - 2026-02-13

### Changed
- Update README.md to show latest supported models
- Show LLM provider and model name explicitly in the console log


## [0.4.0] - 2026-02-13

### Fixed
- [Issue #20](https://github.com/hideya/mcp-client-langchain-ts/issues/20):
  Make sure to work with latest models including GPT 5, Claude 4.5, Gemini 3 preview and Grok 4.1


## [0.3.9] - 2025-09-03

### Fixed
- [Issue #19](https://github.com/hideya/mcp-client-langchain-ts/issues/19):
  Gemini 1.5 needs improved schema transformations for some MCP servers

### Changed
- README_DEV.md, which was totally broken


## [0.3.8] - 2025-08-27

### Added
- `--version` flag for the convenient version checking


## [0.3.7] - 2025-08-27

### Changed
- Remove extra `console.log()`s from load-config.ts
- Upgrade dependencies


## [0.3.6] - 2025-08-24

### Added
- "schema_transformations" flag to the config file to check the effect of
  the transformations.


## [0.3.5] - 2025-08-23

### Added
- Support for Cerebras and Groq
  primarily to try gpt-oss-* with the exceptional speed
- Usage examples of gpt-oss-120b/20b on Cerebras / Groq

### Changed
- Replace "model_provider" with "provider" while keeping backward compatibility 
  to avoid confusion between the model provider and the API provider
- Use double quotation marks instead of single quotation marks for all the
  applicable string literals
- Update dependencies
