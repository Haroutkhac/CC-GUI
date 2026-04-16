# Contributing

Thanks for your interest in CC-GUI. Contributions are welcome — bug reports, fixes, and small features especially.

## Getting started

```bash
git clone https://github.com/Haroutkhac/CC-GUI.git
cd CC-GUI
npm install
cp data/store.example.json data/store.json
npm run dev
```

See the [README](README.md) for full setup, including `node-pty` prerequisites.

## Development workflow

1. Create a branch off `main`: `git checkout -b feat/short-description` or `fix/short-description`
2. Make your changes
3. Run `npm test` — all tests must pass
4. If your change is user-visible, verify it in the browser (`npm run dev`, open http://localhost:5173)
5. Commit with a conventional-style message: `feat: ...`, `fix: ...`, `docs: ...`, `refactor: ...`, `test: ...`, `chore: ...`
6. Open a PR against `main` with a clear description of what changed and why

## Code style

- ES modules throughout (`"type": "module"`)
- JSDoc over TypeScript — keep types in `shared/types.js` and `server/types.js`
- Prefer editing existing files over creating new ones; keep modules focused
- No formatter is enforced; match the surrounding code

## Testing

- Unit tests live in `server/__tests__/` and run with `vitest`
- Add tests for bug fixes and new behavior in the orchestrator, state detector, or auto-responder
- `npm test` runs once; `npm run test:watch` for iterative work

## Safe mode

CC-GUI spawns real shells, so it is designed for local use only. Default behavior (loopback bind, localhost origins, auto-respond off, protected-agent approvals) should stay intact. If a change would relax those defaults, call it out in the PR.

## Reporting bugs

Open an issue with:
- OS and Node version
- `claude --version` if the bug involves a session
- Steps to reproduce
- Relevant server log output (redact the auth token)

## License

By contributing, you agree your contributions will be licensed under the MIT License.
