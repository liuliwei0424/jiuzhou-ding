# 推送到 GitHub 操作手册（P2）

目标仓库：<https://github.com/April313/jiuzhou-ding>  
目标分支：`asset/p2-ding`（**不是 main**）

---

## 当前状态

| 项     | 状态                                                    |
| ----- | ----------------------------------------------------- |
| 资产与文档 | ✅ 全部就绪，已通过校验（11 个 GLB 有效、构建通过）                        |
| 远程基线  | ✅ 已核对：`asset/p2-ding` 上只有骨架文件，`docs/CONTRACT.md` 未被改动 |
| 推送    | ❌ 未执行 —— 本机缺 git 与 GitHub 凭据                          |

### 为什么我这边推不上去

1. `/usr/bin/git` 只是 Xcode 命令行工具的壳，本机未安装，调用会弹安装窗并失败
2. 无 GitHub token / 无 `gh` 登录，GitHub API 返回 401
3. 就算有 token 也不行：contents API 单文件限制 1 MB，且**不写 Git LFS**。这批资产 18 MB、11 个 GLB，走 API 推上去的是指针文件，P3 拉下来会加载失败

所以必须在有 git 的终端里推。下面是完整步骤。

---

## 一次性环境准备

```sh
xcode-select --install      # 装命令行工具（含 git），弹出窗口点"安装"，约 5–10 分钟
brew install git-lfs        # 若没有 Homebrew，见 https://brew.sh
```

装完验证：

```sh
git --version      # 应输出 git version 2.x
git lfs version    # 应输出 git-lfs/3.x
```

## 推送（一条命令）

```sh
cd /Users/llwy/WorkBuddy/2026-10-17-13-15-49/jiuzhou-ding
./scripts/push-p2.sh
```

脚本会自动完成：检查 git/git-lfs → 初始化仓库 → 关联远程 → 对齐到远程基线（保留工作区文件）→ 验证 GLB 不是指针 → `npm ci` + `npm run build` → 提交 → 推送。

首次 push 会让你认证 GitHub。推荐用 Personal Access Token：

1. 打开 <https://github.com/settings/tokens> → Generate new token (classic)
2. 勾选 **`repo`** 权限 → 生成 → 复制
3. push 时用户名填 `April313`，密码处粘贴 token

### 如果脚本失败，手动版

```sh
cd /Users/llwy/WorkBuddy/2026-10-17-13-15-49/jiuzhou-ding

git init
git symbolic-ref HEAD refs/heads/asset/p2-ding
git remote add origin https://github.com/April313/jiuzhou-ding.git
git fetch origin asset/p2-ding
git reset FETCH_HEAD                      # 对齐基线，工作区文件保留

git lfs install --local
head -c 4 public/models/ding-base.glb     # 必须输出 glTF，输出 vers 说明是指针文件

npm ci && npm run build                    # 必须通过

git add -A
git commit -m "feat(asset): 程序化生成三足圆鼎与九鼎变体，补齐资产台账与热点坐标"
git push -u origin asset/p2-ding
```

## 提交内容清单

本次提交 **新增 51 个文件**，**既有文件仅改动 1 个**（`.gitignore` 追加 `__pycache__/`、`*.pyc`）；`docs/CONTRACT.md`、`data/schema/zhou.schema.json`、`src/` 均**未改动**。

```
scripts/build_ding.py            建模+贴图+导出脚本
scripts/export_blend.py          Blender 工程导出脚本
scripts/init.sh                  入项初始化（Day 0 要求，仓库原本缺失）
scripts/push-p2.sh               推送脚本
public/models/*.glb              11 个（LFS）
public/textures/*.png            22 个（LFS）
docs/ASSET-SOURCES.md            资产台账
docs/REFERENCE-SOURCES.md        参考图来源与许可（Day 0）
docs/ASSET-HANDOFF-P3.md         P3 接入说明
docs/ACCEPTANCE-P2-DAY1.md       Day 1 验收清单
docs/PR-p2-asset.md              PR 描述
docs/P2-DAY0-1-交付说明.md       交付总说明
docs/PUSH-TO-GITHUB.md           本文件
docs/assets/previews/*.png       4 张预览图（LFS）
data/assets/ding-manifest.json   资产清单与热点坐标
verify.html                      浏览器验收页
assets-src/jiuzhou-ding.blend    Blender 工程源文件（LFS）
```

改动既有文件：`.gitignore`（追加 Python 缓存忽略规则）。

## 提 Pull Request

推送完成后打开：

```
https://github.com/April313/jiuzhou-ding/compare/develop...asset/p2-ding
```

- 标题：`feat(asset): P2 资产交付 —— 三足圆鼎与九鼎变体`
- 描述：直接粘贴 `docs/PR-p2-asset.md` 全文
- 请求审核人：P1
- **目标分支必须是 `develop`，不是 `main`**

## 推送前最后确认

- [ ] `head -c 4 public/models/ding-base.glb` 输出 `glTF`
- [ ] `npm run build` 通过
- [ ] GitHub LFS 配额够用（本次约 18 MB；免费额度 1 GB 存储 / 1 GB 月流量）
- [ ] 没有把 `node_modules/`、`dist/` 提交进去（`.gitignore` 已排除）
- [ ] `assets-src/` 已提交但**不应进入部署包**（P4 打包时排除）
