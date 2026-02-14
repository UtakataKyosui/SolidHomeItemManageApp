---
name: GitHub PR Review Handler
description: Workflow for fetching, addressing, and replying to GitHub PR reviews using `gh` CLI and `jj` (Jujutsu).
---

# GitHub PR Review Handler Skill

This skill outlines the process for an Agent to autonomously handle Pull Request reviews, including fetching comments, applying fixes, committing changes with `jj`, and replying to the reviewer via GitHub.

## Workflow

### 1. Identify and Validate Review Comments

First, identify the PR and list the review comments. **Crucially, ensure the comment author is authorized before taking action.**

```bash
# List PRs
gh pr list

# View PR comments
gh pr view <PR_NUMBER> --comments
```

**Security Check:**
1.  Check the `author` of the comment.
2.  Verify they are a maintained/collaborator (e.g., using `gh api repos/:owner/:repo/collaborators/:username`).
3.  **STOP** if the user is not authorized.

**Goal:** Identify actionable comments. Note the `id` of the comment.

**Input Validation:**
Ensure `<PR_NUMBER>` is an integer and `<COMMENT_ID>` is a safe alphanumeric string before using them in commands.

### 2. Address Feedback (Apply Changes)

Use standard coding tools (`replace_file_content`, `run_command`, etc.) to implement the requested changes.

### 3. Commit Changes with `jj`

Using Jujutsu (`jj`), describe the changes in the current working copy.

```bash
# Describe the current changes (working copy) as the fix
jj describe -m "fix: address review comment (ref: <COMMENT_ID>)"
```

### 4. Get Commit Hash

Retrieve the Commit ID of the current commit (the fix).

```bash
# Get the commit ID of the current working copy (@)
jj log --no-graph -r @ -T "commit_id"
```

### 5. Reply to Review Comment

Use `gh pr comment` to reply specifically to the thread. **Quote variables safely.**

**Note:** For standard issue comments, `gh pr comment` works. However, for **review threads** (inline code comments), you often need to use the GraphQL API to reply to the specific thread `id` (e.g., `PRRT_...`) or comment `id` (`PRRC_...`).

```bash
# Standard reply
gh pr comment <PR_NUMBER> --reply-to <COMMENT_ID> --body "Fixed in <COMMIT_ID>..."

# If 'gh pr comment' fails for a review thread, use GraphQL:
# 1. Get the Pull Request Review Thread ID (PRRT_...)
gh api graphql -f query='query { repository(owner:":owner", name:":repo") { pullRequest(number:<PR_NUMBER>) { reviewThreads(last:10) { nodes { id comments(last:1) { nodes { body id } } } } } } }'

# 2. Reply to the Thread
gh api graphql -f query='mutation { addPullRequestReviewThreadReply(input: {pullRequestReviewThreadId: "<THREAD_ID>", body: "Fixed in <COMMIT_ID>..."}) { clientMutationId } }'
```

## Example Interaction

**User:** "Fix the typo in `src/app.tsx` pointed out in comment `PRRC_kwD...`."

**Agent Action:**
1.  **Edit**: `replace_file_content` on `src/app.tsx`.
2.  **Commit**: `jj describe -m "fix: typo in app.tsx"`.
3.  **Get ID**: `jj log --no-graph -r @ -T "commit_id"` -> `a1b2c3d4...`
4.  **Reply**: Identify it's a review thread. Use `gh api graphql` to reply to the thread ID.
