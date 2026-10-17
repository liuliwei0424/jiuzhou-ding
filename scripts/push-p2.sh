#!/usr/bin/env bash
# 一键推送 P2 资产到 GitHub 的 asset/p2-ding 分支
#
# 用法（先装好 git 与 git-lfs）：
#     cd jiuzhou-ding && ./scripts/push-p2.sh
#
# 前置条件：
#   1. git 可用：xcode-select --install
#   2. git-lfs 可用：brew install git-lfs
#   3. 已登录 GitHub（首次 push 会弹认证，或先 gh auth login）
#
# 脚本做的事：初始化仓库 → 关联远程 → 基于远程分支 → 提交 → 推送。
# 不会碰 main，也不会强推。

set -euo pipefail

BRANCH="asset/p2-ding"
REMOTE="origin"
URL="https://github.com/April313/jiuzhou-ding.git"
MSG="${1:-feat(asset): 程序化生成三足圆鼎与九鼎变体，补齐资产台账与热点坐标}"

info() { printf '\033[36m==>\033[0m %s\n' "$1"; }
ok()   { printf '\033[32m  ✓\033[0m %s\n' "$1"; }
die()  { printf '\033[31m  ✗\033[0m %s\n' "$1" >&2; exit 1; }

cd "$(dirname "${BASH_SOURCE[0]}")/.."

# ---------------------------------------------------------------- 前置检查
info "检查 git"
if ! git --version >/dev/null 2>&1; then
  die "git 不可用。请先运行：xcode-select --install"
fi
ok "$(git --version)"

info "检查 git-lfs（仓库用 LFS 管模型，没有它推上去的会是指针文件）"
if ! git lfs version >/dev/null 2>&1; then
  die "git-lfs 不可用。macOS：brew install git-lfs"
fi
ok "$(git lfs version | head -1)"
git lfs install --local >/dev/null

info "检查当前是否在 main 分支"
CUR="$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "")"
if [ "$CUR" = "main" ]; then
  die "当前在 main 上，拒绝操作。请先 git switch -c $BRANCH"
fi

# ---------------------------------------------------------------- 初始化
info "初始化仓库（已初始化则跳过）"
if [ ! -d .git ]; then
  git init
  git symbolic-ref HEAD "refs/heads/$BRANCH"
  ok "已初始化，默认分支 $BRANCH"
else
  ok "仓库已存在"
fi

if git remote get-url "$REMOTE" >/dev/null 2>&1; then
  git remote set-url "$REMOTE" "$URL"
  ok "远程 $REMOTE 已更新"
else
  git remote add "$REMOTE" "$URL"
  ok "远程 $REMOTE 已添加"
fi

# ---------------------------------------------------------------- 对齐远程
info "拉取远程 $BRANCH 作为基线（不覆盖工作区）"
git fetch "$REMOTE" "$BRANCH"
REMOTE_SHA="$(git rev-parse FETCH_HEAD)"

if git rev-parse --verify HEAD >/dev/null 2>&1; then
  ok "本地已有提交，跳过对齐"
else
  # 让本地 HEAD 指向远程提交，但保留工作区文件（无需重复下载）
  git reset "$REMOTE_SHA" >/dev/null
  ok "本地已对齐到远程 $(echo "$REMOTE_SHA" | cut -c1-8)"
fi

# ---------------------------------------------------------------- 预检
info "预检：确认模型不是 LFS 指针"
if [ -f public/models/ding-base.glb ]; then
  MAGIC="$(head -c 4 public/models/ding-base.glb)"
  if [ "$MAGIC" != "glTF" ]; then
    die "public/models/ding-base.glb 不是有效 GLB（魔数：$MAGIC），请先 git lfs pull"
  fi
  ok "GLB 魔数正确（glTF）"
fi

info "运行构建"
npm ci --no-fund --no-audit >/dev/null 2>&1 || npm install --no-fund --no-audit >/dev/null 2>&1
npm run build >/dev/null
ok "构建通过"

# ---------------------------------------------------------------- 提交
info "暂存改动"
git add -A
if git diff --cached --quiet; then
  ok "没有需要提交的改动"
else
  git -c user.name="${GIT_AUTHOR_NAME:-P2}" \
      -c user.email="${GIT_AUTHOR_EMAIL:-p2@example.invalid}" \
      commit -m "$MSG"
  ok "已提交：$MSG"
fi

info "统计将要推送的 LFS 对象"
LFS_COUNT="$(git lfs ls-files 2>/dev/null | wc -l | tr -d ' ')"
ok "LFS 跟踪文件：$LFS_COUNT 个（推送前确认仓库 LFS 配额，GitHub 免费额度 1 GB 存储）"

# ---------------------------------------------------------------- 推送
info "推送到 $REMOTE/$BRANCH"
git push -u "$REMOTE" "$BRANCH"
ok "推送完成"

printf '\n'
ok "下一步："
printf '     打开 https://github.com/April313/jiuzhou-ding/compare/develop...%s\n' "$BRANCH"
printf '     PR 标题建议：feat(asset): P2 资产交付 —— 三足圆鼎与九鼎变体\n'
printf '     PR 描述直接粘贴 docs/PR-p2-asset.md 的内容\n'
printf '\n'
printf '     注意：不要向 main 提 PR，目标分支为 develop。\n'
