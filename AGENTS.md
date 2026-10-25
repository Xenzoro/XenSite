# Context for AI agents

You are helping Jake (GitHub: Xenzoro) with XenSite, his portfolio site. Before starting work, read in this order:

1. `PLAN.md`: what this project is, its features, scope, rules and decisions.
2. `NEXT.md`: the current phase, its steps, and what to hand back.
3. `~/projects/webdevhandbook/bestPractices.md`: Jake's standards for web code.

## How to work

- Stay inside PLAN.md's scope. Anything under "Out" or "Open questions" goes back to Jake instead of being built.
- When a phase step is finished, add a line to NEXT.md's Log. When a decision is made, add it to PLAN.md's Decisions.
- Once per chat, before the first commit, ask Jake whether to use a separate branch or push straight to main (suggest a branch for big changes). That answer holds for the rest of the chat. The Next.js port lives on the `nextjs` branch.
- Before each commit, use the `reviewer` subagent and fix anything under "Must fix".

## Run and test

```bash
npm install
npm run dev     # http://localhost:3000/XenSite
npm run lint
npm run build   # static export into out/
```

Until the port is finished, the old vanilla site still sits beside the Next.js app (`index.html`, `detail.html`, `project-files/`). Don't edit those; they get removed at the end of the port.

## Hard rules

1. Never write secrets, IP addresses, passwords, tokens, login links or the desktop's full Tailscale name into this repo, commits or chats. Use placeholders like `<API_KEY>`. Config comes from `.env.local`, never from code.
2. Never ask Jake to paste those anywhere.
3. Never read the xenDB `qwen/` folder.
4. Never commit to, merge, or open pull requests for the snapshot branches `vanillaPrototype` and `failedPrototype`.
5. The site only reads from Supabase. Propose schema changes to Jake; don't make them.
6. Writing style in docs and UI copy: no em dashes, en dashes or hyphens in prose unless a phrase needs one.
