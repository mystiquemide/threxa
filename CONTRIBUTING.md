# Contributing to Threxa

Thanks for taking the time to contribute. Threxa is young and moving fast, which means small contributions land quickly and visibly.

## Getting set up

Follow the [Quickstart](README.md#quickstart-10-minutes) in the README. It takes you from clone to a running stack (DataHub quickstart, the MCP server, and the app). If you get stuck on setup, that is itself a bug worth reporting.

## Finding something to work on

Issues labeled `good first issue` are scoped to be approachable without deep context. If you want to work on something bigger, open an issue first and describe the approach so nobody duplicates effort.

## Making changes

- Branch from `main`, name it after the change: `fix/comment-dedupe`, `feat/slack-notify`.
- Keep the severity scorer deterministic. The language model parses and explains; it never decides severity. This is the project's core invariant.
- Missing lineage must never produce a SAFE verdict.
- Run the checks before opening a PR: `npm run lint`, `npm test`, `npm run build`.
- Add a test when you change scoring or gating behavior.

## Pull requests

Describe what changed and why, link the issue if one exists, and keep PRs focused on one thing. CI runs lint, tests, and build on every PR.

## Conduct

Be respectful and assume good intent. We follow the spirit of the [Contributor Covenant](https://www.contributor-covenant.org/version/2/1/code_of_conduct/).
