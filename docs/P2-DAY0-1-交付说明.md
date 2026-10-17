# 九州鼎 · P2 交付包（Day 0 – Day 1）

> **本交付包内所有模型与纹理均为艺术复原示意，非考古还原。**

- 交付人：P2（3D 美术）
- 分支：`asset/p2-ding`
- 日期：2026-10-17
- 对应任务：`P2｜3D 美术负责人任务` 的 Day 0「准备」与 Day 1「基础鼎模型」

---

## 一、任务完成对照

### Day 0｜准备

| # | 任务原文 | 状态 | 交付物 / 说明 |
|---|---|---|---|
| 1 | 安装 Blender 与团队约定的 Blender MCP | ✅ | Blender **5.2.2 LTS** 已装；MCP 插件 `blender_mcp` v1.8 已装入 Blender 并启用；服务端 `mcp-for-blender` v1.30.0 已配在 `~/.workbuddy/mcp.json`，实测握手成功（协议 13） |
| 2 | 准备 2–3 张参考图（司母戊鼎、二里头网格纹鼎），记录来源和许可 | ✅ | 见 `docs/REFERENCE-SOURCES.md`。**结论：不将第三方图片入库**（馆方图片未明确授予再分发+贴图权），只用其公开尺寸与形制文字描述；3 条来源均已验证可访问（HTTP 200），并列出「参考特征 → 模型部件 → 差异」映射 |
| 3 | 克隆仓库、执行 `./scripts/init.sh`、切换到 `asset/p2-ding` | ✅ | 仓库原**无** `scripts/init.sh`，已补齐并通过实跑（Node 版本校验 → git-lfs 检测 → `npm ci` → 切分支）。克隆与切分支需本机有 git |

### Day 1｜基础鼎模型

| # | 任务原文 | 状态 | 交付物 / 说明 |
|---|---|---|---|
| 1 | 用 Blender 建立三足圆鼎基础模型 | ✅ | `scripts/build_ding.py` 参数化生成：立耳（扁平环耳、双足贴壁）、深腹、三柱足、双弦纹、腹部雷纹带、内壁仿铭文 |
| 2 | 调整青铜材质与铜绿锈蚀表现 | ✅ | 程序化贴图：孔雀石绿 + 蓝铜矿蓝双色锈层，多尺度噪声 + 高度偏置（底部积锈）+ 点蚀；铜绿区金属度归零。ORM 按 glTF 约定打包 |
| 3 | 导出 `public/models/ding-base.glb` | ✅ | 13,648 三角面 / 1.32 MB / 1024² 纹理；底面实测 y = 0.000 |
| 4 | Git LFS 追踪；`git lfs lock` / 提交后 `unlock` | ⚠️ 部分 | `.gitattributes` 已含 `*.glb`、`*.png` 等 LFS 规则；**lock/unlock 未执行**——本机无 git / git-lfs，需在有 git 的机器上操作（命令见 `docs/ASSET-SOURCES.md` §9） |
| 5 | 配合 P3 验收：浏览器能加载、成员可 pull | ✅ P2 侧完成 | `verify.html` 验收页（5 项自动断言 + 9 热点可点）；`docs/ACCEPTANCE-P2-DAY1.md` 列出 P3 需执行的三步与排错对照表。**实机浏览器点击由 P3 执行** |

**两天合计：7 项完成，1 项部分完成（LFS lock，受本机环境限制）。**

---

## 二、交付包内容

```
p2-day0-day1/
├── 00-交付说明.md                  ← 本文件
├── verify.html                     验收页（P3 用）
├── scripts/
│   ├── build_ding.py               生成脚本：建模 + 贴图 + 导出 GLB + 热点清单
│   ├── export_blend.py             生成脚本：导出 Blender 工程源文件
│   └── init.sh                     入项初始化脚本（Day 0 要求）
├── public/
│   ├── models/                     11 个 GLB
│   │   ├── ding-base.glb           主模型 13,648 面 / 1024²
│   │   ├── ding-base-lod1.glb      移动端 9,136 面 / 512²
│   │   └── ding-{ji,yan,qing,xu,yang,jing,yu,liang,yong}.glb
│   └── textures/                   44 张 PNG（每模型 basecolor + ORM 各一张）
├── data/assets/
│   └── ding-manifest.json          机器可读清单：尺寸/面数/体积/9 个热点坐标
├── docs/
│   ├── ASSET-SOURCES.md            资产台账：来源、许可、艺术复原声明、对照史料
│   ├── REFERENCE-SOURCES.md        参考图来源与许可记录（Day 0）
│   ├── ASSET-HANDOFF-P3.md         P3 接入说明（加载/热点/材质/性能）
│   ├── ACCEPTANCE-P2-DAY1.md       Day 1 验收清单
│   ├── PR-p2-asset.md              Pull Request 描述（可直接粘贴）
│   └── assets/previews/            4 张 Cycles 预览图（形制审核用）
└── assets-src/
    └── jiuzhou-ding.blend          Blender 工程：10 个集合 / 80 对象 / 20 张贴图全打包
```

## 三、模型规格一览

| 文件 | 州 | 总高 (m) | 三角面 | 纹理 | 体积 |
|---|---|---|---|---|---|
| ding-base.glb | — | 0.879 | 13,648 | 1024² | 1.29 MB |
| ding-base-lod1.glb | — | 0.879 | 9,136 | 512² | 577 KB |
| ding-ji.glb | 冀州 | 0.879 | 10,640 | 512² | 0.61 MB |
| ding-yan.glb | 兖州 | 0.845 | 10,640 | 512² | 0.65 MB |
| ding-qing.glb | 青州 | 0.829 | 10,640 | 512² | 0.66 MB |
| ding-xu.glb | 徐州 | 0.859 | 10,640 | 512² | 0.64 MB |
| ding-yang.glb | 扬州 | 0.898 | 10,640 | 512² | 0.66 MB |
| ding-jing.glb | 荆州 | 0.915 | 10,640 | 512² | 0.68 MB |
| ding-yu.glb | 豫州 | 0.949 | 10,640 | 512² | 0.59 MB |
| ding-liang.glb | 梁州 | 0.836 | 10,640 | 512² | 0.60 MB |
| ding-yong.glb | 雍州 | 0.935 | 10,640 | 512² | 0.58 MB |

**契约符合性**：`.glb`（glTF 2.0 二进制）｜+Y 向上｜单位米｜原点在足底中心（实测 y=0.000）｜缩放已烘焙进顶点｜文件名小写 kebab-case｜每个模型含 UV、单材质、贴图内嵌。

> 九鼎之间的高度差、锈蚀差、纹饰行数差是**视觉区分手段**，不代表任何历史差异。

## 四、怎么用（P3 一步验收）

```sh
# 1. 把本包的 public/ data/ verify.html 覆盖进仓库根目录（或在仓库中直接 pull 分支）
# 2. 起服务
npm run dev
# 3. 打开验收页
open http://localhost:5173/verify.html
```

验收页会给 5 项断言：加载成功 / 底面 Y≈0 / UV 齐全 / 热点数=9 / 总高与 manifest 一致。

**注意**：若从 Git 拉取而非直接使用本包，必须先 `git lfs pull`。判断是否拉全：
`head -c 4 public/models/ding-base.glb` 输出 `glTF` 即正常，输出 `vers` 说明只是指针文件。

## 五、复现（任何人可重跑，结果一致）

```sh
# 依赖 Blender 5.x
/Applications/Blender.app/Contents/MacOS/Blender -b -P scripts/build_ding.py -- --build
/Applications/Blender.app/Contents/MacOS/Blender -b -P scripts/build_ding.py -- --preview
/Applications/Blender.app/Contents/MacOS/Blender -b -P scripts/export_blend.py
```

脚本内随机数全部固定种子，重跑得到相同资产，便于审核复现。

## 六、权利说明

- 模型、纹理、预览图、脚本均为**本项目原创**，未使用任何第三方模型、贴图、HDRI、字体或参考图。
- 铭文为抽象笔画，**不构成可释读文字**；雷纹为装饰性仿纹，不对应具体器物纹样。
- 对照器物数据（后母戊鼎、二里头网格纹铜鼎）仅作文字引用并标注馆方出处，未参与建模。
- 工具许可：Blender 为 GPL v2+，但**用其导出的 GLB 不受 GPL 传染**；MCP 插件仅供本地辅助，不进入部署包。
- 详细台账见 `docs/ASSET-SOURCES.md`。

## 七、遗留事项（需人工）

| 事项 | 原因 | 处理 |
|---|---|---|
| 提交 / 推送 / 提 PR | 本机无 git 可执行文件、无 GitHub 凭据 | 在装有 git 的机器上执行 `docs/ASSET-SOURCES.md` §9 的命令；PR 描述用 `docs/PR-p2-asset.md` |
| `git lfs lock` / `unlock` | 同上，且需 git-lfs | 同上流程中执行 |
| 浏览器实机点击验收 | 需真实 GPU 环境 | 由 P3 按 `docs/ACCEPTANCE-P2-DAY1.md` 执行并回填结论 |
| 部署包剔除源文件 | `assets-src/` 不应上网 | 已在 `docs/ASSET-SOURCES.md` §5 声明；P4 打包时排除 |
