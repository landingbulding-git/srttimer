#!/bin/sh
# Commit and push any changes in the project.
cd "${CLAUDE_PROJECT_DIR:-$(dirname "$0")/..}" || exit 0
git add -A
git diff --cached --quiet || git commit -q -m "Auto-commit: $(date '+%Y-%m-%d %H:%M')

Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
git push -q origin main 2>&1 | tail -2
exit 0
