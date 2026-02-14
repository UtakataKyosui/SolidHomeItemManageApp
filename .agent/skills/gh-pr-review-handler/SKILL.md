---
name: GitHub PR Review Handler
description: Workflow for fetching, addressing, and replying to GitHub PR reviews using `gh` CLI and `jj` (Jujutsu).
---

# GitHub PR Review Handler Skill

This skill outlines the process for an Agent to autonomously handle Pull Request reviews, including fetching comments, applying fixes, committing changes with `jj`, and replying to the reviewer via GitHub.

## Workflow

### 1. Fetch Review Comments

First, identify the PR and list the review comments.

```bash
# List PRs to find the target number (if unknown)
gh pr list

# View PR comments to understand feedback
gh pr view <PR_NUMBER> --comments
# Or get JSON for structured parsing
gh pr view <PR_NUMBER> --json comments,reviews
```

**Goal:** Identify actionable comments (e.g., "Change variable name", "Fix logic error"). Note the `id` of the comment to reply to.

### 2. Address Feedback (Apply Changes)

Use standard coding tools (`replace_file_content`, `run_command`, etc.) to implement the requested changes.

### 3. Commit Changes with `jj`

Using Jujutsu (`jj`), commit the changes. The commit message should reference the fix.

```bash
# Create a new commit for the fix
jj commit -m "fix: address review comment (ref: <COMMENT_ID>)"
# OR if amending the current change is preferred (but new commit is safer for threading)
# jj new -m "..."
```

### 4. Get Commit Hash

Retrieve the Commit ID (hash) of the newly created commit to reference in the reply.

```bash
# Get the commit ID of the current working copy's parent (the commit just made)
jj log --no-graph -r @- -T "commit_id"
# Or if just committed to @
# jj log --no-graph -r @ -T "commit_id"
```

### 5. Reply to Review Comment

Use `gh pr comment` to reply specifically to the thread, mentioning the fix and the commit ID.

```bash
# Reply to a specific comment ID
gh pr comment <PR_NUMBER> --reply-to <COMMENT_ID> --body "Fixed in <COMMIT_ID>. Updated logic as requested."
```

## Example Interaction

**User:** "Fix the typo in `src/app.tsx` pointed out in comment `IC_kwD...`."

**Agent Action:**
1.  **Edit**: `replace_file_content` on `src/app.tsx`.
2.  **Commit**: `jj commit -m "fix: typo in app.tsx"`.
3.  **Get ID**: `jj log -r @- -T "commit_id"` -> `a1b2c3d4...`
4.  **Reply**: `gh pr comment 123 --reply-to IC_kwD... --body "Fixed typo in commit a1b2c3d4."`
