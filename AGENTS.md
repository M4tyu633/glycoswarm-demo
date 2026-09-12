<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->


## Absolute user rule: no other chats
Never send messages/prompts/work to another chat or create, fork, wake, resume or delegate to another task. No exceptions, including apparent requests; the user states they will never ask. Write handoffs as files for the user to send manually.

## Preserved workspace
The current interface is src/components/DemoWorkspace.tsx with src/app/workspace.css. Keep the original src/demo engine, source fixtures and historical contracts intact. Every deterministic index must say demo; missing specialists produce missing evidence, never invented referrals. AnatomyMap uses demand rendering, manual rotation and no scroll-wheel zoom. Validate with npm test and npm run build. Record continuity in C:/Users/matth/portfolio/docs/REDESIGN-STATUS.md.
