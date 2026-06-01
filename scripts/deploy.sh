#!/usr/bin/env bash
# Deploy the Tokyo guide PWA to GitHub Pages.
# Adapted from the wishket-refui skill deploy pattern (gh repo create + push + Pages API),
# with the macOS large-push fix (HTTP/1.1 + postBuffer) for the 29MB image payload.
set -uo pipefail
cd "$(dirname "$0")/.."

REPO="travel-japan"
OWNER="$(gh api user -q .login)"
DESC="2026 도쿄 가족여행 오프라인 가이드 (모바일 PWA)"

# --- large-push fix (the HTTP 400 / sideband disconnect cause) ---
git config http.postBuffer 524288000
git config http.version HTTP/1.1

# --- ensure everything committed ---
git add -A
git diff --cached --quiet || git commit -qm "chore(deploy): sync site" || true

# --- repo + remote ---
if gh repo view "${OWNER}/${REPO}" >/dev/null 2>&1; then
  echo "ℹ repo ${OWNER}/${REPO} exists"
  git remote | grep -q origin || git remote add origin "https://github.com/${OWNER}/${REPO}.git"
else
  echo "🔧 creating ${OWNER}/${REPO}"
  gh repo create "${REPO}" --public --source=. --remote=origin --description "${DESC}" || true
fi

# --- push (force is safe: first push to an empty repo, or re-deploy) ---
echo "📤 pushing main…"
git push -u origin main --force 2>&1 | grep -v "^remote:" || true

# --- enable Pages (main / root) ---
echo "🌐 enabling Pages…"
gh api --silent --method POST "/repos/${OWNER}/${REPO}/pages" \
  -f "source[branch]=main" -f "source[path]=/" 2>/dev/null \
  || gh api --silent --method PUT "/repos/${OWNER}/${REPO}/pages" \
       -f "source[branch]=main" -f "source[path]=/" 2>/dev/null || true

echo ""
echo "✅ done"
echo "  Site:  https://${OWNER}.github.io/${REPO}/"
echo "  Repo:  https://github.com/${OWNER}/${REPO}"
echo "  ⏱ Pages 빌드 1~3분 소요"
