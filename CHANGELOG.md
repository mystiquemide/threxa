# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2026-07-11

### Added

- Pull request analysis pipeline: file gate, LLM diff parsing, DataHub lineage traversal via the official MCP server, deterministic severity scoring, PR verdict comments, commit statuses
- Column-level blast radius: consumers of a dropped or renamed column are identified through fine-grained lineage, with a schema-match fallback
- Catalog write-back: change records on touched entities, incidents on merged breaking changes
- Public dashboard with run history, per-run blast radius, and live system status
- Marketing site with documentation, get-started guide, terms, and privacy pages
- Unit tests for the scorer and file gate; CI running lint, tests, and build
