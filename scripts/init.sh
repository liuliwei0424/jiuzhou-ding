#!/usr/bin/env bash
# 九州鼎 · 入项初始化脚本
#
# 用途：新成员（或换了机器的成员）拉下仓库后，一条命令把环境准备好：
#   1. 校验 Node.js 版本（Vite 7 要求 20.19+ 或 22.12+）
#   2. 校验并初始化 Git LFS
#   3. npm ci 安装依赖（严格按 package-lock.json）
#   4. 切到你的个人工作分支
#
# 用法：
#   ./scripts/init.sh              # 默认：只检查并安装依赖
#   ./scripts/init.sh asset/p2-ding  # 同时切换到指定分支（本地不存在则从 origin 建）
#   SKIP_INSTALL=1 ./scripts/init.sh # 跳过 npm ci（依赖已装好时）
#
# 注意：本脚本不做任何提交、不改远程分支，切分支前会检查工作区是否干净。

set -euo pipefail

BRANCH="${1:-}"
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

info() { printf '\033[36m==>\033[0m %s\n' "$1"; }
ok()   { printf '\033[32m  ✓\033[0m %s\n' "$1"; }
warn() { printf '\033[33m  !\033[0m %s\n' "$1"; }
die()  { printf '\033[31m  ✗\033[0m %s\n' "$1" >&2; exit 1; }

# ---------------------------------------------------------------- Node.js
info "检查 Node.js"
command -v node >/dev/null 2>&1 || die "未找到 node。请安装 Node.js 22.12.0 或更高的 22.x（见 .nvmrc）"
NODE_V="$(node -v | sed 's/^v//')"
MAJOR="${NODE_V%%.*}"
REST="${NODE_V#*.}"
MINOR="${REST%%.*}"
if [ "$MAJOR" -eq 22 ] && [ "$MINOR" -ge 12 ]; then
  ok "node v${NODE_V}（满足 22.12+）"
elif [ "$MAJOR" -eq 20 ] && [ "$MINOR" -ge 19 ]; then
  ok "node v${NODE_V}（满足 20.19+，但团队约定用 22.x）"
elif [ "$MAJOR" -gt 22 ]; then
  warn "node v$NODE_V 高于 22.x，团队约定为 22.x；如遇异常请切回 22.12+"
else
  die "node v$NODE_V 版本过低。需要 22.12.0 或更高的 22.x（参考 .nvmrc）"
fi

# ---------------------------------------------------------------- Git LFS
info "检查 Git LFS"
if ! command -v git >/dev/null 2>&1; then
  warn "未找到 git，跳过 LFS 检查（macOS 可执行 xcode-select --install）"
else
  if git lfs version >/dev/null 2>&1; then
    ok "$(git lfs version | head -1)"
    git lfs install --local >/dev/null 2>&1 && ok "LFS 已在本仓库启用"
    # .gitattributes 里的过滤器缺失时，LFS 文件会被当普通文件拉取
    if ! grep -q 'filter=lfs' .gitattributes 2>/dev/null; then
      warn ".gitattributes 中未发现 LFS 过滤器规则"
    fi
  else
    warn "未安装 git-lfs。macOS: brew install git-lfs；其它平台见 https://git-lfs.com"
    warn "没有 LFS 时拉取到的 .glb 只是指针文件，无法加载"
  fi
fi

# ---------------------------------------------------------------- 依赖
if [ "${SKIP_INSTALL:-0}" = "1" ]; then
  warn "SKIP_INSTALL=1，跳过 npm ci"
else
  info "安装依赖（npm ci，严格按 package-lock.json）"
  npm ci --no-fund --no-audit
  ok "依赖安装完成"
fi

# ---------------------------------------------------------------- 分支
if [ -n "$BRANCH" ]; then
  info "切换分支：$BRANCH"
  if ! command -v git >/dev/null 2>&1; then
    die "未找到 git，无法切换分支"
  fi
  if [ -n "$(git status --porcelain 2>/dev/null)" ]; then
    die "工作区有未提交改动，请先提交或 stash，再重新运行"
  fi
  if git show-ref --verify --quiet "refs/heads/$BRANCH"; then
    git switch "$BRANCH"
    ok "已切换到本地分支 $BRANCH"
  elif git show-ref --verify --quiet "refs/remotes/origin/$BRANCH"; then
    git switch --track "origin/$BRANCH" 2>/dev/null || git switch -c "$BRANCH" --track "origin/$BRANCH"
    ok "已从 origin/$BRANCH 创建跟踪分支"
  else
    git switch -c "$BRANCH"
    ok "已新建本地分支 ${BRANCH}（远程尚无同名分支）"
  fi
  warn "不要直接推 main；完成后向 develop 提 Pull Request"
fi

printf '\n'
ok "初始化完成。下一步："
printf '     npm run dev      # 本地开发服务器\n'
printf '     npm run build    # 提交前必须通过\n'
