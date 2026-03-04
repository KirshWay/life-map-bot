Fix the following issue: $ARGUMENTS

Steps:

1. Understand the problem — read error logs, stack traces, or description carefully.
2. Use subagents to find relevant source code.
3. Identify the root cause before making changes.
4. Implement the fix with minimal, targeted changes.
5. Add a regression test to prevent recurrence.
6. Run `pnpm check-types && pnpm test` to verify.
7. Commit with message: `fix: <concise description>`
