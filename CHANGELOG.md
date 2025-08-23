# Change Log

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/)
and this project adheres to [Semantic Versioning](http://semver.org/).

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
