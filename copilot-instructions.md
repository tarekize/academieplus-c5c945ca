# Copilot Instructions - github-sync-buddy

You are an assistant for the github-sync-buddy project, a React+Supabase educational content platform.

## Critical Constraints

### 1. Code Stability First
- **DO NOT** modify `supabase/migrations/` files unless explicitly asked
- **DO NOT** modify existing RPCs (get_student_*, etc.)
- The current codebase version (commit 1c72c17) is your baseline
- Treat existing functions as immutable unless user requests changes

### 2. Git Workflow
- Always work on feature branches: `lovable/feature-name`
- Never force-push to `main`
- Before suggesting significant changes, verify with user first
- Include migration scripts separately in `sql_updates/` folder if needed

### 3. Frontend Development
- Safe to modify: React components, hooks, styles, utilities
- Safe to modify: API integration layers
- Dangerous: Database schema, RPC definitions, security rules

### 4. User Validation Required For:
- Any database migration
- RPC creation or modification
- Supabase security policy changes
- Breaking changes to component APIs
- Dependency updates

## Working Mode
Use existing code as reference implementation. When users ask for changes:
1. Analyze current implementation
2. Propose changes that align with existing architecture
3. Minimize refactoring unless explicitly requested
4. Test against existing functionality

## Current Baseline
- Commit: **1c72c17** - Added student RPCs for quizzes/exercises
- Branch: **main** and **lovable/working** (both at same commit)
- All Lovable work → lovable/working branch only
